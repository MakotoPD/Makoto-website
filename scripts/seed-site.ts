import 'dotenv/config'
import pg from 'pg'
import { siteSeed } from '../shared/site-seed'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
let created = 0
let existing = 0
try {
  for (const entry of siteSeed) {
    const result = await client.query(
      `INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data,
        status, seo_title, seo_description, source_key, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,$11,$12,now())
       ON CONFLICT(source_key) DO NOTHING RETURNING id`,
      [entry.kind, entry.locale, entry.slug, entry.translationGroup, entry.title, entry.summary,
        JSON.stringify(entry.body), JSON.stringify(entry.sections), JSON.stringify(entry.data),
        entry.seoTitle, entry.seoDescription, `seed:${entry.translationGroup}:${entry.locale}`]
    )
    if (result.rowCount) created++
    else existing++
  }
} finally {
  await client.end()
}
console.log(JSON.stringify({ created, existing, total: siteSeed.length }))
