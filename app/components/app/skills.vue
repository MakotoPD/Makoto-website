<template>
	<div>
		<div class="flex flex-col justify-center items-center">
			<div>
				<div class="relative mx-auto size-fit overflow-hidden">
					<div
						class="[mask-image:linear-gradient(to_top,transparent,black_50%,black_90%,transparent)] [mask-image:linear-gradient(to_top,transparent,#000_100%)]">
						<div ref="flower" class="relative mx-auto size-[300px] translate-y-36 md:size-[380px] md:translate-y-40 animate-[spin_6s_linear_infinite]">
							<NuxtImg :placeholder="[200, 200, 30, 10]" src="/imgs/steel-bg.png" draggable="false" alt="bg" class="z-10 w-full opacity-65 select-none" />
						</div>
					</div>
				</div>
				<h2  class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-40 mb-0 md:mb-0 size-full -translate-y-6 md:-translate-y-10">
					<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-black/70 dark:text-white/70">{{ $t('page.home.skills.line1') }}</p>
					<span class="serif">
						<span class="text-black dark:text-white">{{ $t('page.home.skills.line2') }} </span>
						<span class="pl-2 tracking-tight italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent"> {{ $t('page.home.skills.greeting') }}</span>
					</span>
				</h2>
				<div class="mx-auto flex max-w-4xl flex-wrap justify-center gap-2 lg:gap-3">
					<UBadge
					v-for="(badge, index) in skins"
					size="lg"
					color="neutral"
					variant="outline"
					class="rounded-lg hover:scale-110 duration-150"
					:icon="badge.logo"
					
					>
						{{ badge.name }}
					</UBadge>
				</div>
			</div>
		</div>




	</div>
</template>

<script setup lang="ts">

let flower = ref('flower')


let skins = [
	{ name: 'NuxtJS', logo:'i-mkt-nuxt-icon' },
	{ name: 'Tailwind CSS', logo:'i-mkt-tailwindcss-icon' },
	{ name: 'VueJS', logo:'i-mkt-vue' },
	{ name: 'TypeScript', logo:'i-mkt-typescript-icon' },
	{ name: 'GraphQL', logo:'i-mkt-graphql' },
	{ name: 'NuxtUI', logo:'i-mkt-vueuse' },
	{ name: 'Fastify', logo:'i-mkt-fastify' },
	{ name: 'AdonisJS', logo:'i-mkt-adonisjs-icon' },
	{ name: 'NodeJS', logo:'i-mkt-nodejs-icon' },
	{ name: 'Express', logo:'i-mkt-express' },
	{ name: 'Pinia', logo:'i-mkt-pinia' },
	{ name: 'Docker', logo:'i-mkt-docker-icon' },
	{ name: 'Bun', logo:'i-mkt-bun' },
	{ name: 'Framer', logo:'i-mkt-framer' },
	{ name: 'Strapi', logo:'i-mkt-strapi-icon' },
	{ name: 'Figma', logo:'i-mkt-figma' },
	{ name: 'PostgreSQL', logo:'i-mkt-postgresql' },
	{ name: 'MongoDB', logo:'i-mkt-mongodb-icon' },
	{ name: 'pnpm', logo:'i-mkt-pnpm' },
	{ name: 'Git', logo:'i-mkt-git-icon' },
	{ name: 'GitHub', logo:'i-mkt-github' },
	{ name: 'Vercel', logo:'i-mkt-vercel' },
	{ name: 'AWS', logo:'i-mkt-aws' },
	{ name: 'Linux', logo:'i-mkt-linux' },
	{ name: 'Mac', logo:'i-mkt-macosx' },
	{ name: 'GSAP', logo:'i-mkt-gsap' },
	{ name: 'Bunny', logo:'i-mkt-bunny' },

]

</script>