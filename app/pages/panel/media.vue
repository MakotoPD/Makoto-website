<script setup lang="ts">
definePageMeta({ layout: 'admin', i18n: false, pageTransition: false })
useSeoMeta({ title: 'Media | Panel Makoto', robots: 'noindex, nofollow' })
const session = usePanelSession()
</script>
<template>
  <div><h1 class="font-serif text-4xl">Media</h1><p class="mt-3 mb-7 text-sm text-zinc-400">Twoje obrazy i dokumenty. Jeden oryginał, automatyczne rozmiary do każdego miejsca na stronie.</p><PanelMediaLibrary :csrf="session?.csrf || ''" /></div>
</template>
