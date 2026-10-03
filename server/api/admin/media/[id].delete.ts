import { eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { media, mediaLinks } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'
import { deleteObject } from '../../../utils/r2'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  if ((await readBody(event))?.confirm !== 'DELETE') throw createError({ statusCode: 422, statusMessage: 'Confirmation required' })
  const id = getRouterParam(event, 'id') || ''
  await database().transaction(async tx => {
    const [row] = await tx.select().from(media).where(eq(media.id, id)).for('update').limit(1)
    if (!row) throw createError({ statusCode: 404 })
    const [link] = await tx.select().from(mediaLinks).where(eq(mediaLinks.mediaId, id)).limit(1)
    if (link) throw createError({ statusCode: 409, statusMessage: 'File is used by content' })
    await deleteObject(row.objectKey)
    await tx.delete(media).where(eq(media.id, id))
  })
  return { ok: true }
})
