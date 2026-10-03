import { desc } from 'drizzle-orm'
import { database } from '../../../db/client'
import { media } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  return database().select().from(media).orderBy(desc(media.createdAt)).limit(250)
})
