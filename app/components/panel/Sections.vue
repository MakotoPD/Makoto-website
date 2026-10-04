<script setup lang="ts">
import type { ContentKind, Locale } from '#shared/content'
import type { EntryReference } from '#shared/panel'
const props = defineProps<{ entries: EntryReference[]; locale: Locale; disabled?: boolean }>()
const sections = defineModel<any[]>({ required: true })
const type = ref('scope')
const labels: Record<string, string> = { audience: 'Dla kogo', scope: 'Zakres', process: 'Proces', pricing: 'Wycena', related: 'Powiązane realizacje', facts: 'Informacje', locations: 'Lokalizacje', services: 'Usługi', featured: 'Wyróżnione realizacje', note: 'Notatka', faq: 'Pytania i odpowiedzi' }
const referenceKinds: Record<string, ContentKind> = { related: 'project', featured: 'project', locations: 'location', services: 'service' }
const typeOptions = Object.entries(labels).map(([value, label]) => ({ value, label }))
function add() {
  sections.value.push({ type: type.value, title: '', ...(referenceKinds[type.value] ? { slugs: [] } : type.value === 'note' ? { text: '' } : { items: type.value === 'faq' ? [['', '']] : [] }) })
}
function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= sections.value.length) return
  ;[sections.value[index], sections.value[target]] = [sections.value[target], sections.value[index]]
}
function addItem(section: any) {
  if (referenceKinds[section.type]) { section.slugs ||= []; section.slugs.push('') }
  else { section.items ||= []; section.items.push(section.type === 'faq' ? ['', ''] : '') }
}
function options(section: any) {
  const items = props.entries.filter(entry => entry.kind === referenceKinds[section.type] && entry.locale === props.locale && entry.status !== 'deleted').map(entry => ({ value: entry.slug, label: `${entry.title}${entry.status !== 'published' ? ' · szkic' : ''}` }))
  for (const slug of section.slugs || []) if (slug && !items.some(item => item.value === slug)) items.push({ value: slug, label: `Niedostępna treść: ${slug}` })
  return items
}
function values(section: any): any[] { return referenceKinds[section.type] ? section.slugs || [] : section.items || [] }
function moveItem(section: any, index: number, delta: number) {
  const items = values(section)
  const target = index + delta
  if (target < 0 || target >= items.length) return
  ;[items[index], items[target]] = [items[target], items[index]]
}
</script>
<template>
  <section class="panel-card p-5 md:p-6">
    <h2 class="font-serif text-2xl">Sekcje strony</h2>
    <div class="mt-4 flex flex-wrap gap-3">
      <USelectMenu v-model="type" :items="typeOptions" value-key="value" :disabled="disabled" aria-label="Rodzaj sekcji" class="min-w-44 flex-1" />
      <UButton color="neutral" variant="outline" icon="i-mkt-plus" :disabled="disabled" @click="add">Dodaj sekcję</UButton>
    </div>
    <div v-for="(section, index) in sections" :key="index" class="mt-5 space-y-4 rounded-lg border border-accented p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-sm font-medium text-primary">{{ labels[section.type] || section.type }}</h3>
        <div class="flex gap-1">
          <UButton color="neutral" variant="ghost" icon="i-mkt-alt-arrow-up-line-duotone" aria-label="Przesuń sekcję w górę" :disabled="disabled || index === 0" @click="move(index, -1)" />
          <UButton color="neutral" variant="ghost" icon="i-mkt-alt-arrow-down-line-duotone" aria-label="Przesuń sekcję w dół" :disabled="disabled || index === sections.length - 1" @click="move(index, 1)" />
          <UButton color="error" variant="ghost" icon="i-mkt-x" aria-label="Usuń sekcję" :disabled="disabled" @click="sections.splice(index, 1)" />
        </div>
      </div>
      <UFormField label="Nagłówek sekcji"><UInput v-model="section.title" :disabled="disabled" class="w-full" /></UFormField>
      <UFormField v-if="section.type === 'note'" label="Tekst"><UTextarea v-model="section.text" :disabled="disabled" class="w-full" :rows="3" /></UFormField>
      <template v-else>
        <div v-for="(item, itemIndex) in values(section)" :key="itemIndex" class="space-y-3 rounded-lg border border-accented p-3">
          <template v-if="section.type === 'faq'">
            <UFormField label="Pytanie"><UInput v-model="item[0]" :disabled="disabled" class="w-full" /></UFormField>
            <UFormField label="Odpowiedź"><UTextarea v-model="item[1]" :disabled="disabled" class="w-full" :rows="3" /></UFormField>
          </template>
          <USelectMenu v-else-if="referenceKinds[section.type]" v-model="section.slugs[itemIndex]" :items="options(section)" value-key="value" :disabled="disabled" :aria-label="`Wybierz treść ${Number(itemIndex) + 1}`" placeholder="Wybierz po tytule…" class="w-full" />
          <UTextarea v-else v-model="section.items[itemIndex]" :disabled="disabled" :aria-label="`Element ${Number(itemIndex) + 1}`" class="w-full" :rows="2" />
          <div class="flex items-center justify-end gap-1">
            <UButton color="neutral" variant="ghost" icon="i-mkt-alt-arrow-up-line-duotone" aria-label="Przesuń element w górę" :disabled="disabled || itemIndex === 0" @click="moveItem(section, itemIndex, -1)" />
            <UButton color="neutral" variant="ghost" icon="i-mkt-alt-arrow-down-line-duotone" aria-label="Przesuń element w dół" :disabled="disabled || itemIndex === values(section).length - 1" @click="moveItem(section, itemIndex, 1)" />
            <UButton color="error" variant="ghost" icon="i-mkt-x" aria-label="Usuń element" :disabled="disabled" @click="values(section).splice(itemIndex, 1)" />
          </div>
        </div>
        <UButton color="neutral" variant="outline" icon="i-mkt-plus" :disabled="disabled" @click="addItem(section)">Dodaj {{ section.type === 'faq' ? 'pytanie' : referenceKinds[section.type] ? 'treść' : 'element' }}</UButton>
        <p v-if="referenceKinds[section.type]" class="text-xs text-muted">Wybieraj treści w języku {{ locale.toUpperCase() }}. Szkice pojawią się na stronie po opublikowaniu.</p>
      </template>
    </div>
  </section>
</template>
