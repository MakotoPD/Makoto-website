<template>
	<div>
		<AppHeader class="fixed z-100 top-0 left-0" />
		<div>
			<slot />
		</div>
		<div>
			<AppFooter />
		</div>
	</div>
</template>

<script lang="ts" setup>
const { t, locale } = useI18n();

const i18nHead = useLocaleHead({
  dir: true,
  lang: true
})

useHead({
  title: t('page.home.seo.title'),
  htmlAttrs: {
    lang: locale.value,
	  dir: i18nHead.value.htmlAttrs.dir
  },
  meta: [
    { name: 'description', content: t('page.home.seo.description') },
    // Open Graph
    { property: 'og:title', content: t('page.home.seo.title') },
    { property: 'og:description', content: t('page.home.seo.description') },
    ...(i18nHead.value.meta || [])
  ],
  link: [...(i18nHead.value.link || [])],
})

</script>