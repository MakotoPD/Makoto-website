<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

const { locale } = useI18n()
const { data: home, error } = await useAsyncData(
  () => `home-${locale.value}`,
  () => $fetch<PublicEntry>('/api/content/home', { query: { locale: locale.value, slug: 'home' } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
if (!home.value) throw createError({ statusCode: 503 })
const { data: services } = await useAsyncData(
  () => `home-services-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/service', { query: { locale: locale.value } }),
  { watch: [locale] }
)
const { data: projects } = await useAsyncData(
  () => `home-projects-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/project', { query: { locale: locale.value } }),
  { watch: [locale] }
)
const sections = computed(() => home.value?.sections || [])
const section = (type: string) => sections.value.find(item => item.type === type) as Record<string, any> | undefined
const orderedServices = computed(() => (section('services')?.slugs || []).map((slug: string) => services.value?.find(item => item.slug === slug)).filter(Boolean) as PublicEntry[])
const featured = computed(() => (section('featured')?.slugs || []).map((slug: string) => projects.value?.find(item => item.slug === slug)).filter(Boolean) as PublicEntry[])
const facts = computed(() => section('facts')?.items as string[] || [])
const process = computed(() => section('process')?.items as string[] || [])
const locations = computed(() => section('locations')?.slugs as string[] || [])
const faqs = computed(() => section('faq')?.items as string[][] || [])
const contactPath = computed(() => locale.value === 'pl' ? '/pl/kontakt' : '/contact')
const showModel = ref(false)
onMounted(() => {
  if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if ('requestIdleCallback' in window) window.requestIdleCallback(() => { showModel.value = true }, { timeout: 3500 })
  else setTimeout(() => { showModel.value = true }, 1200)
})
useEntrySeo(home)
</script>

<template>
  <div class="text-black dark:text-white">
    <section class="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden px-5 pb-24 pt-40 text-center md:min-h-screen">
      <img src="/bg/elipse.png" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 opacity-70">
      <div aria-hidden="true" class="pointer-events-none absolute -right-20 top-12 -z-10 hidden h-[33rem] w-[37rem] opacity-20 lg:block">
        <ClientOnly><LazyModelsMakotologo v-if="showModel" class="size-full" /></ClientOnly>
      </div>
      <div class="relative z-10 mx-auto max-w-4xl">
        <p class="serif mb-5 flex items-center justify-center gap-3 text-base md:text-xl">
          <span>{{ locale === 'pl' ? 'Cześć, jestem Patryk' : 'Hi, I’m Patryk' }}</span>
          <img src="/imgs/smallAvatar.jpg" alt="" width="36" height="36" class="size-9 rounded-full object-cover transition hover:-rotate-12 hover:scale-110">
          <span>{{ locale === 'pl' ? 'i tworzę strony' : 'and I build websites' }}</span>
        </p>
        <h1 class="makoto-heading text-balance text-5xl leading-tight md:text-7xl">{{ home?.title }}</h1>
        <p class="makoto-muted mx-auto mt-7 max-w-2xl text-lg leading-relaxed">{{ home?.summary }}</p>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink :to="contactPath" class="makoto-cta">{{ locale === 'pl' ? 'Porozmawiajmy o projekcie' : 'Let’s talk about your project' }} <span aria-hidden="true">↗</span></NuxtLink>
          <NuxtLink :to="locale === 'pl' ? '/pl/work' : '/work'" class="link-underline py-2">{{ locale === 'pl' ? 'Zobacz realizacje' : 'See my work' }}</NuxtLink>
        </div>
      </div>
    </section>

    <section id="services" class="makoto-rule border-t px-5 py-24">
      <div class="mx-auto max-w-6xl">
        <div class="mb-12 grid gap-6 md:grid-cols-2">
          <div><p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">{{ locale === 'pl' ? 'Oferta' : 'Services' }}</p><h2 class="makoto-heading text-4xl md:text-6xl">{{ locale === 'pl' ? 'Co mogę dla Ciebie zrobić' : 'How I can help' }}</h2></div>
          <p class="makoto-muted max-w-md self-end leading-relaxed">{{ locale === 'pl' ? 'Każdy projekt zaczynam od poznania celu i zakresu. Poniżej znajdziesz obszary, w których mogę pomóc.' : 'Every project starts with understanding the goal and scope. These are the areas where I can help.' }}</p>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <NuxtLink v-for="service in orderedServices" :key="service.id" :to="contentPath(service)" class="makoto-card group relative min-h-56 overflow-hidden rounded-xl p-7">
            <UIcon name="i-mkt-window-frame-line-duotone" class="size-8 text-sky-500/70" aria-hidden />
            <h3 class="serif mt-7 text-2xl md:text-3xl">{{ service.title }}</h3>
            <p class="makoto-muted mt-3 max-w-lg leading-relaxed">{{ service.summary }}</p>
            <span aria-hidden="true" class="absolute right-7 top-7 text-xl text-sky-300 transition group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="px-5 py-24">
      <div class="mx-auto max-w-6xl">
        <p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">{{ locale === 'pl' ? 'Realizacje' : 'Work' }}</p>
        <h2 class="makoto-heading text-4xl md:text-6xl">{{ locale === 'pl' ? 'Wybrane realizacje' : 'Selected projects' }}</h2>
        <ContentProjectShowcase v-if="featured.length" class="mt-12" :projects="featured" />
        <NuxtLink :to="locale === 'pl' ? '/pl/work' : '/work'" class="mt-8 inline-flex text-sky-300 underline underline-offset-4">{{ locale === 'pl' ? 'Wszystkie realizacje' : 'All projects' }}</NuxtLink>
      </div>
    </section>

    <section class="makoto-rule border-t px-5 py-24">
      <div class="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div><p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">{{ locale === 'pl' ? 'Współpraca' : 'Collaboration' }}</p><h2 class="makoto-heading text-4xl md:text-6xl">{{ locale === 'pl' ? 'Współpraca oparta na konkretach' : 'A practical way of working' }}</h2></div>
        <ul class="divide-y divide-zinc-500/30">
          <li v-for="fact in facts" :key="fact" class="makoto-muted flex gap-5 py-6 text-lg leading-relaxed"><UIcon name="i-mkt-course-up-bold-duotone" class="mt-1 size-5 shrink-0 text-sky-500" aria-hidden />{{ fact }}</li>
        </ul>
      </div>
    </section>

    <section class="makoto-rule border-y px-5 py-24">
      <div class="mx-auto max-w-6xl">
        <p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">{{ locale === 'pl' ? 'Proces' : 'Process' }}</p>
        <h2 class="makoto-heading text-4xl md:text-6xl">{{ locale === 'pl' ? 'Od rozmowy do opieki' : 'From conversation to care' }}</h2>
        <ol class="mt-12 grid gap-3 md:grid-cols-3">
          <li v-for="(step, index) in process" :key="index" class="makoto-card min-h-36 rounded-xl p-6">
            <span class="serif text-2xl italic text-sky-500">{{ String(index + 1).padStart(2, '0') }}</span>
            <p class="serif mt-8 text-xl">{{ step }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="locale === 'pl'" class="px-5 py-24">
      <div class="mx-auto max-w-6xl">
        <p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">Lokalnie</p>
        <h2 class="makoto-heading text-4xl md:text-6xl">Inowrocław, Toruń, Bydgoszcz</h2>
        <p class="makoto-muted mt-5 max-w-2xl leading-relaxed">Współpracuję z firmami z regionu.</p>
        <div class="mt-9 flex flex-wrap gap-3">
          <NuxtLink v-for="city in locations" :key="city" :to="`/pl/${city}`" class="makoto-card rounded-xl px-6 py-3 capitalize">{{ city.split('/')[1] }}</NuxtLink>
        </div>
      </div>
    </section>

    <section class="makoto-rule border-t px-5 py-24">
      <div class="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_2fr]">
        <div><p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">FAQ</p><h2 class="makoto-heading text-4xl md:text-5xl">{{ locale === 'pl' ? 'Przed rozpoczęciem' : 'Before we begin' }}</h2></div>
        <div class="divide-y divide-zinc-500/30">
          <details v-for="(item, index) in faqs" :key="index" class="py-6">
            <summary class="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-sky-300">{{ item[0] }}</summary>
            <p class="makoto-muted pt-3 leading-relaxed">{{ item[1] }}</p>
          </details>
        </div>
      </div>
    </section>

    <section id="contact" class="makoto-rule border-t px-5 py-24">
      <div class="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <p class="mb-4 text-xs uppercase tracking-[.28em] text-sky-500">{{ locale === 'pl' ? 'Kontakt' : 'Contact' }}</p>
          <h2 class="makoto-heading text-4xl md:text-6xl">{{ locale === 'pl' ? 'Opowiedz mi o projekcie' : 'Tell me about your project' }}</h2>
          <p class="makoto-muted mt-5 max-w-md leading-relaxed">{{ locale === 'pl' ? 'Napisz, co chcesz zbudować lub poprawić. Odpowiem z pytaniami potrzebnymi do wyceny.' : 'Tell me what you want to build or improve. I will follow up with the questions needed for an estimate.' }}</p>
          <NuxtLink :to="contactPath" class="mt-6 inline-flex text-sky-300 underline underline-offset-4">{{ locale === 'pl' ? 'Pełna strona kontaktowa' : 'Contact page' }}</NuxtLink>
        </div>
        <UiConnectform />
      </div>
    </section>
  </div>
</template>
