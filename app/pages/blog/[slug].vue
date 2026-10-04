<script setup lang="ts">
import type { PublicEntry } from '#shared/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => String(route.params.slug || ''))
const { data: article, error } = await useAsyncData(
  () => `article-${locale.value}-${slug.value}`,
  () => $fetch<PublicEntry>('/api/content/article', { query: { locale: locale.value, slug: slug.value } }),
  { watch: [slug, locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Article unavailable' })
if (!article.value) throw createError({ statusCode: 404 })

const { data: authors } = await useAsyncData(() => `blog-authors-${locale.value}`, () => $fetch<PublicEntry[]>('/api/content/author', { query: { locale: locale.value } }), { watch: [locale] })
const { data: categories } = await useAsyncData(() => `blog-categories-${locale.value}`, () => $fetch<PublicEntry[]>('/api/content/category', { query: { locale: locale.value } }), { watch: [locale] })
const author = computed(() => authors.value?.find(item => item.translationGroup === article.value?.data.authorSource))
const articleCategories = computed(() => categories.value?.filter(item => (article.value?.data.categorySources as string[] || []).includes(item.translationGroup)) || [])
const cover = computed(() => article.value?.data.cover as { url?: string; alternativeText?: string } | undefined)

const setParams = useSetI18nParams()
watch(() => article.value?.translations, translations => {
  if (translations) setParams(Object.fromEntries(translations.map(item => [item.locale, { slug: item.slug }])))
}, { immediate: true })
useEntrySeo(article, author)
</script>

<template>
  <div v-if="article" class="pb-24 text-black dark:text-white">
    <div v-if="cover?.url" class="h-72 w-full mask-y-from-60% mask-y-to-99% md:h-[35rem]">
      <img v-if="cover?.url" :src="cover.url" :alt="cover.alternativeText || article.title" width="1600" height="900" fetchpriority="high" class="imagemask h-72 w-full object-cover md:h-[35rem]">
    </div>
    <article class="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-12" :class="cover?.url ? '-mt-16' : 'pt-44'">
      <h1 class="mb-4 text-4xl font-bold leading-tight md:text-5xl">{{ article.title }}</h1>
      <div class="mb-8 flex items-center gap-4">
        <UUser :name="author?.title || 'Patryk Dąbrowski'" :avatar="{ src: '/imgs/smallAvatar.jpg', icon: 'i-mkt-image' }" size="sm" :description="article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale) : undefined" />
      </div>
      <div v-if="articleCategories.length" class="mb-8 flex flex-wrap gap-2">
        <UBadge v-for="category in articleCategories" :key="category.id" variant="soft" color="primary" size="md" class="text-black dark:text-white">{{ category.title }}</UBadge>
      </div>
      <ContentDocument :document="article.body" />
    </article>
  </div>
</template>

<style scoped>
.imagemask {
  -webkit-mask-image: radial-gradient(circle, #0000 50%, #000 0);
  mask-image: radial-gradient(circle, #0000 50%, #000 0);
  -webkit-mask-position: 50%;
  mask-position: 50%;
  -webkit-mask-size: 4px 4px;
  mask-size: 4px 4px;
}
</style>
