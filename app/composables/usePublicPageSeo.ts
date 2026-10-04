import type { MaybeRefOrGetter } from 'vue'
import type { Locale } from '#shared/content'
import { absoluteUrl, localeLanguage, siteName } from '#shared/seo'

interface PublicSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string>
  label?: MaybeRefOrGetter<string>
  cover?: MaybeRefOrGetter<string | undefined>
  revision?: MaybeRefOrGetter<string | undefined>
  article?: MaybeRefOrGetter<boolean>
  publishedAt?: MaybeRefOrGetter<string | undefined>
  modifiedAt?: MaybeRefOrGetter<string | undefined>
  alternates: MaybeRefOrGetter<{ locale: Locale; path: string }[]>
}

export function usePublicPageSeo(options: PublicSeoOptions) {
  const route = useRoute()
  const { locale } = useI18n()
  const title = computed(() => toValue(options.title))
  const description = computed(() => toValue(options.description))
  const canonical = computed(() => absoluteUrl(toValue(options.path) || route.path))
  const language = computed(() => localeLanguage(locale.value as Locale))
  useSeoMeta({
    title: () => title.value.endsWith(`| ${siteName}`) ? title.value : `${title.value} | ${siteName}`,
    description, ogTitle: title, ogDescription: description, ogUrl: canonical,
    ogType: () => toValue(options.article) ? 'article' : 'website',
    ogSiteName: siteName, ogLocale: () => language.value.replace('-', '_'),
    twitterCard: 'summary_large_image', twitterTitle: title, twitterDescription: description,
    articlePublishedTime: () => toValue(options.publishedAt),
    articleModifiedTime: () => toValue(options.modifiedAt)
  })
  useHead({
    link: computed(() => {
      const versions = toValue(options.alternates)
      const links = versions.map(item => ({ key: `alternate-${item.locale}`, rel: 'alternate', hreflang: localeLanguage(item.locale), href: absoluteUrl(item.path) }))
      const english = versions.find(item => item.locale === 'en')
      if (english) links.push({ key: 'alternate-default', rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(english.path) })
      return links
    })
  })
  const images = defineOgImage('MakotoCard.takumi', {
    title, description, locale,
    label: computed(() => toValue(options.label) || 'Patryk Dąbrowski'),
    cover: computed(() => toValue(options.cover) || ''),
    revision: computed(() => toValue(options.revision) || '')
  }, { alt: title, width: 1200, height: 630 })
  return { canonical, language, images }
}
