<script setup lang="ts">
import type { PublicEntry } from '#shared/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || ''))
const { data: entry, error } = await useAsyncData(
  () => `entry-${locale.value}-${slug.value}`,
  async () => {
    const kinds = slug.value.includes('/') ? ['location'] : ['service', 'page']
    for (const kind of kinds) {
      try {
        return await $fetch<PublicEntry>(`/api/content/${kind}`, { query: { locale: locale.value, slug: slug.value } })
      } catch (cause) {
        const status = (cause as { statusCode?: number; response?: { status?: number } }).statusCode || (cause as { response?: { status?: number } }).response?.status
        if (status !== 404) throw cause
      }
    }
    throw createError({ statusCode: 404 })
  },
  { watch: [slug, locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
if (!entry.value) throw createError({ statusCode: 404 })
const { data: projects } = await useAsyncData(
  () => `related-projects-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/project', { query: { locale: locale.value } }),
  { watch: [locale] }
)
const { data: services } = await useAsyncData(
  () => `offer-services-${locale.value}-${slug.value}`,
  () => ['service', 'location'].includes(entry.value?.kind || '') ? $fetch<PublicEntry[]>('/api/content/service', { query: { locale: locale.value } }) : Promise.resolve([]),
  { watch: [locale, slug] }
)
const { data: articles } = await useAsyncData(
  () => `offer-articles-${locale.value}-${slug.value}`,
  () => ['service', 'location'].includes(entry.value?.kind || '') ? $fetch<PublicEntry[]>('/api/content/article', { query: { locale: locale.value } }) : Promise.resolve([]),
  { watch: [locale, slug] }
)
const { data: locations } = await useAsyncData(
  () => `locations-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/location', { query: { locale: locale.value } }),
  { watch: [locale] }
)
const parentService = computed(() => services.value?.find(service => service.slug === entry.value?.data.parentService))
useEntrySeo(entry, undefined, parentService)
</script>

<template>
  <ContentOfferPage v-if="entry?.kind === 'service' || entry?.kind === 'location'" :entry="entry" :projects="projects || []" :services="services || []" :locations="locations || []" :articles="articles || []" />
  <div v-else-if="entry?.kind === 'page'" class="mx-auto max-w-4xl px-5 pb-24 pt-44 text-black dark:text-white">
    <h1 class="makoto-heading text-center text-5xl md:text-7xl">{{ entry.title }}</h1>
    <p class="serif makoto-muted mx-auto mt-5 max-w-2xl text-center text-2xl leading-relaxed">{{ entry.summary }}</p>
    <ContentDocument v-if="entry.body.content?.length" class="mt-12" :document="entry.body" />
    <div v-if="['kontakt', 'contact'].includes(slug)" class="mt-12 space-y-10"><ContentContactDetails /><UiConnectform /></div>
  </div>
</template>
