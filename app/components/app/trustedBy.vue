<template>
  <section class="bg-background overflow-hidden py-16">
    <div ref="groupRef" class="relative mx-auto max-w-7xl px-6">
      <div class="flex flex-col items-center md:flex-row">
        <div v-if="text" class="md:max-w-44 md:border-r md:pr-6">
          <p class="text-end text-sm">{{ text }}</p>
        </div>

        <div
          class="relative py-6 border-x border-gray-950"
          :class="[text ? 'md:w-[calc(100%-11rem)]' : 'w-full']"
        >
          <div class="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
          <div class="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
          <div class="slider-mask">
            <div ref="scrollerRef" class="flex items-center" style="flex-wrap: nowrap;">
              <div
                v-for="logo in logos"
                :key="logo.alt"
                class="flex-shrink-0 px-14"
              >
                <img
                  :src="logo.src"
                  :alt="logo.alt"
                  loading="lazy"
                  class="w-44 h-auto grayscale-100 hover:grayscale-0"
                />
              </div>
              <div
                v-for="logo in logos"
                :key="`${logo.alt}-duplicate`"
                class="flex-shrink-0 px-14"
                aria-hidden="true"
              >
                <img
                  :src="logo.src"
                  :alt="logo.alt"
                  loading="lazy"
                  class="w-44 h-auto grayscale-100 hover:grayscale-0"
                />
              </div>
            </div>
          </div>
          
          <div class="pointer-events-none absolute left-0 top-0 h-full w-20"><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 0) 33.33333333333333%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 0) 33.33333333333333%);backdrop-filter:blur(0px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 0) 44.44444444444444%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 0) 44.44444444444444%);backdrop-filter:blur(1px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 0) 55.55555555555556%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 0) 55.55555555555556%);backdrop-filter:blur(2px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 0) 66.66666666666666%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 0) 66.66666666666666%);backdrop-filter:blur(3px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 0) 77.77777777777777%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 0) 77.77777777777777%);backdrop-filter:blur(4px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 0) 88.88888888888889%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 0) 88.88888888888889%);backdrop-filter:blur(5px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 0) 100%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 0) 100%);backdrop-filter:blur(6px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 1) 100%, rgba(255, 255, 255, 0) 111.11111111111111%);-webkit-mask-image:linear-gradient(270deg, rgba(255, 255, 255, 0) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 1) 100%, rgba(255, 255, 255, 0) 111.11111111111111%);backdrop-filter:blur(7px)"></div></div>
          <div class="pointer-events-none absolute right-0 top-0 h-full w-20"><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 0) 33.33333333333333%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 0) 33.33333333333333%);backdrop-filter:blur(0px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 0) 44.44444444444444%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 11.11111111111111%, rgba(255, 255, 255, 1) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 0) 44.44444444444444%);backdrop-filter:blur(1px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 0) 55.55555555555556%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 22.22222222222222%, rgba(255, 255, 255, 1) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 0) 55.55555555555556%);backdrop-filter:blur(2px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 0) 66.66666666666666%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 33.33333333333333%, rgba(255, 255, 255, 1) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 0) 66.66666666666666%);backdrop-filter:blur(3px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 0) 77.77777777777777%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 44.44444444444444%, rgba(255, 255, 255, 1) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 0) 77.77777777777777%);backdrop-filter:blur(4px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 0) 88.88888888888889%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 55.55555555555556%, rgba(255, 255, 255, 1) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 0) 88.88888888888889%);backdrop-filter:blur(5px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 0) 100%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 66.66666666666666%, rgba(255, 255, 255, 1) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 0) 100%);backdrop-filter:blur(6px)"></div><div class="pointer-events-none absolute inset-0 rounded-[inherit]" style="mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 1) 100%, rgba(255, 255, 255, 0) 111.11111111111111%);-webkit-mask-image:linear-gradient(90deg, rgba(255, 255, 255, 0) 77.77777777777777%, rgba(255, 255, 255, 1) 88.88888888888889%, rgba(255, 255, 255, 1) 100%, rgba(255, 255, 255, 0) 111.11111111111111%);backdrop-filter:blur(7px)"></div></div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { PropType } from 'vue'
import gsap from 'gsap' // ✅ Importujemy GSAP

// Definicje propsów i interfejsu (bez zmian)
interface Logo {
  src: string
  alt: string
}
const props = defineProps({
  logos: {
    type: Array as PropType<Logo[]>,
    required: true,
  },
  text: {
    type: String,
    default: null,
  },
  speed: {
    type: Number,
    default: 40,
  },
})

// ✅ Tworzymy referencje do elementów DOM
const groupRef = ref<HTMLElement | null>(null)
const scrollerRef = ref<HTMLElement | null>(null)
let tween: gsap.core.Tween | null = null // Zmienna do przechowywania naszej animacji

// onMounted() uruchamia się, gdy komponent jest już w DOM
onMounted(() => {
  // Czekamy, aż elementy będą dostępne
  if (scrollerRef.value && groupRef.value) {
    // Tworzymy animację GSAP
    tween = gsap.to(scrollerRef.value, {
      xPercent: -164, // Przesuń element o 50% jego własnej szerokości w lewo
      duration: props.speed, // Użyj szybkości z propsów
      ease: 'none', // Stała prędkość, bez zwalniania i przyspieszania
      repeat: -1, // Nieskończona pętla
    })

    // ✅ Obsługa pauzy na hover za pomocą event listenerów
    groupRef.value.addEventListener('mouseenter', () => tween?.pause())
    groupRef.value.addEventListener('mouseleave', () => tween?.resume())
  }
})

// onUnmounted() sprząta po komponencie, gdy jest niszczony
onUnmounted(() => {
  // Zabijamy animację, aby uniknąć wycieków pamięci
  tween?.kill()
})
</script>

<style scoped>
/* Cała animacja została usunięta z CSS. Zostają tylko style layoutu. */
.slider-mask {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
}
</style>


          
