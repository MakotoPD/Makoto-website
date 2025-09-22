<template>
	<div class="pt-44" v-if="about?.data">
		<h1 class="text-6xl text-center">
			{{ about.data.title }}
		</h1>
		
		<br/><br/>
		<div class="w-full max-w-5xl mx-auto px-12">
			<StrapiBlocks :blocks="blockNodes" />
		</div>
	</div>
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="isPending">Loading…</div>
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="error">Error: {{ error }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AboutResponse = {
  data?: {
    title?: string
    blocks?: unknown[]
  }
}

const config = useRuntimeConfig()

const STRAPI_URL = config.public.apiUrl;

// Pobieranie i18n
const { locale, t } = useI18n();

const { data: about, pending: isPending, error } = useFetch<AboutResponse>('/api/about?populate[blocks][populate]=*', {
    baseURL: STRAPI_URL,
    // Przekazujemy `locale` bezpośrednio. Nuxt będzie go obserwował za nas.
    query: {
        locale,

    },

    watch: [locale]
});

const blockNodes = computed(() => about.value?.data?.blocks ?? [])
</script>