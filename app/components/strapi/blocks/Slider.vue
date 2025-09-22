<template>
  <div v-if="carouselItems.length" class="my-6">
    <UCarousel
      	v-slot="{ item }"
      	:items="carouselItems"
	  	class-names
	  	loop
	  	dots
		prev-icon="i-lucide-chevron-left"
    	next-icon="i-lucide-chevron-right"
		:autoplay="{ delay: 2000 }"
      	:ui="{
			viewport: 'rounded-xl',
        	item: 'basis-[70%] transition-opacity [&:not(.is-snapped)]:opacity-10 [&:not(.is-snapped)]:scale-95',
        	container: 'rounded-lg',
			prev: 'bg-zinc-700/60 border-zinc-600 hover:bg-zinc-600 text-white/60',
			next: 'bg-zinc-700/60 border-zinc-600 hover:bg-zinc-600 text-white/60'
      	}"
      	arrows
      	class="mx-auto max-w-xl"
    >
      <img
        :src="item.src"
        :alt="item.alt"
        class="rounded-xl w-full object-cover"
        draggable="false"
      >
    </UCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Definicja typu dla pliku ze Strapi pozostaje bez zmian
interface StrapiFile {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
}

// Komponent wciąż przyjmuje prop 'files'
const props = defineProps<{
  files: StrapiFile[];
}>();

const config = useRuntimeConfig();
const strapiBaseUrl = config.public.apiUrl;

// Funkcja pomocnicza do tworzenia pełnego URL-a obrazu
const getImageUrl = (file: StrapiFile) => {
  if (!file?.url) return '';
  return file.url.startsWith('http') ? file.url : `${strapiBaseUrl}${file.url}`;
};

// KLUCZOWA ZMIANA: Transformacja danych dla karuzeli
// Tworzymy właściwość 'computed', która mapuje tablicę 'files' ze Strapi
// na tablicę obiektów z polami 'src' i 'alt', idealną dla naszej karuzeli.
const carouselItems = computed(() => {
  if (!props.files?.length) {
    return [];
  }
  return props.files.map(file => ({
    src: getImageUrl(file),
    alt: file.alternativeText || 'Obraz w karuzeli', // Zapewniamy fallback dla 'alt'
  }));
});
</script>