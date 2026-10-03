import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import argon2 from 'argon2'
import * as OTPAuth from 'otpauth'
import pg from 'pg'
import sharp from 'sharp'
import jsQR from 'jsqr'
import { markdownToDocument } from '../shared/markdown.ts'

const connectionString = process.env.TEST_DATABASE_URL
if (!connectionString || new URL(connectionString).pathname !== '/makoto_verify' || !['127.0.0.1', 'localhost'].includes(new URL(connectionString).hostname)) {
  throw new Error('TEST_DATABASE_URL must point to local makoto_verify database')
}

const origin = 'http://127.0.0.1:3101'
const password = randomBytes(24).toString('base64url')
const encryptionKey = randomBytes(32).toString('base64')
const credentials = { login: 'integration', password, token: 'XXXX.DUMMY.TOKEN.XXXX' }
const storage = await mkdtemp(join(tmpdir(), 'makoto-media-test-'))
const database = new pg.Client({ connectionString })
await database.connect()
await database.query('TRUNCATE used_totp_steps, admin_login_attempts, admin_sessions')
await database.query('UPDATE admin_security SET totp_secret=NULL, enabled_at=NULL, pending_secret=NULL, pending_expires_at=NULL, pending_session_hash=NULL WHERE id=1')
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'test', NITRO_HOST: '127.0.0.1', NITRO_PORT: '3101', SITE_URL: origin,
    DATABASE_URL: connectionString, ADMIN_LOGIN: 'integration',
    ADMIN_PASSWORD_HASH: await argon2.hash(password, { type: argon2.argon2id }),
    ADMIN_2FA_ENCRYPTION_KEY: encryptionKey,
    ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'),
    R2_TEST_DIR: storage,
    R2_ACCOUNT_ID: '', R2_ACCESS_KEY_ID: '', R2_SECRET_ACCESS_KEY: '', R2_BUCKET_NAME: '',
    WEB3FORMS_KEY: '', TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
    NUXT_PUBLIC_ADMIN_TURNSTILE_SITE_KEY: '1x00000000000000000000AA'
  },
  stdio: ['ignore', 'pipe', 'pipe']
})
let output = ''
child.stdout.on('data', chunk => { output += chunk.toString() })
child.stderr.on('data', chunk => { output += chunk.toString() })

async function request(path, init = {}, expected = 200) {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual', ...init })
  const text = await response.text()
  assert.equal(response.status, expected, `${init.method || 'GET'} ${path}: ${response.status} ${text.slice(0, 350)}`)
  let json
  try { json = JSON.parse(text) } catch { /* HTML or binary */ }
  return { response, text, json }
}

function jsonPost(body, cookie = '', csrf = '', useOrigin = true) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(csrf ? { 'x-csrf-token': csrf } : {}), ...(useOrigin ? { origin } : {}) },
    body: JSON.stringify(body)
  }
}

try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${origin}/api/admin/session`)
      if (response.status === 401) { ready = true; break }
    } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, `Server did not start: ${output.slice(-1000)}`)

  await request('/panel', {}, 302)
  await request('/api/admin/entries', {}, 401)
  await request('/api/admin/entries', jsonPost({ kind: 'article' }), 401)
  await request('/api/contact', jsonPost({ name: 'A', email: 'bad', message: 'short', token: 'invalidtoken' }), 422)
  await request('/api/contact', jsonPost({ name: 'Local Test', email: 'test@example.invalid', message: 'This is a local test message.', token: 'invalidtoken' }), 503)
  await request('/api/admin/security', {}, 401)
  await request('/api/admin/security', jsonPost({ action: 'start', password }), 401)
  await request('/api/admin/login', jsonPost(credentials, '', '', false), 403)
  await request('/api/admin/login', jsonPost({ ...credentials, token: '' }), 422)
  await request('/api/admin/login', jsonPost({ ...credentials, token: 'forged' }), 422)
  await request('/api/admin/login', jsonPost({ ...credentials, password: 'wrong' }), 401)
  const signedIn = await request('/api/admin/login', jsonPost(credentials))
  const cookie = signedIn.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  const csrf = signedIn.json.csrf
  assert.match(cookie, /makoto_session=/)
  await request('/panel', { headers: { cookie } })
  await request('/api/admin/session', { headers: { cookie } })
  assert.equal((await request('/api/admin/security', { headers: { cookie } })).json.enabled, false)
  await request('/api/admin/security', jsonPost({ action: 'start', password }, cookie, 'wrong'), 403)
  await request('/api/admin/security', jsonPost({ action: 'start', password: 'wrong' }, cookie, csrf), 401)
  const other = await request('/api/admin/login', jsonPost(credentials))
  const otherCookie = other.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  async function setup2fa() {
    const setup = await request('/api/admin/security', jsonPost({ action: 'start', password }, cookie, csrf))
    assert.ok(setup.json.qr.startsWith('data:image/png;base64,'))
    const image = await sharp(Buffer.from(setup.json.qr.split(',')[1], 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const decoded = jsQR(new Uint8ClampedArray(image.data), image.info.width, image.info.height)
    assert.ok(decoded, 'QR is machine-readable')
    const otp = OTPAuth.URI.parse(decoded.data)
    assert.equal(otp.issuer, 'Makoto')
    assert.equal(otp.label, 'integration')
    const stored = (await database.query('SELECT pending_secret FROM admin_security WHERE id=1')).rows[0].pending_secret
    assert.ok(stored.startsWith('v1.') && !stored.includes(otp.secret.base32), 'Secret is encrypted in storage')
    return otp
  }
  let otp = await setup2fa()
  const status = await request('/api/admin/security', { headers: { cookie } })
  assert.deepEqual(Object.keys(status.json).sort(), ['enabled', 'enabledAt'])
  await request('/api/admin/security', jsonPost({ action: 'confirm', code: otp.generate() }, otherCookie, other.json.csrf), 409)
  await database.query("UPDATE admin_security SET pending_expires_at=now() - interval '1 second' WHERE id=1")
  await request('/api/admin/security', jsonPost({ action: 'confirm', code: otp.generate() }, cookie, csrf), 409)
  otp = await setup2fa()
  let invalidCode = '000000'
  while (otp.validate({ token: invalidCode, window: 1 }) !== null) invalidCode = String(Number(invalidCode) + 1).padStart(6, '0')
  await request('/api/admin/security', jsonPost({ action: 'confirm', code: invalidCode }, cookie, csrf), 422)
  assert.equal((await request('/api/admin/security', { headers: { cookie } })).json.enabled, false)
  const confirmationCode = otp.generate({ timestamp: Date.now() - 30_000 })
  await request('/api/admin/security', jsonPost({ action: 'confirm', code: confirmationCode }, cookie, csrf))
  assert.equal((await request('/api/admin/security', { headers: { cookie } })).json.enabled, true)
  await request('/api/admin/session', { headers: { cookie: otherCookie } }, 401)
  const required = await request('/api/admin/login', jsonPost(credentials), 401)
  assert.equal(required.json.data.code, 'TOTP_REQUIRED')
  await request('/api/admin/login', jsonPost({ ...credentials, code: confirmationCode }), 401)
  await request('/api/admin/login', jsonPost({ ...credentials, code: invalidCode }), 401)
  const code = otp.generate()
  const concurrent = await Promise.all([1, 2].map(() => fetch(`${origin}/api/admin/login`, jsonPost({ ...credentials, code }))))
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 401], 'Concurrent replay accepts the code once')
  await request('/api/admin/security', jsonPost({ action: 'disable', password: 'wrong' }, cookie, csrf), 401)
  await request('/api/admin/security', jsonPost({ action: 'disable', password }, cookie, csrf))
  assert.equal((await request('/api/admin/security', { headers: { cookie } })).json.enabled, false)
  await setup2fa()
  await request('/api/admin/security', jsonPost({ action: 'cancel' }, cookie, csrf))
  assert.equal((await database.query('SELECT pending_secret FROM admin_security WHERE id=1')).rows[0].pending_secret, null)
  console.log('Security: password-only login, Turnstile, readable QR, enrollment expiry/binding, encrypted storage, 2FA, replay and disable passed')
  if (process.env.VISUAL_OUTPUT_DIR) {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    try {
      await mkdir(process.env.VISUAL_OUTPUT_DIR, { recursive: true })
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      await context.addCookies(signedIn.response.headers.getSetCookie().map(value => {
        const [name, ...rest] = value.split(';')[0].split('=')
        return { name, value: rest.join('='), url: origin }
      }))
      const page = await context.newPage()
      await page.goto(`${origin}/panel`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1200)
      assert.equal(new URL(page.url()).pathname, '/panel')
      await page.screenshot({ path: join(process.env.VISUAL_OUTPUT_DIR, 'panel-desktop.png'), fullPage: true })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(800)
      await page.screenshot({ path: join(process.env.VISUAL_OUTPUT_DIR, 'panel-mobile.png'), fullPage: true })
    } finally { await browser.close() }
  }

  const slug = `integration-${randomUUID().slice(0, 8)}`
  const body = markdownToDocument(await readFile(new URL('./fixtures/markdown-rendering.md', import.meta.url), 'utf8'))
  const entry = { kind: 'article', locale: 'pl', slug, translationGroup: randomUUID(), title: 'Test lokalny', summary: 'Treść testowa', body, sections: [], data: {}, seoTitle: 'Test lokalny', seoDescription: 'Treść testowa', coverMediaId: null }
  await request('/api/admin/entries', jsonPost(entry, cookie, '', false), 403)
  await request('/api/admin/entries', jsonPost(entry, cookie, 'wrong'), 403)

  const image = await sharp({ create: { width: 2, height: 2, channels: 4, background: '#38bdf8' } }).png().toBuffer()
  const invalidForm = new FormData()
  invalidForm.set('file', new Blob([Buffer.from('<svg/>')], { type: 'image/png' }), 'bad.png')
  await request('/api/admin/media', { method: 'POST', headers: { origin, cookie, 'x-csrf-token': csrf }, body: invalidForm }, 415)
  const form = new FormData()
  form.set('file', new Blob([image], { type: 'image/png' }), 'image.png')
  form.set('alt', 'Test image')
  const uploaded = await request('/api/admin/media', { method: 'POST', headers: { origin, cookie, 'x-csrf-token': csrf }, body: form }, 201)
  const mediaId = uploaded.json.id
  await request(`/api/admin/media/${mediaId}`, { method: 'PATCH', headers: { origin, cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' }, body: JSON.stringify({ alt: 'Test image', caption: 'Local test' }) })
  await request(`/api/media/${mediaId}`, {}, 401)

  entry.body = structuredClone(body)
  entry.body.content.push({ type: 'image', attrs: { src: `/api/media/${mediaId}`, alt: 'Test image' } })
  entry.data = { cover: { url: `/api/media/${mediaId}` } }
  const created = await request('/api/admin/entries', jsonPost(entry, cookie, csrf), 201)
  assert.deepEqual(created.json.body, JSON.parse(JSON.stringify(entry.body)), 'CMS retains every rich-text node and mark')
  const id = created.json.id
  await request(`/api/content/article?locale=pl&slug=${slug}`, {}, 404)
  await request(`/api/admin/preview/${id}`, {}, 401)
  await request(`/api/admin/preview/${id}`, { headers: { cookie } })
  const before = await request('/sitemap.xml')
  assert.ok(!before.text.includes(slug))
  await request(`/api/admin/entries/${id}/status`, jsonPost({ status: 'published' }, cookie, csrf))
  await request(`/api/content/article?locale=pl&slug=${slug}`)
  const publicPage = await request(`/pl/blog/${slug}`)
  assert.match(publicPage.text, /Test lokalny/)
  for (const marker of ['alert-note', 'alert-success', 'alert-info', 'alert-tip', 'alert-important', 'alert-warning', 'alert-caution', '<mark>', '<kbd>', '<sub>', '<sup>', '<h6>', '<table>', 'hljs-keyword']) assert.ok(publicPage.text.includes(marker), `Published SSR retains ${marker}`)
  await request('/__preview/markdown', {}, 404)
  assert.match(publicPage.text, new RegExp(`rel="canonical" href="https://makoto.com.pl/pl/blog/${slug}"`))
  await request(`/api/media/${mediaId}`)
  const after = await request('/sitemap.xml')
  assert.ok(after.text.includes(`/pl/blog/${slug}`))
  await request(`/api/admin/media/${mediaId}`, { method: 'DELETE', headers: { origin, cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' }, body: JSON.stringify({ confirm: 'DELETE' }) }, 409)
  const revisions = await request(`/api/admin/entries/${id}/versions`, { headers: { cookie } })
  assert.ok(revisions.json.length >= 2)
  await request(`/api/admin/entries/${id}/restore`, jsonPost({ number: 1 }, cookie, csrf))
  await request(`/api/content/article?locale=pl&slug=${slug}`, {}, 404)
  await request(`/api/media/${mediaId}`, {}, 401)
  await request(`/api/admin/entries/${id}`, { ...jsonPost({ ...entry, body }, cookie, csrf), method: 'PUT' })
  await request(`/api/admin/media/${mediaId}`, { method: 'DELETE', headers: { origin, cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' }, body: JSON.stringify({ confirm: 'DELETE' }) }, 409)
  await request(`/api/admin/entries/${id}`, { ...jsonPost({ ...entry, body, data: {} }, cookie, csrf), method: 'PUT' })
  await request(`/api/admin/media/${mediaId}`, { method: 'DELETE', headers: { origin, cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' }, body: JSON.stringify({ confirm: 'DELETE' }) })

  await request('/api/admin/logout', jsonPost({}, cookie, csrf))
  await request('/api/admin/session', { headers: { cookie } }, 401)
  const second = await request('/api/admin/login', jsonPost(credentials))
  const secondCookie = second.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  await database.query("UPDATE admin_sessions SET expires_at = now() - interval '1 second' WHERE revoked_at IS NULL")
  await request('/api/admin/session', { headers: { cookie: secondCookie } }, 401)
  for (let attempt = 0; attempt < 5; attempt++) await request('/api/admin/login', jsonPost({ ...credentials, password: 'wrong' }), 401)
  await request('/api/admin/login', jsonPost({ ...credentials, password: 'wrong' }), 429)
  console.log('Local integration: login, TOTP replay, CSRF, draft, publish, SSR, sitemap, media, version restore, logout and expiry passed')
} finally {
  child.kill()
  await database.end()
  try { await rmdir(storage) } catch { /* Retain files for inspection after a failed run. */ }
}
