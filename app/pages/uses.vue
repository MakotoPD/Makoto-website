<template>
	<div class="pt-36">
		<h2 class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-30 mb-8 md:mb-14 size-full -translate-y-6 md:-translate-y-10">
			<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-white/70">
				{{ t('page.uses.header.subtitle') }}
			</p>
			<i18n-t 
				keypath="page.uses.header.heading" 
				tag="span" 
				class="serif"
				scope="global"
			>
				<template #highlighted>
					<span class="px-2 tracking-tight italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent">
						{{ t('page.uses.header.highlightedWord') }}
					</span>
				</template>
			</i18n-t>
		</h2>
		<div class="px-4 xl:px-0 mt-12 w-full max-w-5xl mx-auto flex flex-col items-center">
			<NuxtImg src="/imgs/uses/macbook-air.jpg" lazy class="w-5xl rounded-3xl outline-offset-3 outline-2 outline-sky-500 shadow-2xl"  />
			<p class="mt-4 serif text-2xl"> MacBook Air M1 <span class="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">Space Grey</span></p>
			
			<div class="w-full mt-24">
				<h2 class="text-3xl">{{t('page.uses.soft')}}</h2>

				<div class="mt-8 flex flex-wrap justify-center gap-8">
					
					<div 
						v-for="it in soft"	
						class="flex flex-col items-center group"
						>
						<div class="bg-gradient-to-b from-gray-700/30 to-gray-900/20 border border-gray-600 outline-offset-3 outline-1 outline-gray-500/30 w-24 h-24 rounded-2xl flex items-center justify-center mb-2 group-hover:outline-sky-600 group-hover:outline-offset-4 group-hover:outline-2 group-hover:-translate-y-1/6 duration-300">
							<UIcon :name="it.icon" class="size-12" :class="it?.color" />
						</div>
						<p class="text-gray-400 group-hover:text-gray-200">{{ it.name }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lant="ts">
	const { t } = useI18n()

const title = computed(() => t('page.uses.seo.title'))
const description = computed(() => t('page.uses.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})


	const soft = [
		{ name: "Visual Studio Code", icon: "i-devicon-vscode"},
		{ name: "Notion", icon: "i-devicon-notion"},
		{ name: "Brave browser", icon: "i-logos-brave"},
		{ name: "Figma", icon: "i-devicon-figma"},
		{ name: "Photoshop", icon: "i-devicon-photoshop"},
		{ name: "Illustrator", icon: "i-devicon-illustrator"},
		{ name: "Obsidian", icon: "i-logos-obsidian-icon"},
		{ name: "Tidal", icon: "i-logos-tidal-icon"},
		{ name: "Discord", icon: "i-logos-discord-icon"},
		{ name: "Slack", icon: "i-logos-slack-icon"},
		{ name: "Asana", icon: "i-logos-asana-icon"},
		{ name: "Thunderbird", icon: "i-simple-icons-thunderbird", color: 'text-blue-400'},
		{ name: "Bitwarden", icon: "i-simple-icons-bitwarden", color: 'text-sky-600'},
		{ name: "2FAS", icon: "i-simple-icons-2fas", color: 'text-red-500'},
		{ name: "Perplexity", icon: "i-logos-perplexity-icon"},
	]
</script>