<template>
	<div>
		<div class="flex flex-col justify-center items-center">
			<div>
				<div class="relative mx-auto size-fit overflow-hidden">
					<div
						class="[mask-image:linear-gradient(to_top,transparent,black_50%,black_90%,transparent)] [masak-image:linear-gradient(to_top,transparent,#000_100%)]">
						<div ref="flower" class="relative mx-auto size-[300px] translate-y-36 md:size-[380px] md:translate-y-40 animate-[spin_5s_linear_infinite]">
							<NuxtImg src="/imgs/steel-flower.webp" draggable="false" alt="flower" class="z-10 w-full opacity-65 select-none" />
						</div>
					</div>
				</div>
				<h2  class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-30 mb-0 md:mb-0 size-full -translate-y-6 md:-translate-y-10">
					<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-white/70">{{ $t('page.home.skills.line1') }}</p>
					<span class="serif">
						<span class="">{{ $t('page.home.skills.line2') }} </span>
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
	{ name: 'NuxtJS', logo:'i-logos-nuxt-icon' },
	{ name: 'Tailwind CSS', logo:'i-logos-tailwindcss-icon' },
	{ name: 'VueJS', logo:'i-logos-vue' },
	{ name: 'TypeScript', logo:'i-logos-typescript-icon' },
	{ name: 'GraphQL', logo:'i-logos-graphql' },
	{ name: 'NuxtUI', logo:'i-logos-vueuse' },
	{ name: 'Fastify', logo:'i-simple-icons-fastify' },
	{ name: 'NodeJS', logo:'i-logos-nodejs-icon' },
	{ name: 'Express', logo:'i-simple-icons-express' },
	{ name: 'Pinia', logo:'i-logos-pinia' },
	{ name: 'Docker', logo:'i-logos-docker-icon' },
	{ name: 'Bun', logo:'i-logos-bun' },
	{ name: 'Framer', logo:'i-simple-icons-framer' },
	{ name: 'Strapi', logo:'i-logos-strapi-icon' },
	{ name: 'Figma', logo:'i-devicon-figma' },
	{ name: 'PostgreSQL', logo:'i-logos-postgresql' },
	{ name: 'MongoDB', logo:'i-logos-mongodb-icon' },
	{ name: 'pnpm', logo:'i-devicon-pnpm' },
	{ name: 'Git', logo:'i-logos-git-icon' },
	{ name: 'GitHub', logo:'i-simple-icons-github' },
	{ name: 'Vercel', logo:'i-simple-icons-vercel' },
	{ name: 'AWS', logo:'i-logos-aws' },
	{ name: 'Linux', logo:'i-logos-linux-tux' },
	{ name: 'Mac', logo:'i-logos-macosx' },
	{ name: 'GSAP', logo:'i-simple-icons-gsap' },
]

</script>