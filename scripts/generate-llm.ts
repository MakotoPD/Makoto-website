import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const SITE_URL = process.env.SITE_URL || 'https://makoto.com.pl'

// Funkcja pobiera linki z sitemap (rekurencyjnie jeśli indeks sitemap)
async function fetchSitemapLinks(url: string): Promise<string[]> {
  console.log(`📥 Pobieram sitemap: ${url}`)
  const res = await fetch(url)
  const xml = await res.text()
  const links = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])

  const isIndexSitemap = links.some(link =>
    link.includes('__sitemap__') || link.endsWith('.xml')
  )

  if (isIndexSitemap && links.length < 50) {
    console.log(`🔍 Znaleziono ${links.length} submap — pobieram wszystkie...`)
    const allUrls: string[] = []
    for (const sm of links) {
      const urls = await fetchSitemapLinks(sm)
      allUrls.push(...urls)
    }
    return allUrls
  }

  console.log(`✅ Znaleziono ${links.length} adresów`)
  return links
}

// Funkcja wczytuje pliki i18n i zwraca mapę tytułów dla stron statycznych
function loadI18nTitles(lang: string) {
  const filePath = path.resolve(`i18n/lang/${lang}.json`)
  if (!fs.existsSync(filePath)) return {}
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const pages = json.page || {}
  const titles: Record<string, string> = {}
  for (const [key, val] of Object.entries(pages)) {
    titles[key] = val?.seo?.title || ''
  }
  return titles
}

async function generateLLMFile() {
  console.log('🧠 Generuję llm.txt...')

  const allUrls = await fetchSitemapLinks(`${SITE_URL}/sitemap.xml`)

  // Pobierz artykuły blogowe
  console.log('📚 Pobieram artykuły z API...')
  const apiData = await fetch('https://api.makoto.com.pl/api/articles').then(r => r.json())
  const posts = apiData?.data || []

  const llmLines: string[] = []
  llmLines.push(`# 🌐 Website sitemap for makoto.com.pl`)
  llmLines.push(`# Last generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`)
  llmLines.push('')

  const langs = ['en', 'pl']

  for (const lang of langs) {
    const isDefault = lang === 'en'
    const pages = allUrls.filter(u => {
		const isBlogPost = /\/blog\/[^/]+$/.test(u)  // wpisy blogowe
		if (isBlogPost) return false                 // wykluczamy je z pages
		return isDefault ? !u.includes('/pl') : u.includes(`/${lang}`)
	})

    const titlesMap = loadI18nTitles(lang)

    llmLines.push(`## ─────────────── ${lang.toUpperCase()} pages (${lang})`)
    for (const url of pages) {
      // Wyciągamy ostatni segment URL, np. /blog => blog
      let slug = url.split('/').filter(Boolean).pop() || 'home'

      // Mapujemy slug do i18n title
      // jeśli to główna strona: slug = 'home'
      if (url === SITE_URL || url === `${SITE_URL}/pl`) slug = 'home'
      const title = titlesMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

      llmLines.push(`${url} | lang: ${lang} | type: page | title: ${title}`)
    }
    llmLines.push('')
  }

  // Blog posts
  llmLines.push('## ─────────────── Blog posts')
  for (const post of posts) {
    llmLines.push(`${SITE_URL}/blog/${post.slug} | lang: en | type: post | title: ${post.title}`)
    llmLines.push(`${SITE_URL}/pl/blog/${post.slug} | lang: pl | type: post | title: ${post.title}`)
  }

  const outputPath = path.resolve('public', 'llm.txt')
  fs.writeFileSync(outputPath, llmLines.join('\n'), 'utf8')

  console.log(`✅ Wygenerowano ${allUrls.length} stron i ${posts.length} artykułów → ${outputPath}`)
}

generateLLMFile().catch(err => {
  console.error('❌ Błąd podczas generowania llm.txt:', err)
})
