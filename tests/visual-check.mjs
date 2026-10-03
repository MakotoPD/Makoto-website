import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'

const base = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000'
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Visual checks are limited to a local server')
const article = (await (await fetch(`${base}/api/content/article?locale=pl`)).json())[0]
const project = (await (await fetch(`${base}/api/content/project?locale=pl`)).json())[0]
assert.ok(article?.slug && project?.slug, 'Import sample content before visual checks')
const articleDetail = await (await fetch(`${base}/api/content/article?locale=pl&slug=${article.slug}`)).json()
const englishArticle = articleDetail.translations?.find(item => item.locale === 'en')

const pages = [
  ['/pl', 'home'],
  ['/pl/strony-internetowe', 'service'],
  ['/pl/strony-internetowe/inowroclaw', 'location'],
  ['/pl/work', 'work'],
  [`/pl/work/${project.slug}`, 'project'],
  ['/pl/blog', 'blog-index'],
  [`/pl/blog/${article.slug}`, 'article'],
  ['/panel/login', 'login']
]
const browser = await chromium.launch()
try {
  for (const [name, width, height, colorScheme] of [['desktop', 1440, 900, 'dark'], ['mobile', 390, 844, 'dark'], ['light-desktop', 1440, 900, 'light']]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme })
    if (colorScheme === 'light') await context.addInitScript(() => localStorage.setItem('nuxt-color-mode', 'light'))
    const page = await context.newPage()
    for (const [path, label] of pages) {
      const response = await page.goto(base + path, { waitUntil: 'domcontentloaded' })
      assert.equal(response?.status(), 200, `${name} ${path} HTTP status`)
      if (label === 'home') await page.waitForFunction(() => Boolean(document.getElementById('__nuxt')?.__vue_app__))
      const rejectCookies = page.getByRole('button', { name: /Odrzuć wszystkie|Reject all/i })
      if (await rejectCookies.count()) {
        await rejectCookies.first().click()
        await page.getByRole('dialog').waitFor({ state: 'hidden' })
      }
      await page.locator('h1').first().waitFor()
      const headings = await page.locator('h1').count()
      assert.equal(headings, 1, `${name} ${path} H1 count`)
      const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }))
      assert.ok(widths.document <= widths.viewport + 2, `${name} ${path} horizontal overflow ${widths.document}/${widths.viewport}`)
      if (process.env.VISUAL_OUTPUT_DIR && ['home', 'service', 'work', 'blog-index', 'article', 'login'].includes(label)) {
        await mkdir(process.env.VISUAL_OUTPUT_DIR, { recursive: true })
        await page.screenshot({ path: join(process.env.VISUAL_OUTPUT_DIR, `${label}-${name}-viewport.png`) })
      }
    }
    if (name === 'mobile') {
      await page.goto(`${base}/pl`, { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: 'Otwórz menu' }).click()
      assert.ok(await page.getByRole('link', { name: 'Sklepy internetowe', exact: true }).isVisible())
      await page.goto(`${base}/pl/strony-internetowe/inowroclaw`, { waitUntil: 'domcontentloaded' })
      assert.equal(await page.locator('a[hreflang="en-US"]').count(), 0, 'No nonexistent local translation link')
      await page.goto(`${base}/pl/blog/${article.slug}`, { waitUntil: 'domcontentloaded' })
      if (englishArticle) {
        const translatedLink = page.locator(`a[href="/blog/${englishArticle.slug}"]`).first()
        await translatedLink.waitFor({ state: 'attached' })
        assert.ok(await translatedLink.count(), 'Article language switch uses translated slug')
      }
    }
    await context.close()
  }
  console.log('Visual checks: 8 pages in dark desktop, dark mobile and light desktop, one H1, no horizontal overflow, mobile menu and locale links passed')
} finally { await browser.close() }
