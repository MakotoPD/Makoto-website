<script setup lang="ts">
import { panelSections } from '#shared/panel'
import '~/assets/css/panel.css'
const route = useRoute()
const session = usePanelSession()
const { data, error } = await useFetch('/api/admin/session')
if (error.value?.statusCode === 401) await navigateTo('/panel/login')
else if (error.value) throw createError({ statusCode: 503, statusMessage: 'Panel chwilowo niedostępny' })
session.value = data.value || null
const loggingOut = ref(false)
async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/api/admin/logout', { method: 'POST', body: {}, headers: { 'x-csrf-token': session.value?.csrf || '' } })
    session.value = null
    await navigateTo('/panel/login')
  } finally { loggingOut.value = false }
}
const navigation = [...panelSections, { slug: 'media', label: 'Media' }, { slug: 'ochrona', label: 'Ochrona' }]
</script>
<template>
  <div class="cms min-h-dvh bg-[#101216]">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-[#30343a] px-5 py-4 md:px-8">
      <NuxtLink to="/panel/blog" class="flex items-baseline gap-3"><span class="font-serif text-3xl text-white">Makoto</span><span class="text-xs uppercase tracking-[.18em] text-sky-300">Panel treści</span></NuxtLink>
      <div class="flex items-center gap-4 text-sm"><NuxtLink to="/pl" target="_blank" class="text-zinc-400 hover:text-sky-300">Zobacz stronę ↗</NuxtLink><button class="panel-button" :disabled="loggingOut" @click="logout">Wyloguj</button></div>
    </header>
    <div v-if="session" class="mx-auto grid max-w-[1680px] grid-cols-1 lg:grid-cols-[205px_minmax(0,1fr)]">
      <aside class="min-w-0 border-b border-[#30343a] px-4 py-4 lg:min-h-[calc(100dvh-80px)] lg:border-r lg:border-b-0 lg:py-7">
        <nav aria-label="Sekcje panelu" class="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col">
          <NuxtLink v-for="item in navigation" :key="item.slug" :to="`/panel/${item.slug}`" :aria-current="route.path.split('/')[2] === item.slug ? 'page' : undefined" class="whitespace-nowrap rounded-md px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white" :class="route.path.split('/')[2] === item.slug && 'bg-sky-400/10 text-sky-200!'">{{ item.label }}</NuxtLink>
        </nav>
      </aside>
      <main class="min-w-0 px-4 py-7 md:px-8 lg:py-9"><slot /></main>
    </div>
  </div>
</template>
