import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import argon2 from 'argon2'
import * as OTPAuth from 'otpauth'
import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { database } from '../db/client'
import { adminSecurity, loginAttempts, sessions, usedTotp } from '../db/schema'
import { allowedAdminOrigin } from './admin-origin'
import { verifyAdminTurnstile } from './admin-turnstile'
import { decryptTotp } from './security-crypto'
import type { H3Event } from 'h3'

const cookieName = 'makoto_session'
const durationMs = 8 * 60 * 60 * 1000
const loginError = () => createError({ statusCode: 401, statusMessage: 'Nieprawidłowe dane logowania' })

function secrets() {
  const { ADMIN_LOGIN, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET } = process.env
  if (!ADMIN_LOGIN || !ADMIN_PASSWORD_HASH?.startsWith('$argon2id$') || !ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Panel is not configured' })
  }
  return { ADMIN_LOGIN, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET }
}

function hash(value: string) {
  return createHmac('sha256', secrets().ADMIN_SESSION_SECRET).update(value).digest('hex')
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: durationMs / 1000
  }
}

function assertOrigin(event: H3Event) {
  if (!allowedAdminOrigin(getHeader(event, 'origin'), getRequestURL(event), process.env.SITE_URL, import.meta.dev)) {
    throw createError({ statusCode: 403, message: 'Adres formularza nie zgadza się z adresem panelu. Odśwież stronę i spróbuj ponownie.' })
  }
}

export async function checkAttempts(key: string) {
  const [attempt] = await database().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1)
  if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) {
    throw createError({ statusCode: 429, message: 'Za dużo nieudanych prób. Spróbuj ponownie za 15 minut.' })
  }
}

export async function recordFailure(key: string) {
  await database().insert(loginAttempts).values({ key, attempts: 1 }).onConflictDoUpdate({
    target: loginAttempts.key,
    set: {
      attempts: sql`CASE WHEN ${loginAttempts.updatedAt} < now() - interval '15 minutes' THEN 1 ELSE ${loginAttempts.attempts} + 1 END`,
      blockedUntil: sql`CASE WHEN ${loginAttempts.updatedAt} >= now() - interval '15 minutes' AND ${loginAttempts.attempts} + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END`,
      updatedAt: new Date()
    }
  })
}

export async function verifyAdminPassword(password: string) {
  return argon2.verify(secrets().ADMIN_PASSWORD_HASH, password).catch(() => false)
}

export function totpStep(secret: string, code: string) {
  const now = Date.now()
  const totp = new OTPAuth.TOTP({ issuer: 'Makoto', label: secrets().ADMIN_LOGIN, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) })
  const delta = /^\d{6}$/.test(code) ? totp.validate({ token: code, window: 1, timestamp: now }) : null
  return delta === null ? null : Math.floor(now / 30_000) + delta
}

export async function signIn(event: H3Event, login: string, password: string, code: string, token: string) {
  assertOrigin(event)
  const config = secrets()
  const db = database()
  const key = `login:${hash(getRequestIP(event) || 'unknown')}`
  await checkAttempts(key)
  await verifyAdminTurnstile(event, token)
  const passwordValid = await verifyAdminPassword(password)
  if (!sameSecret(login, config.ADMIN_LOGIN) || !passwordValid) {
    await recordFailure(key)
    throw loginError()
  }
  const sessionToken = randomBytes(32).toString('base64url')
  const csrf = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + durationMs)
  const result = await db.transaction(async tx => {
    const [security] = await tx.select().from(adminSecurity).where(eq(adminSecurity.id, 1)).for('update')
    if (!security) throw createError({ statusCode: 503, message: 'Panel wymaga migracji bazy danych.' })
    if (security.totpSecret) {
      if (!code) return 'requires2fa'
      const step = totpStep(decryptTotp(security.totpSecret), code)
      if (step === null) return 'invalid'
      const claimed = await tx.insert(usedTotp).values({ step }).onConflictDoNothing().returning()
      if (!claimed.length) return 'invalid'
    }
    await tx.insert(sessions).values({ tokenHash: hash(sessionToken), csrfHash: hash(csrf), expiresAt })
    await tx.delete(loginAttempts).where(eq(loginAttempts.key, key))
    return 'ok'
  })
  if (result === 'requires2fa') {
    throw createError({ statusCode: 401, message: 'Wpisz aktualny kod z aplikacji uwierzytelniającej.', data: { code: 'TOTP_REQUIRED' } })
  }
  if (result === 'invalid') {
    await recordFailure(key)
    throw createError({ statusCode: 401, message: 'Kod 2FA jest nieprawidłowy lub został już użyty. Poczekaj na nowy kod.', data: { code: 'TOTP_INVALID' } })
  }
  setCookie(event, cookieName, sessionToken, cookieOptions())
  setCookie(event, 'makoto_csrf', csrf, { ...cookieOptions(), httpOnly: false })
  return { csrf, expiresAt: expiresAt.toISOString() }
}

export async function requireSession(event: H3Event, mutate = false) {
  secrets()
  const token = getCookie(event, cookieName)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  const [session] = await database().select().from(sessions).where(and(
    eq(sessions.tokenHash, hash(token)),
    isNull(sessions.revokedAt),
    gt(sessions.expiresAt, new Date())
  )).limit(1)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  if (mutate) {
    assertOrigin(event)
    const csrf = getHeader(event, 'x-csrf-token')
    if (!csrf || !sameSecret(hash(csrf), session.csrfHash)) throw createError({ statusCode: 403, statusMessage: 'Invalid CSRF token' })
  }
  setHeader(event, 'Cache-Control', 'no-store')
  return session
}

export async function signOut(event: H3Event) {
  const session = await requireSession(event, true)
  await database().update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, session.tokenHash))
  deleteCookie(event, cookieName, cookieOptions())
  deleteCookie(event, 'makoto_csrf', { ...cookieOptions(), httpOnly: false })
}

export function sessionCsrf(event: H3Event, expectedHash: string) {
  const csrf = getCookie(event, 'makoto_csrf')
  return csrf && sameSecret(hash(csrf), expectedHash) ? csrf : ''
}
