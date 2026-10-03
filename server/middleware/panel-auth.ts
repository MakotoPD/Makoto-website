import { requireSession } from '../utils/auth'

export default defineEventHandler(async event => {
  const path = getRequestURL(event).pathname
  if (!/^\/(?:pl\/)?panel(?:\/|$)/.test(path) || /^\/(?:pl\/)?panel\/login\/?$/.test(path)) return
  try {
    await requireSession(event)
  } catch {
    return sendRedirect(event, '/panel/login', 302)
  }
})
