<script setup lang="ts">
import source from '../../../tests/fixtures/markdown-rendering.md?raw'
import { markdownToDocument } from '#shared/markdown'
definePageMeta({ layout: false })
if (!import.meta.dev) throw createError({ statusCode: 404 })
useHead({ title: 'Podgląd formatowania Markdown', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const document = ref(markdownToDocument(source))
const edit = ref(false)
</script>

<template>
  <main class="mx-auto max-w-4xl px-5 py-16 text-black dark:text-white">
    <h1 class="serif mb-8 text-4xl">Podgląd formatowania Markdown</h1>
    <button class="makoto-cta mb-4" @click="edit = !edit">{{ edit ? 'Zamknij edytor' : 'Sprawdź w edytorze' }}</button>
    <div v-if="edit" class="mb-12">
      <p class="mb-4 text-sm">Zmiany dotyczą tylko tego podglądu i nie są zapisywane w CMS.</p>
      <ClientOnly><LazyPanelEditor v-model="document" csrf="" /></ClientOnly>
    </div>
    <ContentDocument id="rendered-preview" :document="document" />
  </main>
</template>
