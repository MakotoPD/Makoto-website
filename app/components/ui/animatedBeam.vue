<template>
  <div :class="cn('absolute inset-0', props.className)">
    <!-- Debug info -->
    <div v-if="false" class="absolute top-0 right-0 text-xs bg-red-500 text-white p-1 z-50 rounded max-w-[200px]">
      SVG: {{ !!svgRef }}<br>
      Path: {{ pathD.slice(0, 30) }}...<br>
      Length: {{ Math.round(pathLength) }}<br>
      SVG Size: {{ svgRef?.getBoundingClientRect().width }}x{{ svgRef?.getBoundingClientRect().height }}
    </div>
    
    <ClientOnly>
      <svg
        ref="svgRef"
        width="100%"
        height="100%"
        class="pointer-events-none absolute inset-0"
        style="z-index: 10; min-width: 100%; min-height: 100%;"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            :id="gradientId"
            gradientUnits="userSpaceOnUse"
            :x1="gradientCoordinates.x1"
            :y1="gradientCoordinates.y1"
            :x2="gradientCoordinates.x2"
            :y2="gradientCoordinates.y2"
          >
            <stop :stop-color="gradientStartColor" stop-opacity="0"></stop>
            <stop :stop-color="gradientStartColor"></stop>
            <stop offset="32.5%" :stop-color="gradientStopColor"></stop>
            <stop offset="100%" :stop-color="gradientStopColor" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <!-- Static background line (always visible) -->
        <path
          :d="pathD"
          :stroke="pathColor"
          :stroke-width="pathWidth"
          :stroke-opacity="0.3"
          stroke-linecap="round"
          fill="none"
        ></path>
        <!-- Animated gradient beam (short moving segment) -->
        <path
          :d="pathD"
          :stroke="`url(#${gradientId})`"
          :stroke-width="pathWidth + 1"
          stroke-linecap="round"
          fill="none"
          :style="{
            strokeDasharray: `${beamLength} ${pathLength}`,
            strokeDashoffset: animatedStrokeDashoffset,
          }"
        ></path>
      </svg>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, type Ref } from 'vue';
import { useRafFn } from '@vueuse/core';

// Helper do łączenia klas - można go przenieść do osobnego pliku utils
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface Props {
  className?: string;
  fromRef: Ref<HTMLElement | null> | HTMLElement | null;
  toRef: Ref<HTMLElement | null> | HTMLElement | null;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  /** Długość animowanego beam'a (px) */
  beamLength?: number;
}

const props = withDefaults(defineProps<Props>(),
  {
    curvature: 0,
    reverse: false,
    duration: 5,
    delay: 0,
    pathColor: 'gray',
    pathWidth: 2,
    pathOpacity: 0.2,
    gradientStartColor: '#ffaa40',
    gradientStopColor: '#9c40ff',
    startXOffset: 0,
    startYOffset: 0,
    endXOffset: 0,
    endYOffset: 0,
    beamLength: 60,
  }
);

const svgRef = ref<SVGElement | null>(null);
const pathD = ref('');
const pathLength = ref(0);

const gradientId = `animated-beam-gradient-${Math.random().toString(36).substr(2, 9)}`;

const gradientCoordinates = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });

const updatePath = () => {
  // Obsługa zarówno ref obiektów jak i bezpośrednich elementów
  if (!props.fromRef || !props.toRef || !svgRef.value) {
    return;
  }
  
  const fromElement = ('value' in props.fromRef) ? props.fromRef.value : props.fromRef;
  const toElement = ('value' in props.toRef) ? props.toRef.value : props.toRef;
  
  if (!fromElement || !toElement) {
    return;
  }

  const svgRect = svgRef.value.getBoundingClientRect();
  const fromRect = fromElement.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();
  
  // Oblicz pozycje względem kontenera nadrzędnego
  const containerRect = svgRef.value.parentElement?.getBoundingClientRect() || svgRect;
  
  const startX = (fromRect.left + fromRect.width / 2 - containerRect.left) * (1000 / containerRect.width) + props.startXOffset;
  const startY = (fromRect.top + fromRect.height / 2 - containerRect.top) * (200 / containerRect.height) + props.startYOffset;
  const endX = (toRect.left + toRect.width / 2 - containerRect.left) * (1000 / containerRect.width) + props.endXOffset;
  const endY = (toRect.top + toRect.height / 2 - containerRect.top) * (200 / containerRect.height) + props.endYOffset;

  const controlX = (startX + endX) / 2;
  const controlY = (startY + endY) / 2 - props.curvature;

  const newPathD = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
  pathD.value = newPathD;

  // Obliczanie długości ścieżki
  const pathNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathNode.setAttribute('d', newPathD);
  pathLength.value = pathNode.getTotalLength();
  
  // Sprawdź czy współrzędne są w granicach viewBox (tylko w development)
  if (import.meta.env.DEV && (startX < 0 || startY < 0 || endX < 0 || endY < 0 || 
      startX > 1000 || endX > 1000 || startY > 200 || endY > 200)) {
    console.warn('Path coordinates outside viewBox bounds!', {
      viewBoxBounds: { width: 1000, height: 200 },
      coordinates: { startX, startY, endX, endY }
    });
  }
  
  // Aktualizacja koordynatów gradientu
  gradientCoordinates.value = {
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
  };
};

const startTime = ref(0);
const animatedStrokeDashoffset = ref(0);
const beamLength = computed(() => Math.min(pathLength.value * 0.15, 60)); // 15% długości ścieżki lub max 60px

const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    if (!startTime.value) {
      startTime.value = timestamp;
    }
    const elapsedTime = timestamp - startTime.value - props.delay * 1000;
    if (elapsedTime < 0) return;
    
    const progress = Math.min(elapsedTime / (props.duration * 1000), 1);
    
    // Beam startuje poza ścieżką i kończy poza ścieżką po przeciwnej stronie
    const totalDistance = pathLength.value + beamLength.value;
    
    if (props.reverse) {
      animatedStrokeDashoffset.value = -beamLength.value + (totalDistance * progress);
    } else {
      animatedStrokeDashoffset.value = totalDistance - (totalDistance * progress);
    }
    
    if (progress >= 1) {
      startTime.value = timestamp;
    }
  },
  { immediate: false }
);

onMounted(() => {
  updatePath();
  window.addEventListener('resize', updatePath);
  
  const timeoutId = setTimeout(() => {
    resume();
  }, props.delay * 1000);

  onUnmounted(() => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', updatePath);
    pause();
  });
});

watch([
  () => props.fromRef && ('value' in props.fromRef) ? props.fromRef.value : props.fromRef,
  () => props.toRef && ('value' in props.toRef) ? props.toRef.value : props.toRef
], () => {
  setTimeout(updatePath, 100);
});

</script>