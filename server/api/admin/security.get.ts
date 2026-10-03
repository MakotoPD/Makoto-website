import { eq } from 'drizzle-orm'
import { database } from '../../db/client'
import { adminSecurity } from '../../db/schema'
import { requireSession } from '../../utils/auth'

export default defineEventHandler(async event => {
  await requireSession(event)
  const [settings] = await database().select({ enabledAt: adminSecurity.enabledAt }).from(adminSecurity).where(eq(adminSecurity.id, 1))
  if (!settings) throw createError({ statusCode: 503, message: 'Panel wymaga migracji bazy danych.' })
  return { enabled: Boolean(settings.enabledAt), enabledAt: settings.enabledAt }
})
