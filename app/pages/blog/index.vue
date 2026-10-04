<script setup lang="ts">
import { contentPath, type PublicEntry } from '#shared/content'

const { locale, t } = useI18n()
const { data: articles, error } = await useAsyncData(
  () => `articles-${locale.value}`,
  () => $fetch<PublicEntry[]>('/api/content/article', { query: { locale: locale.value } }),
  { watch: [locale] }
)
if (error.value) throw createError({ statusCode: error.value.statusCode || 500, statusMessage: error.value.statusMessage || 'Content unavailable' })
const { data: authors } = await useAsyncData(() => `blog-authors-${locale.value}`, () => $fetch<PublicEntry[]>('/api/content/author', { query: { locale: locale.value } }), { watch: [locale] })
const { data: categories } = await useAsyncData(() => `blog-categories-${locale.value}`, () => $fetch<PublicEntry[]>('/api/content/category', { query: { locale: locale.value } }), { watch: [locale] })
const authorFor = (article: PublicEntry) => authors.value?.find(item => item.translationGroup === article.data.authorSource)
const categoriesFor = (article: PublicEntry) => categories.value?.filter(item => (article.data.categorySources as string[] || []).includes(item.translationGroup)) || []
const coverFor = (article: PublicEntry) => article.data.cover as { url?: string; alternativeText?: string } | undefined
useStaticPageSeo('blog')
</script>

<template>
  <div class="pt-44 pb-24 text-black dark:text-white">
    <h1 class="bg-linear-to-b from-zinc-700 via-zinc-800 to-zinc-50 bg-clip-text pb-2 text-center text-6xl italic text-transparent dark:via-zinc-200">{{ t('page.blog.hero.title') }}</h1>
    <p class="serif text-center text-4xl text-zinc-400">{{ t('page.blog.hero.description') }}</p>
    <div class="mx-auto mt-24 w-full max-w-5xl px-5 sm:px-12">
      <UPageGrid v-if="articles?.length">
        <UPageCard v-for="article in articles" :key="article.id" :title="article.title" :description="article.summary" orientation="vertical" spotlight variant="subtle" spotlight-color="primary" :to="contentPath(article)">
          <img v-if="coverFor(article)?.url" :src="coverFor(article)?.url" :alt="coverFor(article)?.alternativeText || article.title" width="800" height="450" loading="lazy" decoding="async" class="h-36 w-full rounded-lg border border-neutral-500/50 object-cover">
          <UUser :name="authorFor(article)?.title || 'Patryk Dąbrowski'" :avatar="{ src: '/imgs/smallAvatar.jpg', icon: 'i-mkt-image' }" size="xs" />
          <template #footer>
            <div class="flex flex-wrap gap-1">
              <UBadge v-for="category in categoriesFor(article)" :key="category.id" variant="soft" color="primary" size="md" class="text-black dark:text-white">{{ category.title }}</UBadge>
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
      <p v-else class="py-16 text-center text-zinc-500">{{ locale === 'pl' ? 'Artykuły pojawią się po publikacji.' : 'Articles will appear after publication.' }}</p>
    </div>
  </div>
</template>
