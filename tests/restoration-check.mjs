import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000'
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)) throw new Error('Use a local server')
const out = process.env.VISUAL_OUTPUT_DIR
if (out) await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const errors = []
async function hydrate(page) {
  await page.waitForFunction(() => Boolean(document.getElementById('__nuxt')?.__vue_app__))
  const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
  if (await reject.count()) await reject.click()
}
async function image(page, label, locator) {
  if (locator) await locator.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 120))
  if (out) await (locator || page).screenshot({ path: join(out, `${label}.png`) })
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow')
}
async function settledPage(page) {
  await page.waitForFunction(() => {
    if (document.querySelector('.page-enter-active, .page-leave-active')) return false
    const loading = document.querySelector('.nuxt-loading-indicator')
    if (loading && Number(getComputedStyle(loading).opacity) > 0) return false
    let element = document.querySelector('h1')
    if (!element) return false
    while (element) {
      const style = getComputedStyle(element)
      if (style.filter !== 'none' || Number(style.opacity) < 1) return false
      element = element.parentElement
    }
    return true
  })
}
try {
  for (const [name, width, colorScheme] of [['desktop', 1440, 'dark'], ['tablet', 820, 'dark'], ['mobile', 390, 'dark'], ['light', 1440, 'light']]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme })
    if (colorScheme === 'light') await context.addInitScript(() => localStorage.setItem('nuxt-color-mode', 'light'))
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    page.on('pageerror', error => { if (!/Turnstile/.test(error.message)) errors.push(error.message) })
    await page.goto(`${base}/pl`, { waitUntil: 'domcontentloaded' })
    await hydrate(page)
    await page.locator('.service-card-4').scrollIntoViewIfNeeded()
    const geometry = await page.evaluate(() => {
      const avatar = document.querySelector('.care-avatar')
      const rect = avatar.getBoundingClientRect()
      const svg = document.querySelector('.site-map svg')
      const endpoints = [27, 100, 173].map(x => new DOMPoint(x, 60).matrixTransform(svg.getScreenCTM()))
      const icons = [...document.querySelectorAll('.map-pages > *')].map(el => el.getBoundingClientRect())
      const beam = document.querySelector('.care-connection svg')
      const start = new DOMPoint(0, 40).matrixTransform(beam.getScreenCTM())
      const end = new DOMPoint(200, 40).matrixTransform(beam.getScreenCTM())
      const client = document.querySelector('.care-client').getBoundingClientRect()
      return { avatar: [rect.width, rect.height], fit: getComputedStyle(avatar).objectFit,
        alignment: endpoints.map((point, index) => Math.abs(point.x - icons[index].x - icons[index].width / 2)),
        beam: [Math.abs(start.x - client.right), Math.abs(start.y - client.y - client.height / 2), Math.abs(end.x - rect.left), Math.abs(end.y - rect.y - rect.height / 2)] }
    })
    assert.ok(Math.abs(geometry.avatar[0] - geometry.avatar[1]) < 1, `${name} avatar remains square`)
    assert.equal(geometry.fit, 'cover')
    assert.ok(geometry.alignment.every(error => error < 1.5), `${name} sitemap lines meet icon centers: ${geometry.alignment}`)
    assert.ok(geometry.beam.every(error => error < 1.5), `${name} connection meets both circles: ${geometry.beam}`)
    await image(page, `care-${name}`, page.locator('.service-card-4'))
    await image(page, `sitemap-${name}`, page.locator('.service-card-3'))
    await image(page, `cursor-${name}`, page.locator('.service-card-0'))
    await noOverflow(page)

    await page.locator('.project-art[href="/pl/work/radec24"]').click()
    await page.waitForURL(`${base}/pl/work/radec24`)
    await page.getByRole('heading', { name: 'Radec24', level: 1, exact: true }).waitFor()
    await settledPage(page)
    assert.ok(await page.locator('.content-document strong').count() > 0, 'Project role renders Markdown')
    await image(page, `radec24-${name}`)
    await noOverflow(page)
    if (name === 'desktop') {
      assert.equal((await page.request.get(`${base}/pl/work/nonexistent-regression-check`)).status(), 404)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByRole('heading', { name: 'Radec24', level: 1, exact: true }).waitFor()
      await settledPage(page)
    }

    await page.goto(`${base}/pl/about`, { waitUntil: 'domcontentloaded' })
    await hydrate(page)
    assert.equal(await page.locator('.timeline-item').count(), 4)
    assert.ok(await page.locator('.timeline-description strong').count() > 20)
    assert.ok(await page.locator('.timeline-description ul ul').count() > 0)
    assert.ok(!(await page.locator('.work-timeline').innerText()).includes('**'))
    const items = page.locator('.timeline-item')
    await items.nth(1).evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 180))
    await page.waitForTimeout(300)
    const firstProgress = await page.locator('.timeline-progress').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)
    const alignment = await page.evaluate(() => {
      const rail = document.querySelector('.timeline-rail').getBoundingClientRect()
      return [...document.querySelectorAll('.timeline-dot')].map(el => { const r = el.getBoundingClientRect(); return Math.abs(r.x + r.width / 2 - rail.x) })
    })
    assert.ok(alignment.every(error => error < 1), `${name} timeline dots line up: ${alignment}`)
    await image(page, `timeline-${name}`)
    await items.nth(3).evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 180))
    await page.waitForTimeout(250)
    const lastProgress = await page.locator('.timeline-progress').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d)
    assert.ok(lastProgress > firstProgress, 'Timeline follows scroll')
    await items.first().evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 300))
    await page.waitForTimeout(250)
    assert.ok(await page.locator('.timeline-progress').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).d) < lastProgress, 'Timeline reverses with scroll')
    await noOverflow(page)

    await page.goto(`${base}/__preview/markdown`, { waitUntil: 'domcontentloaded' })
    await hydrate(page)
    const preview = page.locator('#rendered-preview')
    assert.equal(await preview.locator('.alert').count(), 7)
    assert.equal(await preview.locator('input[type=checkbox]:checked').count(), 2)
    assert.equal(await preview.locator('h5').count(), 1)
    assert.equal(await preview.locator('h6').count(), 1)
    assert.equal(await preview.locator('mark').innerText(), 'Highlighted text')
    assert.equal(await preview.locator('table td').nth(1).evaluate(el => getComputedStyle(el).textAlign), 'center')
    assert.equal(await preview.locator('table td').nth(2).evaluate(el => getComputedStyle(el).textAlign), 'right')
    for (const language of ['javascript', 'python', 'css']) assert.ok(await preview.locator(`pre[data-language=${language}] span`).count() > 0)
    for (const [part, selector] of [['alerts', '.alert'], ['code', 'pre'], ['table', 'table'], ['inline', 'kbd']]) {
      await preview.locator(selector).first().evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 80))
      await image(page, `markdown-${part}-${name}`)
    }
    await noOverflow(page)
    if (name === 'desktop') {
      await page.getByRole('button', { name: 'Sprawdź w edytorze' }).click()
      await page.locator('.ProseMirror').waitFor()
      assert.equal(await page.locator('.ProseMirror aside[data-callout]').count(), 7)
      assert.equal(await page.locator('.ProseMirror table').count(), 1)
      assert.equal(await page.locator('.ProseMirror mark').count(), 1)
      await page.locator('.ProseMirror').click()
      await page.keyboard.press('Control+End')
      await page.getByRole('button', { name: 'Wstaw Markdown', exact: true }).click()
      await page.locator('#markdown-source').fill('> [!SUCCESS]\n> **Zapis działa**\n\n<mark>Wyróżnienie z edytora</mark>')
      await page.getByRole('button', { name: 'Wstaw treść', exact: true }).click()
      await page.waitForFunction(() => document.querySelectorAll('#rendered-preview .alert').length === 8)
      assert.equal(await preview.locator('table').count(), 1, 'Editing retains the table')
      assert.equal(await preview.locator('mark').count(), 2, 'Editing retains and adds highlights')
      await image(page, 'markdown-editor', page.locator('.ProseMirror').locator('aside').first())
    }
    await context.close()
    console.log(`${name}: geometry, navigation, timeline and formatting passed`)
  }
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const reducedPage = await reduced.newPage()
  await reducedPage.goto(`${base}/pl/about`, { waitUntil: 'domcontentloaded' })
  await hydrate(reducedPage)
  await reducedPage.locator('.timeline-item').first().scrollIntoViewIfNeeded()
  assert.equal(await reducedPage.locator('.timeline-item').count(), 4)
  assert.ok(await reducedPage.locator('.timeline-description strong').count() > 20)
  assert.equal(await reducedPage.locator('.timeline-progress').evaluate(el => getComputedStyle(el).transform), 'none', 'Reduced motion retains the complete static timeline')
  await noOverflow(reducedPage)
  await reduced.close()
  console.log('Reduced motion: timeline remains readable without scroll animation')
  assert.deepEqual(errors, [], 'No application errors')
} finally { await browser.close() }
