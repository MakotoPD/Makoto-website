import { eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { entries } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  const [entry] = await database().select().from(entries).where(eq(entries.id, getRouterParam(event, 'id') || '')).limit(1)
  if (!entry) throw createError({ statusCode: 404 })
  return entry
})
