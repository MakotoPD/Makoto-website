import { and, eq, gt, isNull, ne } from 'drizzle-orm'
import { z } from 'zod'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { database } from '../../db/client'
import { adminSecurity, loginAttempts, sessions, usedTotp } from '../../db/schema'
import { checkAttempts, recordFailure, requireSession, totpStep, verifyAdminPassword } from '../../utils/auth'
import { decryptTotp, encryptTotp } from '../../utils/security-crypto'
import { parseInput } from '../../utils/validation'

const input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start'), password: z.string().min(1).max(1024) }),
  z.object({ action: z.literal('disable'), password: z.string().min(1).max(1024) }),
  z.object({ action: z.literal('confirm'), code: z.string().trim().regex(/^\d{6}$/) }),
  z.object({ action: z.literal('cancel') })
])
const cleared = { pendingSecret: null, pendingExpiresAt: null, pendingSessionHash: null }

export default defineEventHandler(async event => {
  const session = await requireSession(event, true)
  const body = parseInput(input, await readBody(event))
  const attemptsKey = `security:${session.tokenHash}`
  await checkAttempts(attemptsKey)
  if ('password' in body && !await verifyAdminPassword(body.password)) {
    await recordFailure(attemptsKey)
    throw createError({ statusCode: 401, message: 'Nieprawidłowe hasło.' })
  }
  const db = database()
  const result = await db.transaction(async tx => {
    const [settings] = await tx.select().from(adminSecurity).where(eq(adminSecurity.id, 1)).for('update')
    if (!settings) throw createError({ statusCode: 503, message: 'Panel wymaga migracji bazy danych.' })
    // Recheck after acquiring the lock: another security change may have revoked this session.
    const [active] = await tx.select().from(sessions).where(and(eq(sessions.tokenHash, session.tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())))
    if (!active) throw createError({ statusCode: 401, message: 'Zaloguj się ponownie.' })
    if (body.action === 'start') {
      if (settings.totpSecret) throw createError({ statusCode: 409, message: '2FA jest już włączone.' })
      const secret = new OTPAuth.Secret({ size: 20 })
      let encrypted: string
      try { encrypted = encryptTotp(secret.base32) } catch { throw createError({ statusCode: 503, message: 'Brakuje klucza szyfrowania 2FA w konfiguracji serwera.' }) }
      const totp = new OTPAuth.TOTP({ issuer: 'Makoto', label: process.env.ADMIN_LOGIN, algorithm: 'SHA1', digits: 6, period: 30, secret })
      const expiresAt = new Date(Date.now() + 10 * 60_000)
      const qr = await QRCode.toDataURL(totp.toString(), { width: 320, margin: 4, errorCorrectionLevel: 'M' })
      await tx.update(adminSecurity).set({ pendingSecret: encrypted, pendingExpiresAt: expiresAt, pendingSessionHash: session.tokenHash, updatedAt: new Date() }).where(eq(adminSecurity.id, 1))
      await tx.delete(loginAttempts).where(eq(loginAttempts.key, attemptsKey))
      return { enabled: false, qr, expiresAt: expiresAt.toISOString() }
    }
    if (body.action === 'cancel') {
      if (settings.pendingSessionHash === session.tokenHash) await tx.update(adminSecurity).set({ ...cleared, updatedAt: new Date() }).where(eq(adminSecurity.id, 1))
      return { enabled: Boolean(settings.enabledAt) }
    }
    if (body.action === 'confirm') {
      if (settings.totpSecret || !settings.pendingSecret || settings.pendingSessionHash !== session.tokenHash || !settings.pendingExpiresAt || settings.pendingExpiresAt <= new Date()) {
        throw createError({ statusCode: 409, message: 'Konfiguracja wygasła. Wygeneruj nowy kod QR.' })
      }
      const step = totpStep(decryptTotp(settings.pendingSecret), body.code)
      if (step === null) return { invalidCode: true }
      await tx.update(adminSecurity).set({ totpSecret: settings.pendingSecret, enabledAt: new Date(), ...cleared, updatedAt: new Date() }).where(eq(adminSecurity.id, 1))
      await tx.delete(usedTotp)
      await tx.insert(usedTotp).values({ step })
    } else {
      await tx.update(adminSecurity).set({ totpSecret: null, enabledAt: null, ...cleared, updatedAt: new Date() }).where(eq(adminSecurity.id, 1))
      await tx.delete(usedTotp)
    }
    await tx.update(sessions).set({ revokedAt: new Date() }).where(and(ne(sessions.tokenHash, session.tokenHash), isNull(sessions.revokedAt)))
    await tx.delete(loginAttempts).where(eq(loginAttempts.key, attemptsKey))
    return { enabled: body.action === 'confirm' }
  })
  if ('invalidCode' in result) {
    await recordFailure(attemptsKey)
    throw createError({ statusCode: 422, message: 'Kod nie pasuje. Sprawdź czas w telefonie i wpisz aktualny kod z nowo dodanego konta.' })
  }
  return result
})
