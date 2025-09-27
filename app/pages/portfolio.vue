<template>
	<div class="pt-44">
		<h1 class="text-6xl text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ t('page.portfolio.hero.title') }}
		</h1>
		<h2 class="serif text-4xl text-center text-zinc-400">
			{{ t('page.portfolio.hero.description') }}
		</h2>
	</div>
</template>

<script lang="ts" setup>
const { t } = useI18n()




const title = computed(() => t('page.portfolio.seo.title'))
const description = computed(() => t('page.portfolio.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>