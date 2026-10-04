<script setup lang="ts">
import { panelSections, type AdminEntry } from '#shared/panel'
definePageMeta({ layout: 'admin', i18n: false, key: route => `panel-${route.params.section}-editor`, pageTransition: false })
const route = useRoute()
const section = panelSections.find(item => item.slug === route.params.section)
if (!section) throw createError({ statusCode: 404, statusMessage: 'Nie ma takiej sekcji' })
const { data, error } = await useFetch<AdminEntry[]>('/api/admin/entries', { query: { kind: section.kind } })
if (error.value) throw createError({ statusCode: error.value.statusCode || 503, statusMessage: 'Nie udało się wczytać treści' })
if (route.params.id !== 'nowy' && !data.value?.some(entry => entry.id === route.params.id && entry.status !== 'deleted')) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono wpisu' })
const session = usePanelSession()
useSeoMeta({ title: `Edycja · ${section.label} | Makoto`, robots: 'noindex, nofollow' })
</script>
<template><div><ClientOnly><PanelEntryForm :section="section!" :entries="data || []" :entry-id="String(route.params.id)" :csrf="session?.csrf || ''" /><template #fallback><p role="status" class="py-10 text-zinc-400">Ładowanie edytora…</p></template></ClientOnly></div></template>
