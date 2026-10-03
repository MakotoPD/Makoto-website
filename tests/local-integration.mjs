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
import { markdownToDocument } from '../shared/markdown.ts'

const connectionString = process.env.TEST_DATABASE_URL
if (!connectionString || new URL(connectionString).pathname !== '/makoto_verify' || !['127.0.0.1', 'localhost'].includes(new URL(connectionString).hostname)) {
  throw new Error('TEST_DATABASE_URL must point to local makoto_verify database')
}

const origin = 'http://127.0.0.1:3101'
const password = randomBytes(24).toString('base64url')
const secret = new OTPAuth.Secret({ size: 20 })
const totp = new OTPAuth.TOTP({ issuer: 'Makoto Test', label: 'integration', secret, digits: 6, period: 30 })
const storage = await mkdtemp(join(tmpdir(), 'makoto-media-test-'))
const database = new pg.Client({ connectionString })
await database.connect()
await database.query('TRUNCATE used_totp_steps, admin_login_attempts, admin_sessions')
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'test', NITRO_HOST: '127.0.0.1', NITRO_PORT: '3101', SITE_URL: origin,
    DATABASE_URL: connectionString, ADMIN_LOGIN: 'integration',
    ADMIN_PASSWORD_HASH: await argon2.hash(password, { type: argon2.argon2id }),
    ADMIN_TOTP_SECRET: secret.base32,
    ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'),
    R2_TEST_DIR: storage,
    R2_ACCOUNT_ID: '', R2_ACCESS_KEY_ID: '', R2_SECRET_ACCESS_KEY: '', R2_BUCKET_NAME: '',
    WEB3FORMS_KEY: '', TURNSTILE_SECRET_KEY: ''
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
  const code = totp.generate()
  await request('/api/admin/login', jsonPost({ login: 'integration', password: 'wrong', code }), 401)
  await request('/api/admin/login', jsonPost({ login: 'integration', password, code: '000000' }), 401)
  const signedIn = await request('/api/admin/login', jsonPost({ login: 'integration', password, code }))
  const cookie = signedIn.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  const csrf = signedIn.json.csrf
  assert.match(cookie, /makoto_session=/)
  await request('/api/admin/login', jsonPost({ login: 'integration', password, code }), 401)
  await request('/panel', { headers: { cookie } })
  await request('/api/admin/session', { headers: { cookie } })
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
  const nextCode = totp.generate({ timestamp: Date.now() + 30_000 })
  const second = await request('/api/admin/login', jsonPost({ login: 'integration', password, code: nextCode }))
  const secondCookie = second.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  await database.query("UPDATE admin_sessions SET expires_at = now() - interval '1 second' WHERE revoked_at IS NULL")
  await request('/api/admin/session', { headers: { cookie: secondCookie } }, 401)
  for (let attempt = 0; attempt < 5; attempt++) await request('/api/admin/login', jsonPost({ login: 'integration', password: 'wrong', code: '000000' }), 401)
  await request('/api/admin/login', jsonPost({ login: 'integration', password: 'wrong', code: '000000' }), 429)
  console.log('Local integration: login, TOTP replay, CSRF, draft, publish, SSR, sitemap, media, version restore, logout and expiry passed')
} finally {
  child.kill()
  await database.end()
  try { await rmdir(storage) } catch { /* Retain files for inspection after a failed run. */ }
}
