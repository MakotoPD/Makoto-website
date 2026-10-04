<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
const model = defineModel<string>({ default: '' })
const open = ref(false)
const search = ref('')
const { icons } = usePanelIcons()
const filtered = computed(() => icons.filter(item => item.name.replace(/-/g, ' ').toLowerCase().includes(search.value.trim().toLowerCase().replace(/-/g, ' '))))
function select(icon: string) { model.value = icon; open.value = false }
</script>

<template>
  <UButton color="neutral" variant="outline" :disabled="disabled" :icon="model || 'i-mkt-image'" aria-label="Wybierz ikonę" @click="search = ''; open = true">{{ model ? 'Zmień ikonę' : 'Wybierz ikonę' }}</UButton>
  <UModal v-model:open="open" title="Wybierz ikonę" description="Ikony dostępne na stronie Makoto." :ui="{ content: 'cms sm:max-w-2xl', body: 'overflow-y-auto' }">
    <template #body>
      <UInput v-model="search" aria-label="Szukaj ikony" placeholder="Szukaj, np. nuxt, figma, github…" class="w-full" />
      <div class="mt-5 grid max-h-96 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
        <button v-for="item in filtered" :key="item.file" type="button" :aria-label="item.name.replace(/-/g, ' ')" :aria-pressed="model === item.icon" class="flex min-w-0 flex-col items-center gap-2 rounded-lg border border-accented p-3 text-highlighted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary" :class="model === item.icon ? 'ring-2 ring-primary' : ''" @click="select(item.icon)">
          <img :src="item.src" class="size-7 shrink-0 object-contain" alt="" loading="lazy" />
          <span class="w-full truncate text-center text-xs">{{ item.name.replace(/-/g, ' ') }}</span>
        </button>
      </div>
      <p v-if="!filtered.length" class="mt-5 text-sm text-muted">Brak ikon pasujących do wyszukiwania.</p>
      <UButton v-if="model" color="neutral" variant="ghost" class="mt-4" @click="model = ''; open = false">Bez ikony</UButton>
    </template>
  </UModal>
</template>
