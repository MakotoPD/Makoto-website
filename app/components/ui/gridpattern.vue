<template>
  <div
    ref="gridRef"
    class="interactive-grid-pattern"
    :style="gridStyle"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Definicja propsów z wartościami domyślnymi
const props = withDefaults(defineProps<{
  gridSize?: number;
  lineColor?: string;
  highlightColor?: string;
  highlightSize?: number;
}>(), {
  gridSize: 30, // Odstęp między liniami siatki w px
  lineColor: 'rgba(255, 255, 255, 0.08)', // Kolor linii
  highlightColor: 'rgba(255, 255, 255, 0.12)', // Kolor poświaty
  highlightSize: 450, // Rozmiar poświaty w px
});

const gridRef = ref<HTMLElement | null>(null);
const mousePosition = ref({ x: -1000, y: -1000 });

// Dynamiczne style przekazywane do CSS
const gridStyle = computed(() => ({
  '--grid-size': `${props.gridSize}px`,
  '--line-color': props.lineColor,
  '--highlight-color': props.highlightColor,
  '--highlight-size': `${props.highlightSize}px`,
  '--mouse-x': `${mousePosition.value.x}px`,
  '--mouse-y': `${mousePosition.value.y}px`,
}));

const handleMouseMove = (event: MouseEvent) => {
  if (gridRef.value) {
    const rect = gridRef.value.getBoundingClientRect();
    mousePosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
};

const handleMouseLeave = () => {
  mousePosition.value = { x: -1000, y: -1000 };
};
</script>

<style scoped>
.interactive-grid-pattern {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000000; /* Główne tło */
  overflow: hidden;
}

/* Używamy pseudo-elementu ::before do renderowania siatki i poświaty */
.interactive-grid-pattern::before {
  content: "";
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  /*
   * Warstwy tła:
   * 1. Poświata (radial-gradient).
   * 2. Linie pionowe (linear-gradient).
   * 3. Linie poziome (drugi linear-gradient).
   */
  background-image:
    /* 1. Poświata */
    radial-gradient(
      circle at var(--mouse-x) var(--mouse-y),
      var(--highlight-color),
      transparent var(--highlight-size)
    ),
    /* 2. & 3. Siatka Linii */
    linear-gradient(to right, var(--line-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line-color) 1px, transparent 1px);

  background-size:
    100% 100%, /* Rozmiar poświaty */
    var(--grid-size) var(--grid-size), /* Rozmiar komórki dla linii pionowych */
    var(--grid-size) var(--grid-size); /* Rozmiar komórki dla linii poziomych */
    
  background-position: center, center, center;
  
  transition: background 0.15s ease-out;
}
</style>