<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

defineProps<{ services: PublicEntry[] }>()
const icons = ['i-mkt-window-frame-line-duotone', 'i-mkt-shopping-bag', 'i-mkt-programming-line-duotone', 'i-mkt-folder-path-connect-line-duotone', 'i-mkt-user-heart-rounded-line-duotone']
</script>

<template>
  <div class="service-grid">
    <NuxtLink v-for="(service, index) in services" :key="service.id" :to="contentPath(service)" class="service-card makoto-card" :class="`service-card-${index}`">
      <div class="service-visual" aria-hidden="true">
        <template v-if="index === 0">
          <div class="design-orbit orbit-one" /><div class="design-orbit orbit-two" />
          <img src="/imgs/steel-flower.webp" alt="" width="512" height="512" loading="lazy" class="steel-flower">
          <div class="design-cursor"><UIcon name="i-mkt-map-arrow-right-bold-duotone" class="size-7" /><span>Makoto</span></div>
          <div class="design-handle handle-one" /><div class="design-handle handle-two" />
        </template>
        <template v-else-if="index === 1">
          <div class="store-bag"><UIcon name="i-mkt-shopping-bag" class="size-20" /><img src="/Sygnet.svg" alt="" width="36" height="36"></div>
          <div class="store-tech"><UIcon name="i-mkt-woocommerce" class="size-10" /><UIcon name="i-mkt-wordpress" class="size-7" /></div>
        </template>
        <template v-else-if="index === 2">
          <img src="/imgs/SnippetSAAS.webp" alt="" width="2512" height="1408" loading="lazy" class="code-window">
          <div class="code-icons"><UIcon name="i-mkt-nuxt-icon" class="size-7" /><UIcon name="i-mkt-typescript-icon" class="size-6" /><UIcon name="i-mkt-postgresql" class="size-7" /></div>
        </template>
        <template v-else-if="index === 3">
          <div class="site-map">
            <span class="map-root"><UIcon name="i-mkt-www" class="size-7" /></span>
            <svg viewBox="0 0 200 60" fill="none"><path d="M100 0V25M30 60V25H170V60M100 25V60" /></svg>
            <div class="map-pages"><UIcon v-for="i in 3" :key="i" name="i-mkt-document-text-line-duotone" class="size-8" /></div>
          </div>
        </template>
        <template v-else>
          <div class="care-rings"><span /><span /><span /></div>
          <div class="care-connection">
            <span class="care-client"><UIcon name="i-mkt-user-hand-up-bold-duotone" class="size-8" /></span>
            <svg viewBox="0 0 200 80" fill="none"><path class="connection-track" d="M0 40C60 -10 140 90 200 40" /><path class="connection-pulse" d="M0 40C60 -10 140 90 200 40" /></svg>
            <img src="/imgs/smallAvatar.jpg" alt="" width="80" height="80" class="care-avatar">
          </div>
        </template>
      </div>
      <div class="service-copy">
        <UIcon :name="icons[index] || icons[0]!" class="service-icon size-7" aria-hidden="true" />
        <h3 class="serif text-2xl md:text-3xl">{{ service.title }}</h3>
        <p class="makoto-muted mt-3 text-sm leading-relaxed md:text-base">{{ service.summary }}</p>
      </div>
      <span class="service-arrow" aria-hidden="true">↗</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.service-grid { --ease-out: cubic-bezier(.23, 1, .32, 1); display: grid; gap: 1rem; }
.service-card { position: relative; display: flex; flex-direction: column; isolation: isolate; overflow: hidden; border-radius: .75rem; min-height: 24rem; }
.service-card::before { content: ''; position: absolute; z-index: -1; inset: 0; background-image: linear-gradient(rgb(125 145 165 / .09) 1px, transparent 1px), linear-gradient(90deg, rgb(125 145 165 / .09) 1px, transparent 1px); background-size: 48px 48px; mask-image: linear-gradient(black, transparent 85%); }
.service-visual { position: relative; height: 11rem; pointer-events: none; }
.service-copy { position: relative; z-index: 1; padding: 1.5rem; margin-top: auto; }
.service-icon { color: #6b93ad; margin-bottom: .75rem; }
.service-arrow { position: absolute; z-index: 2; top: 1.25rem; right: 1.5rem; color: #65a9ce; font-size: 1.5rem; transition: transform .25s var(--ease-out); }
.service-card:focus-visible { outline: 2px solid #38bdf8; outline-offset: 4px; }
.steel-flower { position: absolute; width: 18rem; height: 18rem; object-fit: contain; top: -2.5rem; left: calc(50% - 9rem); filter: drop-shadow(0 15px 30px rgb(56 189 248 / .15)); transition: transform .6s var(--ease-out); }
.design-orbit { position: absolute; width: 19rem; height: 19rem; left: calc(50% - 9.5rem); top: -3rem; border: 1px solid rgb(100 165 200 / .25); border-radius: 50%; transform: rotateX(55deg) rotate(-30deg); }
.orbit-two { transform: rotateY(55deg) rotate(30deg); }
.design-cursor { position: absolute; top: 7rem; right: 1.5rem; color: #38bdf8; transform: rotate(-12deg); transition: transform .4s var(--ease-out); }
.design-cursor span { display: block; margin: -.2rem 0 0 1.5rem; border: 1px solid #38bdf880; border-radius: .35rem; padding: .1rem .5rem; background: #0c4a6e; color: white; font-size: .75rem; }
.design-handle { position: absolute; width: .5rem; height: .5rem; border: 1px solid #38bdf8; background: #164e63; }
.handle-one { left: 1.75rem; top: 2rem; }.handle-two { right: 2rem; top: 11rem; }
.store-bag { position: absolute; left: calc(50% - 4rem); top: .75rem; width: 8rem; height: 8rem; display: grid; place-items: center; border: 1px solid #7dd3fc55; border-radius: 1rem; background: linear-gradient(150deg, #164e6370, #0284c720); color: #62a8c4; transform: rotate(-12deg); box-shadow: 0 20px 40px #0002; transition: transform .3s var(--ease-out); }
.store-bag img { position: absolute; top: 3.25rem; width: 1.5rem; height: 1.5rem; }
.store-tech { position: absolute; bottom: 0; right: 1.5rem; display: flex; align-items: center; gap: .75rem; padding: .5rem 1rem; color: #a78bfa; background: #18181be6; border: 1px solid #71717a66; border-radius: .5rem; transform: rotate(7deg); }
.code-window { position: absolute; width: 25rem; max-width: none; right: -4rem; top: -1.5rem; transform: rotate(-8deg); opacity: .8; transition: transform .3s var(--ease-out), opacity .3s; }
.code-icons { position: absolute; left: 1.5rem; bottom: .5rem; display: flex; align-items: center; gap: 1rem; padding: .75rem; background: #18181be6; border: 1px solid #71717a66; border-radius: .75rem; box-shadow: 0 10px 25px #0003; }
.site-map { position: absolute; width: 13rem; left: calc(50% - 6.5rem); top: 1rem; }
.map-root { display: grid; place-items: center; margin: auto; width: 3.25rem; height: 3.25rem; border: 1px solid #38bdf866; border-radius: .5rem; color: #38bdf8; background: #0c4a6e33; }
.site-map svg { width: 100%; height: 3rem; stroke: #559dbb; stroke-width: 1; opacity: .5; }
.map-pages { display: flex; justify-content: space-between; margin-inline: .75rem; color: #7e9cab; }
.map-pages > * { transition: transform .25s var(--ease-out), color .25s; }
.care-connection { display: flex; align-items: center; position: absolute; width: 80%; left: 10%; top: 2rem; }
.care-client { display: grid; place-items: center; flex-shrink: 0; width: 3.5rem; height: 3.5rem; border-radius: 50%; border: 1px solid #38bdf880; background: #164e63; color: #a5f3fc; }
.care-avatar { width: 5rem; height: 5rem; border-radius: 50%; border: 2px solid #71717a; transition: transform .3s var(--ease-out); }
.care-connection svg { flex: 1; min-width: 0; }.connection-track { stroke: #6b8a9a; stroke-width: 1; }.connection-pulse { stroke: #38bdf8; stroke-width: 2; stroke-dasharray: 30 200; }
.care-rings { position: absolute; inset: 0; display: grid; place-items: center; }
.care-rings span { position: absolute; width: 12rem; height: 12rem; border: 1px solid #7dd3fc12; border-radius: 50%; }.care-rings span:nth-child(2) { width: 20rem; height: 20rem; }.care-rings span:nth-child(3) { width: 28rem; height: 28rem; }
@media (min-width: 768px) {
  .service-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .service-card-0 { grid-row: span 2; }
  .service-card-0 .service-visual { flex: 1; min-height: 20rem; }
  .service-card-0 .steel-flower { width: 24rem; height: 24rem; left: calc(50% - 12rem); top: 3rem; }
  .service-card-0 .design-orbit { top: 6rem; }
  .service-card-0 .design-cursor { top: 19rem; }
  .service-card-0 .handle-one { top: 9rem; }.service-card-0 .handle-two { top: 21rem; }
  .service-card-2 { grid-column: 2; grid-row: 1; }
  .service-card-4 { grid-column: 1 / -1; min-height: 14rem; flex-direction: row-reverse; align-items: center; }
  .service-card-4 .service-visual { width: 45%; height: 14rem; overflow: hidden; }
  .service-card-4 .service-copy { width: 55%; margin-top: 0; }
  .service-card-4 .care-connection { top: 4rem; }
}
@media (min-width: 1024px) {
  .service-grid { grid-template-columns: 1.15fr 1fr 1fr; }
  .service-card { min-height: 21rem; }
  .service-card-2 { grid-column: 2 / span 2; min-height: 18rem; justify-content: end; }
  .service-card-2 .service-visual { position: absolute; right: 0; top: 0; width: 56%; height: 100%; }
  .service-card-2 .code-window { width: 31rem; top: 2rem; right: -12rem; transform: rotate(-12deg); }
  .service-card-2 .code-icons { left: 6rem; bottom: 1.5rem; }
  .service-card-2 .service-copy { width: 58%; padding-top: 3rem; padding-right: 0; }
  .service-card-1 { grid-column: 2; grid-row: 2; }
  .service-card-3 { grid-column: 3; grid-row: 2; }
  .service-card-4 { min-height: 14rem; }
  .service-card-0 .steel-flower { top: 2rem; }
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .service-card:hover .service-arrow { transform: translate(3px, -3px); }
  .service-card:hover .steel-flower { transform: rotate(55deg) scale(1.08); }
  .service-card:hover .design-cursor { transform: translate(-1rem, -1rem) rotate(-4deg); }
  .service-card:hover .store-bag { transform: rotate(3deg) translateY(-.4rem); }
  .service-card:hover .code-window { transform: rotate(-3deg) translate(-1rem, -.5rem); opacity: 1; }
  .service-card:hover .map-pages > * { transform: translateY(-.35rem); color: #38bdf8; }
  .service-card:hover .map-pages > :nth-child(2) { transition-delay: .04s; }
  .service-card:hover .map-pages > :nth-child(3) { transition-delay: .08s; }
  .service-card:hover .care-avatar { transform: scale(1.1) rotate(-8deg); }
  .service-card:hover .connection-pulse { animation: connection 1.5s linear infinite; }
}
@keyframes connection { to { stroke-dashoffset: -230; } }
@media (prefers-reduced-motion: reduce) { .service-card, .service-card * { transition: none; animation: none; } }
</style>
