<template>
	<div class="pt-44">
		<h1 class="text-6xl pb-2 text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-800 dark:via-zinc-200 to-zinc-50  bg-clip-text text-transparent">
			{{ t('page.work.hero.title') }}
		</h1>
		<h2 class="serif text-4xl text-center text-zinc-400 max-w-4xl mx-auto">
			{{ t('page.work.hero.description') }}
		</h2>
		<div class="container mx-auto mt-24">
			<AppProjects/>
		</div>
	</div>
</template>

<script setup lang="ts">

const { t, locale } = useI18n()



const title = computed(() => t('page.work.seo.title'))
const description = computed(() => t('page.work.seo.description'))

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>