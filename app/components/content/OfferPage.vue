<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

type Section = { type: string; title?: string; items?: (string | string[])[]; text?: string; slugs?: string[] }
const props = defineProps<{ entry: PublicEntry; projects: PublicEntry[] }>()
const { locale } = useI18n()
const sections = computed(() => props.entry.sections as Section[])
const related = computed(() => {
  const section = sections.value.find(item => item.type === 'related')
  return props.projects.filter(project => section?.slugs?.includes(project.slug))
})
const contactPath = computed(() => locale.value === 'pl' ? '/pl/kontakt' : '/contact')
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-24 pt-36 text-black dark:text-white">
    <nav aria-label="Breadcrumb" class="mb-8 flex flex-wrap gap-2 text-sm text-sky-300">
      <NuxtLink :to="locale === 'pl' ? '/pl' : '/'">{{ locale === 'pl' ? 'Start' : 'Home' }}</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink v-if="entry.kind === 'location'" to="/pl/strony-internetowe">Strony internetowe</NuxtLink>
      <span v-if="entry.kind === 'location'" aria-hidden="true">/</span>
      <span class="makoto-muted">{{ entry.title }}</span>
    </nav>

    <header class="relative px-2 py-14 text-center md:py-20">
      <img src="/bg/elipse.png" alt="" aria-hidden="true" class="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 opacity-50">
      <p class="mb-5 text-xs uppercase tracking-widest text-zinc-500">{{ entry.kind === 'location' ? 'Lokalnie' : locale === 'pl' ? 'Usługi' : 'Services' }}</p>
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
          <template v-else-if="section.type === 'related' && related.length">
            <h2 class="serif text-3xl md:text-4xl">{{ section.title }}</h2>
            <div class="mt-7 grid gap-4 md:grid-cols-2">
              <NuxtLink v-for="project in related" :key="project.id" :to="contentPath(project)" class="makoto-card group rounded-xl p-6">
                <h3 class="serif text-2xl group-hover:text-sky-500">{{ project.title }}</h3>
                <p class="makoto-muted mt-3 line-clamp-3">{{ project.summary }}</p>
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
