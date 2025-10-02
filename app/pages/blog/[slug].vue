<template>
	<div class="pt-44">
		<div v-if="pending" class="w-full max-w-4xl mx-auto px-12">Ładowanie...</div>
		<div v-else-if="error">Błąd: {{ error }}</div>
		<div v-else-if="article">
			<div>
				<img 
					v-if="article.cover"
					:src="config.public.apiUrl + article.cover.url" 
					:alt="article.title" 
					class="mask-y-from-40% mask-y-to-99% w-full h-[35rem] object-cover absolute top-0 left-0 -z-10"  
				/>
			</div>

			<article class="mt-[20rem] w-full max-w-4xl mx-auto px-12">

				<h1 class="text-5xl font-bold mb-4">{{ article.title }}</h1>
				
				<div class="flex items-center gap-4 mb-8">
					<UUser
						v-if="article.author"
						:name="article.author.name"
						:avatar="{
							src: config.public.apiUrl + article.author.avatar.url,
							icon: 'i-lucide-image'
						}"
						size="sm"
					/>
					<time class="text-zinc-400">
						{{ new Date(article.publishedAt).toLocaleDateString(locale) }}
					</time>
				</div>
				
				<div v-if="article.categories" class="flex flex-wrap gap-2 mb-8">
					<UBadge 
						v-for="category in article.categories" 
						:key="category.id" 
						variant="soft" 
						color="primary" 
						size="md" 
						:icon="getCategoryIcon(category.slug)"
					>
						{{ category.name }}
					</UBadge>
				</div>
								
				<div>
					<StrapiBlocks :blocks="blockNodes" />
				</div>
			</article>
		</div>
	</div>
</template>

<style>
.coverimage{
	-webkit-mask-image: -webkit-gradient(linear, left 0%, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))
}

</style>

<script setup lang="ts">
import type { Article } from '~/types/article'
import { getCategoryIcon } from '~/types/article'

const { locale } = useI18n()
const { findOne, find } = useStrapi()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const switchLocalePath = useSwitchLocalePath()

const slug = computed(() => route.params.slug as string)

// Query params z populacją wszystkich lokalizacji
const queryParams = computed(() => ({
	locale: locale.value,
	populate: {
		cover: { populate: '*' },
		author: { populate: '*' },
		blocks: { populate: '*' },
		categories: { populate: '*' },
		localizations: { 
			fields: ['slug', 'locale']
		}
	}
}))

// Pobierz artykuł
const { data: articleData, pending, error } = await useAsyncData(
	`article-${slug.value}-${locale.value}`,
	async () => {
		try {
			// Najpierw spróbuj znaleźć po slug
			const response = await find<{ data: Article[] }>('articles', {
				...queryParams.value,
				filters: {
					slug: { $eq: slug.value }
				}
			})
			
			if (response?.data && response.data.length > 0) {
				return response.data[0]
			}
			
			return null
		} catch (e) {
			console.error('Error fetching article:', e)
			return null
		}
	},
	{
		watch: [locale]
	}
)


const blockNodes = computed(() => articleData.value?.blocks ?? [])
const article = computed(() => articleData.value)


// SEO
useSeoMeta({
	title: `Makoto - ${article.value?.title}` || 'Blog',
	description: article.value?.description || '',
	ogTitle: `Makoto - ${article.value?.title}` || 'Blog',
	ogDescription: article.value?.description || '',
	ogImage: article.value?.cover ? config.public.apiUrl + article.value.cover.url : ''
})

// 404 jeśli artykuł nie istnieje
if (!pending.value && !article.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Artykuł nie został znaleziony'
	})
}
</script>

