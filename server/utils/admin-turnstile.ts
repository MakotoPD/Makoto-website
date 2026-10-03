import type { H3Event } from 'h3'
import { env } from 'node:process'
import { isLoopback } from './admin-origin'

const testSecret = '1x0000000000000000000000000000000AA'
type Verification = { success: boolean; hostname?: string; action?: string }
export function validAdminChallenge(result: Verification, hostname: string, testing: boolean) {
  return result.success === true && (testing || (result.hostname === hostname && result.action === 'admin-login'))
}

export async function verifyAdminTurnstile(event: H3Event, token: string) {
  const url = getRequestURL(event)
  const secret = import.meta.dev && isLoopback(url.hostname) ? testSecret : process.env.TURNSTILE_SECRET_KEY
  const dummy = /^[123]x0+AA$/.test(secret || '')
  // Read the runtime environment: Nitro replaces process.env.NODE_ENV at build time.
  const testing = dummy && (import.meta.dev || env.NODE_ENV === 'test') && isLoopback(url.hostname)
  if (!secret || (dummy && !testing)) {
    throw createError({ statusCode: 503, message: 'Ochrona logowania nie jest skonfigurowana.' })
  }
  if (!token || token.length > 2048 || (testing && token !== 'XXXX.DUMMY.TOKEN.XXXX')) throw createError({ statusCode: 422, message: 'Potwierdź weryfikację Turnstile.' })
  let result: Verification
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token, remoteip: getRequestIP(event) || '' })
    })
    if (!response.ok) throw new Error('Turnstile unavailable')
    result = await response.json() as Verification
  } catch {
    throw createError({ statusCode: 503, message: 'Weryfikacja Turnstile jest chwilowo niedostępna. Spróbuj ponownie.' })
  }
  const hostname = new URL(process.env.SITE_URL || url.origin).hostname
  if (!validAdminChallenge(result, hostname, testing)) {
    throw createError({ statusCode: 422, message: 'Weryfikacja Turnstile wygasła lub została odrzucona. Spróbuj ponownie.' })
  }
}
