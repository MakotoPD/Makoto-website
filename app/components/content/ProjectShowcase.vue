<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

defineProps<{ projects: PublicEntry[] }>()
const themeColors: Record<string, [string, string, string]> = {
  red: ['#991b1b', '#ef4444', '#fca5a5'],
  orange: ['#9a3412', '#fb923c', '#fed7aa'],
  amber: ['#92400e', '#fbbf24', '#fde68a'],
  yellow: ['#854d0e', '#facc15', '#fef08a'],
  lime: ['#3f6212', '#a3e635', '#d9f99d'],
  green: ['#166534', '#4ade80', '#bbf7d0'],
  emerald: ['#065f46', '#34d399', '#a7f3d0'],
  teal: ['#115e59', '#2dd4bf', '#99f6e4'],
  cyan: ['#155e75', '#22d3ee', '#a5f3fc'],
  sky: ['#075985', '#38bdf8', '#bae6fd'],
  blue: ['#1e40af', '#60a5fa', '#bfdbfe'],
  indigo: ['#3730a3', '#818cf8', '#c7d2fe'],
  violet: ['#5b21b6', '#a78bfa', '#ddd6fe'],
  purple: ['#6b21a8', '#c084fc', '#e9d5ff'],
  pink: ['#9d174d', '#f472b6', '#fbcfe8']
}
const colorsFor = (project: PublicEntry) => themeColors[String(project.data.theme || '')] || themeColors.sky!
const gradientFor = (project: PublicEntry) => {
  const [dark, light] = colorsFor(project)
  return `linear-gradient(135deg, ${dark}, ${dark} 42%, ${light})`
}
const imageFor = (project: PublicEntry) => project.data.image as { url?: string; alternativeText?: string } | undefined
const stackFor = (project: PublicEntry) => Array.isArray(project.data.stack) ? project.data.stack.slice(0, 5) : []
</script>

<template>
  <div class="space-y-16 md:space-y-24">
    <article v-for="project in projects" :key="project.id" class="grid items-center gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,.65fr)] lg:gap-12">
      <NuxtLink :to="contentPath(project)" class="group relative block rounded-2xl border border-gray-300 bg-gray-200 p-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900/80 lg:p-2">
        <div aria-hidden="true" class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
        <div class="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-xl px-8 pt-7" :style="{ background: gradientFor(project) }">
          <p v-if="project.data.slogan" class="serif mb-9 text-2xl text-white/90">{{ project.data.slogan }}</p>
          <img v-if="imageFor(project)?.url" :src="imageFor(project)?.url" :alt="imageFor(project)?.alternativeText || project.title" width="1000" height="625" loading="lazy" decoding="async" class="relative top-5 w-full rounded-t-xl object-cover shadow-[0_-4px_25px_0_rgb(255_255_255_/.25)] transition duration-300 group-hover:translate-y-3 group-hover:-rotate-2 group-hover:scale-105">
        </div>
      </NuxtLink>
      <div class="lg:pr-8">
        <span aria-hidden="true" class="mb-5 block h-1 w-8 rounded-full" :style="{ backgroundColor: colorsFor(project)[1] }" />
        <h3 class="serif text-3xl text-black dark:text-white">{{ project.title }}</h3>
        <p class="makoto-muted mt-4 leading-relaxed">{{ project.summary }}</p>
        <div v-if="stackFor(project).length" class="mt-5 flex flex-wrap gap-2">
          <UBadge v-for="(tech, index) in stackFor(project)" :key="index" variant="subtle" class="text-black dark:text-white">{{ (tech as { name?: string }).name || tech }}</UBadge>
        </div>
        <NuxtLink :to="contentPath(project)" class="link-underline mt-6 inline-block text-sm text-sky-600 dark:text-sky-300">{{ project.locale === 'pl' ? 'Zobacz realizację' : 'View project' }} ↗</NuxtLink>
      </div>
    </article>
  </div>
</template>
