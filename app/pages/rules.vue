<template>
	<div class="pt-44">
    <div v-if="pending" class="w-full max-w-4xl mx-auto px-12">Ładowanie...</div>
		<div v-else-if="error">Błąd: {{ error }}</div>

    <div v-if="rule?.data">
      <h1 class="text-6xl pb-1 text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-800 dark:via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
        {{ rule.data.title }}
      </h1>
      <div class="mt-12 container mx-auto">
        <StrapiBlocksRichText :body="blockNodes" />
      </div>
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

const { data: rule, pending, error, refresh } = useAsyncData(
  () => `Rule-${locale.value}`,
  () => find('Rule', queryParams.value),
  {
    watch: [() => locale.value]
  }
)

console.log(rule)

const blockNodes = computed(() => rule.value?.data?.description ?? [])

const title = computed(() => t('page.rules.seo.title'))
const description = computed(() => t('page.rules.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>