<template>
	<div>
		<section class="section sectionHero relative">
			<AppHero/>
			<div class="absolute w-full h-full top-0 right-0 -z-10">
				<ModelsMakotologo class="relative top-0 -z-1"/>
			</div>
		</section>
		<div class="container mx-auto">
			<section class="section w-full px-4">
				<AppGrid/>
			</section>
			<section class="section mt-8">
				<AppSkills/>
			</section>
		</div>
		<div class="my-36">
			<div class="h-44 pt-8  ">
				<div class="z-0 flex w-[102dvw] translate-y-10 rotate-6 bg-linear-to-r from-sky-800 via-sky-600 to-sky-800 py-4 opacity-60 md:rotate-3 lg:translate-y-16 lg:py-8">
				</div>
				<div class="z-2 flex w-[102dvw] -rotate-3 items-center justify-center overflow-hidden bg-linear-to-r from-sky-600 via-sky-500 to-sky-600 py-1.5 will-change-transform lg:py-4">
					<UiTextScroller
						class="serif relative z-10"
						:items="scrollerItems"
						speed="15s"
						gap="1rem"
						separator="✦"
						:draggable="true"
					/>
				</div>
			</div>
		</div>
		<div class="container mx-auto">
			<section class="section">
				<AppProjects/>
			</section>
			<section class="section mt-64">
				<AppTrusted/>
			</section>
			<section class="section">
				<AppAbout />
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
const { t, tm, locale } = useI18n();

// Ta właściwość będzie automatycznie aktualizować się przy zmianie języka
// Używamy tm() tylko do pobrania długości tablicy, a każdy element renderujemy przez t(),
// aby zawsze otrzymać zwykłe stringi zamiast obiektów AST/kompilatora.
const scrollerItems = computed(() => {
  const raw = tm('page.home.scroller.items');
  const length = Array.isArray(raw) ? raw.length : 0;
  return Array.from({ length }, (_, i) => t(`page.home.scroller.items.${i}`));
});

const i18nHead = useLocaleHead({
  dir: true,
  lang: true
})
console.log(locale.value)

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
    // ... inne meta tagi
  ],
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
})

</script>

<style scoped>


</style>

