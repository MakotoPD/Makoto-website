<template>
  <div v-if="body" v-html="renderedMarkdown" class="prose max-w-none"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import { bundledLanguages, getHighlighter } from 'shiki';
import shiki from '@shikijs/markdown-it';

// Definiujemy propsy komponentu, oczekując na właściwość `body` typu string
const props = defineProps<{
  body: string | null | undefined;
}>();

// `ref` do przechowywania wyrenderowanego HTML
const renderedMarkdown = ref('');

// Inicjalizujemy markdown-it
const md = new MarkdownIt({
  html: true,        // Włącz renderowanie HTML wewnątrz markdown
  linkify: true,     // Automatycznie konwertuj tekst wyglądający jak URL na linki
  typographer: true, // Włącz inteligentne cytaty i inne ulepszenia typograficzne
});

// Funkcja do renderowania markdown, która zostanie wywołana po stronie klienta
const renderMarkdown = async () => {
  if (!props.body) {
    renderedMarkdown.value = '';
    return;
  }

  // Konfiguracja podświetlania składni za pomocą Shiki
  md.use(await shiki({
    // Możesz tutaj dostosować motywy dla jasnego i ciemnego trybu
    theme: 'tokyo-night',
    // Wczytaj języki, które chcesz wspierać
    // `bundledLanguages` zawiera wszystkie popularne języki
    langs: Object.keys(bundledLanguages)
  }));

  // Renderujemy zawartość markdown do HTML
  renderedMarkdown.value = md.render(props.body);
};

// `onMounted` jest używane, aby upewnić się, że renderowanie odbywa się
// po stronie klienta (w przeglądarce), ponieważ Shiki/Shikiji
// może mieć problemy z renderowaniem po stronie serwera (SSR) bez dodatkowej konfiguracji.
onMounted(() => {
  renderMarkdown();
});

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
	@apply list-disc list-inside;
}

.prose ol {
	@apply list-decimal list-inside;
}

.prose blockquote {
	@apply bg-slate-700/30 px-4 py-1 rounded-lg w-fit;
}

.prose a {
  @apply text-sky-600 hover:underline;
}
</style>