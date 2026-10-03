import { and, eq, lte, sql } from 'drizzle-orm'
import { database } from '../db/client'
import { entries } from '../db/schema'
import type { ContentKind, Locale, PublicEntry } from '../../shared/content'

function publicEntry(row: typeof entries.$inferSelect): PublicEntry {
  return {
    id: row.id,
    kind: row.kind as ContentKind,
    locale: row.locale as Locale,
    slug: row.slug,
    translationGroup: row.translationGroup,
    title: row.title,
    summary: row.summary,
    body: row.body as unknown as PublicEntry['body'],
    sections: row.sections,
    data: row.data,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    coverMediaId: row.coverMediaId,
    publishedAt: row.publishedAt?.toISOString() || null,
    updatedAt: row.updatedAt.toISOString()
  }
}

export async function listPublished(kind: ContentKind, locale: Locale) {
  const rows = await database().select().from(entries).where(and(
    eq(entries.kind, kind),
    eq(entries.locale, locale),
    eq(entries.status, 'published'),
    lte(entries.publishedAt, sql`now()`)
  )).orderBy(entries.createdAt)
  return rows.map(publicEntry)
}

export async function getPublished(kind: ContentKind, locale: Locale, slug: string) {
  const [row] = await database().select().from(entries).where(and(
    eq(entries.kind, kind),
    eq(entries.locale, locale),
    eq(entries.slug, slug),
    eq(entries.status, 'published'),
    lte(entries.publishedAt, sql`now()`)
  )).limit(1)
  if (!row) return null
  const translations = await database().select({ locale: entries.locale, slug: entries.slug }).from(entries).where(and(
    eq(entries.translationGroup, row.translationGroup),
    eq(entries.status, 'published'),
    lte(entries.publishedAt, sql`now()`)
  ))
  return { ...publicEntry(row), translations: translations.map(item => ({ locale: item.locale as Locale, slug: item.slug })) }
}
