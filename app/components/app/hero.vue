<template>
	<div class="z-10 relative h-screen w-screen flex justify-center items-center">

		<div class="relative z-50 text-slate-900 dark:text-white text-xl">
			<h1 class="serif text-5xl md:text-6xl text-center leading-18 text-shadow-lg/30 text-shadow-black dark:text-shadow-white max-w-2xl">
				<i18n-t keypath="page.home.hero.title" scope="global">
				<template #highlightedText>
          <br/>
					<span class="italic bg-gradient-to-b bg-linear-to-b from-zinc-300 via-zinc-800 to-zinc-900 dark:from-zinc-700 dark:via-zinc-200 dark:to-zinc-50 bg-clip-text text-transparent">
					{{ $t('page.home.hero.titleHighlight') }}
					</span>
				</template>
				</i18n-t>
			</h1>

			<div class="serif relative">
				<h2 class="flex flex-col sm:flex-row gap-2 justify-center items-center text-md md:text-2xl">
					<span class="font-semibold text-center bg-gradient-to-b bg-linear-to-b from-zinc-300 via-zinc-800 to-zinc-900 dark:from-zinc-700 dark:via-zinc-200 dark:to-zinc-50 bg-clip-text text-transparent">
						{{ $t('page.home.hero.greeting') }}
					</span>

					<div class="group relative">
						<div class="rounded-full overflow-hidden">
						<NuxtImg src="/imgs/smallAvatar.jpg" title="Makoto image" alt="profile picture" height="36" loading="eager" class="group-hover:scale-110 group-hover:-rotate-12 duration-300" />
						</div>
						<div class="hidden group-hover:block group-hover:animate-bounce absolute -left-3 -bottom-3">
						👋
						</div>
					</div>

					<span class="font-semibold text-center bg-gradient-to-b bg-linear-to-b from-zinc-300 via-zinc-800 to-zinc-900 dark:from-zinc-700 dark:via-zinc-200 dark:to-zinc-50 bg-clip-text text-transparent">
						{{ $t('page.home.hero.role') }}
					</span>
				</h2>

				<NuxtImg src="/bg/elipse.png" aria-hidden="true" alt="glow in background" class="absolute -z-10 opacity-75 w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
			</div>

			<div class="flex justify-center mt-8">
				<UButton
					@click="(e) => copyEmail(e, { title: t('page.home.hero.notification.title'), description: t('page.home.hero.notification.desc'), btnLabel: t('page.home.hero.notification.btn') })"
					icon="i-solar-copy-line-duotone"
					variant="soft"
					size="xl"
					tabindex="0"
					class="z-[50] bg-sky-500/20 border border-sky-400/80 text-white/80 rounded-xl px-3 py-1.5 hover:bg-sky-500/40 active:bg-sky-500/20 backdrop-blur-lg"
				>
					contact@makoto.com.pl
				</UButton>
			</div>
		</div>



	</div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { copyEmail } = useCopyEmail()
</script>
