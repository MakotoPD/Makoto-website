<script setup lang="ts">
import type { PublicEntry } from '#shared/content'
const { locale } = useI18n()
const filter = ref('all')
const { data: items, error } = await useAsyncData(
  () => `portfolio-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/portfolio', { query: { locale: locale.value } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
const visible = computed(() => filter.value === 'all' ? items.value : items.value?.filter(item => item.data.type === filter.value))
useStaticPageSeo('portfolio')
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-24 pt-44 text-black dark:text-white">
    <h1 class="makoto-heading text-center text-6xl">Portfolio</h1>
    <p class="serif makoto-muted mx-auto mt-5 max-w-2xl text-center text-2xl">{{ locale === 'pl' ? 'Wybrane prace graficzne z mojego portfolio.' : 'Selected graphic work from my portfolio.' }}</p>
    <div class="mt-10 flex flex-wrap gap-3" aria-label="Portfolio filters">
      <button v-for="option in ['all', 'web', 'logo']" :key="option" type="button" :aria-pressed="filter === option" class="rounded-lg border px-5 py-2 text-sm capitalize focus-visible:outline-2 focus-visible:outline-sky-300" :class="filter === option ? 'border-sky-400 bg-sky-400/15 text-sky-600 dark:text-sky-300' : 'border-zinc-400 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300'" @click="filter = option">{{ option === 'all' && locale === 'pl' ? 'Wszystkie' : option }}</button>
    </div>
    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <figure v-for="item in visible" :key="item.id" class="makoto-card overflow-hidden rounded-xl">
        <img v-if="(item.data.image as any)?.url" :src="(item.data.image as any).url" :alt="(item.data.image as any).alternativeText || item.title" loading="lazy" width="800" height="800" class="aspect-square w-full object-cover">
        <figcaption class="makoto-muted px-5 py-4 text-sm capitalize">{{ item.data.type }}</figcaption>
      </figure>
    </div>
  </div>
</template>
