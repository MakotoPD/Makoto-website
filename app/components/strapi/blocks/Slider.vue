<template>
	<div v-if="files?.length" class="my-6">
	  <div class="flex overflow-x-auto space-x-4 p-2 snap-x snap-mandatory">
		<div
		  v-for="file in files"
		  :key="file.id"
		  class="flex-shrink-0 w-4/5 md:w-1/3 snap-center"
		>
		  <img
			:src="getImageUrl(file)"
			:alt="file.alternativeText || 'Obraz w sliderze'"
			class="w-full h-auto object-cover rounded-lg shadow-md"
		  />
		</div>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  // Używamy tego samego interfejsu co w Media.vue
  interface StrapiFile {
	id: number;
	url: string;
	alternativeText?: string;
	caption?: string;
  }
  
  // Komponent slidera otrzymuje tablicę plików w propie 'files'
  const props = defineProps<{
	files: StrapiFile[];
  }>();
  
  const config = useRuntimeConfig();
  const strapiBaseUrl = config.public.apiUrl;
  
  // Funkcja pomocnicza do budowania pełnego URL-a obrazka
  const getImageUrl = (file: StrapiFile) => {
	if (!file?.url) return '';
	return file.url.startsWith('http') ? file.url : `${strapiBaseUrl}${file.url}`;
  };
  </script>
  
  <style scoped>
  /* Dodaje płynne przewijanie i ukrywa pasek przewijania dla estetyki */
  .overflow-x-auto {
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
  }
  .overflow-x-auto::-webkit-scrollbar {
	display: none; /* Chrome, Safari, and Opera */
  }
  </style>