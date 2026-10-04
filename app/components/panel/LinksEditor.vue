<script setup lang="ts">
defineProps<{ title?: string; disabled?: boolean }>()
const model = defineModel<any[]>({ default: () => [] })
const items = computed(() => Array.isArray(model.value) ? model.value : [])
function add() { model.value = [...items.value, { name: '', link: '', icon: '' }] }
function update(index: number, patch: Record<string, unknown>) { model.value = items.value.map((item, i) => i === index ? { ...item, ...patch } : item) }
function remove(index: number) { model.value = items.value.filter((_, i) => i !== index) }
function move(index: number, delta: number) {
  const list = [...items.value]
  const target = index + delta
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target], list[index]]
  model.value = list
}
</script>

<template>
  <section class="panel-card p-5 md:p-6">
    <h2 class="font-serif text-2xl">{{ title || 'Linki i profile społecznościowe' }}</h2>
    <div v-for="(item, index) in items" :key="index" class="mt-5 space-y-3 rounded-lg border border-accented p-4">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm text-muted">{{ item.name || `Link ${index + 1}` }}</span>
        <div class="flex gap-1">
          <UButton icon="i-mkt-alt-arrow-up-line-duotone" color="neutral" variant="ghost" :disabled="disabled || index === 0" aria-label="Przesuń link w górę" @click="move(index, -1)" />
          <UButton icon="i-mkt-alt-arrow-down-line-duotone" color="neutral" variant="ghost" :disabled="disabled || index === items.length - 1" aria-label="Przesuń link w dół" @click="move(index, 1)" />
          <UButton icon="i-mkt-x" color="error" variant="ghost" :disabled="disabled" aria-label="Usuń link" @click="remove(index)" />
        </div>
      </div>
      <UFormField label="Nazwa linku"><UInput :model-value="item.name" :disabled="disabled" placeholder="np. GitHub" class="w-full" @update:model-value="update(index, { name: String($event) })" /></UFormField>
      <UFormField label="Adres"><UInput :model-value="item.link" :disabled="disabled" placeholder="https://… lub /pl/kontakt" class="w-full" @update:model-value="update(index, { link: String($event) })" /></UFormField>
      <PanelIconPicker :model-value="item.icon || ''" :disabled="disabled" @update:model-value="update(index, { icon: $event })" />
    </div>
    <p v-if="!items.length" class="mt-4 text-sm text-muted">Brak linków. Dodaj adres i nazwę, którą zobaczy odwiedzający.</p>
    <UButton color="neutral" variant="outline" icon="i-mkt-plus" class="mt-5" :disabled="disabled" @click="add">Dodaj link</UButton>
  </section>
</template>
