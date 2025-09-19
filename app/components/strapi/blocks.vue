<template>
	<div v-if="blocks?.length">
		<component
		v-for="(block, index) in blocks"
		:key="`${block.__component}-${index}`"
		:is="resolveComponent(block.__component)"
		v-bind="block"
		/>
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Definiujemy prop `blocks`, oczekując tablicy
interface Block {
  __component: string;
  [key: string]: any;
}
defineProps<{
  blocks: Block[] | null | undefined;
}>();

// Mapa mapująca nazwy komponentów ze Strapi na komponenty Vue
// Używamy `defineAsyncComponent` dla lepszej wydajności (lazy loading)
const blockComponents = {
  'shared.rich-text': defineAsyncComponent(() => import('~/components/strapi/blocks/RichText.vue')),
  'shared.media': defineAsyncComponent(() => import('~/components/strapi/blocks/Media.vue')),
  'shared.quote': defineAsyncComponent(() => import('~/components/strapi/blocks/Quote.vue')),
  'shared.slider': defineAsyncComponent(() => import('~/components/strapi/blocks/Slider.vue')),
};

// Funkcja, która zwraca odpowiedni komponent na podstawie nazwy ze Strapi
const resolveComponent = (componentName: string) => {
  const component = blockComponents[componentName as keyof typeof blockComponents];
  if (!component) {
    console.warn(`Component not found for: ${componentName}`);
    return null; // Można też zwrócić komponent zastępczy
  }
  return component;
};

</script>