import 'dotenv/config'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import pg from 'pg'
import { markdownToDocument } from '../shared/markdown.ts'
import { validateRichDocument } from '../shared/content.ts'

const apply = process.argv.includes('--apply')
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const archive = JSON.parse(await readFile('data/strapi-public-export.json', 'utf8'))
const db = new pg.Client({ connectionString: process.env.DATABASE_URL })
const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-pl$/, '')
const report = { mode: apply ? 'apply' : 'dry-run', repaired: [], unchanged: [], edited: [] }
function fromBlocks(blocks) {
  return { type: 'doc', content: blocks.flatMap(block => {
    if (block.__component === 'shared.rich-text') return markdownToDocument(block.body).content
    if (block.__component === 'shared.media' && block.file?.url) return [{ type: 'image', attrs: { src: block.file.url, alt: block.file.alternativeText || block.file.name || 'Obraz', caption: block.file.caption || '' } }]
    if (block.__component === 'shared.quote') return [{ type: 'blockquote', content: markdownToDocument(block.body || block.text || '').content }]
    throw new Error(`Unsupported source block: ${block.__component}`)
  }) }
}
const snapshot = row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()), value]))
await db.connect()
try {
  await db.query('BEGIN')
  const { rows } = await db.query("SELECT * FROM content_entries WHERE source_key LIKE 'strapi:%' AND kind IN ('article', 'work', 'project') FOR UPDATE")
  const revisions = new Set((await db.query('SELECT DISTINCT entry_id FROM content_versions')).rows.map(row => row.entry_id))
  const changes = []
  for (const row of rows) {
    const works = archive.records[`works:${row.locale}`] || []
    let body = row.body
    const data = { ...row.data }
    if (row.kind === 'article' && Array.isArray(data.originalBlocks)) body = fromBlocks(data.originalBlocks)
    if (row.kind === 'work') {
      const source = works.find(item => item.documentId === row.translation_group)
      if (!source) throw new Error(`Missing archived work: ${row.id}`)
      body = markdownToDocument(source.description)
      data.location = source.location
      data.isRemote = source.isRemote
    }
    if (row.kind === 'project') {
      const work = works.find(item => slug(item.company) === slug(row.title))
      data.scope = work?.description || data.scope || ''
      body = markdownToDocument(data.scope || row.summary)
    }
    // Match JSON persistence: optional undefined keys are omitted by PostgreSQL JSONB.
    body = JSON.parse(JSON.stringify(body))
    const name = `${row.kind}:${row.locale}:${row.slug}`
    if (isDeepStrictEqual(row.body, body) && isDeepStrictEqual(row.data, data)) { report.unchanged.push(name); continue }
    // CMS changes always create revisions. Never replace subsequently edited content.
    if (revisions.has(row.id)) { report.edited.push(name); continue }
    validateRichDocument(body)
    changes.push({ row, body, data })
    report.repaired.push(name)
  }
  if (apply && changes.length) {
    await mkdir('.data/content-backups', { recursive: true })
    const backup = `.data/content-backups/before-formatting-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    await writeFile(backup, JSON.stringify(changes.map(({ row }) => snapshot(row)), null, 2) + '\n')
    report.backup = backup
    for (const { row, body, data } of changes) {
      await db.query('INSERT INTO content_versions(entry_id, number, snapshot) VALUES ($1,1,$2)', [row.id, JSON.stringify(snapshot(row))])
      const { rows: [updated] } = await db.query('UPDATE content_entries SET body=$2, data=$3, updated_at=now() WHERE id=$1 RETURNING *', [row.id, JSON.stringify(body), JSON.stringify(data)])
      await db.query('INSERT INTO content_versions(entry_id, number, snapshot) VALUES ($1,2,$2)', [row.id, JSON.stringify(snapshot(updated))])
      const ids = new Set(JSON.stringify([body, data]).match(/\/api\/media\/[0-9a-f-]{36}/g)?.map(path => path.slice('/api/media/'.length)) || [])
      for (const id of ids) await db.query('INSERT INTO content_media(entry_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [row.id, id])
    }
  }
  await db.query(apply ? 'COMMIT' : 'ROLLBACK')
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  await db.query('ROLLBACK')
  throw error
} finally { await db.end() }
