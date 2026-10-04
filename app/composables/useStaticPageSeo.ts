import type { Locale } from '#shared/content'
import { absoluteUrl, listingPages, pagePath, type ListingPage } from '#shared/seo'

export function useStaticPageSeo(slug: ListingPage) {
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as Locale)
  const page = listingPages[slug]
  const path = computed(() => pagePath(slug, currentLocale.value))
  const title = computed(() => page.title[currentLocale.value])
  const description = computed(() => page.description[currentLocale.value])
  const alternates = (['pl', 'en'] as const).map(locale => ({ locale, path: pagePath(slug, locale) }))
  const translations = useState<{ locale: string; path: string }[]>('page-translations', () => [])
  watchEffect(() => { translations.value = alternates })
  const { canonical, language } = usePublicPageSeo({ title, description, path, alternates, label: computed(() => page.label[currentLocale.value]) })
  useSchemaOrg(computed(() => [
    { '@type': 'CollectionPage', '@id': `${canonical.value}#webpage`, name: title.value, description: description.value, url: canonical.value, inLanguage: language.value },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: currentLocale.value === 'pl' ? 'Start' : 'Home', item: absoluteUrl(currentLocale.value === 'pl' ? '/pl' : '/') },
      { '@type': 'ListItem', position: 2, name: page.label[currentLocale.value], item: canonical.value }
    ] }
  ]))
}
