import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000'
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Use a local server')
const out = process.env.VISUAL_OUTPUT_DIR
if (out) await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const errors = []
async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options })
  if (options.colorScheme === 'light') await context.addInitScript(() => localStorage.setItem('nuxt-color-mode', 'light'))
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  page.on('pageerror', error => { if (!/Turnstile/.test(error.message)) errors.push(error.message) })
  await page.goto(`${base}/pl`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => Boolean(document.getElementById('__nuxt')?.__vue_app__))
  const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
  if (await reject.count()) await reject.click()
  await page.locator('.hero-scene canvas').waitFor()
  await page.waitForTimeout(4000)
  return { page, context }
}
async function screenshot(page, name) {
  if (out) await page.screenshot({ path: join(out, `${name}.png`) })
}
async function checkWidths(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow')
  const canvas = await page.locator('.hero-scene canvas').boundingBox()
  const hero = await page.locator('.home-hero').boundingBox()
  assert.ok(Math.abs(canvas.width - hero.width) < 2 && Math.abs(canvas.height - hero.height) < 2, '3D fills the entire hero')
}
try {
  const { page, context } = await open()
  await checkWidths(page)
  await screenshot(page, 'hero-desktop')
  await page.locator('#services').scrollIntoViewIfNeeded()
  if (out) await page.locator('#services').screenshot({ path: join(out, 'services-desktop.png') })
  const showcase = page.locator('.project-showcase')
  await page.waitForFunction(() => document.querySelector('.project-showcase')?.classList.contains('is-animated'))
  const images = page.locator('.project-art')
  const count = await images.count()
  for (const index of [...Array(count).keys(), ...Array(count).keys()].map((value, i) => i < count ? value : count - value - 1)) {
    console.log(`Checking project ${index}`)
    await images.nth(index).evaluate(el => window.scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .22))
    await page.waitForFunction(index => document.querySelector('.project-showcase')?.getAttribute('data-active-project') === String(index), index)
    await page.waitForTimeout(350)
    const panel = page.locator('.project-copy').nth(index)
    assert.equal(await panel.getAttribute('aria-hidden'), null, 'Current project is accessible')
    assert.equal(await page.locator('.project-copy[inert]').count(), count - 1, 'Only active description accepts focus')
    const icons = await panel.locator('.project-stack .iconify').count()
    assert.ok(icons > 0, 'Technology icons rendered')
    const before = await panel.boundingBox()
    await page.evaluate(() => window.scrollBy(0, 65))
    await page.waitForTimeout(100)
    const after = await panel.boundingBox()
    if (index < count - 1) assert.ok(Math.abs(before.y - after.y) < 2, 'Description stays pinned while images scroll')
    await screenshot(page, `project-${index}`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForFunction(() => !document.querySelector('.project-showcase')?.classList.contains('is-animated'))
  assert.equal(await page.locator('.project-copy[inert]').count(), 0, 'Resize restores all descriptions')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.waitForFunction(() => document.querySelector('.project-showcase')?.classList.contains('is-animated'))
  // A client-side navigation must dispose triggers and set up a fresh showcase.
  await page.locator('a[href="/pl/work"]').last().click()
  await page.waitForURL(`${base}/pl/work`)
  await page.waitForFunction(() => document.querySelector('.project-showcase')?.classList.contains('is-animated'))
  await page.goBack()
  await page.waitForFunction(() => document.querySelector('.home-hero') && document.querySelector('.project-showcase')?.classList.contains('is-animated'))
  await context.close()

  for (const [name, options] of [
    ['mobile', { viewport: { width: 390, height: 844 } }],
    ['reduced-motion', { reducedMotion: 'reduce' }],
    ['light', { colorScheme: 'light' }]
  ]) {
    const { page, context } = await open(options)
    await checkWidths(page)
    await screenshot(page, `hero-${name}`)
    if (name !== 'light') {
      assert.equal(await page.locator('.project-copy[inert]').count(), 0)
      assert.equal(await page.locator('.project-showcase.is-animated').count(), 0)
      for (const panel of await page.locator('.project-copy').all()) {
        assert.ok(await panel.isVisible(), `${name}: all descriptions remain visible`)
      }
    }
    await page.locator('#services').scrollIntoViewIfNeeded()
    if (out) await page.locator('#services').screenshot({ path: join(out, `services-${name}.png`) })
    await context.close()
  }
  assert.deepEqual(errors, [], 'No application errors')
  console.log('Full-screen 3D, desktop scroll down/up, pinned descriptions, technology icons, resize, route navigation, mobile and reduced motion passed.')
} finally { await browser.close() }
