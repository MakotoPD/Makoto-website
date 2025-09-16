<template>
  <div
    class="scroller"
    :class="{ 'is-draggable': draggable }"
    @mousedown="dragStart"
    @touchstart.passive="dragStart"
    @mousemove="dragging"
    @touchmove.passive="dragging"
    @mouseup="dragEnd"
    @touchend="dragEnd"
    @mouseleave="dragEnd"
    ref="scrollerRef"
  >
    <div class="scroller__inner" :style="scrollerStyle" ref="scrollerInnerRef">
      <div class="tag-list">
        <template v-for="(item, index) in items" :key="index">
          <span class="item">{{ item }}</span>
          <span class="separator" aria-hidden="true">{{ separator }}</span>
        </template>
      </div>
      <div class="tag-list" aria-hidden="true">
        <template v-for="(item, index) in items" :key="`duplicate-${index}`">
          <span class="item">{{ item }}</span>
          <span class="separator">{{ separator }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  speed: { type: String, default: '40s' },
  gap: { type: String, default: '3rem' },
  separator: { type: String, default: '✦' },
  textColor: { type: String, default: '#FFFFFF' },
  separatorColor: { type: String, default: '#FFFFFF' },
  draggable: { type: Boolean, default: false },
});

const scrollerRef = ref(null);
const scrollerInnerRef = ref(null);
const position = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startPos = ref(0);
let animationFrameId = null;

const velocity = computed(() => {
  const durationInSeconds = parseFloat(props.speed);
  return 20 / durationInSeconds;
});

const scrollerStyle = computed(() => ({
  '--gap': props.gap,
  '--text-color': props.textColor,
  '--separator-color': props.separatorColor,
  transform: `translateX(${position.value}px)`,
}));

// Pętla animacji z poprawioną logiką resetowania
const animate = () => {
  if (!isDragging.value && scrollerInnerRef.value) {
    position.value -= velocity.value;

    const halfWidth = scrollerInnerRef.value.scrollWidth / 2;
    // Kluczowa poprawka: Resetujemy pozycję, gdy pierwsza połowa
    // całkowicie zniknie z widoku.
    if (Math.abs(position.value) >= halfWidth) {
      // Zamiast dodawać, obliczamy resztę z dzielenia, aby płynnie
      // kontynuować ruch, nawet jeśli klatka "przeskoczyła" za daleko.
      position.value = position.value % halfWidth;
    }
  }
  animationFrameId = requestAnimationFrame(animate);
};

// --- Obsługa przeciągania ---
const dragStart = (e) => {
  if (!props.draggable) return;
  isDragging.value = true;
  startX.value = e.pageX || e.touches[0].pageX;
  startPos.value = position.value;
  scrollerRef.value.classList.add('is-dragging');
};

const dragging = (e) => {
  if (!isDragging.value || !props.draggable) return;
  e.preventDefault();
  const currentX = e.pageX || e.touches[0].pageX;
  const walk = currentX - startX.value;
  position.value = startPos.value + walk;
};

const dragEnd = () => {
  if (!props.draggable) return;
  isDragging.value = false;
  scrollerRef.value.classList.remove('is-dragging');
};

onMounted(() => {
  // Czekamy na pewność, że element jest w pełni wyrenderowany przed startem
  animationFrameId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.scroller {
  width: 100%;
  overflow: hidden;
  -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
  mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
}

.scroller.is-draggable { cursor: grab; }
.scroller.is-dragging { cursor: grabbing; }

.scroller.is-dragging .item,
.scroller.is-dragging .separator {
  user-select: none;
  pointer-events: none;
}

.scroller__inner {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  gap: var(--gap);
  /* USUNIĘTO: transition: transform 0.2s ease-out; */
  /* Ta linia powodowała animowany "powrót" zamiast niewidocznego resetu. */
}

.tag-list {
  display: flex;
  align-items: center;
  gap: var(--gap);
}

.item {
  font-size: 1.5rem;
  color: var(--text-color);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.separator {
  font-size: 1.2rem;
  color: var(--separator-color);
}
</style>