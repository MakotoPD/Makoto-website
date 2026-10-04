<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

const props = defineProps<{ projects: PublicEntry[] }>()
const root = useTemplateRef('root')
const enhanced = ref(false)
const activeIndex = ref(0)
let dispose: (() => void) | undefined
let disposed = false
const themeColors: Record<string, [string, string]> = {
  red: ['#991b1b', '#ef4444'], orange: ['#9a3412', '#fb923c'],
  amber: ['#92400e', '#fbbf24'], yellow: ['#854d0e', '#facc15'],
  lime: ['#3f6212', '#a3e635'], green: ['#166534', '#4ade80'],
  emerald: ['#065f46', '#34d399'], teal: ['#115e59', '#2dd4bf'],
  cyan: ['#155e75', '#22d3ee'], sky: ['#075985', '#38bdf8'],
  blue: ['#1e40af', '#60a5fa'], indigo: ['#3730a3', '#818cf8'],
  violet: ['#5b21b6', '#a78bfa'], purple: ['#6b21a8', '#c084fc'],
  fuchsia: ['#86198f', '#e879f9'], pink: ['#9d174d', '#f472b6'], rose: ['#9f1239', '#fb7185']
}
const colorsFor = (project: PublicEntry) => themeColors[String(project.data.theme || '')] || themeColors.sky!
const gradientFor = (project: PublicEntry) => {
  const [dark, light] = colorsFor(project)
  return `linear-gradient(135deg, ${dark}, ${dark} 42%, ${light})`
}
const imageFor = (project: PublicEntry) => project.data.image as { url?: string; alternativeText?: string; width?: number; height?: number } | undefined
const stackFor = (project: PublicEntry) => (Array.isArray(project.data.stack) ? project.data.stack : []) as { name: string; logo?: string }[]

onMounted(async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (disposed || !root.value) return
  gsap.registerPlugin(ScrollTrigger)
  const media = gsap.matchMedia()
  const setup = () => {
    media.revert()
    media.add('(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
      const container = root.value!
      const images = Array.from(container.querySelectorAll<HTMLElement>('.project-art'))
      const panels = Array.from(container.querySelectorAll<HTMLElement>('.project-copy'))
      if (images.length < 2) return
      // Preserve the server-rendered article layout until the scroll enhancement is ready.
      enhanced.value = true
      container.classList.add('is-animated')
      activeIndex.value = 0
      gsap.set(panels, { autoAlpha: 0, y: 0 })
      gsap.set(panels[0]!, { autoAlpha: 1 })
      let current = 0
      const select = (index: number, direction: number) => {
        if (index === current) return
        const previous = panels[current]!
        const next = panels[index]!
        // Fast scrolling can interrupt a transition in either direction.
        gsap.killTweensOf(panels)
        gsap.set(panels.filter(panel => panel !== previous && panel !== next), { autoAlpha: 0 })
        gsap.to(previous, { autoAlpha: 0, y: -18 * direction, duration: .18, ease: 'power2.in' })
        gsap.fromTo(next, { autoAlpha: 0, y: 18 * direction }, { autoAlpha: 1, y: 0, duration: .28, ease: 'power3.out' })
        current = index
        activeIndex.value = index
      }
      images.forEach((image, index) => {
        ScrollTrigger.create({
          trigger: image, start: 'top 55%', end: 'bottom 55%',
          onEnter: () => select(index, 1),
          onEnterBack: () => select(index, -1),
          onLeaveBack: () => select(Math.max(0, index - 1), -1)
        })
      })
      ScrollTrigger.refresh()
      return () => {
        gsap.killTweensOf(panels)
        enhanced.value = false
        container.classList.remove('is-animated')
      }
    }, root.value!)
  }
  setup()
  const stop = watch(() => props.projects, async () => {
    media.revert()
    await nextTick()
    if (!disposed) setup()
  })
  dispose = () => { stop(); media.revert() }
})
onBeforeUnmount(() => { disposed = true; dispose?.() })
</script>

<template>
  <div ref="root" class="project-showcase" :data-active-project="enhanced ? activeIndex : undefined" :style="{ '--project-count': projects.length }">
    <article v-for="(project, index) in projects" :key="project.id" class="project-item">
      <NuxtLink :to="contentPath(project)" class="project-art group relative block rounded-2xl border border-gray-300 bg-gray-200 p-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900/80 lg:p-2" :aria-label="project.title" :style="{ '--project-row': index + 1 }">
        <div aria-hidden="true" class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
        <div class="project-image relative flex flex-col justify-end overflow-hidden rounded-xl px-7 pt-8 md:px-10" :style="{ background: gradientFor(project) }">
          <p v-if="project.data.slogan" class="serif mb-10 text-2xl text-white/90">{{ project.data.slogan }}</p>
          <img v-if="imageFor(project)?.url" :src="imageFor(project)?.url" :alt="imageFor(project)?.alternativeText || project.title" :width="imageFor(project)?.width || 1000" :height="imageFor(project)?.height || 625" loading="lazy" decoding="async" class="relative top-5 w-full rounded-t-xl object-cover shadow-[0_-4px_25px_0_rgb(255_255_255_/.25)]">
        </div>
      </NuxtLink>
      <div class="project-copy-slot">
        <div class="project-copy" :inert="enhanced && index !== activeIndex" :aria-hidden="enhanced && index !== activeIndex ? true : undefined">
          <span aria-hidden="true" class="mb-5 block h-1 w-8 rounded-full" :style="{ backgroundColor: colorsFor(project)[1] }" />
          <h3 class="serif text-3xl text-black dark:text-white md:text-4xl">{{ project.title }}</h3>
          <p class="makoto-muted mt-4 leading-relaxed">{{ project.summary }}</p>
          <div v-if="stackFor(project).length" class="project-stack mt-5 flex flex-wrap gap-2">
            <UBadge v-for="(tech, techIndex) in stackFor(project)" :key="techIndex" :icon="tech.logo" variant="subtle" size="lg" class="text-black dark:text-white" :ui="{ leadingIcon: 'size-5' }">{{ tech.name }}</UBadge>
          </div>
          <NuxtLink :to="contentPath(project)" class="link-underline mt-6 inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-300">{{ project.locale === 'pl' ? 'Zobacz realizację' : 'View project' }} <UIcon name="i-mkt-arrow-up-right" class="size-4 shrink-0" aria-hidden="true" /></NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.project-showcase { --ease-out: cubic-bezier(.23, 1, .32, 1); }
.project-item { display: grid; align-items: center; gap: 2rem; margin-bottom: 5rem; }
.project-item:last-child { margin-bottom: 0; }
.project-image { min-height: 20rem; }
.project-image img { transition: transform .3s var(--ease-out); }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .project-art:hover img { transform: translateY(.75rem) rotate(-2deg) scale(1.05); }
}
@media (min-width: 1024px) {
  .project-item { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 4rem; margin-bottom: 9rem; }
  .project-image { min-height: 27rem; }
  /* Article cells share columns while the DOM keeps each image beside its description. */
  .is-animated { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: 4rem; }
  .is-animated .project-item { display: contents; }
  .is-animated .project-art { grid-column: 1; grid-row: var(--project-row); margin-bottom: 9rem; }
  .is-animated .project-item:last-child .project-art { margin-bottom: 0; }
  .is-animated .project-copy-slot { grid-column: 2; grid-row: 1 / span var(--project-count); position: relative; pointer-events: none; }
  .is-animated .project-copy { position: sticky; top: 28vh; padding-block: 1rem; pointer-events: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .project-image img { transition: none; }
}
</style>
