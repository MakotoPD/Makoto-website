<script setup lang="ts">
import type { ContentKind, Locale } from '#shared/content'
import type { EntryReference } from '#shared/panel'
import { cityName } from '#shared/local-seo'
const props = defineProps<{ kind: ContentKind; slug: string; title: string; locale: Locale; entries: EntryReference[]; disabled?: boolean }>()
const data = defineModel<Record<string, any>>({ required: true })
const tags = computed<string[]>({ get: () => Array.isArray(data.value.tags) ? data.value.tags : [], set: value => { data.value.tags = [...new Set(value.map(item => item.trim()).filter(Boolean))] } })
const categories = computed<string[]>({ get: () => Array.isArray(data.value.categorySources) ? data.value.categorySources : [], set: value => { data.value.categorySources = value } })
const ongoing = computed(() => !/^\d{4}-\d{2}-\d{2}$/.test(String(data.value.to || '')))
const { technologies } = usePanelIcons()
function setOngoing(value: boolean) { data.value.to = value ? (props.locale === 'pl' ? 'Aktualnie' : 'Present') : new Date().toISOString().slice(0, 10) }
function addTag(value: string) { if (value) tags.value = [...tags.value, value] }
function referenceOptions(kind: ContentKind) {
  const entries = props.entries.filter(item => item.kind === kind && item.status !== 'deleted')
  const selected = new Map<string, EntryReference>()
  for (const item of entries) if (!selected.has(item.translationGroup) || item.locale === props.locale) selected.set(item.translationGroup, item)
  return [...selected.values()].map(item => ({ value: item.translationGroup, label: `${item.title}${item.locale !== props.locale ? ` (${item.locale.toUpperCase()})` : ''}${item.status !== 'published' ? ' · szkic' : ''}` }))
}
const authors = computed(() => referenceOptions('author'))
const categoryOptions = computed(() => referenceOptions('category'))
const services = computed(() => props.entries.filter(item => item.kind === 'service' && item.locale === props.locale && item.status !== 'deleted').map(item => ({ value: item.slug, label: item.title })))
const city = computed({ get: () => cityName(data.value.city), set: value => { data.value.city = value } })
const serviceSlugs = computed<string[]>({ get: () => Array.isArray(data.value.serviceSlugs) ? data.value.serviceSlugs : [], set: value => { data.value.serviceSlugs = value } })
const locationSlugs = computed<string[]>({ get: () => Array.isArray(data.value.locationSlugs) ? data.value.locationSlugs : [], set: value => { data.value.locationSlugs = value } })
const locations = computed(() => props.entries.filter(item => item.kind === 'location' && item.locale === props.locale && item.status !== 'deleted').map(item => ({ value: item.slug, label: item.title })))
const areas = computed<string[]>({ get: () => Array.isArray(data.value.serviceArea) ? data.value.serviceArea : [], set: value => { data.value.serviceArea = value } })
const study = computed<Record<string, string>>(() => data.value.caseStudy || {})
const ownership = computed({ get: () => data.value.projectOwnership === 'own' ? 'own' : 'client', set: value => { data.value.projectOwnership = value } })
const testimonial = computed<Record<string, string>>(() => data.value.testimonial || {})
function setStudy(key: string, value: string) { data.value.caseStudy = { ...study.value, [key]: value } }
function setTestimonial(key: string, value: string) { data.value.testimonial = { ...testimonial.value, [key]: value } }
const portfolioOptions = computed(() => {
  const items = [{ value: 'web', label: 'Projekt strony / interfejsu' }, { value: 'logo', label: 'Logo / identyfikacja wizualna' }]
  if (data.value.type && !items.some(item => item.value === data.value.type)) items.push({ value: data.value.type, label: data.value.type })
  return items
})
</script>

<template>
  <div class="space-y-6">
    <template v-if="kind === 'project'">
      <section class="panel-card space-y-5 p-5 md:p-6">
        <h2 class="font-serif text-2xl">Informacje o realizacji</h2>
        <UFormField label="Rodzaj realizacji"><USelect v-model="ownership" :items="[{ label: 'Realizacja dla klienta', value: 'client' }, { label: 'Projekt własny', value: 'own' }]" value-key="value" :disabled="disabled" class="w-full" /></UFormField>
        <UFormField label="Adres strony projektu" description="Przycisk „Otwórz projekt” prowadzi pod ten adres."><UInput v-model="data.externalUrl" :disabled="disabled" type="url" placeholder="https://…" class="w-full" /></UFormField>
        <UFormField label="Hasło przy zdjęciu" description="Krótki tekst wyświetlany na kolorowym tle realizacji."><UTextarea v-model="data.slogan" :disabled="disabled" :rows="2" class="w-full" /></UFormField>
      </section>
      <PanelTechnologyStack v-model="data.stack" :disabled="disabled" />
      <PanelProjectAppearance v-model="data" :title="title" :disabled="disabled" />
      <section class="panel-card space-y-5 p-5 md:p-6">
        <h2 class="font-serif text-2xl">{{ ownership === 'own' ? 'Kontekst i efekty projektu' : 'Klient i efekty projektu' }}</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField v-if="ownership === 'client'" label="Nazwa klienta"><UInput v-model="data.clientName" :disabled="disabled" class="w-full" /></UFormField>
          <UFormField label="Branża"><UInput v-model="data.industry" :disabled="disabled" class="w-full" /></UFormField>
        </div>
        <UFormField :label="ownership === 'own' ? 'Miejscowość związana z projektem' : 'Miejscowość klienta'" description="Opcjonalnie. Projekt pojawi się na stronie tej miejscowości."><UInput v-model="data.clientCity" :disabled="disabled" placeholder="np. Inowrocław" class="w-full" /></UFormField>
        <UFormField label="Cel projektu"><UTextarea :model-value="study.challenge" :disabled="disabled" :rows="3" class="w-full" @update:model-value="setStudy('challenge', String($event))" /></UFormField>
        <UFormField label="Rozwiązanie"><UTextarea :model-value="study.solution" :disabled="disabled" :rows="3" class="w-full" @update:model-value="setStudy('solution', String($event))" /></UFormField>
        <UFormField :label="ownership === 'own' ? 'Efekt projektu' : 'Co zyskał klient'" description="Opisz rzeczywiste efekty. Liczby podaj, jeśli masz pomiar."><UTextarea :model-value="study.outcome" :disabled="disabled" :rows="3" class="w-full" @update:model-value="setStudy('outcome', String($event))" /></UFormField>
        <UFormField label="Powiązane usługi"><USelectMenu v-model="serviceSlugs" :items="services" value-key="value" multiple :disabled="disabled" class="w-full" /></UFormField>
        <UFormField label="Dodatkowe powiązane lokalizacje"><USelectMenu v-model="locationSlugs" :items="locations" value-key="value" multiple :disabled="disabled" class="w-full" /></UFormField>
      </section>
      <section class="panel-card space-y-5 p-5 md:p-6">
        <h2 class="font-serif text-2xl">Opinia klienta</h2>
        <p class="text-sm text-muted">Opinia pojawi się przy realizacji po uzupełnieniu tekstu i autora.</p>
        <UFormField label="Treść opinii"><UTextarea :model-value="testimonial.quote" :disabled="disabled" :rows="4" class="w-full" @update:model-value="setTestimonial('quote', String($event))" /></UFormField>
        <UFormField label="Autor"><UInput :model-value="testimonial.author" :disabled="disabled" class="w-full" @update:model-value="setTestimonial('author', String($event))" /></UFormField>
        <UFormField label="Firma lub stanowisko"><UInput :model-value="testimonial.role" :disabled="disabled" class="w-full" @update:model-value="setTestimonial('role', String($event))" /></UFormField>
        <UFormField label="Link do źródła opinii"><UInput :model-value="testimonial.sourceUrl" :disabled="disabled" type="url" placeholder="https://…" class="w-full" @update:model-value="setTestimonial('sourceUrl', String($event))" /></UFormField>
      </section>
    </template>
    <section v-if="kind === 'work'" class="panel-card space-y-5 p-5 md:p-6">
      <h2 class="font-serif text-2xl">Doświadczenie zawodowe</h2>
      <UFormField label="Firma"><UInput v-model="data.company" :disabled="disabled" class="w-full" /></UFormField>
      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField label="Data rozpoczęcia"><UInput v-model="data.from" :disabled="disabled" type="date" class="w-full" /></UFormField>
        <UFormField v-if="!ongoing" label="Data zakończenia"><UInput v-model="data.to" :disabled="disabled" type="date" class="w-full" /></UFormField>
      </div>
      <USwitch :model-value="ongoing" :disabled="disabled" label="Nadal tutaj pracuję" @update:model-value="setOngoing" />
      <UFormField label="Lokalizacja"><UInput v-model="data.location" :disabled="disabled" placeholder="np. Toruń, Polska" class="w-full" /></UFormField>
      <USwitch v-model="data.isRemote" :disabled="disabled" label="Praca zdalna" />
      <UFormField label="Technologie i umiejętności" description="Wpisz nazwę i zatwierdź Enterem albo wybierz gotową technologię.">
        <UInputTags v-model="tags" :disabled="disabled" placeholder="Dodaj tag…" :max="60" :max-length="100" add-on-blur class="w-full" delete-icon="i-mkt-x" />
      </UFormField>
      <USelectMenu :items="technologies" value-key="label" :disabled="disabled" placeholder="Dodaj technologię z katalogu…" aria-label="Dodaj technologię do doświadczenia" class="w-full" @update:model-value="addTag" />
    </section>
    <section v-if="kind === 'article'" class="panel-card space-y-5 p-5 md:p-6">
      <h2 class="font-serif text-2xl">Autor i kategorie</h2>
      <UFormField label="Autor" description="Autorów możesz dodawać w sekcji „Autorzy bloga”."><USelectMenu v-model="data.authorSource" :items="authors" value-key="value" :disabled="disabled" placeholder="Wybierz autora" class="w-full" /></UFormField>
      <UButton v-if="data.authorSource" color="neutral" variant="ghost" :disabled="disabled" @click="delete data.authorSource">Bez przypisanego autora</UButton>
      <UFormField label="Kategorie" description="Kategorie oznaczone jako szkic pojawią się publicznie po ich opublikowaniu."><USelectMenu v-model="categories" :items="categoryOptions" value-key="value" multiple :disabled="disabled" placeholder="Wybierz kategorie" class="w-full" /></UFormField>
      <div v-if="categories.length" class="flex flex-wrap gap-2"><UBadge v-for="value in categories" :key="value" color="neutral" variant="subtle">{{ categoryOptions.find(item => item.value === value)?.label || 'Niedostępna kategoria' }}<button type="button" :disabled="disabled" aria-label="Usuń kategorię" class="ml-1 flex" @click="categories = categories.filter(item => item !== value)"><UIcon name="i-mkt-x" class="size-3" /></button></UBadge></div>
    </section>
    <section v-if="kind === 'portfolio'" class="panel-card p-5 md:p-6">
      <h2 class="mb-5 font-serif text-2xl">Rodzaj pracy</h2>
      <UFormField label="Kategoria portfolio"><USelectMenu v-model="data.type" :items="portfolioOptions" value-key="value" :disabled="disabled" placeholder="Wybierz rodzaj pracy" class="w-full" /></UFormField>
    </section>
    <section v-if="kind === 'author'" class="panel-card p-5 md:p-6">
      <h2 class="mb-5 font-serif text-2xl">Dane autora</h2>
      <UFormField label="Adres e-mail"><UInput v-model="data.email" :disabled="disabled" type="email" class="w-full" /></UFormField>
    </section>
    <section v-if="kind === 'location'" class="panel-card space-y-5 p-5 md:p-6">
      <h2 class="font-serif text-2xl">Obszar obsługi</h2>
      <UFormField label="Miasto" description="Możesz wpisać dowolną miejscowość. Nazwa pojawi się w danych dla wyszukiwarki."><UInput v-model="city" :disabled="disabled" placeholder="np. Inowrocław" class="w-full" /></UFormField>
      <UFormField label="Powiązana usługa"><USelectMenu v-model="data.parentService" :items="services" value-key="value" :disabled="disabled" placeholder="Wybierz usługę" class="w-full" /></UFormField>
    </section>
    <section v-if="kind === 'page' && ['kontakt', 'contact'].includes(slug)" class="panel-card space-y-5 p-5 md:p-6">
      <h2 class="font-serif text-2xl">Publiczne dane kontaktowe</h2>
      <p class="text-sm text-muted">Dane wyświetlane na stronie kontaktowej, stronie głównej i w stopce.</p>
      <UFormField label="Nazwa usługodawcy"><UInput v-model="data.contactName" :disabled="disabled" placeholder="Patryk Dąbrowski — Makoto" class="w-full" /></UFormField>
      <UFormField label="Adres e-mail"><UInput v-model="data.contactEmail" :disabled="disabled" type="email" placeholder="contact@makoto.com.pl" class="w-full" /></UFormField>
      <UFormField label="Telefon"><UInput v-model="data.contactPhone" :disabled="disabled" type="tel" placeholder="+48 …" class="w-full" /></UFormField>
      <UFormField label="Link do wizytówki Google"><UInput v-model="data.googleMapsUrl" :disabled="disabled" type="url" placeholder="https://maps.app.goo.gl/…" class="w-full" /></UFormField>
      <UFormField label="Obszar współpracy"><UInputTags v-model="areas" :disabled="disabled" add-on-blur placeholder="Dodaj miejscowość i zatwierdź Enterem" class="w-full" delete-icon="i-mkt-x" /></UFormField>
      <UFormField label="Dodatkowe informacje o kontakcie"><UTextarea v-model="data.contactNote" :disabled="disabled" :rows="3" placeholder="np. sposób umawiania rozmowy" class="w-full" /></UFormField>
    </section>
    <template v-if="kind === 'page' && ['about', 'links'].includes(slug)">
      <PanelLinksEditor v-if="slug === 'links'" v-model="data.primarylinks" title="Wyróżnione linki" :disabled="disabled" />
      <PanelLinksEditor v-model="data.links" :disabled="disabled" />
    </template>
  </div>
</template>
