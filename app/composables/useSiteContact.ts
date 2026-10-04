import type { PublicEntry } from '#shared/content'
import { contactInfo } from '#shared/local-seo'

export async function useSiteContact() {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    () => `site-contact-${locale.value}`,
    () => $fetch<PublicEntry>('/api/content/page', { query: { locale: locale.value, slug: locale.value === 'pl' ? 'kontakt' : 'contact' } }),
    { watch: [locale] }
  )
  return { info: computed(() => contactInfo(data.value?.data)) }
}
