<script setup lang="ts">
import { safeHref, type PublicEntry } from '#shared/content'
const { locale } = useI18n()
const { data: page, error } = await useAsyncData(
  () => `links-${locale.value}`,
  () => $fetch<PublicEntry>('/api/content/page', { query: { locale: locale.value, slug: 'links' } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
if (!page.value) throw createError({ statusCode: 404 })
const links = computed(() => [...((page.value?.data.primarylinks as any[]) || []), ...((page.value?.data.links as any[]) || [])])
useEntrySeo(page)
</script>

<template>
  <div v-if="page" class="mx-auto max-w-xl px-5 pb-24 pt-40 text-center text-black dark:text-white">
    <img v-if="(page.data.picture as any)?.url" :src="(page.data.picture as any).url" :alt="page.title" width="128" height="128" class="mx-auto size-28 rounded-2xl object-cover">
    <h1 class="makoto-heading mt-6 text-4xl">{{ page.title }}</h1>
    <p class="makoto-muted mt-3">{{ locale === 'pl' ? 'Moje miejsca w sieci i kontakt' : 'Find me online and get in touch' }}</p>
    <div class="mt-9 grid gap-3">
      <a v-for="item in links" :key="item.link" :href="safeHref(item.link)" :target="String(item.link).startsWith('http') ? '_blank' : undefined" rel="noopener noreferrer" class="makoto-card flex items-center justify-between gap-4 rounded-xl px-6 py-4 text-left hover:text-sky-500"><span>{{ item.name }}</span><UIcon name="i-mkt-arrow-up-right" class="size-5 shrink-0" aria-hidden="true" /></a>
    </div>
  </div>
</template>
