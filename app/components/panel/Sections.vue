<script setup lang="ts">
const sections = defineModel<any[]>({ required: true })
const type = ref('scope')
const labels: Record<string, string> = { audience: 'Dla kogo', scope: 'Zakres', process: 'Proces', pricing: 'Wycena', related: 'Powiązane treści', facts: 'Informacje', locations: 'Lokalizacje', services: 'Usługi', featured: 'Wyróżnione', note: 'Notatka', faq: 'Pytania i odpowiedzi' }
function add() { sections.value.push({ type: type.value, title: '', items: type.value === 'faq' ? [['', '']] : [] }) }
function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= sections.value.length) return
  ;[sections.value[index], sections.value[target]] = [sections.value[target], sections.value[index]]
}
function addItem(section: any) { if (section.slugs) section.slugs.push(''); else { section.items ||= []; section.items.push(section.type === 'faq' ? ['', ''] : '') } }
</script>
<template>
  <section class="panel-card p-5"><h2 class="font-serif text-2xl">Sekcje strony</h2><div class="mt-4 flex gap-2"><select v-model="type" aria-label="Rodzaj sekcji" class="panel-input"><option v-for="(label, key) in labels" :key="key" :value="key">{{ label }}</option></select><button class="panel-button shrink-0" @click="add">Dodaj sekcję</button></div>
    <div v-for="(section, index) in sections" :key="index" class="mt-4 space-y-3 rounded-lg border border-[#30343a] p-4">
      <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="text-sm text-sky-200">{{ labels[section.type] || section.type }}</h3><div class="flex gap-2"><button class="panel-button" aria-label="Przesuń sekcję w górę" :disabled="index === 0" @click="move(index, -1)"><UIcon name="i-mkt-alt-arrow-up-line-duotone" class="size-5" aria-hidden="true" /></button><button class="panel-button" aria-label="Przesuń sekcję w dół" :disabled="index === sections.length - 1" @click="move(index, 1)"><UIcon name="i-mkt-alt-arrow-down-line-duotone" class="size-5" aria-hidden="true" /></button><button class="panel-button" @click="sections.splice(index, 1)">Usuń sekcję</button></div></div>
      <label class="panel-label">Nagłówek sekcji<input v-model="section.title" class="panel-input mt-2"></label>
      <label v-if="section.type === 'note'" class="panel-label">Tekst<textarea v-model="section.text" class="panel-input mt-2" rows="3"></textarea></label>
      <template v-else><div v-for="(item, itemIndex) in section.items || section.slugs || []" :key="itemIndex" class="flex flex-wrap gap-2"><template v-if="section.type === 'faq'"><input v-model="item[0]" aria-label="Pytanie" class="panel-input" placeholder="Pytanie"><input v-model="item[1]" aria-label="Odpowiedź" class="panel-input" placeholder="Odpowiedź"></template><input v-else v-model="(section.items || section.slugs)[itemIndex]" :aria-label="`Element ${Number(itemIndex) + 1}`" class="panel-input"><button class="text-xs text-red-300 underline" @click="(section.items || section.slugs).splice(itemIndex, 1)">Usuń element</button></div><button class="panel-button" @click="addItem(section)">Dodaj {{ section.type === 'faq' ? 'pytanie' : 'element' }}</button></template>
    </div>
  </section>
</template>
