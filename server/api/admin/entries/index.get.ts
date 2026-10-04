import { desc, eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { entries } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  const { kind, compact } = getQuery(event)
  if (compact === 'true') {
    const references = database().select({ id: entries.id, kind: entries.kind, locale: entries.locale, slug: entries.slug, translationGroup: entries.translationGroup, title: entries.title, status: entries.status }).from(entries)
    return (typeof kind === 'string' ? references.where(eq(entries.kind, kind)) : references).orderBy(desc(entries.updatedAt))
  }
  const query = database().select().from(entries)
  return (typeof kind === 'string' ? query.where(eq(entries.kind, kind)) : query).orderBy(desc(entries.updatedAt))
})
