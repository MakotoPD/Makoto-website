<script setup lang="ts">
import type { MediaItem } from '#shared/panel'
defineProps<{ csrf: string; imagesOnly?: boolean; selectedId?: string | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ select: [file: MediaItem] }>()
function select(file: MediaItem) { emit('select', file); open.value = false }
</script>
<template>
  <UModal v-model:open="open" title="Wybierz z mediów" description="Wybierz istniejący plik albo prześlij nowy oryginał." :ui="{ content: 'cms bg-[#16191f] text-zinc-100 sm:max-w-6xl', body: 'overflow-y-auto', header: 'border-[#30343a]' }">
    <template #close><button aria-label="Zamknij wybór mediów" class="panel-button" @click="open = false"><UIcon name="i-mkt-x" class="size-5" aria-hidden="true" /></button></template>
    <template #body><PanelMediaLibrary :csrf="csrf" picker :images-only="imagesOnly" :selected-id="selectedId" @select="select" /></template>
  </UModal>
</template>
