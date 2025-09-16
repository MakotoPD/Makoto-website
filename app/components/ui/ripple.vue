<template>
  <div class="absolute left-0 top-0 -z-10 flex h-full w-full items-center justify-center overflow-hidden">
    <!-- Debug: usuń to jeśli animacje działają -->
    <div v-if="false" class="absolute top-2 left-2 text-white text-xs z-50 bg-red-500 p-1 rounded">
      Circles: {{ circles.length }} | Type: {{ props.animationType }}
    </div>
    
    <div
      v-for="circle in circles"
      :key="circle.id"
      :class="['circle', `circle-${circle.type}`]"
      :style="circle.style"
    ></div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

type AnimationType = 'breathe' | 'expand';

interface Props {
  // --- General Settings ---
  /** Liczba generowanych kółek */
  numCircles?: number;
  /** Kolor kółek (rgba, hex, named color) */
  color?: string;
  /** Opóźnienie między kółkami dla animacji 'breathe' (ms). Dla 'expand' jest ignorowane - używa równomiernego rozkładu */
  spawnInterval?: number;

  // --- Animation Settings ---
  /** Typ animacji: 'breathe' (pulsowanie) lub 'expand' (rozszerzanie) */
  animationType?: AnimationType;
  /** Czas trwania jednego cyklu animacji (ms) */
  animationDuration?: number;

  // --- Style Settings ---
  /** Początkowy rozmiar kółek (px) */
  startSize?: number;
  /** Przyrost rozmiaru dla kolejnych kółek w animacji 'breathe' (px) */
  sizeIncrement?: number;
  /** Początkowa przezroczystość dla animacji 'breathe' */
  startOpacity?: number;
  /** Grubość ramki dla animacji 'expand' (px) */
  borderWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  numCircles: 8,
  color: 'rgba(226, 232, 240, 0.3)', // Tailwind's slate-200/30
  spawnInterval: 400,
  animationType: 'breathe',
  animationDuration: 3400,
  startSize: 210,
  sizeIncrement: 70,
  startOpacity: 0.8,
  borderWidth: 2,
});

const circles = computed(() => {
  const result = [];
  
  for (let i = 0; i < props.numCircles; i++) {
    let animationDelay: number;
    
    if (props.animationType === 'expand') {
      // Dla expand: rozłóż delay równomiernie w czasie animacji, aby zapewnić ciągłość
      // Każde kółko startuje w równych odstępach w obrębie czasu trwania animacji
      animationDelay = (i * props.animationDuration) / props.numCircles;
    } else {
      // Dla breathe: użyj normalnego spawnInterval
      animationDelay = i * props.spawnInterval;
    }
    
    const size = props.animationType === 'breathe' 
      ? props.startSize + i * props.sizeIncrement 
      : props.startSize;
    
    const style: Record<string, string> = {
      '--animation-delay': `${animationDelay}ms`,
      '--circle-size': `${size}px`,
      '--circle-color': props.color,
      '--animation-duration': `${props.animationDuration}ms`,
    };

    if (props.animationType === 'breathe') {
      style['--circle-opacity'] = String(Math.max(0.3, props.startOpacity - i * 0.08));
    } else { // 'expand'
      style['--border-width'] = `${props.borderWidth}px`;
    }

    result.push({ 
      id: i, 
      style,
      type: props.animationType,
      size: size
    });
  }
  return result;
});
</script>

<style scoped>
.circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  width: var(--circle-size);
  height: var(--circle-size);
  animation-duration: var(--animation-duration);
  animation-delay: var(--animation-delay);
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
}

.circle-breathe {
  background-color: var(--circle-color);
  opacity: var(--circle-opacity);
  animation-name: breathe;
}

.circle-expand {
  background-color: transparent;
  border: var(--border-width) solid var(--circle-color);
  opacity: 0;
  animation-name: expand;
}

@keyframes breathe {
  0% {
    transform: translate(-50%, -50%) scale(0.9);
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, -50%) scale(0.9);
  }
}

@keyframes expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}
</style>