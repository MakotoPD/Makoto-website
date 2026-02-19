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

defineOptions({ inheritAttrs: false })

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


// SEO - Computed values for reactivity
const pageTitle = computed(() => 
	article.value?.title ? `${article.value.title} | Makoto Blog` : 'Blog | Makoto'
)

const pageDescription = computed(() => 
	article.value?.description || 'Artykuł na blogu Makoto'
)

const coverImageUrl = computed(() => 
	article.value?.cover ? `${config.public.apiUrl}${article.value.cover.url}` : `${config.public.siteUrl}/og-default.jpg`
)

const canonicalUrl = computed(() => 
	`${config.public.siteUrl}/blog/${slug.value}`
)

const publishedTime = computed(() => 
	article.value?.publishedAt ? new Date(article.value.publishedAt).toISOString() : undefined
)

const updatedTime = computed(() => 
	article.value?.updatedAt ? new Date(article.value.updatedAt).toISOString() : undefined
)

const authorName = computed(() => 
	article.value?.author?.name || 'Makoto'
)

const categoryName = computed(() => 
	article.value?.categories?.[0]?.name || 'Blog'
)

// OpenGraph & Twitter meta tags
useSeoMeta({
	title: pageTitle,
	description: pageDescription,
	
	// OpenGraph
	ogType: 'article',
	ogTitle: pageTitle,
	ogDescription: pageDescription,
	ogImage: coverImageUrl,
	ogImageAlt: () => article.value?.title || 'Makoto Blog',
	ogUrl: canonicalUrl,
	ogSiteName: 'Makoto',
	ogLocale: () => locale.value === 'pl' ? 'pl_PL' : 'en_US',
	
	// Article-specific OpenGraph
	articlePublishedTime: publishedTime,
	articleModifiedTime: updatedTime,
	articleAuthor: authorName,
	articleSection: categoryName,
	
	// Twitter Cards
	twitterCard: 'summary_large_image',
	twitterTitle: pageTitle,
	twitterDescription: pageDescription,
	twitterImage: coverImageUrl,
	twitterImageAlt: () => article.value?.title || 'Makoto Blog',
})

// Canonical URL & hreflang alternates
useHead({
	link: computed(() => {
		const links: Array<{ rel: string; href: string; hreflang?: string }> = [
			{ rel: 'canonical', href: canonicalUrl.value }
		]
		
		// Add hreflang for current locale
		links.push({
			rel: 'alternate',
			hreflang: locale.value,
			href: canonicalUrl.value
		})
		
		// Add hreflang alternates for other locales
		if (article.value?.localizations) {
			for (const localization of article.value.localizations) {
				links.push({
					rel: 'alternate',
					hreflang: localization.locale,
					href: `${config.public.siteUrl}/${localization.locale}/blog/${localization.slug}`
				})
			}
		}
		
		// x-default for language selection
		links.push({
			rel: 'alternate',
			hreflang: 'x-default',
			href: `${config.public.siteUrl}/blog/${slug.value}`
		})
		
		return links
	}),
	
	// JSON-LD Structured Data
	script: computed(() => {
		if (!article.value) return []
		
		const jsonLd = {
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			'headline': article.value.title,
			'description': article.value.description || '',
			'image': coverImageUrl.value,
			'url': canonicalUrl.value,
			'datePublished': publishedTime.value,
			'dateModified': updatedTime.value || publishedTime.value,
			'author': {
				'@type': 'Person',
				'name': authorName.value
			},
			'publisher': {
				'@type': 'Organization',
				'name': 'Makoto',
				'logo': {
					'@type': 'ImageObject',
					'url': `${config.public.siteUrl}/logo.png`
				}
			},
			'mainEntityOfPage': {
				'@type': 'WebPage',
				'@id': canonicalUrl.value
			},
			'articleSection': categoryName.value,
			'inLanguage': locale.value === 'pl' ? 'pl-PL' : 'en-US'
		}
		
		return [{
			type: 'application/ld+json',
			innerHTML: JSON.stringify(jsonLd)
		}]
	})
})

// 404 jeśli artykuł nie istnieje
if (!pending.value && !article.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Artykuł nie został znaleziony'
	})
}
</script>

