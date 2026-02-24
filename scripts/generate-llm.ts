import fs from 'fs'
import path from 'path'

const SITE_URL = (process.env.SITE_URL || 'https://makoto.com.pl').replace(/\/$/, '')
// Używa wewnętrznego URL (omija Cloudflare) jeśli ustawiony, fallback na publiczny
const STRAPI_URL = (process.env.STRAPI_INTERNAL_URL || process.env.STRAPI_URL || 'https://api.makoto.com.pl').replace(/\/$/, '')

// Strony wykluczone z llms.txt (panel admina itp.)
const EXCLUDED_PREFIXES = ['/panel', '/admin']

/**
 * Skanuje app/pages/ i zwraca statyczne trasy (bez dynamicznych [slug])
 */
function getPagesRoutes(): string[] {
  const pagesDir = path.resolve(process.cwd(), 'app/pages')
  const routes: string[] = []

  function scan(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = entry.name

      if (entry.isDirectory()) {
        scan(path.join(dir, name), `${prefix}/${name}`)
        continue
      }

      if (!name.endsWith('.vue')) continue
      // Pomijaj dynamiczne trasy (blog/[slug].vue itp.)
      if (name.includes('[')) continue

      const base = name.replace(/\.vue$/, '')
      const route = base === 'index' ? prefix || '/' : `${prefix}/${base}`
      routes.push(route || '/')
    }
  }

  scan(pagesDir, '')
  return routes.filter(r => !EXCLUDED_PREFIXES.some(ex => r.startsWith(ex)))
}

function loadI18nTitles(lang: string): Record<string, string> {
  const filePath = path.resolve(process.cwd(), `i18n/lang/${lang}.json`)
  if (!fs.existsSync(filePath)) return {}
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const pages = (json.page || {}) as Record<string, any>
  return Object.fromEntries(
    Object.entries(pages).map(([key, val]) => [key, val?.seo?.title || ''])
  )
}

async function fetchArticles(locale: string): Promise<{ slug: string; title: string }[]> {
  try {
    const url = `${STRAPI_URL}/api/articles?locale=${locale}&fields[0]=slug&fields[1]=title&sort=publishedAt:desc`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`Nie udało się pobrać artykułów (${locale}): ${res.status}`)
      return []
    }
    const data = await res.json() as { data: any[] }
    return (data.data || []).map(p => ({ slug: p.slug as string, title: p.title as string }))
  } catch (err) {
    console.warn(`Błąd pobierania artykułów (${locale}):`, err)
    return []
  }
}

async function generateLLMFile() {
  console.log('Generuję llms.txt...')

  const routes = getPagesRoutes()
  console.log(`Znaleziono ${routes.length} stron z app/pages/`)

  console.log('Pobieram artykuły z API...')
  const [postsEn, postsPl] = await Promise.all([
    fetchArticles('en'),
    fetchArticles('pl'),
  ])

  const llmLines: string[] = [
    `# Website sitemap for makoto.com.pl`,
    `# Last generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
  ]

  const langs = ['en', 'pl'] as const

  for (const lang of langs) {
    const titlesMap = loadI18nTitles(lang)
    const prefix = lang === 'en' ? '' : `/${lang}`

    llmLines.push(`## ${lang.toUpperCase()} pages`)
    for (const route of routes) {
      const url = `${SITE_URL}${prefix}${route === '/' ? '' : route}`
      const slug = route === '/' ? 'home' : (route.split('/').filter(Boolean).pop() || 'home')
      const title = titlesMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      llmLines.push(`${url} | lang: ${lang} | type: page | title: ${title}`)
    }
    llmLines.push('')
  }

  const plBySlug = new Map(postsPl.map(p => [p.slug, p.title]))

  llmLines.push('## Blog posts')
  for (const post of postsEn) {
    const titlePl = plBySlug.get(post.slug) ?? post.title
    llmLines.push(`${SITE_URL}/blog/${post.slug} | lang: en | type: post | title: ${post.title}`)
    llmLines.push(`${SITE_URL}/pl/blog/${post.slug} | lang: pl | type: post | title: ${titlePl}`)
  }

  const outputPath = path.resolve(process.cwd(), 'public/llms.txt')
  fs.writeFileSync(outputPath, llmLines.join('\n'), 'utf8')
  console.log(`Wygenerowano ${routes.length} stron i ${postsEn.length} artykułów → ${outputPath}`)
}

generateLLMFile().catch(err => {
  console.error('Błąd podczas generowania llms.txt:', err)
  process.exit(1)
})
