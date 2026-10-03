import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { extname } from 'node:path'

const base = process.env.STRAPI_URL || 'https://api.makoto.com.pl'
const collections = ['articles', 'projects', 'featured-projects', 'works', 'Portfolios']
const singles = ['about', 'Privacy', 'Rule', 'link']
const report = { source: base, exportedAt: new Date().toISOString(), records: {}, media: {}, errors: [] }

async function request(name, locale, page = 1) {
  const url = new URL(`/api/${name}`, base)
  if (name !== 'Portfolios' && name !== 'link') url.searchParams.set('locale', locale)
  if (name === 'articles') {
    for (const [field, value] of Object.entries({
      'populate[cover]': 'true',
      'populate[author][populate]': '*',
      'populate[categories]': 'true',
      'populate[localizations]': 'true',
      'populate[blocks][populate]': '*'
    })) url.searchParams.set(field, value)
  } else if (name === 'about') {
    url.searchParams.set('populate[blocks][populate]', '*')
    url.searchParams.set('populate[localizations]', 'true')
  } else {
    url.searchParams.set('populate', '*')
  }
  url.searchParams.set('pagination[page]', String(page))
  url.searchParams.set('pagination[pageSize]', '100')
  const response = await fetch(url, { headers: process.env.STRAPI_TOKEN ? { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` } : {} })
  if (!response.ok) throw new Error(`${name}/${locale}: HTTP ${response.status}`)
  return response.json()
}

for (const name of [...collections, ...singles]) {
  for (const locale of (['Portfolios', 'link'].includes(name) ? ['all'] : ['en', 'pl'])) {
    try {
      const first = await request(name, locale)
      const records = Array.isArray(first.data) ? [...first.data] : first.data ? [first.data] : []
      const pages = first.meta?.pagination?.pageCount || 1
      for (let page = 2; page <= pages; page++) records.push(...(await request(name, locale, page)).data)
      report.records[`${name}:${locale}`] = records
    } catch (error) {
      report.errors.push(String(error))
    }
  }
}

function collectMedia(value, urls = new Set()) {
  if (!value || typeof value !== 'object') return urls
  if (Array.isArray(value)) {
    for (const item of value) collectMedia(item, urls)
    return urls
  }
  if (typeof value.url === 'string' && (value.url.startsWith('/uploads/') || value.url.startsWith(base))) urls.add(value.url)
  for (const child of Object.values(value)) collectMedia(child, urls)
  return urls
}

const mediaUrls = collectMedia(report.records)
await mkdir('data/strapi-media', { recursive: true })
for (const mediaUrl of mediaUrls) {
  try {
    const fullUrl = new URL(mediaUrl, base)
    if (fullUrl.origin !== new URL(base).origin) throw new Error('Unexpected media host')
    const response = await fetch(fullUrl, { headers: process.env.STRAPI_TOKEN ? { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` } : {} })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    const extension = extname(fullUrl.pathname).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 12)
    const filename = `${createHash('sha256').update(fullUrl.pathname).digest('hex').slice(0, 24)}${extension}`
    await writeFile(`data/strapi-media/${filename}`, bytes)
    report.media[mediaUrl] = {
      file: `strapi-media/${filename}`,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex')
    }
  } catch (error) {
    report.errors.push(`Media ${mediaUrl}: ${String(error)}`)
  }
}

await mkdir('data', { recursive: true })
await writeFile('data/strapi-public-export.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ counts: Object.fromEntries(Object.entries(report.records).map(([key, value]) => [key, value.length])), media: Object.keys(report.media).length, errors: report.errors }, null, 2))
if (report.errors.length) process.exitCode = 1
