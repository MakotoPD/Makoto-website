<template>
	<div class="pt-36">
		<h2 class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-30 mb-8 md:mb-14 size-full -translate-y-6 md:-translate-y-10">
			<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-white/70">
				{{ t('page.faq.header.subtitle') }}
			</p>
			<i18n-t 
				keypath="page.faq.header.heading" 
				tag="span" 
				class="serif"
				scope="global"
			>
				<template #highlighted>
					<span class="px-2 tracking-tight italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent">
						{{ t('page.faq.header.highlightedWord') }}
					</span>
				</template>
			</i18n-t>
		</h2>
		<div class="px-4 xl:px-0 mt-12 w-full max-w-2xl mx-auto flex flex-col items-center">
				<div class="w-full" v-for="(section, i) in faq" :key="i">
					<div class="flex gap-4 items-center mb-2 mt-6">
						<UIcon :name="rt(section.icon)" class="size-9 text-sky-400"/>
						<h2 class="text-3xl serif">{{ rt(section.name) }}</h2>
					</div>
					
					<UAccordion :items="section.q">
						<template #="{item}">
							{{ rt(item.label) }}
						</template>
						<template #content="{item}">
							<p class="text-zinc-400">
								{{ rt(item.content) }}
							</p>
							
						</template>
					</UAccordion>
				</div>
		</div>
	</div>
</template>
<script setup lang="ts">
const { t, tm, rt } = useI18n({useScope: "local"})

const title = computed(() => t('page.faq.seo.title'))
const description = computed(() => t('page.faq.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})

const faq = computed(() => tm('page.faq.faq'))

</script>