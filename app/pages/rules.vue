<script setup lang="ts">
import type { PublicEntry } from '#shared/content'
const { locale } = useI18n()
const { data: page, error } = await useAsyncData(
  () => `rules-${locale.value}`,
  () => $fetch<PublicEntry>('/api/content/page', { query: { locale: locale.value, slug: 'rules' } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
if (!page.value) throw createError({ statusCode: 404 })
useEntrySeo(page)
</script>
<template>
  <article v-if="page" class="mx-auto max-w-4xl px-5 pb-24 pt-40 text-zinc-100">
    <h1 class="font-serif text-5xl">{{ page.title }}</h1>
    <ContentDocument class="mt-10" :document="page.body" />
  </article>
</template>
