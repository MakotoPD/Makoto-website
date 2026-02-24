import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<{ data: any[] }>(`${config.public.apiUrl}/api/articles`, {
      headers: config.strapiToken
        ? { Authorization: `Bearer ${config.strapiToken}` }
        : {},
      params: {
        fields: ['slug', 'updatedAt', 'publishedAt'],
        sort: 'publishedAt:desc',
      },
    })

    const posts = response.data || []

    return posts.map((post) =>
      asSitemapUrl({
        loc: `/blog/${post.slug}`,
        lastmod: post.updatedAt || post.publishedAt,
        changefreq: 'weekly',
        priority: 0.8,
        _i18nTransform: true,
      })
    )
  } catch (error) {
    console.error('Błąd podczas pobierania artykułów dla sitemap:', error)
    return []
  }
})
