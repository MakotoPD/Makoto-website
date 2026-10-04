import { contentPath, type PublicEntry } from '#shared/content'
import { absoluteUrl, entryImage, listingPages, pagePath } from '#shared/seo'

export function useEntrySeo(entry: Ref<PublicEntry | null | undefined>, author?: Ref<PublicEntry | undefined>) {
  const route = useRoute()
  const { locale } = useI18n()
  const title = computed(() => entry.value?.seoTitle || entry.value?.title || 'Makoto')
  const description = computed(() => entry.value?.seoDescription || entry.value?.summary || '')
  const path = computed(() => entry.value ? contentPath(entry.value) : route.path)
  const cover = computed(() => entry.value ? entryImage(entry.value) : undefined)
  const translations = useState<{ locale: string; path: string }[]>('page-translations', () => [])
  const alternates = computed(() => {
    if (!entry.value) return []
    const current = entry.value
    const versions = current.translations?.length ? current.translations : [{ locale: current.locale, slug: current.slug }]
    return versions.map(item => ({ locale: item.locale, path: contentPath({ kind: current.kind, locale: item.locale, slug: item.slug }) }))
  })
  watchEffect(() => { translations.value = alternates.value })
  const { canonical, language, images } = usePublicPageSeo({
    title, description, path, cover, alternates,
    label: computed(() => entry.value?.kind === 'article' ? 'Blog' : entry.value?.kind === 'project' ? listingPages.work.label[entry.value.locale] : 'Patryk Dąbrowski'),
    article: computed(() => entry.value?.kind === 'article'),
    revision: computed(() => entry.value?.updatedAt),
    publishedAt: computed(() => entry.value?.kind === 'article' ? entry.value.publishedAt || undefined : undefined),
    modifiedAt: computed(() => entry.value?.kind === 'article' ? entry.value.updatedAt : undefined)
  })
  useSchemaOrg(computed(() => {
    const current = entry.value
    if (!current) return []
    const authorName = author?.value?.title || 'Patryk Dąbrowski'
    const person = { '@type': 'Person' as const, name: authorName, ...(authorName === 'Patryk Dąbrowski' ? { url: absoluteUrl(pagePath('about', current.locale)) } : {}) }
    const nodes: Record<string, unknown>[] = [{
      '@type': current.slug === 'about' ? 'ProfilePage' : current.slug === 'contact' || current.slug === 'kontakt' ? 'ContactPage' : 'WebPage',
      '@id': `${canonical.value}#webpage`, url: canonical.value, name: title.value, description: description.value, inLanguage: language.value,
      ...(current.slug === 'about' ? { mainEntity: person } : {})
    }]
    if (current.kind !== 'home') {
      const crumbs = [{ '@type': 'ListItem', position: 1, name: locale.value === 'pl' ? 'Start' : 'Home', item: absoluteUrl(locale.value === 'pl' ? '/pl' : '/') }]
      const collection = current.kind === 'article' ? 'blog' : current.kind === 'project' ? 'work' : undefined
      if (collection) crumbs.push({ '@type': 'ListItem', position: 2, name: listingPages[collection].label[current.locale], item: absoluteUrl(pagePath(collection, current.locale)) })
      crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: current.title, item: canonical.value })
      nodes.push({ '@type': 'BreadcrumbList', itemListElement: crumbs })
    }
    if (current.kind === 'article') nodes.push({
      '@type': 'BlogPosting', headline: current.title, description: description.value,
      image: cover.value || images[0], datePublished: current.publishedAt || undefined, dateModified: current.updatedAt,
      author: person, publisher: person, mainEntityOfPage: { '@id': `${canonical.value}#webpage` }, inLanguage: language.value
    })
    if (current.kind === 'service' || current.kind === 'location') nodes.push({
      '@type': 'Service', name: current.title, description: description.value, url: canonical.value,
      provider: person, serviceType: current.title,
      ...(typeof current.data.city === 'string' ? { areaServed: { '@type': 'City', name: { inowroclaw: 'Inowrocław', torun: 'Toruń', bydgoszcz: 'Bydgoszcz' }[current.data.city] || current.data.city } } : {})
    })
    if (current.kind === 'project') nodes.push({
      '@type': 'CreativeWork', name: current.title, description: description.value, url: canonical.value,
      creator: person, image: cover.value, inLanguage: language.value
    })
    return nodes
  }))
}
