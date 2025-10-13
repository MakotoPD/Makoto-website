<template>
	<div class="pt-24">
		<h2 class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-40 mb-8 md:mb-14 size-full -translate-y-6 md:-translate-y-10">
			<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-black/70 dark:text-white/70">
				{{ $t('page.home.trusted.subtitle') }}
			</p>
			<i18n-t 
				keypath="page.home.trusted.mainSentence" 
				tag="span" 
				class="serif text-black dark:text-white"
				scope="global"
			>
				<template #highlighted>
					<span class="px-2 tracking-tight italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent">
						{{ $t('page.home.trusted.highlightedWord') }}
					</span>
				</template>
			</i18n-t>
		</h2>

		<div>
			<UMarquee>
				<img v-for="img in clientLogos" class="w-44 h-auto grayscale-100 hover:grayscale-0" :src="img.src" :alt="img.alt">
			</UMarquee>
			<!-- <AppTrustedBy :speed="20" :logos="clientLogos" /> -->
		</div>
	</div>
</template>
<script setup lang="ts">

const clientLogos = ref([
  	{ src: '/trusted/8bitjelly.png', alt: '8bitjelly' },
  	{ src: '/trusted/radec.png', alt: 'Radec24' },
  	{ src: '/trusted/yc.png', alt: 'YesCandles' },
  	{ src: '/trusted/techtokpl.png', alt: 'techtok' },
	{ src: '/trusted/rywal-rhc.png', alt: 'rywal-rhc' },
	{ src: '/trusted/samvolvo.svg', alt: 'samvolvo' },
	{ src: '/trusted/webstrong.png', alt: 'webstrong' },
]);

</script>