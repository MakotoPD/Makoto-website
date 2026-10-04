import { and, eq, inArray, lte, sql } from 'drizzle-orm'
import type { SitemapUrlInput } from '#sitemap/types'
import { database } from '../db/client'
import { entries, type ContentEntry } from '../db/schema'
import { contentPath, type ContentKind, type Locale } from '../../shared/content'
import { absoluteUrl, entryImage, listingPages, localeLanguage, pagePath, publicContentKinds } from '../../shared/seo'

export const entryPath = (row: ContentEntry) => contentPath({ kind: row.kind as ContentKind, locale: row.locale as Locale, slug: row.slug })

export function publishedSeoEntries() {
  return database().select().from(entries).where(and(
    inArray(entries.kind, [...publicContentKinds]),
    eq(entries.status, 'published'),
    lte(entries.publishedAt, sql`now()`)
  )).orderBy(entries.kind, entries.locale, entries.slug)
}

export async function sitemapUrls(): Promise<SitemapUrlInput[]> {
  const rows = await publishedSeoEntries()
  const groups = new Map<string, ContentEntry[]>()
  for (const row of rows) {
    const key = `${row.kind}:${row.translationGroup}`
    groups.set(key, [...(groups.get(key) || []), row])
  }
  const urls: SitemapUrlInput[] = rows.map(row => {
    const versions = groups.get(`${row.kind}:${row.translationGroup}`) || [row]
    const alternatives = versions.map(item => ({ hreflang: localeLanguage(item.locale as Locale), href: absoluteUrl(entryPath(item)) }))
    const english = versions.find(item => item.locale === 'en')
    if (english) alternatives.push({ hreflang: 'x-default', href: absoluteUrl(entryPath(english)) })
    const image = entryImage(row)
    return { loc: entryPath(row), lastmod: row.updatedAt.toISOString(), alternatives, ...(image ? { images: [{ loc: image, title: row.title }] } : {}) }
  })
  for (const slug of Object.keys(listingPages)) {
    const alternatives = (['pl', 'en'] as const).map(locale => ({ hreflang: localeLanguage(locale), href: absoluteUrl(pagePath(slug, locale)) }))
    alternatives.push({ hreflang: 'x-default', href: absoluteUrl(pagePath(slug, 'en')) })
    for (const locale of ['pl', 'en'] as const) urls.push({ loc: pagePath(slug, locale), alternatives })
  }
  return [...new Map(urls.map(url => [typeof url === 'string' ? url : url.loc, url])).values()]
}
