<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'
import { projectLocations } from '#shared/local-seo'

type Section = { type: string; title?: string; items?: (string | string[])[]; text?: string; slugs?: string[] }
const props = defineProps<{ entry: PublicEntry; projects: PublicEntry[]; services: PublicEntry[]; locations: PublicEntry[]; articles: PublicEntry[] }>()
const { locale } = useI18n()
const parentService = computed(() => props.services.find(service => service.slug === props.entry.data.parentService))
const sections = computed(() => {
  const items = [...props.entry.sections] as Section[]
  if (props.entry.kind === 'service' && !items.some(item => item.type === 'locations')) {
    const places = props.locations.filter(location => location.data.parentService === props.entry.slug)
    if (places.length) items.push({ type: 'locations', title: locale.value === 'pl' ? 'Oferta w Twojej miejscowości' : 'Services in your area', slugs: places.map(place => place.slug) })
  }
  if (props.entry.kind === 'location') {
    const localProjects = props.projects.filter(project => projectLocations(project, [props.entry]).length)
    if (localProjects.length) items.unshift({ type: 'related', title: locale.value === 'pl' ? 'Projekty dla firm z tego obszaru' : 'Projects for businesses in this area', slugs: localProjects.map(project => project.slug) })
    if (parentService.value && !items.some(item => item.type === 'services')) items.push({ type: 'services', title: locale.value === 'pl' ? 'Zakres usługi' : 'Service details', slugs: [parentService.value.slug] })
  }
  return items.filter(item => !['related', 'locations', 'services', 'articles'].includes(item.type) || references(item).length)
})
function references(section: Section) {
  const entries = section.type === 'related' ? props.projects : section.type === 'services' ? props.services : section.type === 'locations' ? props.locations : props.articles
  return (section.slugs || []).map(slug => entries.find(entry => entry.slug === slug)).filter(Boolean) as PublicEntry[]
}
const contactPath = computed(() => locale.value === 'pl' ? '/pl/kontakt' : '/contact')
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-24 pt-36 text-black dark:text-white">
    <nav :aria-label="locale === 'pl' ? 'Ścieżka strony' : 'Breadcrumb'" class="mb-8 flex flex-wrap gap-2 text-sm text-sky-300">
      <NuxtLink :to="locale === 'pl' ? '/pl' : '/'">{{ locale === 'pl' ? 'Start' : 'Home' }}</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink v-if="entry.kind === 'location' && parentService" :to="contentPath(parentService)">{{ parentService.title }}</NuxtLink>
      <span v-if="entry.kind === 'location' && parentService" aria-hidden="true">/</span>
      <span class="makoto-muted" aria-current="page">{{ entry.title }}</span>
    </nav>

    <header class="relative px-2 py-14 text-center md:py-20">
      <img src="/bg/elipse.png" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 opacity-50">
      <p class="mb-5 text-xs uppercase tracking-widest text-zinc-500">{{ entry.kind === 'location' ? (locale === 'pl' ? 'Lokalnie' : 'In your area') : locale === 'pl' ? 'Usługi' : 'Services' }}</p>
      <h1 class="makoto-heading relative mx-auto max-w-4xl text-5xl leading-tight md:text-7xl">{{ entry.title }}</h1>
      <p class="makoto-muted relative mx-auto mt-7 max-w-2xl text-lg leading-relaxed">{{ entry.summary }}</p>
      <div class="relative mt-10 flex flex-wrap justify-center gap-5">
        <NuxtLink :to="contactPath" class="makoto-cta">{{ locale === 'pl' ? 'Zapytaj o wycenę' : 'Ask for an estimate' }}</NuxtLink>
        <NuxtLink :to="locale === 'pl' ? '/pl/work' : '/work'" class="link-underline py-3">{{ locale === 'pl' ? 'Zobacz realizacje' : 'See my work' }}</NuxtLink>
      </div>
    </header>

    <div class="mt-16 grid gap-x-16 md:grid-cols-[14rem_1fr]">
      <aside class="hidden md:block">
        <p class="sticky top-32 text-xs font-semibold uppercase tracking-[.25em] text-zinc-500">{{ locale === 'pl' ? 'W OFERCIE' : 'IN THIS OFFER' }}</p>
      </aside>
      <div class="space-y-16">
        <section v-for="(section, index) in sections" :key="index" class="makoto-rule border-t pt-8">
          <template v-if="section.type === 'audience' || section.type === 'scope' || section.type === 'pricing'">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <ul class="mt-7 grid gap-4 md:grid-cols-2">
              <li v-for="(item, itemIndex) in section.items" :key="itemIndex" class="makoto-card makoto-muted rounded-xl p-5 leading-relaxed">
                <UIcon name="i-mkt-course-up-bold-duotone" class="mb-3 block size-6 text-sky-500" aria-hidden />
                {{ item }}
              </li>
            </ul>
          </template>
          <template v-else-if="section.type === 'process'">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <ol class="mt-7 grid gap-3">
              <li v-for="(item, itemIndex) in section.items" :key="itemIndex" class="makoto-card makoto-muted flex items-center gap-5 rounded-xl px-5 py-4">
                <span class="serif text-2xl italic text-sky-500">{{ String(itemIndex + 1).padStart(2, '0') }}</span>
                {{ item }}
              </li>
            </ol>
          </template>
          <template v-else-if="section.type === 'faq'">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <div class="mt-6 divide-y divide-zinc-500/30">
              <details v-for="(item, itemIndex) in section.items" :key="itemIndex" class="group py-5">
                <summary class="cursor-pointer list-none pr-6 font-semibold marker:hidden focus-visible:outline-2 focus-visible:outline-sky-300">{{ Array.isArray(item) ? item[0] : item }}</summary>
                <p v-if="Array.isArray(item)" class="makoto-muted max-w-2xl pt-3 leading-relaxed">{{ item[1] }}</p>
              </details>
            </div>
          </template>
          <template v-else-if="['related', 'locations', 'services', 'articles'].includes(section.type)">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <div class="mt-7 grid gap-4 md:grid-cols-2">
              <NuxtLink v-for="relatedEntry in references(section)" :key="relatedEntry.id" :to="contentPath(relatedEntry)" class="makoto-card group rounded-xl p-6">
                <h3 class="serif text-2xl group-hover:text-sky-500">{{ relatedEntry.title }}</h3>
                <p class="makoto-muted mt-3 line-clamp-3">{{ relatedEntry.summary }}</p>
              </NuxtLink>
            </div>
          </template>
          <template v-else-if="section.type === 'note'">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <p class="makoto-muted mt-5 max-w-2xl leading-relaxed">{{ section.text }}</p>
          </template>
        </section>
      </div>
    </div>

    <section class="makoto-rule mt-20 border-t py-12 text-center">
      <p class="text-xs uppercase tracking-widest text-sky-500">{{ locale === 'pl' ? 'Następny krok' : 'Next step' }}</p>
      <h2 class="makoto-heading mt-3 text-3xl md:text-5xl">{{ locale === 'pl' ? 'Opowiedz mi o swoim projekcie' : 'Tell me about your project' }}</h2>
      <p class="makoto-muted mx-auto mt-4 max-w-2xl">{{ locale === 'pl' ? 'Napisz, co ma robić nowa strona lub aplikacja. Doprecyzujemy zakres przed wyceną.' : 'Share what your website or application should do. We will clarify the scope before an estimate.' }}</p>
      <NuxtLink :to="contactPath" class="makoto-cta mt-7">{{ locale === 'pl' ? 'Przejdź do kontaktu' : 'Get in touch' }}</NuxtLink>
    </section>
  </div>
</template>
