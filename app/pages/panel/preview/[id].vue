<script setup lang="ts">
import type { PublicEntry } from '#shared/content'
definePageMeta({ layout: 'panel', i18n: false })
useSeoMeta({ title: 'Podgląd treści | Makoto', robots: 'noindex, nofollow' })
const route = useRoute()
const { data: entry, error } = await useFetch<PublicEntry & { status: string }>(`/api/admin/preview/${route.params.id}`)
if (error.value?.statusCode === 401) await navigateTo('/panel/login')
else if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Preview unavailable' })
</script>

<template>
  <main v-if="entry">
    <div class="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-500/50 bg-amber-950/95 px-5 py-3 text-sm text-amber-100">
      <span>Podgląd chroniony · {{ entry.status || 'szkic' }}</span>
      <NuxtLink to="/panel" class="underline">Wróć do panelu</NuxtLink>
    </div>
    <ContentOfferPage v-if="entry.kind === 'service' || entry.kind === 'location'" :entry="entry" :projects="[]" />
    <article v-else class="mx-auto max-w-4xl px-5 pb-24 pt-20">
      <h1 class="font-serif text-5xl">{{ entry.title }}</h1>
      <p class="mt-6 text-lg text-zinc-400">{{ entry.summary }}</p>
      <img v-if="entry.coverMediaId || (entry.data.cover as any)?.url || (entry.data.image as any)?.url" :src="entry.coverMediaId ? `/api/media/${entry.coverMediaId}?size=big` : ((entry.data.cover || entry.data.image) as any).url" :alt="((entry.data.cover || entry.data.image) as any)?.alternativeText || entry.title" class="mt-8 max-h-[32rem] w-full rounded-xl object-contain">
      <ContentDocument class="mt-10" :document="entry.body" />
    </article>
  </main>
</template>
