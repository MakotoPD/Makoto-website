import { z } from 'zod'
import { and, eq, max, sql } from 'drizzle-orm'
import { database } from '../db/client'
import { entries, media, mediaLinks, versions } from '../db/schema'
import { contentKinds, validateRichDocument } from '../../shared/content'
import { parseInput } from './validation'

export const entryInput = z.object({
  kind: z.enum(contentKinds),
  locale: z.enum(['pl', 'en']),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/).max(160),
  translationGroup: z.string().min(1).max(200),
  title: z.string().trim().min(2).max(180),
  summary: z.string().max(1000).default(''),
  body: z.unknown().default({ type: 'doc', content: [] }),
  sections: z.array(z.record(z.string(), z.unknown())).max(80).default([]),
  data: z.record(z.string(), z.unknown()).default({}),
  seoTitle: z.string().max(180).nullable().default(null),
  seoDescription: z.string().max(320).nullable().default(null),
  coverMediaId: z.uuid().nullable().default(null)
})

export function parseEntry(value: unknown) {
  const parsed = parseInput(entryInput, value)
  try { validateRichDocument(parsed.body) } catch { throw createError({ statusCode: 422, statusMessage: 'Invalid document' }) }
  if (JSON.stringify(parsed.sections).length > 150_000 || JSON.stringify(parsed.data).length > 250_000) throw createError({ statusCode: 422, statusMessage: 'Content is too large' })
  return { ...parsed, body: parsed.body as unknown as Record<string, unknown> }
}

function linkedMedia(value: unknown, found = new Set<string>()) {
  if (typeof value === 'string') {
    const match = value.match(/^\/api\/media\/([0-9a-f-]{36})$/i)
    if (match) found.add(match[1]!)
    return found
  }
  if (!value || typeof value !== 'object') return found
  if (Array.isArray(value)) {
    value.forEach(item => linkedMedia(item, found))
    return found
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === 'mediaId' && typeof item === 'string' && /^[0-9a-f-]{36}$/i.test(item)) found.add(item)
    linkedMedia(item, found)
  }
  return found
}

async function syncMedia(tx: Parameters<Parameters<ReturnType<typeof database>['transaction']>[0]>[0], id: string, input: ReturnType<typeof parseEntry>) {
  const oldLinks = await tx.select({ mediaId: mediaLinks.mediaId }).from(mediaLinks).where(eq(mediaLinks.entryId, id))
  const ids = linkedMedia([input.body, input.sections, input.data])
  if (input.coverMediaId) ids.add(input.coverMediaId)
  await tx.delete(mediaLinks).where(eq(mediaLinks.entryId, id))
  if (ids.size) {
    const existing = await tx.select({ id: media.id }).from(media).where(sql`${media.id} IN (${sql.join([...ids].map(id => sql`${id}::uuid`), sql`, `)})`)
    if (existing.length !== ids.size) throw createError({ statusCode: 422, statusMessage: 'Unknown media reference' })
    await tx.insert(mediaLinks).values([...ids].map(mediaId => ({ entryId: id, mediaId })))
  }
  await refreshMediaPublication(tx, new Set([...oldLinks.map(link => link.mediaId), ...ids]))
}

async function refreshMediaPublication(tx: Parameters<Parameters<ReturnType<typeof database>['transaction']>[0]>[0], ids: Set<string>) {
  for (const mediaId of ids) await tx.execute(sql`UPDATE media m SET published_at = CASE WHEN EXISTS (
    SELECT 1 FROM content_media cm JOIN content_entries e ON e.id = cm.entry_id
    WHERE cm.media_id = m.id AND e.status = 'published' AND e.published_at <= now()
  ) THEN COALESCE(m.published_at, now()) ELSE NULL END WHERE m.id = ${mediaId}::uuid`)
}

async function snapshot(tx: Parameters<Parameters<ReturnType<typeof database>['transaction']>[0]>[0], id: string) {
  const [entry] = await tx.select().from(entries).where(eq(entries.id, id)).limit(1)
  if (!entry) throw createError({ statusCode: 404 })
  const [last] = await tx.select({ number: max(versions.number) }).from(versions).where(eq(versions.entryId, id))
  await tx.insert(versions).values({ entryId: id, number: (last?.number || 0) + 1, snapshot: entry })
  return entry
}

export async function createEntry(input: ReturnType<typeof parseEntry>) {
  return database().transaction(async tx => {
    const [entry] = await tx.insert(entries).values({ ...input, status: 'draft' }).returning()
    await syncMedia(tx, entry!.id, input)
    await snapshot(tx, entry!.id)
    return entry
  })
}

export async function updateEntry(id: string, input: ReturnType<typeof parseEntry>) {
  return database().transaction(async tx => {
    await tx.execute(sql`SELECT id FROM content_entries WHERE id = ${id}::uuid FOR UPDATE`)
    const [entry] = await tx.update(entries).set({ ...input, updatedAt: new Date() }).where(eq(entries.id, id)).returning()
    if (!entry) throw createError({ statusCode: 404 })
    await syncMedia(tx, id, input)
    await snapshot(tx, id)
    return entry
  })
}

export async function setEntryStatus(id: string, status: 'published' | 'draft' | 'deleted') {
  return database().transaction(async tx => {
    await tx.execute(sql`SELECT id FROM content_entries WHERE id = ${id}::uuid FOR UPDATE`)
    const [entry] = await tx.update(entries).set({
      status,
      publishedAt: status === 'published' ? new Date() : null,
      updatedAt: new Date()
    }).where(eq(entries.id, id)).returning()
    if (!entry) throw createError({ statusCode: 404 })
    const links = await tx.select({ mediaId: mediaLinks.mediaId }).from(mediaLinks).where(eq(mediaLinks.entryId, id))
    await refreshMediaPublication(tx, new Set(links.map(link => link.mediaId)))
    await snapshot(tx, id)
    return entry
  })
}

export async function restoreVersion(id: string, number: number) {
  return database().transaction(async tx => {
    await tx.execute(sql`SELECT id FROM content_entries WHERE id = ${id}::uuid FOR UPDATE`)
    const [version] = await tx.select().from(versions).where(and(eq(versions.entryId, id), eq(versions.number, number))).limit(1)
    if (!version) throw createError({ statusCode: 404 })
    const source = version.snapshot as typeof entries.$inferSelect
    const [restored] = await tx.update(entries).set({
      kind: source.kind, locale: source.locale, slug: source.slug,
      translationGroup: source.translationGroup, title: source.title,
      summary: source.summary, body: source.body, sections: source.sections,
      data: source.data, status: 'draft', publishedAt: null,
      seoTitle: source.seoTitle, seoDescription: source.seoDescription,
      coverMediaId: source.coverMediaId, updatedAt: new Date()
    }).where(eq(entries.id, id)).returning()
    await syncMedia(tx, id, parseEntry(source))
    await snapshot(tx, id)
    return restored
  })
}
