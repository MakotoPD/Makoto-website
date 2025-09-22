<template>
	<figure v-if="imageUrl" class="my-6 max-w-2xl">
	  <img :src="imageUrl" :alt="altText" class="w-full h-auto rounded-xl shadow-md" />
	  <figcaption v-if="caption" class="mt-2 text-sm text-center text-gray-500">{{ caption }}</figcaption>
	</figure>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  // Definiujemy interfejs pasujący do obiektu 'file' z Twojego API
  interface StrapiFile {
	url: string;
	alternativeText?: string;
	caption?: string;
	width: number;
	height: number;
  }
  
  // ZMIANA: Prop nazywa się teraz 'file', a nie 'image'
  const props = defineProps<{
	file: StrapiFile | null;
  }>();
  
  const config = useRuntimeConfig();
  const strapiBaseUrl = config.public.apiUrl;
  
  // ZMIANA: Uproszczona ścieżka do URL
  const imageUrl = computed(() => {
	const url = props.file?.url;
	if (!url) return null;
	return url.startsWith('http') ? url : `${strapiBaseUrl}${url}`;
  });
  
  // ZMIANA: Uproszczona ścieżka do tekstu alternatywnego
  const altText = computed(() => {
	return props.file?.alternativeText || 'Zdjęcie';
  });
  
  const caption = computed(() => {
	return props.file?.caption;
  });
  </script>