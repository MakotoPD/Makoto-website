import { eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { entries } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  const id = getRouterParam(event, 'id') || ''
  const [entry] = await database().select().from(entries).where(eq(entries.id, id)).limit(1)
  if (!entry) throw createError({ statusCode: 404 })
  return entry
})
