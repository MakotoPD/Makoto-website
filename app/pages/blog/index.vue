<template>
	<div class="pt-44">
		<h1 class="text-6xl pb-2 text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ t('page.blog.hero.title') }}
		</h1>
		<h2 class="serif text-4xl text-center text-zinc-400">
			{{ t('page.blog.hero.description') }}
		</h2>
		<div class="w-full max-w-5xl mx-auto px-12 mt-24">
			<div v-if="pending" class="text-center">
				Loading...
			</div>
			<UPageGrid v-if="articles?.data">
				<UPageCard
					v-for="article in articles.data"
					:key="article.id"
					:title="article.title"
					:description="article.description"
					orientation="vertical"
					spotlight
					variant="subtle"
					spotlight-color="primary"
					:to="localePath(`/blog/${article.slug}`)"
				>
					<img :src="config.public.apiUrl + article.cover.url" alt="Tailwind CSS" class="w-full h-36 object-cover rounded-lg border border-neutral-500/25"  />
					<template #footer>
						<div class="flex flex-wrap gap-1">
							<UBadge v-for="category in article.categories" :key="category.id" variant="soft" color="primary" size="md" :icon="getCategoryIcon(category.slug)" >{{ category.name }}</UBadge>
						</div>
					</template>

					<div>
						<UUser
							:name="article.author.name"
							:avatar="{
								src: config.public.apiUrl + article.author.avatar.url,
								icon: 'i-lucide-image'
							}"
							size="xs"
						/>
					</div>
				</UPageCard>
			</UPageGrid>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ArticlesResponse, Article } from '~/types/article'
import { getCategoryIcon } from '~/types/article'

const { t, locale } = useI18n()
const { find } = useStrapi()
const config = useRuntimeConfig()

const localePath = useLocalePath()


const queryParams = computed(() => {
  return {
    locale: locale.value,
    populate: {
      cover: {
        populate: '*'
      },
      author: {
        populate: '*'
      },
      categories: {
        populate: '*'
      }
    }
  }
})

const { data: articles, pending, error, refresh } = useAsyncData<ArticlesResponse>(
  () => `articles-${locale.value}`,
  () => find<ArticlesResponse>('articles', queryParams.value),
  {
    watch: [() => locale.value]
  }
)



const title = computed(() => t('page.blog.seo.title'))
const description = computed(() => t('page.blog.seo.description'))

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>