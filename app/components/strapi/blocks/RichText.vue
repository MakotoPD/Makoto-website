<template>
  <div v-if="body" v-html="renderedHtml" class="prose max-w-none"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
const props = defineProps<{ body: string | null | undefined }>()

// i18n locale (aby prze-renderować przy zmianie języka)
const { locale } = useI18n()

// Reaktywne źródła danych do obserwacji
const safeBody = computed(() => props.body || '')

// SSR-friendly render via server API with caching
// Używamy reaktywnego klucza zależnego od treści i języka, aby uniknąć starych danych po przełączeniu języka
const { data } = await useAsyncData(
  () => `richtext-render-${locale.value}-${safeBody.value.length}-${safeBody.value.slice(0, 16)}`,
  () => $fetch<{ html: string }>('/api/render-md', {
    method: 'POST',
    body: { body: safeBody.value }
  })
)

const renderedHtml = computed(() => data.value?.html || '')

</script>

<style>
@reference '../../../assets/css/main.css';
/* Style dla podświetlania składni Shiki */
/* Możesz dostosować te style lub użyć gotowych motywów */

.shiki {
  background-color: #212529 !important; /* Ciemne tło dla bloku kodu */
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6, .prose p, .prose ul, .prose ol, .prose li, .prose figure, .prose blockquote, .prose pre {
	@apply my-1;
}
.prose h1{
	@apply text-6xl;
}

.prose h2{
	@apply text-4xl;
}

.prose h3{
	@apply text-2xl;
}

.prose h4{
	@apply text-xl;
}

.prose h5{
	@apply text-lg;
}

.prose h6{
	@apply text-base ;
}

.prose p{
	@apply text-lg;
}

.prose ul {
	@apply list-disc list-inside marker:text-sky-400;
}

.prose ol {
	@apply list-decimal list-inside marker:text-sky-400;
}

.prose blockquote {
	@apply bg-slate-700/30 px-4 py-1 rounded-lg w-fit;
}

.prose a {
  @apply text-sky-600 hover:underline;
}
</style>