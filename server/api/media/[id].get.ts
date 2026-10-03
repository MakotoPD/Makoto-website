import { and, eq, lte, sql } from 'drizzle-orm'
import { database } from '../../db/client'
import { entries, media, mediaLinks } from '../../db/schema'
import { requireSession } from '../../utils/auth'
import { downloadObject } from '../../utils/r2'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 404 })
  const [item] = await database().select().from(media).where(eq(media.id, id)).limit(1)
  if (!item) throw createError({ statusCode: 404 })
  const [publicUse] = await database().select({ id: entries.id }).from(mediaLinks).innerJoin(entries, eq(mediaLinks.entryId, entries.id)).where(and(
    eq(mediaLinks.mediaId, id), eq(entries.status, 'published'), lte(entries.publishedAt, sql`now()`)
  )).limit(1)
  if (!publicUse) await requireSession(event)
  setHeader(event, 'Content-Type', item.mime)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Content-Security-Policy', "default-src 'none'; sandbox")
  setHeader(event, 'Cache-Control', publicUse ? 'public, max-age=3600' : 'private, no-store')
  setHeader(event, 'Content-Disposition', `${item.mime === 'application/pdf' ? 'attachment' : 'inline'}; filename="${item.name.replace(/["\r\n]/g, '')}"`)
  return downloadObject(item.objectKey)
})
