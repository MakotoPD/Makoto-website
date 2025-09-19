<template>
	<div class="prose max-w-none" v-html="renderedMarkdown"></div>
  </template>
  
<script setup lang="ts">
  import { computed } from 'vue';
  import MarkdownIt from 'markdown-it';
  import hljs from 'highlight.js'; // 1. Import biblioteki highlight.js
  
  // 2. Import wybranego motywu kolorystycznego.
  // Możesz to przenieść do globalnego pliku CSS lub nuxt.config.ts, jeśli wolisz.
  import 'highlight.js/styles/atom-one-dark.css';
  
  const props = defineProps<{
	body: string;
  }>();
  
  // 3. Konfiguracja markdown-it z opcją 'highlight'
  const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	highlight: (str, lang) => {
		const highlightedCode = (() => {
		if (lang && hljs.getLanguage(lang)) {
			try { return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value; } 
			catch (__) {}
		}
		try { return hljs.highlightAuto(str).value; } 
		catch (__) {}
		return md.utils.escapeHtml(str);
		})();
		
		// KROK 1: Zmiana w generowanym HTML
		// Zamiast zwracać samo <pre><code>...</code></pre>, opakowujemy je w div
		// i dodajemy przycisk z wywołaniem funkcji `copyCode`.
		return `
		<div class="code-container">
			<button class="copy-button" onclick="copyCode(this)">Kopiuj</button>
			<pre class="hljs"><code>${highlightedCode}</code></pre>
		</div>
		`;
	},
	});
  
  const renderedMarkdown = computed(() => {
	return props.body ? md.render(props.body) : '';
  });

onMounted(() => {
  window.copyCode = async (buttonElement: HTMLButtonElement) => {
    // Znajdź kontener nadrzędny i w nim element `code`
    const container = buttonElement.parentElement;
    if (!container) return;
    
    const codeElement = container.querySelector('code');
    if (!codeElement) return;

    // Użyj nowoczesnego API schowka
    await navigator.clipboard.writeText(codeElement.innerText);

    // Daj znać użytkownikowi, że kod został skopiowany
    buttonElement.innerText = 'Copied!';
    setTimeout(() => {
      buttonElement.innerText = 'Copy';
    }, 2000); // Wróć do pierwotnego tekstu po 2 sekundach
  };
});

onUnmounted(() => {
  if (window.copyCode) {
    delete window.copyCode;
  }
});

</script>
  
<style>
@import "tailwindcss";
  /* Poprawka: Domyślnie Tailwind Prose może ustawiać białe tło dla bloków pre/code.
	 Nadpisujemy je, aby motyw z highlight.js był w pełni widoczny. */

.prose h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, blockquote,  {
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

.prose > pre {
	@apply !bg-slate-700/30 px-4 rounded-2xl h-fit;
}

.prose .code-container {
	@apply h-fit;
}

.prose pre {
	background-color: transparent;

}

.code-container {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #4a5568; /* Ciemnoszary */
  color: #e2e8f0; /* Jasnoszary tekst */
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: sans-serif;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.copy-button:hover {
  opacity: 1;
}
</style>