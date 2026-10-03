import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import argon2 from 'argon2'
import * as OTPAuth from 'otpauth'
import { and, eq, gt, isNull, sql } from 'drizzle-orm'
import { database } from '../db/client'
import { loginAttempts, sessions, usedTotp } from '../db/schema'
import type { H3Event } from 'h3'

const cookieName = 'makoto_session'
const durationMs = 8 * 60 * 60 * 1000
const loginError = () => createError({ statusCode: 401, statusMessage: 'Nieprawidłowe dane logowania' })

function secrets() {
  const { ADMIN_LOGIN, ADMIN_PASSWORD_HASH, ADMIN_TOTP_SECRET, ADMIN_SESSION_SECRET } = process.env
  if (!ADMIN_LOGIN || !ADMIN_PASSWORD_HASH?.startsWith('$argon2id$') || !ADMIN_TOTP_SECRET || !ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Panel is not configured' })
  }
  return { ADMIN_LOGIN, ADMIN_PASSWORD_HASH, ADMIN_TOTP_SECRET, ADMIN_SESSION_SECRET }
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
  const origin = getHeader(event, 'origin')
  const expected = process.env.SITE_URL || getRequestURL(event).origin
  if (!origin || origin !== expected) throw createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
}

export async function signIn(event: H3Event, login: string, password: string, code: string) {
  assertOrigin(event)
  const config = secrets()
  const db = database()
  const ip = getRequestIP(event) || 'unknown'
  const key = `login:${hash(ip)}`
  const [attempt] = await db.select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1)
  if (attempt?.blockedUntil && attempt.blockedUntil > new Date()) throw createError({ statusCode: 429, statusMessage: 'Spróbuj ponownie później' })

  let valid = false
  let step = -1
  try {
    const passwordValid = await argon2.verify(config.ADMIN_PASSWORD_HASH, password)
    const totp = new OTPAuth.TOTP({ issuer: 'Makoto', label: config.ADMIN_LOGIN, algorithm: 'SHA1', digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(config.ADMIN_TOTP_SECRET) })
    const delta = /^\d{6}$/.test(code) ? totp.validate({ token: code, window: 1 }) : null
    valid = sameSecret(login, config.ADMIN_LOGIN) && passwordValid && delta !== null
    if (valid) step = Math.floor(Date.now() / 30_000) + delta!
  } catch {
    valid = false
  }

  if (!valid) {
    await db.insert(loginAttempts).values({
      key,
      attempts: 1,
      blockedUntil: null
    }).onConflictDoUpdate({
      target: loginAttempts.key,
      set: {
        attempts: sql`${loginAttempts.attempts} + 1`,
        blockedUntil: sql`CASE WHEN ${loginAttempts.attempts} + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END`,
        updatedAt: new Date()
      }
    })
    throw loginError()
  }

  const token = randomBytes(32).toString('base64url')
  const csrf = randomBytes(32).toString('base64url')
  try {
    await db.transaction(async tx => {
      await tx.insert(usedTotp).values({ step })
      await tx.insert(sessions).values({
        tokenHash: hash(token),
        csrfHash: hash(csrf),
        expiresAt: new Date(Date.now() + durationMs)
      })
      await tx.delete(loginAttempts).where(eq(loginAttempts.key, key))
    })
  } catch {
    throw loginError()
  }
  setCookie(event, cookieName, token, cookieOptions())
  setCookie(event, 'makoto_csrf', csrf, { ...cookieOptions(), httpOnly: false })
  return { csrf, expiresAt: new Date(Date.now() + durationMs).toISOString() }
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
