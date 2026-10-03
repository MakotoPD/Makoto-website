<script setup lang="ts">
import type { PublicEntry } from '#shared/content'
const { locale } = useI18n()
const { data: projects, error } = await useAsyncData(
  () => `projects-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/project', { query: { locale: locale.value } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
useSeoMeta({
  title: () => locale.value === 'pl' ? 'Realizacje i zakres mojej pracy | Makoto' : 'Projects and my role | Makoto',
  description: () => locale.value === 'pl' ? 'Wybrane strony, sklepy i aplikacje wraz z opisem mojego zakresu pracy.' : 'Selected websites, stores and applications with details of my contribution.'
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-24 pt-44 text-black dark:text-white">
    <h1 class="makoto-heading pb-2 text-center text-6xl">{{ locale === 'pl' ? 'Realizacje' : 'Selected work' }}</h1>
    <p class="serif text-center text-4xl text-zinc-400">{{ locale === 'pl' ? 'Wybrane projekty' : 'Projects I have worked on' }}</p>
    <ContentProjectShowcase v-if="projects?.length" class="mt-24" :projects="projects" />
  </div>
</template>
