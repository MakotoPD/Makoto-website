<template>
  <UApp>
    <NuxtLoadingIndicator color="aqua" errorColor="red"  />
    <div class="bg-[var(--color-background-app)]" data-vaul-drawer-wrapper>
      <NuxtLayout>
          <NuxtPage />
      </NuxtLayout>
    </div>

    <UiCookieConsent v-if="!technical" />

    <div class="custom-cursor">
      <div ref="cursorRef" class="custom-cursor__cursor"></div>
      <div ref="followerRef" class="custom-cursor__follower"></div>
    </div>
  </UApp>
</template>

<style>

.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.1s;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
    filter: none;
  }
}

.custom-cursor{
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999;
}

.custom-cursor__cursor,
.custom-cursor__follower {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999999;
  border-radius: 50%;
  transform: translate(-50%, -50%); /* Center the element on the cursor position */
}


.custom-cursor__cursor {
  width: 8px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.281);
  backdrop-filter: invert(100%);
}

.custom-cursor__follower {
  width: 30px;
  height: 30px;
  border: 1px solid black;
}

.dark .custom-cursor__follower {
  border: 1px solid white !important;
}

.custom-cursor__follower.active {
  transform: scale(3);
}

@media screen and (max-width: 1023px) {
    
  .custom-cursor{
    display: none;
  }
}

</style>


<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const localeHead = useLocaleHead({ seo: false })
const site = 'https://makoto.com.pl'
const staticPairs = new Set(['/', '/about', '/work', '/blog', '/portfolio', '/uses', '/faq', '/links', '/privacy', '/rules'])
const path = computed(() => route.path.replace(/\/+$/, '') || '/')
const technical = computed(() => /^\/(?:pl\/)?(panel|admin|preview)(\/|$)/.test(path.value))
const basePath = computed(() => path.value === '/pl' ? '/' : path.value.replace(/^\/pl(?=\/)/, ''))

useHead({
  htmlAttrs: {
    lang: () => localeHead.value.htmlAttrs?.lang || (locale.value === 'pl' ? 'pl-PL' : 'en-US'),
    dir: () => localeHead.value.htmlAttrs?.dir || 'ltr'
  },
  link: computed(() => {
    if (technical.value) return []
    const links: ({ key: string; rel: 'canonical'; href: string } | { key: string; rel: 'alternate'; href: string; type: 'text/html'; hreflang: string })[] = [{ key: 'canonical', rel: 'canonical', href: `${site}${path.value}` }]
    if (staticPairs.has(basePath.value)) {
      const en = `${site}${basePath.value}`
      const pl = `${site}${basePath.value === '/' ? '/pl' : `/pl${basePath.value}`}`
      return [
        ...links,
        { key: 'alternate-en', rel: 'alternate', hreflang: 'en-US', href: en, type: 'text/html' },
        { key: 'alternate-pl', rel: 'alternate', hreflang: 'pl-PL', href: pl, type: 'text/html' },
        { key: 'alternate-default', rel: 'alternate', hreflang: 'x-default', href: en, type: 'text/html' }
      ]
    }
    return links
  }),
  script: computed(() => {
    if (path.value !== '/' && path.value !== '/pl') return []
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'Makoto', url: `${site}/`, inLanguage: ['pl-PL', 'en-US'] },
        { '@type': 'Person', name: 'Patryk Dąbrowski', url: `${site}/about`, email: 'contact@makoto.com.pl' }
      ]
    }
    return [{ key: 'site-schema', type: 'application/ld+json', innerHTML: JSON.stringify(graph).replace(/</g, '\\u003c') }]
  })
})
useSeoMeta({ robots: () => technical.value ? 'noindex, nofollow' : 'index, follow' })

let stopCursor: (() => void) | undefined
onMounted(async () => {
  if (window.innerWidth <= 1023 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { gsap } = await import('gsap')
  gsap.set('.custom-cursor', { xPercent: -50, yPercent: -50 })
  const x = gsap.quickTo('.custom-cursor__cursor', 'x', { duration: 0.3, ease: 'power3' })
  const y = gsap.quickTo('.custom-cursor__cursor', 'y', { duration: 0.3, ease: 'power3' })
  const fx = gsap.quickTo('.custom-cursor__follower', 'x', { duration: 0.5, ease: 'power3' })
  const fy = gsap.quickTo('.custom-cursor__follower', 'y', { duration: 0.5, ease: 'power3' })
  const move = (event: MouseEvent) => { x(event.clientX); y(event.clientY); fx(event.clientX); fy(event.clientY) }
  window.addEventListener('mousemove', move)
  stopCursor = () => window.removeEventListener('mousemove', move)
})
onUnmounted(() => stopCursor?.())
</script>
