<script setup lang="ts">
import { projectAppearance, projectThemes } from '#shared/project-appearance'
defineProps<{ title: string; disabled?: boolean }>()
const model = defineModel<Record<string, any>>({ required: true })
const appearance = computed(() => projectAppearance(model.value.theme, model.value.primaryColor))
const custom = computed(() => typeof model.value.primaryColor === 'string' && /^#[\da-f]{6}$/i.test(model.value.primaryColor))
const activeLabel = computed(() => custom.value ? 'Własny kolor' : projectThemes.find(item => item.value === model.value.theme)?.label || 'Błękitny')
const hex = ref(appearance.value.primary)
watch(() => appearance.value.primary, value => { hex.value = value })
function selectTheme(value: string) {
  model.value.theme = value
  delete model.value.primaryColor
}
function setColor(value?: string) {
  if (value && /^#[\da-f]{6}$/i.test(value)) model.value.primaryColor = value.toLowerCase()
}
</script>

<template>
  <section class="panel-card p-5 md:p-6">
    <h2 class="font-serif text-2xl">Kolor realizacji</h2>
    <p class="mt-2 text-sm text-muted">Kolor primary używany w tle i akcencie tej realizacji na stronie głównej. Wybrany kolor: {{ activeLabel }}.</p>
    <div role="group" aria-label="Paleta kolorów realizacji" class="mt-5 flex flex-wrap gap-3">
      <button v-for="theme in projectThemes" :key="theme.value" type="button" :disabled="disabled" :aria-label="theme.label" :title="theme.label" :aria-pressed="!custom && (model.theme || 'sky') === theme.value" class="size-9 rounded-full border-2 border-transparent outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary" :class="!custom && (model.theme || 'sky') === theme.value ? 'ring-2 ring-inverted ring-offset-2 ring-offset-elevated' : ''" :style="{ background: theme.primary }" @click="selectTheme(theme.value)" />
    </div>
    <div class="mt-5 flex flex-wrap items-end gap-3">
      <UPopover>
        <UButton color="neutral" variant="outline" :disabled="disabled"><span class="size-5 rounded-full" :style="{ background: appearance.primary }" aria-hidden="true" />Własny kolor</UButton>
        <template #content><div class="cms rounded-lg bg-elevated p-4"><UColorPicker :model-value="appearance.primary" :disabled="disabled" format="hex" aria-label="Wybierz własny kolor primary" @update:model-value="setColor" /></div></template>
      </UPopover>
      <UFormField label="Kod koloru HEX" :error="/^#[\da-f]{6}$/i.test(hex) ? undefined : 'Podaj kolor w formacie #RRGGBB.'">
        <UInput v-model="hex" :disabled="disabled" maxlength="7" placeholder="#38bdf8" class="w-36" @update:model-value="setColor(String($event))" />
      </UFormField>
    </div>
    <div class="mt-6 flex min-h-40 items-center justify-between gap-5 overflow-hidden rounded-xl p-6 text-white" :style="{ background: appearance.gradient }" aria-label="Podgląd tła realizacji">
      <div><p class="text-xs uppercase tracking-widest text-white/75">Podgląd</p><p class="mt-2 font-serif text-2xl">{{ title || 'Twoja realizacja' }}</p></div>
      <UIcon name="i-mkt-arrow-up-right" class="size-7 shrink-0" aria-hidden="true" />
    </div>
  </section>
</template>
