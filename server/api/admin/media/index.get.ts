import { desc, isNull, sql } from 'drizzle-orm'
import { database } from '../../../db/client'
import { media } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  return database().select({
    id: media.id, name: media.name, mime: media.mime, bytes: media.bytes, alt: media.alt, caption: media.caption,
    width: media.width, height: media.height, published: media.published,
    aliases: sql<string[]>`ARRAY(SELECT id FROM media variants WHERE variants.original_id = "media"."id")`,
    uses: sql<number>`(SELECT count(DISTINCT cm.entry_id)::int FROM content_media cm JOIN content_entries e ON e.id=cm.entry_id WHERE e.status <> 'deleted' AND cm.media_id IN (SELECT id FROM media family WHERE family.id="media"."id" OR family.original_id="media"."id"))`
  }).from(media).where(isNull(media.originalId)).orderBy(desc(media.createdAt))
})
