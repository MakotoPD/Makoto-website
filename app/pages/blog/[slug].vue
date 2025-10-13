<template>
	<div class="">
		<div v-if="pending" class="w-full max-w-4xl mx-auto px-12">Ładowanie...</div>
		<div v-else-if="error">Błąd: {{ error }}</div>
		<div v-else-if="article">
			<div class="h-72 md:h-[35rem] w-full mask-y-from-60% mask-y-to-99%">
				<NuxtImg 
					v-if="article.cover"
					provider="strapi"
					:src="article.cover.url" 
					:alt="article.title" 
					class="imagemask w-full h-72 md:h-[35rem] object-cover"  
				/>
			</div>

			<article class="relative -mt-16 w-full max-w-4xl mx-auto px-12 !z-50">

				<h1 class="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">{{ article.title }}</h1>
				
				<div class="flex items-center gap-4 mb-8">
					<UUser
						v-if="article.author"
						:name="article.author.name"
						:avatar="{
							src: config.public.apiUrl + article.author.avatar.url,
							icon: 'i-lucide-image'
						}"
						size="sm"
						:description="new Date(article.publishedAt).toLocaleDateString(locale)"
					/>
				</div>
				
				<div v-if="article.categories" class="flex flex-wrap gap-2 mb-8">
					<UBadge 
						v-for="category in article.categories" 
						:key="category.id" 
						variant="soft" 
						color="primary" 
						size="md" 
						class="text-black dark:text-white"
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

.dark .coverimage{
	-webkit-mask-image: -webkit-gradient(linear, left 0%, left bottom, from(rgb(255, 255, 255)), to(rgba(255, 255, 255, 0)))
}


.imagemask {
	-webkit-mask-image: radial-gradient(circle, #0000 50%, #000 0);
    mask-image: radial-gradient(circle, #0000 50%, #000 0);
    -webkit-mask-position: 50%;
    mask-position: 50%;
    -webkit-mask-size: 4px 4px;
    mask-size: 4px 4px;
    position: relative;
    transition: -webkit-mask-size .3s, mask-size .3s;
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

