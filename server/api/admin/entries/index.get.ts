import { desc, eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { entries } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  const kind = getQuery(event).kind
  const query = database().select().from(entries)
  return (typeof kind === 'string' ? query.where(eq(entries.kind, kind)) : query).orderBy(desc(entries.updatedAt))
})
