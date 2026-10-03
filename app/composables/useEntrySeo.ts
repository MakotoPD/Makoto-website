import { contentPath, type PublicEntry } from '#shared/content'

const baseUrl = 'https://makoto.com.pl'
const absolute = (path: string) => `${baseUrl}${path === '/' ? '/' : path.replace(/\/$/, '')}`
const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

export function useEntrySeo(entry: Ref<PublicEntry | null | undefined>) {
  const route = useRoute()
  const { locale } = useI18n()
  const title = computed(() => entry.value?.seoTitle || entry.value?.title || 'Makoto')
  const description = computed(() => entry.value?.seoDescription || entry.value?.summary || '')
  const canonical = computed(() => absolute(entry.value ? contentPath(entry.value) : route.path))
  const image = computed(() => {
    const url = entry.value?.data?.coverUrl || (entry.value?.data?.cover as { url?: string } | undefined)?.url || (entry.value?.data?.image as { url?: string } | undefined)?.url
    return typeof url === 'string' && url.startsWith('http') ? url : typeof url === 'string' && url.startsWith('/') ? absolute(url) : absolute('/og.png')
  })
  const translations = useState<{ locale: string; path: string }[]>('page-translations', () => [])
  watchEffect(() => {
    translations.value = (entry.value?.translations || []).map(item => ({
      locale: item.locale,
      path: contentPath({ kind: entry.value!.kind, locale: item.locale, slug: item.slug })
    }))
  })

  useSeoMeta({
    title, description, ogTitle: title, ogDescription: description, ogType: () => entry.value?.kind === 'article' ? 'article' : 'website',
    ogUrl: canonical, ogImage: image, ogSiteName: 'Makoto',
    twitterCard: 'summary_large_image', twitterTitle: title, twitterDescription: description, twitterImage: image,
    articlePublishedTime: () => entry.value?.kind === 'article' ? entry.value.publishedAt || undefined : undefined,
    articleModifiedTime: () => entry.value?.kind === 'article' ? entry.value.updatedAt : undefined
  })
  useHead({
    link: computed(() => {
      const locales = entry.value?.translations || []
      const links: ({ key: string; rel: 'canonical'; href: string } | { key: string; rel: 'alternate'; href: string; type: 'text/html'; hreflang: string })[] = [{ key: 'canonical', rel: 'canonical', href: canonical.value }]
      if (locales.length > 1) {
        for (const item of locales) links.push({
          key: `alternate-${item.locale}`, rel: 'alternate', type: 'text/html', hreflang: item.locale === 'pl' ? 'pl-PL' : 'en-US',
          href: absolute(contentPath({ kind: entry.value!.kind, locale: item.locale, slug: item.slug }))
        })
        const english = locales.find(item => item.locale === 'en')
        if (english) links.push({ key: 'alternate-default', rel: 'alternate', type: 'text/html', hreflang: 'x-default', href: absolute(contentPath({ kind: entry.value!.kind, locale: 'en', slug: english.slug })) })
      }
      return links
    }),
    script: computed(() => {
      if (!entry.value) return []
      const crumb = [
        { '@type': 'ListItem', position: 1, name: locale.value === 'pl' ? 'Start' : 'Home', item: absolute(locale.value === 'pl' ? '/pl' : '/') },
        { '@type': 'ListItem', position: 2, name: entry.value.title, item: canonical.value }
      ]
      const graph: Record<string, unknown>[] = [{ '@type': 'BreadcrumbList', itemListElement: crumb }]
      if (entry.value.kind === 'article') graph.push({
        '@type': 'BlogPosting', headline: entry.value.title, description: description.value, image: image.value,
        datePublished: entry.value.publishedAt, dateModified: entry.value.updatedAt,
        author: { '@type': 'Person', name: 'Patryk Dąbrowski' }, mainEntityOfPage: canonical.value,
        inLanguage: entry.value.locale === 'pl' ? 'pl-PL' : 'en-US'
      })
      return [{ key: 'page-schema', type: 'application/ld+json', innerHTML: jsonLd({ '@context': 'https://schema.org', '@graph': graph }) }]
    })
  })
}
