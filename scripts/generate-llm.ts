import fs from 'fs'
import path from 'path'

const SITE_URL = (process.env.SITE_URL || 'https://makoto.com.pl').replace(/\/$/, '')
const STRAPI_URL = (process.env.STRAPI_URL || 'https://api.makoto.com.pl').replace(/\/$/, '')

async function fetchSitemapLinks(url: string): Promise<string[]> {
  console.log(`Pobieram sitemap: ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const xml = await res.text()
  const links = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim())

  if (xml.includes('<sitemapindex')) {
    console.log(`Znaleziono ${links.length} submap — pobieram wszystkie...`)
    const allUrls: string[] = []
    for (const sm of links) {
      allUrls.push(...await fetchSitemapLinks(sm))
    }
    return allUrls
  }

  console.log(`Znaleziono ${links.length} adresów`)
  return links
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

  let allUrls: string[] = []
  try {
    allUrls = await fetchSitemapLinks(`${SITE_URL}/sitemap.xml`)
  } catch (err) {
    console.warn(`Nie udało się pobrać sitemapy (strona może jeszcze nie działać): ${err}`)
    console.warn('Generuję llms.txt bez listy stron...')
  }

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

  if (allUrls.length > 0) {
    const langs = ['en', 'pl'] as const
    for (const lang of langs) {
      const isDefault = lang === 'en'
      const pages = allUrls.filter(u => {
        if (/\/blog\/[^/]+$/.test(u)) return false
        const normalized = u.replace(/\/$/, '')
        return isDefault
          ? !normalized.includes('/pl/') && !normalized.endsWith('/pl')
          : normalized.includes(`/${lang}/`) || normalized.endsWith(`/${lang}`)
      })

      const titlesMap = loadI18nTitles(lang)

      llmLines.push(`## ${lang.toUpperCase()} pages`)
      for (const url of pages) {
        const normalized = url.replace(/\/$/, '')
        const isHome = normalized === SITE_URL || normalized === `${SITE_URL}/${lang}`
        const slug = isHome ? 'home' : (normalized.split('/').filter(Boolean).pop() || 'home')
        const title = titlesMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        llmLines.push(`${url} | lang: ${lang} | type: page | title: ${title}`)
      }
      llmLines.push('')
    }
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
  console.log(`Wygenerowano ${allUrls.length} stron i ${postsEn.length} artykułów → ${outputPath}`)
}

generateLLMFile().catch(err => {
  console.error('Błąd podczas generowania llms.txt:', err)
  process.exit(1)
})
