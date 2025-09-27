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
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="pending">Loading…</div>
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="error">Error: {{ error }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { find } = useStrapi()
const { locale, t } = useI18n();
const config = useRuntimeConfig()


type AboutResponse = {
  data?: {
    title?: string
    blocks?: unknown[]
  }
}



const queryParams = computed(() => {
  return {
    // 1. Dynamiczny parametr języka (zmienia się)
    locale: locale.value,

    // 2. Statyczny, zagnieżdżony parametr populate (pozostaje taki sam)
    populate: {
      blocks: {
        populate: '*'
      }
    }
  }
})

const { data: about, pending, error, refresh } = await useAsyncData(
  'about',
  () => find('about', queryParams.value),
  {
    watch: [queryParams]
  }
)


const blockNodes = computed(() => about.value?.data?.blocks ?? [])
</script>