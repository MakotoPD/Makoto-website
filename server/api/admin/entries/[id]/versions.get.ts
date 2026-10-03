import { desc, eq } from 'drizzle-orm'
import { database } from '../../../../db/client'
import { versions } from '../../../../db/schema'
import { requireSession } from '../../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  return database().select().from(versions).where(eq(versions.entryId, getRouterParam(event, 'id') || '')).orderBy(desc(versions.number)).limit(100)
})
