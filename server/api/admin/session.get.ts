import { requireSession, sessionCsrf } from '../../utils/auth'

export default defineEventHandler(async event => {
  const session = await requireSession(event)
  return { authenticated: true, csrf: sessionCsrf(event, session.csrfHash), expiresAt: session.expiresAt.toISOString() }
})
