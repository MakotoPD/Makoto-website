<script setup lang="ts">
import type { PublicEntry } from '#shared/content'

const props = defineProps<{ entries: PublicEntry[] }>()
const { locale } = useI18n()
const root = useTemplateRef('root')
const ordered = computed(() => [...props.entries].sort((a, b) => String(a.data.from).localeCompare(String(b.data.from))))
const dateLabel = (value: unknown) => {
  const date = String(value || '')
  const match = date.match(/^(\d{4})-(\d{2})/)
  return match ? `${match[2]}/${match[1]}` : date
}
let cleanup: (() => void) | undefined
let disposed = false
onMounted(async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (disposed || !root.value) return
  gsap.registerPlugin(ScrollTrigger)
  const media = gsap.matchMedia()
  const setup = () => {
    media.revert()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const container = root.value!
      const progress = container.querySelector('.timeline-progress')!
      gsap.fromTo(progress, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: container, start: 'top center', end: 'bottom center', scrub: true } })
      container.querySelectorAll<HTMLElement>('.timeline-item').forEach(item => {
        ScrollTrigger.create({ trigger: item, start: 'top center', end: 'max', toggleClass: { targets: item, className: 'timeline-reached' } })
      })
      const resize = new ResizeObserver(() => ScrollTrigger.refresh())
      resize.observe(container)
      return () => { resize.disconnect(); container.querySelectorAll('.timeline-reached').forEach(item => item.classList.remove('timeline-reached')) }
    }, root.value!)
  }
  setup()
  const stop = watch(ordered, async () => { media.revert(); await nextTick(); if (!disposed) setup() })
  cleanup = () => { stop(); media.revert() }
})
onBeforeUnmount(() => { disposed = true; cleanup?.() })
</script>

<template>
  <div ref="root" class="work-timeline">
    <div class="timeline-rail" aria-hidden="true"><div class="timeline-progress" /></div>
    <ol>
      <li v-for="item in ordered" :key="item.id" class="timeline-item">
        <div class="timeline-company">
          <h3 class="serif text-3xl md:text-4xl">{{ item.data.company }}</h3>
          <p class="makoto-muted mt-2 text-sm">{{ dateLabel(item.data.from) }} – {{ dateLabel(item.data.to) }}</p>
          <p v-if="item.data.isRemote || item.data.location" class="makoto-muted mt-1 flex items-center gap-1.5 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg>
            {{ item.data.isRemote ? (locale === 'pl' ? 'Zdalnie' : 'Remote') : item.data.location }}
          </p>
        </div>
        <span class="timeline-dot" aria-hidden="true" />
        <div class="timeline-description">
          <h4 class="mb-3 text-xl font-bold">{{ item.title }}</h4>
          <ContentDocument :document="item.body" />
          <div v-if="Array.isArray(item.data.tags)" class="mt-4 flex flex-wrap gap-2">
            <UBadge v-for="(tag, index) in item.data.tags" :key="index" variant="soft" class="text-sky-700 dark:text-white">{{ tag }}</UBadge>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.work-timeline { --axis: .75rem; position: relative; margin-top: 4rem; }
.timeline-rail { position: absolute; top: 0; bottom: 0; left: var(--axis); width: 1px; background: #64748b55; }
.timeline-progress { width: 100%; height: 100%; background: #10a0b9; box-shadow: 0 0 10px #10a0b9; transform-origin: top; }
.timeline-item { position: relative; display: grid; gap: 1.25rem; padding-left: 3rem; margin-bottom: 5rem; }
.timeline-item:last-child { margin-bottom: 0; padding-bottom: 2rem; }
.timeline-dot { position: absolute; left: calc(var(--axis) - .75rem); top: .5rem; width: 1.5rem; height: 1.5rem; border: 4px solid var(--color-background-app); border-radius: 50%; background: #64748b; transition: background-color .2s ease, box-shadow .2s ease; }
.timeline-reached .timeline-dot { background: #10a0b9; box-shadow: 0 0 20px #10a0b999; }
.timeline-description { min-width: 0; --content-font-size: .875rem; font-size: .875rem; }
@media (min-width: 768px) {
  .work-timeline { --axis: calc((100% - 6rem) / 3 + 3rem); }
  .timeline-item { padding-left: 0; grid-template-columns: minmax(0, 1fr) 2rem minmax(0, 2fr); column-gap: 2rem; }
  .timeline-description { grid-column: 3; }
}
@media (prefers-reduced-motion: reduce) {
  .timeline-dot { transition: none; background: #10a0b9; }
}
</style>
