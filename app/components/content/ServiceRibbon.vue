<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<template>
  <div class="service-ribbon" aria-hidden="true">
    <div class="ribbon-back" />
    <div class="ribbon-front">
      <div class="ribbon-track serif">
        <div v-for="copy in 2" :key="copy" class="ribbon-items">
          <template v-for="item in items" :key="item"><span>{{ item }}</span><UIcon name="i-mkt-sparkle" class="ribbon-star size-4 shrink-0" /></template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-ribbon { position: relative; overflow: hidden; height: 12rem; display: flex; align-items: center; }
.ribbon-back, .ribbon-front { position: absolute; left: -2%; width: 104%; background: linear-gradient(90deg, #0284c7, #0ea5e9, #0284c7); }
.ribbon-back { height: 4rem; transform: rotate(5deg); opacity: .45; }
.ribbon-front { transform: rotate(-3deg); padding: 1rem 0; overflow: hidden; }
.ribbon-track { display: flex; width: max-content; animation: ribbon 35s linear infinite; color: white; }
.ribbon-items { display: flex; align-items: center; gap: 2.5rem; padding-right: 2.5rem; }
.ribbon-items > span { font-size: 1.5rem; white-space: nowrap; }
.ribbon-items .ribbon-star { font-size: 1rem; }
@keyframes ribbon { to { transform: translateX(-50%); } }
@media (hover: hover) { .service-ribbon:hover .ribbon-track { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) { .ribbon-track { animation: none; } }
</style>
