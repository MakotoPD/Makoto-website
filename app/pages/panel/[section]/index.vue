<script setup lang="ts">
import { groupEntries, panelSections, type AdminEntry } from '#shared/panel'
import type { Locale } from '#shared/content'
definePageMeta({ layout: 'admin', i18n: false, key: route => route.path, pageTransition: false })
const route = useRoute()
const section = panelSections.find(item => item.slug === route.params.section)
if (!section) throw createError({ statusCode: 404, statusMessage: 'Nie ma takiej sekcji' })
useSeoMeta({ title: `${section.label} | Panel Makoto`, robots: 'noindex, nofollow' })
const { data, error, refresh } = await useFetch<AdminEntry[]>('/api/admin/entries', { query: { kind: section.kind } })
const language = useState<Locale>('panel-language', () => 'pl')
const search = ref('')
const status = ref('all')
const groups = computed(() => groupEntries(data.value || []).filter(group => {
  const versions = Object.values(group.translations)
  return versions.some(item => `${item.title} ${item.slug}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())) && (status.value === 'all' || versions.some(item => item.status === status.value))
}))
const statusLabel = (value: string) => value === 'published' ? 'Opublikowany' : 'Szkic'
</script>
<template>
  <div>
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div><p class="text-xs uppercase tracking-[.18em] text-zinc-500">Treści witryny</p><h1 class="mt-2 font-serif text-4xl">{{ section!.label }}</h1></div>
      <NuxtLink :to="`/panel/${section!.slug}/nowy`" class="panel-button-primary">+ Dodaj: {{ section!.singular }}</NuxtLink>
    </header>
    <p class="mt-4 text-sm text-zinc-400">Każda pozycja zawiera obie wersje językowe. Otwórz ją, aby edytować PL lub EN.</p>
    <div class="mt-7 flex flex-wrap items-end gap-3">
      <div class="min-w-48 flex-1"><label for="entry-search" class="panel-label">Szukaj treści</label><input id="entry-search" v-model="search" type="search" class="panel-input" placeholder="Tytuł lub adres…"></div>
      <div><label for="entry-status" class="panel-label">Status</label><select id="entry-status" v-model="status" class="panel-input"><option value="all">Wszystkie</option><option value="draft">Szkice</option><option value="published">Opublikowane</option></select></div>
      <div class="panel-language" role="group" aria-label="Język listy"><button v-for="lang in (['pl', 'en'] as const)" :key="lang" :aria-pressed="language === lang" @click="language = lang">{{ lang.toUpperCase() }}</button></div>
    </div>
    <div v-if="error" role="alert" class="panel-message panel-error mt-6">Nie udało się wczytać listy. <button class="underline" @click="refresh()">Spróbuj ponownie</button></div>
    <div v-else class="panel-card mt-6 overflow-hidden">
      <div class="hidden grid-cols-[1fr_14rem_6rem] gap-4 border-b border-[#30343a] bg-black/10 px-5 py-3 text-xs uppercase tracking-wider text-zinc-500 md:grid"><span>Tytuł</span><span>Wersje językowe</span><span class="text-right">Edycja</span></div>
      <NuxtLink v-for="group in groups" :key="group.key" :to="`/panel/${section!.slug}/${group.entry.id}`" class="group grid gap-3 border-b border-[#30343a] px-5 py-5 last:border-b-0 hover:bg-white/[.025] md:grid-cols-[1fr_14rem_6rem] md:items-center">
        <div class="min-w-0"><span class="block font-medium text-zinc-100 group-hover:text-sky-200">{{ (group.translations[language] || group.entry).title }}</span><span class="mt-1 block truncate text-xs text-zinc-500">/{{ (group.translations[language] || group.entry).slug }}</span></div>
        <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs"><span v-for="lang in (['pl', 'en'] as const)" :key="lang" class="flex items-center gap-1.5"><span class="size-1.5 rounded-full" :class="group.translations[lang]?.status === 'published' ? 'bg-emerald-400' : group.translations[lang] ? 'bg-amber-300' : 'bg-zinc-600'"></span><b>{{ lang.toUpperCase() }}</b><span class="text-zinc-400">{{ group.translations[lang] ? statusLabel(group.translations[lang]!.status) : 'Brak' }}</span></span></div>
        <span class="text-sm text-sky-300 md:text-right">Otwórz ↗</span>
      </NuxtLink>
      <p v-if="!groups.length" class="p-10 text-center text-zinc-400">{{ search || status !== 'all' ? 'Brak treści pasujących do wyszukiwania.' : 'Nie ma jeszcze treści w tej sekcji.' }}</p>
    </div>
    <p class="mt-3 text-xs text-zinc-500">Pozycje: {{ groups.length }}</p>
  </div>
</template>
