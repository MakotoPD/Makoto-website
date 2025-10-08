<template>
	<div class="pt-44" v-if="privacy?.data">
		<h1 class="text-6xl pb-1 text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ privacy.data.title }}
		</h1>
    <div class="mt-12 container mx-auto">
      <StrapiBlocksRichText :body="blockNodes" />
    </div>
	<div class="container mx-auto mt-4">
		<p class="text-neutral-400">{{ t('page.privacy.lastupdate') }} <span>{{ new Date(privacy.data.updatedAt).toLocaleDateString()}}</span></p>
	</div>
  </div>
</template>

<script lang="ts" setup>
const { t, locale } = useI18n()
const { find } = useStrapi()

const queryParams = computed(() => {
  return {
    locale: locale.value,
  }
})

const { data: privacy, pending, error, refresh } = useAsyncData(
  () => `Privacy-${locale.value}`,
  () => find('Privacy', queryParams.value),
  {
    watch: [() => locale.value]
  }
)

console.log(privacy)

const blockNodes = computed(() => privacy.value?.data?.description ?? [])

const title = computed(() => t('page.privacy.seo.title'))
const description = computed(() => t('page.privacy.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>