import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  try {
    // Pobierz artykuły z Strapi
    const response = await $fetch<{ data: any[] }>('https://api.makoto.com.pl/api/articles', {
      params: {
        populate: '*',
        sort: 'publishedAt:desc'
      }
    })

    const posts = response.data || []

    // Generuj URL-e dla każdego artykułu
    const urls = posts.map((post) => {
      return asSitemapUrl({
        loc: `/blog/${post.slug}`,
        lastmod: post.updatedAt || post.publishedAt,
        changefreq: 'weekly',
        priority: 0.8,
        // Automatyczne wsparcie dla i18n - @nuxtjs/sitemap wygeneruje wersje językowe
        _i18nTransform: true
      })
    })

    return urls
  } catch (error) {
    console.error('Błąd podczas pobierania artykułów dla sitemap:', error)
    return []
  }
})