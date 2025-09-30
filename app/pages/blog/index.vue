<template>
	<div class="pt-44">
		<h1 class="text-6xl text-center italic bg-gradient-to-b bg-linear-to-b from-zinc-700 via-zinc-200 to-zinc-50 bg-clip-text text-transparent">
			{{ t('page.blog.hero.title') }}
		</h1>
		<h2 class="serif text-4xl text-center text-zinc-400">
			{{ t('page.blog.hero.description') }}
		</h2>
		<div class="w-full max-w-5xl mx-auto px-12 mt-24">
			<UPageGrid>
				<UPageCard
					title="Tailwind CSS"
					description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
					orientation="vertical"
					spotlight
					variant="subtle"
					spotlight-color="primary"
					to="https://tailwindcss.com/docs/v4-beta"
					target="_blank"
				>
					<img src="/imgs/portfolio.webp" alt="Tailwind CSS" class="w-full h-36 object-cover rounded-lg border border-neutral-500/25"  />
					<template #footer>
						<div class="flex gap-1">
							<UBadge variant="soft" color="primary" size="md" icon="i-logos-vue" >VueJS</UBadge>
						</div>
					</template>

					<div>
						<UUser
							name="John Doe"
							:avatar="{
								src: 'https://i.pravatar.cc/150?u=john-doe',
								icon: 'i-lucide-image'
							}"
							size="xs"
						/>
					</div>
				</UPageCard>
				<UPageCard
					title="Tailwind CSS"
					description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
					orientation="vertical"
					spotlight
					variant="subtle"
					spotlight-color="primary"
					to="https://tailwindcss.com/docs/v4-beta"
					target="_blank"
				>
					<img src="/imgs/portfolio.webp" alt="Tailwind CSS" class="w-full h-36 object-cover rounded-lg border border-neutral-500/25"  />
					<template #footer>
						<div class="flex gap-1">
							<UBadge variant="soft" color="primary" size="md" icon="i-logos-vue" >VueJS</UBadge>
						</div>
					</template>

					<div>
						<UUser
							name="John Doe"
							:avatar="{
								src: 'https://i.pravatar.cc/150?u=john-doe',
								icon: 'i-lucide-image'
							}"
							size="xs"
						/>
					</div>
				</UPageCard>
				<UPageCard
					title="Tailwind CSS"
					description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
					orientation="vertical"
					spotlight
					variant="subtle"
					spotlight-color="primary"
					to="https://tailwindcss.com/docs/v4-beta"
					target="_blank"
				>
					<img src="/imgs/portfolio.webp" alt="Tailwind CSS" class="w-full h-36 object-cover rounded-lg border border-neutral-500/25"  />
					<template #footer>
						<div class="flex gap-1">
							<UBadge variant="soft" color="primary" size="md" icon="i-logos-vue" >VueJS</UBadge>
						</div>
					</template>

					<div>
						<UUser
							name="John Doe"
							:avatar="{
								src: 'https://i.pravatar.cc/150?u=john-doe',
								icon: 'i-lucide-image'
							}"
							size="xs"
						/>
					</div>
				</UPageCard>
				<UPageCard
					title="Tailwind CSS"
					description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
					orientation="vertical"
					spotlight
					variant="subtle"
					spotlight-color="primary"
					to="https://tailwindcss.com/docs/v4-beta"
					target="_blank"
				>
					<img src="/imgs/portfolio.webp" alt="Tailwind CSS" class="w-full h-36 object-cover rounded-lg border border-neutral-500/25"  />
					<template #footer>
						<div class="flex gap-1">
							<UBadge variant="soft" color="primary" size="md" icon="i-logos-vue" >VueJS</UBadge>
						</div>
					</template>

					<div>
						<UUser
							name="John Doe"
							:avatar="{
								src: 'https://i.pravatar.cc/150?u=john-doe',
								icon: 'i-lucide-image'
							}"
							size="xs"
						/>
					</div>
				</UPageCard>
			</UPageGrid>
		</div>
	</div>
</template>

<script setup lang="ts">
const { t } = useI18n()


const title = computed(() => t('page.blog.seo.title'))
const description = computed(() => t('page.blog.seo.description'))

// Ustawianie metadanych SEO
useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
</script>