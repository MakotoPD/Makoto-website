<template>
	<div>
		<section id="contact"
			class="relative z-0 mt-40 flex w-full justify-center overflow-x-hidden bg-[url('/bg/footer.webp')] bg-cover bg-center px-4 py-20">
			<div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-y-4 py-10 text-center lg:mx-0">
				<div>
					<NuxtImg height="44px" alt="Logo Makoto" src="/logo.png" />
				</div>

				<span class="relative mt-4 text-2xl uppercase font-light tracking-wide sm:text-4xl lg:text-5xl text-white">
						
					<h3 class="text-nowrap">
						<i18n-t keypath="footer.sloganLine1" scope="global">
							<template #boldPart>
								<span class="font-bold">{{ $t('footer.sloganLine1Bold') }}</span>
							</template>
						</i18n-t>
					</h3>

					<h3 class="mt-3 text-nowrap">
						<i18n-t keypath="footer.sloganLine2" scope="global">
							<template #boldPart>
								<span class="font-bold">{{ $t('footer.sloganLine2Bold') }}</span>
							</template>
						</i18n-t>
					</h3>

					<div class="absolute -right-8 -bottom-8 hover:scale-110 duration-150">
						<div class="text-sm rounded-full border-4 border-sky-600 px-4 py-2 bg-black/40 backdrop-blur-lg -rotate-12">
							<p>{{ $t('footer.openToWork') }}</p>
						</div>
					</div>
				</span>

				<div ref="buttonContainer" class="p-6" style="overflow: hidden;">
					<button ref="btnGetInTouch" class="flex items-center gap-2 px-6 py-3 text-xl font-semibold bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors duration-200">
						{{ $t('footer.ctaButton') }}
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
							<path d="m9 18 6-6-6-6" />
						</svg>
					</button>
				</div>

				<div class="text-xl font-semibold">
					<p>{{ $t('footer.availability') }}</p>
				</div>
					
				<div>
					<p class="text-lg font-thin">
						<i18n-t keypath="footer.passion" scope="global">
							<template #br><br /></template>
						</i18n-t>
					</p>
				</div>
			</div>
			<div aria-hidden="true" class="absolute inset-0 z-0 bg-linear-to-b from-transparent opacity-100 to-[#0f1013]"></div>
			<div aria-hidden="true" class="absolute inset-0 z-0 bg-linear-to-b to-transparent opacity-100 from-[#0f1013]"></div>
			<div aria-hidden="true" class="absolute inset-0 z-0 opacity-65 bg-[#0f1013]/50"></div>
		</section>
		<footer class="mx-auto my-6 max-w-6xl max-lg:px-4">
			<div
				class="relative mx-auto flex flex-col items-center gap-6 rounded-3xl px-4 py-10 shadow-sm backdrop-blur-lg md:flex-row bg-white/5">
				<div class="flex flex-1 flex-col items-start gap-4 md:flex-row md:gap-10 md:px-8">
					<div class="flex-col gap-y-1 md:flex md:w-1/2">
						<NuxtLink>
							<LazyNuxtImg src="/favicon.png" alt="sygnet makoto" height="46" />
						</NuxtLink>
						<p class="w-60 text-sm leading-5 text-neutral-300">
							{{ $t('footer.desc') }}
						</p>

						<div class="">
							<p class="test-xm text-neutral-600">{{ $t('changelang') }}:</p>
							<!-- <div class="flex gap-x-1.5">
								<a href="#" class="bg-neutral-800/60 rounded-md border border-neutral-700/50 hover:bg-neutral-800/30 duration-200 px-1 text-neutral-300 flex items-center gap-1" v-for="locale in availableLocales" :key="locale.code" @click.prevent.stop="setLocale(locale.code)">
									<NuxtImg :src="'/lang/'+locale.code+'.png'" class="object-contain h-4" height="16px" :alt="locale.code" />
									{{ locale.name }}
								</a>
							</div> -->
							<ULocaleSelect
								v-model="locale"
								:locales="[en, pl]"
								@update:model-value="setLocale($event)"
							/>
						</div>
					</div>
					<div class="flex flex-col items-start justify-end gap-6 md:mx-4 md:w-1/2 md:flex-row md:gap-24">
						<div class="flex flex-col gap-2 md:gap-4">
							<h4 class="text-base text-white">{{ $t('footer.menu.general') }}</h4>
							<ul
								class="flex flex-wrap items-start gap-x-4 gap-y-2 text-sm md:flex-col md:gap-y-3 text-neutral-300">
								<li>
									<NuxtLink class="link-underline" to="/">
										{{ $t('menu.home') }}
									</NuxtLink> 
								</li>
								<li>
									<NuxtLink class="link-underline" to="/about">
										{{ $t('menu.about') }}
									</NuxtLink>
								</li>
								<li>
									<NuxtLink class="link-underline" to="/work">
										{{ $t('menu.work') }}
									</NuxtLink>
								</li>
								<li>
									<NuxtLink class="link-underline" to="/blog">
										{{ $t('menu.blog') }}
									</NuxtLink>
								</li>
							</ul>
						</div>
						<div class="flex flex-col gap-2 md:gap-4">
							<h4 class="text-base text-white">{{ $t('footer.menu.more') }}</h4>
							<ul
								class="flex flex-wrap items-start gap-x-4 gap-y-2 text-sm md:flex-col md:gap-y-3 text-neutral-300">
								<li>{{ $t('menu.more.attributons') }}</li>
								<li>{{ $t('menu.more.links') }}</li>
								<li>{{ $t('menu.more.uses') }}</li>
								<li>RSS</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { en, pl } from '@nuxt/ui/locale'

const { locale, setLocale } = useI18n()


const availableLocales = computed(() => {
  return locales.value.filter(i => i.code)
})
// Define the refs for the elements
const btnGetInTouch = ref<HTMLButtonElement | null>(null)
const buttonContainer = ref<HTMLDivElement | null>(null)

const magnetoStrength = 20;

onMounted(() => {
    nextTick();
    
    // This is the correct way to get the element from the ref
    const buttonElement = btnGetInTouch.value;

    // Check if the elements actually exist and have the required methods
    if (buttonContainer.value && buttonElement && typeof buttonElement.getBoundingClientRect === 'function') {
        
        // Now it's safe to add listeners because we know the elements are not null.
        buttonContainer.value.addEventListener("mousemove", (e) => {
            const boundBox = buttonElement.getBoundingClientRect(); // This will no longer cause an error
            
            const newX = ((e.clientX - boundBox.left) / buttonElement.offsetWidth) - 0.5;
            const newY = ((e.clientY - boundBox.top) / buttonElement.offsetHeight) - 0.5;

            gsap.to(buttonElement, {
                x: newX * magnetoStrength,
                y: newY * magnetoStrength,
				scale: 1.1,
                duration: 1,
                ease: "power4.out",
            });
        });

        buttonContainer.value.addEventListener("mouseleave", () => {
            gsap.to(buttonElement, {
                x: 0,
                y: 0,
				scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.3)",
            });
        });

    } else {
        // Optional: Log an error if elements weren't found, for easier debugging.
        console.error("Magnetic button elements not found!");
    }
})
</script>