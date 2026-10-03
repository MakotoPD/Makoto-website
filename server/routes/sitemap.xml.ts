import { and, eq, lte, sql } from 'drizzle-orm'
import { database } from '../db/client'
import { entries } from '../db/schema'
import { contentPath, type ContentKind, type Locale } from '../../shared/content'

const origin = 'https://makoto.com.pl'
const allowed = new Set<ContentKind>(['home', 'page', 'service', 'location', 'article', 'project'])
const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async event => {
  const rows = await database().select({
    kind: entries.kind,
    locale: entries.locale,
    slug: entries.slug,
    translationGroup: entries.translationGroup,
    updatedAt: entries.updatedAt
  }).from(entries).where(and(eq(entries.status, 'published'), lte(entries.publishedAt, sql`now()`)))
  const indexed = rows.filter(row => allowed.has(row.kind as ContentKind))
  const byGroup = new Map<string, typeof indexed>()
  for (const row of indexed) byGroup.set(row.translationGroup, [...(byGroup.get(row.translationGroup) || []), row])
  const urls = indexed.map(row => {
    const path = contentPath({ kind: row.kind as ContentKind, locale: row.locale as Locale, slug: row.slug })
    const others = byGroup.get(row.translationGroup) || []
    const alternates = others.length > 1 ? others.map(item => {
      const href = origin + contentPath({ kind: item.kind as ContentKind, locale: item.locale as Locale, slug: item.slug })
      return `<xhtml:link rel="alternate" hreflang="${item.locale === 'pl' ? 'pl-PL' : 'en-US'}" href="${xml(href)}"/>`
    }).join('') : ''
    return `<url><loc>${xml(origin + path)}</loc><lastmod>${row.updatedAt.toISOString()}</lastmod>${alternates}</url>`
  })
  for (const path of ['/blog', '/pl/blog', '/work', '/pl/work', '/portfolio', '/pl/portfolio', '/uses', '/pl/uses', '/faq', '/pl/faq']) {
    urls.push(`<url><loc>${xml(origin + path)}</loc></url>`)
  }
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`
})
