<template>
	<div class="pt-44" v-if="about?.data">
		<h1 class="text-6xl text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-800 dark:via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ about.data.title }}
		</h1>
		
    <div class="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 pb-12 lg:size-full lg:flex-row lg:justify-between">
        <div class="max-w-[95%] md:max-w-[60%]">
            <h2 style="text-shadow:0px 4px 8px rgba(255,255,255,.05),0px 8px 30px rgba(255,255,255,.25)"
                class="relative z-2 font-medium tracking-tight md:mb-36 md:text-6xl text-center lg:text-left !mb-8 text-3xl sm:text-4xl text-balance md:mt-28">
                
                <p class="mb-3 text-xs font-normal tracking-widest text-black/80 uppercase md:text-sm dark:text-white/70">
                    {{ about.data.subTitle }}
                </p>

                <i18n-t keypath="page.about.heading" tag="span" class="serif text-black dark:text-white" scope="global">
                    <template #highlighted>
                        <span class="italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent serif pe-2 tracking-tight">
                            {{ $t('page.about.highlightedWord') }}
                        </span>
                    </template>
                </i18n-t>
            </h2>

            <div class="relative z-5 mx-auto flex max-w-xl flex-col gap-y-8 text-center text-base font-light tracking-wider text-black/80 lg:mx-0 lg:max-w-[550px] lg:text-left lg:text-lg dark:text-neutral-300">
                
                <StrapiBlocks :blocks="blockNodes" />

                <div class="flex gap-3 mx-auto -mt-4 w-fit lg:mx-0">
                  <ClientOnly>
                    <LazyNuxtLink v-for="link in about.data.links" :to="link.link" target="_blank" class="group flex items-center gap-1">
                        <UIcon :name="link.icon" />
                        <span class="max-w-0 group-hover:max-w-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            {{ link.name }}
                        </span>
                    </LazyNuxtLink>
                  </ClientOnly>
                </div>
            </div>
        </div>
        <div class="relative grid aspect-square w-92 place-content-center lg:me-10 lg:mt-20 lg:w-[500px]">
            <NuxtImg loading="lazy" src="/imgs/avatar-square.webp" alt="Makoto Picture" class="w-full h-full object-contain rounded-4xl rotate-3 drop-shadow-[0_8px_20px_rgb(76_179_202_/_0.5)] hover:scale-105 hover:-rotate-1 duration-300" />
        </div>
    </div>
		<div class="w-full max-w-5xl mx-auto px-12 mt-24">
			<h2 class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-30 mb-8 md:mb-12 size-full -translate-y-6 md:-translate-y-10">
          <p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-black/70 dark:text-white/70">{{ $t('page.about.work.subtitle') }}</p>
          <span class="serif">
            <i18n-t keypath="page.about.work.heading" tag="span" class="serif text-black dark:text-white" scope="global">
                <template #highlighted>
                    <span class="italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent serif pe-2 tracking-tight">
                        {{ $t('page.about.work.highlighted') }}
                    </span>
                </template>
            </i18n-t>
          </span>
      </h2>
      <div v-if="work?.data">
          <AppTimeline 
            v-if="work"
            :key="`timeline-${locale}`"
            :data="work.data" 
            color="#10A0B9FF" 
          />
      </div>
      <div v-else-if="workPending">
        Loading…
      </div>
      <div v-else-if="workError">
        Error: {{ workError }}
      </div>
		</div>
	</div>
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="pending">Loading…</div>
	<div class="pt-44 mx-auto max-w-5xl" v-else-if="error">Error: {{ error }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { find } = useStrapi()
const { locale, t } = useI18n();


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

const { data: about, pending, error, refresh } = useAsyncData(
  () => `about-${locale.value}`,
  () => find('about', queryParams.value),
  {
    watch: [() => locale.value]
  }
)


const { data: work, pending: workPending, error: workError, refresh: workRefresh } = useAsyncData(
  `works-${locale.value}`,
  () => find('works', { locale: locale.value, sort: 'from:asc'}),
  {
    watch: [locale]
  }
)

const blockNodes = computed(() => about.value?.data?.blocks ?? [])



const title = computed(() => t('page.about.seo.title'))
const description = computed(() => t('page.about.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>