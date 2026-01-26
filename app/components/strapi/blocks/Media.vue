<template>
	<figure v-if="imageUrl" class="my-6 max-w-2xl">
	  <img 
		:src="imageUrl" 
		:alt="altText" 
		class="w-full h-auto rounded-xl shadow-md cursor-zoom-in transition-transform hover:scale-[1.02]" 
		@click="openLightbox"
	  />
	  <figcaption v-if="caption" class="mt-2 text-sm text-center text-gray-500">{{ caption }}</figcaption>
	</figure>

	<!-- Lightbox Overlay -->
	<Teleport to="body">
	  <Transition name="lightbox">
		<div 
		  v-if="isLightboxOpen" 
		  class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
		  @click="closeLightbox"
		  @keydown.escape="closeLightbox"
		  tabindex="0"
		  ref="lightboxRef"
		>
		  <button 
			class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
			@click.stop="closeLightbox"
			aria-label="Zamknij"
		  >
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <line x1="18" y1="6" x2="6" y2="18"></line>
			  <line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		  </button>
		  <img 
			:src="imageUrl" 
			:alt="altText" 
			class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
			@click.stop
		  />
		  <figcaption v-if="caption" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full">
			{{ caption }}
		  </figcaption>
		</div>
	  </Transition>
	</Teleport>
  </template>
  
  <script setup lang="ts">
  import { computed, ref, nextTick } from 'vue';
  
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
  
  // Lightbox state
  const isLightboxOpen = ref(false);
  const lightboxRef = ref<HTMLElement | null>(null);

  const openLightbox = () => {
	isLightboxOpen.value = true;
	document.body.style.overflow = 'hidden';
	nextTick(() => {
	  lightboxRef.value?.focus();
	});
  };

  const closeLightbox = () => {
	isLightboxOpen.value = false;
	document.body.style.overflow = '';
  };
  
  // ZMIANA: Uproszczona ścieżka do URL
  const imageUrl = computed(() => {
	const url = props.file?.url;
	if (!url) return undefined;
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

  <style scoped>
  .lightbox-enter-active,
  .lightbox-leave-active {
	transition: opacity 0.3s ease;
  }
  
  .lightbox-enter-from,
  .lightbox-leave-to {
	opacity: 0;
  }
  
  .lightbox-enter-active img,
  .lightbox-leave-active img {
	transition: transform 0.3s ease;
  }
  
  .lightbox-enter-from img {
	transform: scale(0.9);
  }
  
  .lightbox-leave-to img {
	transform: scale(0.9);
  }
  </style>