import 'dotenv/config'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { createHash } from 'node:crypto'
import pg from 'pg'
import { markdownToDocument } from '../shared/markdown.ts'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Endpoint } from '../shared/r2-config.ts'

const dryRun = process.argv.includes('--dry-run')
const localMedia = process.argv.includes('--local-media')
const archive = JSON.parse(await readFile('data/strapi-public-export.json', 'utf8'))
const report = {
  mode: dryRun ? 'dry-run' : 'import',
  storage: dryRun ? 'none' : localMedia ? 'local-test' : 'r2',
  created: 0, skipped: 0, mediaCreated: 0, mediaSkipped: 0,
  counts: {}, unsupported: [], errors: []
}
const mediaIds = new Map()
let database
let storage

if (!dryRun) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  for (const name of localMedia ? [] : ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']) {
    if (!process.env[name]) throw new Error(`${name} is required`)
  }
  database = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await database.connect()
  if (!localMedia) storage = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint(process.env.R2_ACCOUNT_ID, process.env.R2_ENDPOINT),
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY }
  })
}

const mediaMetadata = new Map()
function inspect(value) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) return value.forEach(inspect)
  if (typeof value.url === 'string' && archive.media[value.url]) mediaMetadata.set(value.url, value)
  Object.values(value).forEach(inspect)
}
inspect(archive.records)

function mimeFor(filename) {
  return ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf' })[extname(filename).toLowerCase()] || null
}

try {
  for (const [url, file] of Object.entries(archive.media)) {
    const mime = mimeFor(file.file)
    if (!mime) { report.unsupported.push(`Media type: ${url}`); continue }
    if (dryRun) { mediaIds.set(url, url); continue }
    const key = localMedia ? `local/${file.file.split('/').at(-1)}` : `archive/${file.sha256}${extname(file.file).toLowerCase()}`
    const existing = await database.query('SELECT id FROM media WHERE object_key = $1', [key])
    if (existing.rowCount) {
      mediaIds.set(url, existing.rows[0].id)
      report.mediaSkipped++
      continue
    }
    try {
      const bytes = await readFile(join('data', file.file))
      if (bytes.length !== file.bytes) throw new Error('Archive file size mismatch')
      if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error('Archive file hash mismatch')
      if (!localMedia) await storage.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: bytes, ContentType: mime,
        CacheControl: 'private, no-store'
      }))
      const meta = mediaMetadata.get(url) || {}
      const result = await database.query(
        'INSERT INTO media(object_key, name, mime, bytes, alt, caption) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT(object_key) DO UPDATE SET object_key = EXCLUDED.object_key RETURNING id',
        [key, meta.name || file.file.split('/').at(-1), mime, bytes.length, meta.alternativeText || '', meta.caption || '']
      )
      mediaIds.set(url, result.rows[0].id)
      report.mediaCreated++
    } catch (error) {
      report.errors.push(`Media ${url}: ${String(error)}`)
    }
  }

  function mediaUrl(value) {
    if (typeof value !== 'string') return value
    const path = value.startsWith(archive.source) ? value.slice(archive.source.length) : value
    if (!path.startsWith('/uploads/')) return value
    const id = mediaIds.get(path) || mediaIds.get(value)
    if (!id) { report.unsupported.push(`Missing media: ${value}`); return value }
    return dryRun ? path : `/api/media/${id}`
  }

  function rewrite(value) {
    if (typeof value === 'string') return mediaUrl(value)
    if (Array.isArray(value)) return value.map(rewrite)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewrite(child)]))
    return value
  }

  const fromMarkdown = source => markdownToDocument(source, mediaUrl)

  function fromBlocks(blocks) {
    const content = []
    for (const block of blocks || []) {
      if (block.__component === 'shared.rich-text') content.push(...fromMarkdown(block.body).content)
      else if (block.__component === 'shared.media' && block.file?.url) {
        content.push({ type: 'image', attrs: { src: mediaUrl(block.file.url), alt: block.file.alternativeText || block.file.name || 'Obraz', caption: block.file.caption || '' } })
      } else if (block.__component === 'shared.quote') {
        content.push({ type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: block.body || block.text || '' }] }] })
      } else {
        report.unsupported.push(`Strapi block: ${block.__component || 'unknown'}`)
      }
    }
    return { type: 'doc', content }
  }

  const slugify = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const inputs = []
  const featured = new Set(['en', 'pl'].flatMap(locale => (archive.records[`featured-projects:${locale}`] || []).map(item => item.documentId)))
  const worksByCompany = new Map()
  for (const locale of ['en', 'pl']) for (const work of archive.records[`works:${locale}`] || []) {
    worksByCompany.set(`${locale}:${slugify(work.company).replace(/-pl$/, '')}`, work)
  }

  function add(kind, locale, slug, source, title, summary, body, data = {}, status = 'published') {
    inputs.push({
      kind, locale, slug, translationGroup: source.documentId || `strapi:${kind}:${slug}`,
      sourceKey: `strapi:${kind}:${source.documentId || source.id}:${locale}`,
      title, summary: summary || '', body, sections: [],
      data: rewrite(data), status, seoTitle: title, seoDescription: summary || null,
      createdAt: source.createdAt || new Date().toISOString(),
      updatedAt: source.updatedAt || new Date().toISOString(),
      publishedAt: status === 'published' ? (source.publishedAt || source.updatedAt || new Date().toISOString()) : null
    })
  }

  for (const locale of ['en', 'pl']) {
    for (const article of archive.records[`articles:${locale}`] || []) {
      if (article.author) add('author', locale, slugify(article.author.name), article.author, article.author.name, '', { type: 'doc', content: [] }, { avatar: article.author.avatar, email: article.author.email })
      for (const category of article.categories || []) add('category', locale, category.slug || slugify(category.name), category, category.name, '', { type: 'doc', content: [] })
      const status = article.documentId === 'g0yx9cn74oizdsrs0fn8xb73' ? 'draft' : 'published'
      add('article', locale, article.slug, article, article.title, article.description, fromBlocks(article.blocks), {
        cover: article.cover, authorSource: article.author?.documentId,
        categorySources: (article.categories || []).map(item => item.documentId),
        originalBlocks: article.blocks
      }, status)
    }
    for (const project of archive.records[`projects:${locale}`] || []) {
      const work = worksByCompany.get(`${locale}:${slugify(project.title).replace(/-pl$/, '')}`)
      const scope = work?.description || ''
      add('project', locale, slugify(project.title), project, project.title, project.description,
        fromMarkdown(scope || project.description), {
          externalUrl: project.link, image: project.image, stack: project.stack,
          theme: project.theme, slogan: project.slogan, scope,
          featured: featured.has(project.documentId)
        })
    }
    for (const work of archive.records[`works:${locale}`] || []) add(
      'work', locale, slugify(work.company), work, work.Title || work.company,
      work.description, fromMarkdown(work.description), { company: work.company, from: work.from, to: work.to, tags: work.tags, location: work.location, isRemote: work.isRemote }
    )
    for (const [name, slug] of [['about', 'about'], ['Privacy', 'privacy'], ['Rule', 'rules']]) {
      const record = archive.records[`${name}:${locale}`]?.[0]
      if (record) add('page', locale, slug, record, record.title, record.subTitle || '',
        record.blocks ? fromBlocks(record.blocks) : fromMarkdown(record.description),
        { links: record.links || [] })
    }
  }
  const link = archive.records['link:all']?.[0]
  if (link) for (const locale of ['en', 'pl']) add('page', locale, 'links', link, link.name, '', { type: 'doc', content: [] }, link)
  for (const item of archive.records['Portfolios:all'] || []) {
    for (const locale of ['en', 'pl']) add('portfolio', locale, `item-${item.id}`, item, item.type, '', { type: 'doc', content: [] }, { type: item.type, image: item.image })
  }

  const seen = new Set()
  for (const input of inputs) {
    const key = input.sourceKey
    if (seen.has(key)) continue
    seen.add(key)
    report.counts[input.kind] = (report.counts[input.kind] || 0) + 1
    if (dryRun) continue
    try {
      const result = await database.query(
        `INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data, status,
          seo_title, seo_description, source_key, published_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT(source_key) DO NOTHING RETURNING id`,
        [input.kind, input.locale, input.slug, input.translationGroup, input.title, input.summary,
          JSON.stringify(input.body), JSON.stringify(input.sections), JSON.stringify(input.data),
          input.status, input.seoTitle, input.seoDescription, input.sourceKey, input.publishedAt,
          input.createdAt, input.updatedAt]
      )
      if (!result.rowCount) { report.skipped++; continue }
      report.created++
      const used = new Set(JSON.stringify([input.body, input.data]).match(/\/api\/media\/[0-9a-f-]{36}/g)?.map(path => path.slice('/api/media/'.length)) || [])
      for (const mediaId of used) await database.query('INSERT INTO content_media(entry_id, media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [result.rows[0].id, mediaId])
    } catch (error) {
      report.errors.push(`Entry ${key}: ${String(error)}`)
    }
  }
  if (!dryRun) {
    const grouping = await readFile('db/migrations/0003_media_and_translations.sql', 'utf8')
    await database.query(grouping.slice(grouping.indexOf('WITH originals')))
  }
  if (!dryRun) await database.query(`UPDATE media m SET published_at = CASE WHEN EXISTS (
    SELECT 1 FROM content_media cm JOIN content_entries e ON e.id = cm.entry_id
    WHERE cm.media_id = m.id AND e.status = 'published' AND e.published_at <= now()
  ) THEN COALESCE(m.published_at, now()) ELSE NULL END`)
} finally {
  await database?.end()
}

report.unsupported = [...new Set(report.unsupported)]
await writeFile('data/strapi-migration-report.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (report.errors.length) process.exitCode = 1
