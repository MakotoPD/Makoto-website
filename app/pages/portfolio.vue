<template>
	<div class="pt-44">
		<h1 class="text-6xl text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-800 dark:via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ t('page.portfolio.hero.title') }}
		</h1>
		<h2 class="serif text-4xl text-center text-zinc-400">
			{{ t('page.portfolio.hero.description') }}
		</h2>
		<div class="mt-24 max-w-4xl mx-auto px-2">
			<h2 class="text-3xl text-black dark:text-white">{{t('page.portfolio.filters.title')}}:</h2>
			<div class="flex gap-3">
				<UButton class="text-black dark:text-white" @click="changefilters('')" :variant="isActive('') ? 'solid' : 'subtle'" color="primary">{{t('page.portfolio.filters.all')}}</UButton>
				<UButton class="text-black dark:text-white" @click="changefilters('web')" :variant="isActive('web') ? 'solid' : 'subtle'" color="primary">{{t('page.portfolio.filters.web')}}</UButton>
				<UButton class="text-black dark:text-white" @click="changefilters('logo')" :variant="isActive('logo') ? 'solid' : 'subtle'" color="primary">{{t('page.portfolio.filters.logo')}}</UButton>
			</div>
			<div v-if="pending" class="mt-8">
				Loading
			</div>
			<div v-else-if="error" class="mt-8">
				Error:
				{{ error }}
			</div>
			<div v-else class="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
				<div v-for="img in portfolio?.data" class="self-center overflow-hidden rounded-2xl border border-zinc-700 p-1 duration-300 hover:border-sky-600 hover:-translate-y-3">
					<NuxtImg provider="strapi" :src="img.image.url" loading="lazy" class="rounded-xl" />
				</div>
			</div>
		</div>

	</div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
const { find } = useStrapi()


let filterParams = ref('')

const queryParams = computed(() => {
  return {
    // 2. Statyczny, zagnieżdżony parametr populate (pozostaje taki sam)
    populate: {
      image: {
        populate: '*'
      }
    },
	filters: {
	 type: {$contains: filterParams.value}
	}
  }
})

const { data: portfolio, pending, error, refresh } = useAsyncData(
  () => `Portfolio`,
  () => find('Portfolios',  queryParams.value),
  {
    watch: [() => filterParams.value]
  }
)


let changefilters = (prop) =>{
	filterParams.value = prop
}

let isActive = (prop) => {
	return filterParams.value == prop
}

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