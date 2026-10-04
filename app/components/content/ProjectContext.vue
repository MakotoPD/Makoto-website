<script setup lang="ts">
import { contentPath, safeHref, type PublicEntry } from '#shared/content'
import { cityName, projectLocations } from '#shared/local-seo'
const props = defineProps<{ project: PublicEntry; services: PublicEntry[]; locations: PublicEntry[] }>()
const study = computed(() => props.project.data.caseStudy as Record<string, string> | undefined)
const testimonial = computed(() => props.project.data.testimonial as Record<string, string> | undefined)
const facts = computed(() => [
  [props.project.locale === 'pl' ? 'Klient' : 'Client', props.project.data.clientName],
  [props.project.locale === 'pl' ? 'Branża' : 'Industry', props.project.data.industry],
  [props.project.locale === 'pl' ? 'Miejscowość' : 'Location', cityName(props.project.data.clientCity)]
].filter(item => item[1]))
const blocks = computed(() => [
  [props.project.locale === 'pl' ? 'Cel projektu' : 'Project goal', study.value?.challenge],
  [props.project.locale === 'pl' ? 'Rozwiązanie' : 'Solution', study.value?.solution],
  [props.project.locale === 'pl' ? 'Co zyskał klient' : 'What the client gained', study.value?.outcome]
].filter(item => item[1]))
const related = computed(() => [
  ...props.services.filter(service => Array.isArray(props.project.data.serviceSlugs) && props.project.data.serviceSlugs.includes(service.slug)),
  ...projectLocations(props.project, props.locations)
])
</script>

<template>
  <div v-if="facts.length || blocks.length || related.length || (testimonial?.quote && testimonial?.author)" class="mt-12 space-y-10">
    <dl v-if="facts.length" class="makoto-rule grid gap-6 border-y py-6 sm:grid-cols-3">
      <div v-for="fact in facts" :key="String(fact[0])"><dt class="text-xs uppercase tracking-widest text-sky-500">{{ fact[0] }}</dt><dd class="serif mt-2 text-xl">{{ fact[1] }}</dd></div>
    </dl>
    <section v-for="block in blocks" :key="block[0]" class="grid gap-5 md:grid-cols-[12rem_1fr]">
      <h2 class="text-sm uppercase tracking-[.2em] text-sky-300">{{ block[0] }}</h2>
      <p class="makoto-muted whitespace-pre-line leading-relaxed">{{ block[1] }}</p>
    </section>
    <figure v-if="testimonial?.quote && testimonial?.author" class="makoto-rule border-y py-8">
      <blockquote class="serif max-w-3xl whitespace-pre-line text-2xl leading-relaxed">{{ testimonial.quote }}</blockquote>
      <figcaption class="makoto-muted mt-5 text-sm">{{ testimonial.author }}<span v-if="testimonial.role"> · {{ testimonial.role }}</span><a v-if="safeHref(testimonial.sourceUrl)" :href="safeHref(testimonial.sourceUrl)" target="_blank" rel="noopener noreferrer" class="ml-4 underline underline-offset-4">{{ project.locale === 'pl' ? 'Źródło opinii' : 'Review source' }}</a></figcaption>
    </figure>
    <nav v-if="related.length" :aria-label="project.locale === 'pl' ? 'Powiązana oferta' : 'Related services'" class="makoto-rule border-t pt-6">
      <h2 class="serif text-2xl">{{ project.locale === 'pl' ? 'Podobny projekt dla Twojej firmy' : 'A similar project for your business' }}</h2>
      <ul class="mt-5 flex flex-wrap gap-x-6 gap-y-3"><li v-for="entry in related" :key="entry.id"><NuxtLink :to="contentPath(entry)" class="link-underline text-sky-600 dark:text-sky-300">{{ entry.title }}</NuxtLink></li></ul>
    </nav>
  </div>
</template>
