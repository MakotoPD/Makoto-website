<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-7 md:grid-rows-4 lg:grid-rows-3 gap-4">
		<div 
			class="realtive overflow-hidden [box-shadow:0_-20px_80px_-20px_#0000001F_inset] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] relative row-start-2 row-span-2 md:col-start-2 md:row-start-1 md:row-span-2 lg:col-start-1 lg:row-start-1 bg-zinc-100/60 dark:bg-zinc-900/40 border border-gray-300/40 dark:border-gray-800/60 rounded-xl hover:bg-zinc-300/60 dark:hover:bg-zinc-900/60 duration-300"
		>
			<div class="w-full text-center py-8 px-8 font-semibold">
				<h3 class="flex flex-col">
					<span class="serif text-3xl tracking-wide bg-gradient-to-t from-primary to-sky-900 dark:to-white bg-clip-text text-transparent">
						{{ t('page.home.grid.tech.line1') }}
					</span>
					<span class="serif text-3xl tracking-wide bg-gradient-to-t from-primary to-sky-900 dark:to-white bg-clip-text text-transparent">
						{{ t('page.home.grid.tech.line2') }}
					</span>
				</h3>

			</div>
			
			<div>
				<UiCarousel/>
			</div>

			<div class="absolute inset-0 -z-10 h-full">
				<UiRipple animationType="expand" :numCircles="8" :spawnInterval="1000" :animationDuration="8000" :startSize="200" color="rgba(96, 165, 250, 0.4)" />
			</div>

		</div>
		<div 
			class="relative group overflow-hidden [box-shadow:0_-20px_80px_-20px_#0000001F_inset] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] row-start-1 lg:col-span-2 lg:col-start-2 lg:row-start-1 bg-zinc-100/60 dark:bg-zinc-900/40 border border-gray-300/40 dark:border-gray-800/60 rounded-xl hover:bg-zinc-300/60 dark:hover:bg-zinc-900/60 duration-300"
		>
			<div class="absolute inset-0 -z-10">
				<UiGridpattern 
					:grid-size="50"
					:highlight-size="0"
					:lineColor="$colorMode.value === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'"
				/>
			</div>
			<div class="absolute z-10 left-0 bottom-0 pl-6 pb-0 group-hover:pb-6 duration-300">
				<UIcon name="i-mkt-window-frame-line-duotone" class="size-10 text-slate-600/60 dark:text-slate-400/40 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:size-8 duration-300" />
				<h3 class="serif text-3xl text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white duration-300">{{ t('page.home.grid.saas.heading') }}</h3>
				<p class="serif text-md text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 duration-300">{{ t('page.home.grid.saas.desc') }}</p>
			</div>
			<NuxtImg src="/imgs/SnippetSAAS.webp" alt="Sample of code block" class="opacity-50 absolute -bottom-12 -right-8 h-64 -z-10 group-hover:h-72 group-hover:-right-3 group-hover:-bottom-8 group-hover:opacity-95 duration-300" />
		</div>
		<div 
			class="relative overflow-hidden [box-shadow:0_-20px_80px_-20px_#0000001F_inset] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] col-start-1 row-span-2 row-start-4 lg:col-start-3 md:row-start-2 bg-zinc-100/60 dark:bg-zinc-900/40 border border-gray-300/40 dark:border-gray-800/60 rounded-xl hover:bg-zinc-300/60 dark:hover:bg-zinc-900/60 duration-300"
		>
			<span
				class="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
			>
				<div class="w-full text-center py-8 px-8 font-semibold">
					<h3 class="flex flex-col">
						<span class="serif text-3xl tracking-wide bg-gradient-to-t from-primary to-sky-800 dark:to-white bg-clip-text text-transparent">
							{{ t('page.home.grid.globe.line1') }}
						</span>
						<span class="serif text-3xl tracking-wide bg-gradient-to-t from-primary to-sky-800 dark:to-white bg-clip-text text-transparent">
							{{ t('page.home.grid.globe.line2') }}
						</span>
					</h3>

				</div>
				
			</span>
			
			<ClientOnly>
				<div class="absolute bottom-0 translate-y-1">
					<UiGlobe/>
				</div>
				<template #fallback>
					<div class="absolute bottom-0">
						<!-- Globe placeholder during SSR -->
					</div>
				</template>
			</ClientOnly>
		</div>
		<div 
			class="relative group overflow-hidden [box-shadow:0_-20px_80px_-20px_#0000001F_inset] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] row-start-7 md:col-span-2 md:col-start-1 md:row-start-4 lg:row-start-3 bg-zinc-100/60 dark:bg-zinc-900/40 border border-gray-300/40 dark:border-gray-800/60 rounded-xl hover:bg-zinc-300/60 dark:hover:bg-zinc-900/60 duration-300"
		>
			<div class="absolute inset-0 -z-10">
				<UiGridpattern 
					:grid-size="50"
					:highlight-size="0"
					:lineColor="$colorMode.value === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'"
				/>
			</div>

			<div class="left-2/12 -z-10 relative w-11/12 md:w-8/12 rounded-lg p-8 h-5/6 group-hover:w-10/12 group-hover:left-1/12 duration-300 overflow-hidden">

				<div ref="centerRef" class="absolute top-1/2 right-2 transform -translate-x-1/2 -translate-y-1/2 z-40">
					<div class="h-16 w-16 group-hover:h-20 group-hover:w-20 duration-300 rounded-full border-2 border-zinc-500 bg-zinc-800 flex items-center justify-center shadow-lg">
						<NuxtImg src="/imgs/smallAvatar.jpg" title="Makoto" alt="Profile picture" height="128" class="h-full object-cover rounded-full" />
					</div>
				</div>

				<div ref="clientRef" class="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-zinc-600 bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center shadow-md">
					<UIcon name="i-mkt-user-hand-up-bold-duotone" class="size-6" />
				</div>

				<UiAnimatedBeam :fromRef="centerRef" :toRef="clientRef" :duration="2" :delay="2" :curvature="30" :path-width="2" :beam-length="40" :path-color="$colorMode.value === 'dark' ? '#e8f0fe' : '#2C2E31FF'" gradient-start-color="#42DFF4FF" gradient-stop-color="#A71AE8FF" />
				<UiAnimatedBeam :fromRef="clientRef" :toRef="centerRef" :duration="2" :delay="0" :curvature="-30" :path-width="2" :beam-length="40" :path-color="$colorMode.value === 'dark' ? '#e8f0fe' : '#2C2E31FF'" gradient-start-color="#F4E842FF" gradient-stop-color="#1a73e8" />
			</div>

			<div class="absolute z-10 left-0 bottom-0 pl-6 pb-0 group-hover:pb-6 duration-300">
				<UIcon name="i-mkt-course-up-bold-duotone" class="size-10 text-slate-600/60 dark:text-slate-400/40 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:size-8 duration-300" />
				<h3 class="serif text-3xl text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white duration-300">{{ t('page.home.grid.communication.heading') }}</h3>
				<p class="serif text-md text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 duration-300">{{ t('page.home.grid.communication.desc') }}</p>
			</div>
		</div>
		<div 
			class="relative overflow-hidden [box-shadow:0_-20px_80px_-20px_#0000001F_inset] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] row-start-6 md:col-start-2 md:row-start-3 lg:row-start-2 bg-zinc-100/60 dark:bg-zinc-900/40 border border-gray-300/40 dark:border-gray-800/60 rounded-xl hover:bg-zinc-300/60 dark:hover:bg-zinc-900/60 duration-300"
		>
			<UiRipple :numCircles="6" animationType="breathe" :startSize="200" :sizeIncrement="60" :startOpacity="0.1" :color="$colorMode.value === 'dark' ? 'rgba(147, 197, 253, 0.2)' : 'rgba(147, 197, 253, 0.8)'" />
			
			<div class="flex flex-col justify-center items-center my-6">
				<NuxtImg src="/favicon.png" alt="Makoto Logo" class="drop-shadow-xl drop-shadow-cyan-500/30"/>
				<h3 class="serif text-3xl text-shadow-lg/30 text-black dark:text-white text-shadow-black/30 dark:text-shadow-white font-semibold text-center">
					{{ t('page.home.grid.question.line1') }} <br/> {{ t('page.home.grid.question.line2') }}
				</h3> 
				<UButton @click="(e) => copyEmail(e, { title: t('page.home.grid.notification.title'), description: t('page.home.grid.notification.desc'), btnLabel: t('page.home.grid.notification.btn') })" icon="i-mkt-copy-line-duotone" variant="soft" size="xl" tabindex="0" class="z-[50] mt-4 bg-sky-500/20 border border-sky-400/80 text-black/80 dark:text-white/80 rounded-lg px-5 py-3 hover:bg-sky-500/40  active:bg-sky-500/20">
					contact@makoto.com.pl
				</UButton>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
const { t } = useI18n()
const { copyEmail } = useCopyEmail()

// Refs for animated beams hub
const centerRef = ref<HTMLElement | null>(null)
const clientRef = ref<HTMLElement | null>(null)
</script>
