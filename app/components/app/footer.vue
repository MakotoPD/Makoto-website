<template>
	<div>
		<section id="contact"
			class="relative z-0 mt-40 flex w-full justify-center overflow-x-hidden bg-[url('/bg/footer.webp')] bg-cover bg-center px-4 py-20">
			<div class="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-y-4 py-10 text-center lg:mx-0">
				<div>
					<NuxtImg loading="lazy" class="dark:block hidden h-8" height="44px" alt="Logo Makoto" src="/logo.png" />
					<NuxtImg loading="lazy" class="block dark:hidden h-8" height="44px" alt="Logo Makoto" src="/logo-dark.png" />
				</div>

				<span class="relative mt-4 text-2xl uppercase font-light tracking-wide sm:text-4xl lg:text-5xl text-black dark:text-white">
						
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
						<div class="text-sm rounded-full border-4 border-sky-600 px-4 py-2 bg-white/400 dark:bg-black/40 backdrop-blur-lg -rotate-12">
							<p>{{ $t('footer.openToWork') }}</p>
						</div>
					</div>
				</span>

				<UDrawer should-scale-background set-background-color-on-scale>
					<div ref="buttonContainer" class="p-6" style="overflow: hidden;">
					
						<button ref="btnGetInTouch" class="flex items-center gap-2 px-6 py-3 text-xl font-semibold bg-black/80 dark:bg-white text-white dark:text-black rounded-xl hover:bg-black/60 hover:dark:bg-neutral-100 transition-colors duration-200">
							{{ $t('footer.ctaButton') }}
							<UIcon name="i-solar-alt-arrow-right-linear" class="size-6" />
						</button>
					</div>

					<template #content>
						<UiConnectform />
					</template>
				</UDrawer>

				<div class="text-xl font-semibold text-black dark:text-white">
					<p>{{ $t('footer.availability') }}</p>
				</div>
					
				<div>
					<p class="text-lg font-thin text-black dark:text-white">
						<i18n-t keypath="footer.passion" scope="global">
							<template #br><br /></template>
						</i18n-t>
					</p>
				</div>
			</div>
			<div aria-hidden="true" class="absolute inset-0 z-0 bg-linear-to-b from-transparent opacity-100 to-[#f8f9fd] dark:to-[#0f1013]"></div>
			<div aria-hidden="true" class="absolute inset-0 z-0 bg-linear-to-b to-transparent opacity-100 from-[#f8f9fd] dark:from-[#0f1013]"></div>
			<div aria-hidden="true" class="absolute inset-0 z-0 opacity-65 bg-[#f8f9fd]/50 dark:bg-[#0f1013]/50"></div>
		</section>
		<footer class="mx-auto my-6 max-w-6xl max-lg:px-4">
			<div
				class="relative mx-auto flex flex-col items-center gap-6 rounded-3xl px-4 py-10 shadow-sm backdrop-blur-lg md:flex-row bg-black/5 dark:bg-white/5"
			>
				<div class="flex flex-1 flex-col items-start gap-4 md:flex-row md:gap-10 md:px-8">
					<div class="flex-col gap-y-1 md:flex md:w-1/2">
						<NuxtLink :to="localePath('/')">
							<NuxtImg loading="lazy" src="/favicon.png" alt="sygnet makoto" height="46" />
						</NuxtLink>
						<p class="w-60 text-sm leading-5 text-zinc-700 dark:text-neutral-300">
							{{ $t('footer.desc') }}
						</p>

						<ClientOnly>
							<div class="">
								<p class="test-xm text-black/50 dark:text-neutral-500">{{ $t('changelang') }}:</p>

								<ULocaleSelect
									:model-value="locale"
									:locales="[en, pl]"
									@update:model-value="setLocale($event)"
								/>
							</div>
						</ClientOnly>
					</div>
					<div class="flex flex-col items-start justify-end gap-6 md:mx-4 md:w-1/2 md:flex-row md:gap-24">
						<div class="flex flex-col gap-2 md:gap-4">
							<h4 class="text-base text-black dark:text-white">{{ $t('footer.menu.general') }}</h4>
							<ul
								class="flex flex-wrap items-start gap-x-4 gap-y-2 text-sm md:flex-col md:gap-y-3 text-neutral-700 dark:text-neutral-300">
								<li>
									<NuxtLink class="link-underline" :to="localePath('/')" prefetch>
										{{ $t('menu.home') }}
									</NuxtLink> 
								</li>
								<li>
									<NuxtLink class="link-underline" :to="localePath('about')" prefetch>
										{{ $t('menu.about') }}
									</NuxtLink>
								</li>
								<li>
									<NuxtLink class="link-underline" :to="localePath('work')" prefetch>
										{{ $t('menu.work') }}
									</NuxtLink>
								</li>
								<li>
									<NuxtLink class="link-underline" :to="localePath('blog')" prefetch>
										{{ $t('menu.blog') }}
									</NuxtLink>
								</li>
							</ul>
						</div>
						<div class="flex flex-col gap-2 md:gap-4">
							<h4 class="text-base text-black dark:text-white">{{ $t('footer.menu.more') }}</h4>
							<ul
								class="flex flex-wrap items-start gap-x-4 gap-y-2 text-sm md:flex-col md:gap-y-3 text-neutral-700 dark:text-neutral-300">
								<li><NuxtLink :to="localePath('rules')">{{ $t('menu.rules') }}</NuxtLink></li>
								<li><NuxtLink :to="localePath('privacy')">{{ $t('menu.privacy') }}</NuxtLink></li>
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

const localePath = useLocalePath()

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

function handleLocaleChange(newLocale: string) {
  if (newLocale === 'en' || newLocale === 'pl') {
    setLocale(newLocale)
  }
}
</script>