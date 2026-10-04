import { and, eq, inArray, lte, or, sql } from 'drizzle-orm'
import { database } from '../../db/client'
import { entries, media, mediaLinks } from '../../db/schema'
import { requireSession } from '../../utils/auth'
import { downloadObject } from '../../utils/r2'
import { imageSizes, imageVariant, type ImageSize } from '../../utils/imageVariants'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 404 })
  const [item] = await database().select().from(media).where(eq(media.id, id)).limit(1)
  if (!item) throw createError({ statusCode: 404 })
  const size = getQuery(event).size
  if (size !== undefined && (typeof size !== 'string' || !Object.hasOwn(imageSizes, size) || !item.mime.startsWith('image/'))) {
    throw createError({ statusCode: 400, statusMessage: 'Use size=small, medium or big for images' })
  }
  const family = await database().select().from(media).where(or(eq(media.id, item.originalId || id), eq(media.originalId, item.originalId || id)))
  const [publicUse] = await database().select({ id: entries.id }).from(mediaLinks).innerJoin(entries, eq(mediaLinks.entryId, entries.id)).where(and(
    inArray(mediaLinks.mediaId, family.map(row => row.id)), eq(entries.status, 'published'), lte(entries.publishedAt, sql`now()`)
  )).limit(1)
  if (!publicUse) await requireSession(event)
  setHeader(event, 'Content-Type', size ? 'image/webp' : item.mime)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Content-Security-Policy', "default-src 'none'; sandbox")
  setHeader(event, 'Cache-Control', publicUse ? 'public, max-age=3600' : 'private, no-store')
  const name = size ? `${item.name.replace(/\.[^.]+$/, '')}-${size}.webp` : item.name
  setHeader(event, 'Content-Disposition', `${item.mime === 'application/pdf' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(name)}`)
  if (size) {
    const original = family.find(row => row.id === (item.originalId || id)) || item
    return imageVariant(original.objectKey, size as ImageSize, () => downloadObject(original.objectKey))
  }
  return downloadObject(item.objectKey)
})
