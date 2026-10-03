import { randomBytes } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { allowedAdminOrigin } from '../server/utils/admin-origin'
import { encryptTotp, decryptTotp } from '../server/utils/security-crypto'
import { verifyAdminTurnstile } from '../server/utils/admin-turnstile'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('Admin origin checks', () => {
  it('accepts same-origin local development on either alias and rejects cross-origin requests', () => {
    for (const host of ['localhost', '127.0.0.1']) {
      const url = new URL(`http://${host}:3000/api/admin/login`)
      expect(allowedAdminOrigin(url.origin, url, 'https://makoto.com.pl', true)).toBe(true)
      expect(allowedAdminOrigin('http://evil.test', url, 'https://makoto.com.pl', true)).toBe(false)
      expect(allowedAdminOrigin(undefined, url, undefined, true)).toBe(false)
      expect(allowedAdminOrigin('null', url, undefined, true)).toBe(false)
    }
    expect(allowedAdminOrigin('http://localhost:3000', new URL('http://127.0.0.1:3000'), 'https://makoto.com.pl', true)).toBe(false)
  })
  it('keeps production bound to its configured origin', () => {
    const url = new URL('https://makoto.com.pl/api/admin/login')
    expect(allowedAdminOrigin('https://makoto.com.pl', url, 'https://makoto.com.pl/', false)).toBe(true)
    expect(allowedAdminOrigin('http://localhost:3000', url, 'https://makoto.com.pl', false)).toBe(false)
  })
})

describe('Stored TOTP encryption', () => {
  it('round-trips with unique nonces and rejects tampering or a different key', () => {
    vi.stubEnv('ADMIN_2FA_ENCRYPTION_KEY', randomBytes(32).toString('base64'))
    const secret = 'JBSWY3DPEHPK3PXP'
    const encrypted = encryptTotp(secret)
    expect(encrypted).not.toContain(secret)
    expect(encryptTotp(secret)).not.toBe(encrypted)
    expect(decryptTotp(encrypted)).toBe(secret)
    const parts = encrypted.split('.')
    parts[2] = randomBytes(16).toString('base64')
    expect(() => decryptTotp(parts.join('.'))).toThrow()
    vi.stubEnv('ADMIN_2FA_ENCRYPTION_KEY', randomBytes(32).toString('base64'))
    expect(() => decryptTotp(encrypted)).toThrow()
    vi.stubEnv('ADMIN_2FA_ENCRYPTION_KEY', '')
    expect(() => encryptTotp(secret)).toThrow()
  })
})

function turnstileSetup() {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('SITE_URL', 'https://makoto.com.pl')
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'configured-production-key')
  vi.stubGlobal('getRequestURL', () => new URL('https://makoto.com.pl/api/admin/login'))
  vi.stubGlobal('getRequestIP', () => '127.0.0.1')
  vi.stubGlobal('createError', (input: object) => Object.assign(new Error(), input))
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, hostname: 'makoto.com.pl', action: 'admin-login' }) })
  vi.stubGlobal('fetch', fetch)
  return fetch
}
describe('Server-side Turnstile', () => {
  it('requires a token, validates it with Cloudflare and checks hostname and action', async () => {
    const fetch = turnstileSetup()
    await expect(verifyAdminTurnstile({} as any, '')).rejects.toMatchObject({ statusCode: 422 })
    expect(fetch).not.toHaveBeenCalled()
    await expect(verifyAdminTurnstile({} as any, 'valid-token')).resolves.toBeUndefined()
    expect(fetch.mock.calls[0]?.[0]).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    for (const result of [
      { success: false },
      { success: true, hostname: 'evil.test', action: 'admin-login' },
      { success: true, hostname: 'makoto.com.pl', action: 'contact' }
    ]) {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => result })
      await expect(verifyAdminTurnstile({} as any, 'token')).rejects.toMatchObject({ statusCode: 422 })
    }
  })
  it('fails closed for outages, missing configuration and production test keys', async () => {
    const fetch = turnstileSetup()
    fetch.mockRejectedValueOnce(new Error('network unavailable'))
    await expect(verifyAdminTurnstile({} as any, 'token')).rejects.toMatchObject({ statusCode: 503 })
    for (const key of ['', '1x0000000000000000000000000000000AA']) {
      vi.stubEnv('TURNSTILE_SECRET_KEY', key)
      await expect(verifyAdminTurnstile({} as any, 'XXXX.DUMMY.TOKEN.XXXX')).rejects.toMatchObject({ statusCode: 503 })
    }
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
