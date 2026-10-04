<script setup lang="ts">
const props = defineProps<{ disabled?: boolean }>()
const model = defineModel<unknown>({ required: true })
interface Technology { name: string; logo?: string; [key: string]: unknown }
const items = computed<Technology[]>(() => Array.isArray(model.value) ? model.value.map(item => typeof item === 'string' ? { name: item } : { ...item, name: typeof item?.name === 'string' ? item.name : '' }) : [])
const { technologies } = usePanelIcons()
const chosen = ref<string>()
const options = computed(() => technologies.map(item => ({ ...item, disabled: items.value.some(tech => tech.name.trim().toLowerCase() === item.label.toLowerCase()) })))
function update(index: number, patch: Partial<Technology>) { model.value = items.value.map((item, i) => i === index ? { ...item, ...patch } : item) }
function add(name = '', logo = '') { model.value = [...items.value, { name, logo }] }
async function preset(value: string) {
  const item = technologies.find(item => item.label === value)
  if (item && !items.value.some(tech => tech.name.trim().toLowerCase() === value.toLowerCase())) add(item.label, item.icon)
  await nextTick()
  chosen.value = undefined
}
function remove(index: number) { model.value = items.value.filter((_, i) => i !== index) }
function move(index: number, delta: number) {
  const list = [...items.value]
  const target = index + delta
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target]!, list[index]!]
  model.value = list
}
</script>

<template>
  <section class="panel-card p-5 md:p-6">
    <h2 class="font-serif text-2xl">Technologie realizacji</h2>
    <p class="mt-2 text-sm text-muted">Nazwa i ikona pojawią się na stronie realizacji oraz w sekcji projektów. Kolejność tutaj jest kolejnością na stronie.</p>
    <div class="mt-5 flex flex-wrap items-center gap-3">
      <USelectMenu v-model="chosen" :items="options" value-key="label" :disabled="props.disabled" placeholder="Dodaj technologię…" aria-label="Dodaj technologię z listy" class="min-w-52 flex-1" @update:model-value="preset" />
      <UButton color="neutral" variant="outline" icon="i-mkt-plus" :disabled="props.disabled" @click="add()">Własna technologia</UButton>
    </div>
    <p v-if="!items.length" class="mt-5 rounded-lg border border-dashed border-accented p-5 text-sm text-muted">Dodaj pierwszą technologię, np. Nuxt lub WordPress.</p>
    <ol v-else class="mt-5 space-y-3">
      <li v-for="(item, index) in items" :key="index" class="flex flex-wrap items-center gap-3 rounded-lg border border-accented p-3">
        <UIcon :name="item.logo || 'i-mkt-code-line'" class="size-7 shrink-0" aria-hidden="true" />
        <UInput :model-value="item.name" :disabled="props.disabled" :aria-label="`Nazwa technologii ${index + 1}`" placeholder="Nazwa technologii" maxlength="100" class="min-w-36 flex-1" @update:model-value="update(index, { name: String($event) })" />
        <PanelIconPicker :model-value="item.logo || ''" :disabled="props.disabled" @update:model-value="update(index, { logo: $event })" />
        <div class="ml-auto flex items-center gap-1">
          <UButton icon="i-mkt-alt-arrow-up-line-duotone" color="neutral" variant="ghost" :disabled="props.disabled || index === 0" :aria-label="`Przesuń ${item.name || 'technologię'} w górę`" @click="move(index, -1)" />
          <UButton icon="i-mkt-alt-arrow-down-line-duotone" color="neutral" variant="ghost" :disabled="props.disabled || index === items.length - 1" :aria-label="`Przesuń ${item.name || 'technologię'} w dół`" @click="move(index, 1)" />
          <UButton icon="i-mkt-x" color="error" variant="ghost" :disabled="props.disabled" :aria-label="`Usuń ${item.name || 'technologię'}`" @click="remove(index)" />
        </div>
      </li>
    </ol>
  </section>
</template>
