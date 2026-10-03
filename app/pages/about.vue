<script setup lang="ts">
import { safeHref, type PublicEntry } from '#shared/content'
const { locale } = useI18n()
const { data: page, error } = await useAsyncData(
  () => `about-${locale.value}`,
  () => $fetch<PublicEntry>('/api/content/page', { query: { locale: locale.value, slug: 'about' } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
if (!page.value) throw createError({ statusCode: 404 })
const { data: work } = await useAsyncData(
  () => `experience-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/work', { query: { locale: locale.value } }),
  { watch: [locale] }
)
useEntrySeo(page)
const safeLinks = computed(() => Array.isArray(page.value?.data.links) ? (page.value.data.links as { link: string; name: string; icon: string }[]).filter(item => safeHref(item.link)) : [])
</script>

<template>
  <div v-if="page" class="mx-auto max-w-6xl px-5 pb-24 pt-44 text-black dark:text-white">
    <h1 class="makoto-heading text-center text-6xl">{{ page.title }}</h1>
    <div class="relative mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-8 pb-12 lg:flex-row">
      <div class="max-w-2xl lg:w-3/5">
        <p class="mb-3 text-xs uppercase tracking-widest text-black/70 dark:text-white/70">{{ page.summary }}</p>
        <h2 class="serif mb-8 text-balance text-4xl leading-tight md:text-6xl">{{ locale === 'pl' ? 'Poznajmy się bliżej' : 'A little more about me' }}</h2>
        <ContentDocument :document="page.body" />
        <div v-if="safeLinks.length" class="mt-8 flex gap-4">
          <a v-for="link in safeLinks" :key="link.link" :href="safeHref(link.link)" target="_blank" rel="noopener noreferrer" :aria-label="link.name" class="group flex items-center gap-1 text-sky-500"><UIcon :name="link.icon" class="size-5" aria-hidden /><span class="text-sm text-black dark:text-white">{{ link.name }}</span></a>
        </div>
      </div>
      <div class="relative aspect-square w-80 lg:w-[500px]">
        <img src="/imgs/avatar-square.webp" alt="Patryk Dąbrowski" width="500" height="500" class="size-full rotate-3 rounded-4xl object-contain drop-shadow-[0_8px_20px_rgb(76_179_202_/_0.5)] transition duration-300 hover:-rotate-1 hover:scale-105">
      </div>
    </div>
    <section v-if="work?.length" class="mt-24">
      <p class="text-center text-xs uppercase tracking-widest text-zinc-500">{{ locale === 'pl' ? 'Doświadczenie' : 'Experience' }}</p>
      <h2 class="makoto-heading mt-4 text-center text-4xl md:text-6xl">{{ locale === 'pl' ? 'Nad czym pracowałem' : 'What I have worked on' }}</h2>
      <ol class="mt-10 divide-y divide-zinc-500/30">
        <li v-for="item in work" :key="item.id" class="grid gap-4 py-7 md:grid-cols-[12rem_1fr]">
          <div class="text-sm text-sky-500">{{ item.data.from }} — {{ item.data.to }}</div>
          <div><h3 class="serif text-2xl">{{ item.data.company }}</h3><p class="makoto-muted mt-3 leading-relaxed">{{ item.summary }}</p></div>
        </li>
      </ol>
    </section>
  </div>
</template>
