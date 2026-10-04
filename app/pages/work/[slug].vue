<script setup lang="ts">
import { safeHref, type PublicEntry } from '#shared/content'
const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => String(route.params.slug || ''))
const { data: project, error } = await useAsyncData(
  () => `project-${locale.value}-${slug.value}`,
  () => $fetch<PublicEntry>('/api/content/project', { query: { locale: locale.value, slug: slug.value } }),
  { watch: [slug, locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Project unavailable' })
if (!project.value) throw createError({ statusCode: 404 })
const setParams = useSetI18nParams()
watch(() => project.value?.translations, translations => {
  if (translations) setParams(Object.fromEntries(translations.map(item => [item.locale, { slug: item.slug }])))
}, { immediate: true })
useEntrySeo(project)
</script>

<template>
  <div v-if="project" class="mx-auto max-w-5xl px-5 pb-24 pt-40 text-black dark:text-white">
    <NuxtLink :to="locale === 'pl' ? '/pl/work' : '/work'" class="inline-flex items-center gap-2 text-sm text-sky-300 hover:underline"><UIcon name="i-mkt-arrow-left" class="size-4 shrink-0" aria-hidden="true" />{{ locale === 'pl' ? 'Wszystkie realizacje' : 'All projects' }}</NuxtLink>
    <h1 class="makoto-heading mt-12 text-center text-5xl md:text-7xl">{{ project.title }}</h1>
    <p class="serif makoto-muted mx-auto mt-6 max-w-3xl text-center text-2xl leading-relaxed">{{ project.summary }}</p>
    <div v-if="(project.data.image as any)?.url" class="makoto-card mt-12 overflow-hidden rounded-2xl p-2">
      <img :src="(project.data.image as any).url" :alt="project.title" width="1200" height="750" class="aspect-[16/10] w-full rounded-xl object-cover">
    </div>
    <section class="mt-16 grid gap-8 md:grid-cols-[12rem_1fr]">
      <h2 class="text-sm uppercase tracking-[.2em] text-sky-300">{{ locale === 'pl' ? 'Mój zakres' : 'My role' }}</h2>
      <div>
        <ContentDocument :document="project.body" />
      </div>
    </section>
    <section v-if="Array.isArray(project.data.stack)" class="makoto-rule mt-12 border-t pt-8">
      <h2 class="text-sm uppercase tracking-[.2em] text-sky-300">{{ locale === 'pl' ? 'Technologie' : 'Technology' }}</h2>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li v-for="(item, index) in project.data.stack" :key="index"><UBadge :icon="(item as any).logo" variant="subtle" size="lg" class="text-black dark:text-white">{{ (item as any).name || item }}</UBadge></li>
      </ul>
    </section>
    <a v-if="safeHref(project.data.externalUrl)" :href="safeHref(project.data.externalUrl)" target="_blank" rel="noopener noreferrer" class="makoto-cta mt-10">{{ locale === 'pl' ? 'Otwórz projekt' : 'Visit project' }} <UIcon name="i-mkt-arrow-up-right" class="size-4 shrink-0" aria-hidden="true" /></a>
  </div>
</template>
