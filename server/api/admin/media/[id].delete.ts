import { eq, inArray, or } from 'drizzle-orm'
import { database } from '../../../db/client'
import { media, mediaLinks } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'
import { deleteObject } from '../../../utils/r2'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  if ((await readBody(event))?.confirm !== 'DELETE') throw createError({ statusCode: 422, statusMessage: 'Confirmation required' })
  const id = getRouterParam(event, 'id') || ''
  const keys = await database().transaction(async tx => {
    const [row] = await tx.select().from(media).where(eq(media.id, id)).for('update').limit(1)
    if (!row) throw createError({ statusCode: 404 })
    const family = await tx.select().from(media).where(or(eq(media.id, id), eq(media.originalId, id))).for('update')
    const ids = family.map(item => item.id)
    const [link] = await tx.select().from(mediaLinks).where(inArray(mediaLinks.mediaId, ids)).limit(1)
    if (link) throw createError({ statusCode: 409, statusMessage: 'File is used by content' })
    await tx.delete(media).where(eq(media.originalId, id))
    await tx.delete(media).where(eq(media.id, id))
    return family.map(item => item.objectKey)
  })
  // Commit the reference checks before removing objects; failed deletions leave only orphaned private files.
  await Promise.all(keys.map(key => deleteObject(key).catch(() => undefined)))
  return { ok: true }
})
