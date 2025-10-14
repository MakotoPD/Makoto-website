<template>
  <div class="w-full py-3 flex justify-center items-center">
    <div class="fixed top-0 left-0 w-screen h-24">
      <div class="absolute inset-0 overflow-hidden">
        <div class="pointer-events-none absolute inset-0 z-10 opacity-100" style="backdrop-filter:blur(3px);mask-image:linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 100%);-webkit-mask-image:linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 100%)"></div>
        <div class="pointer-events-none absolute inset-0 z-20 opacity-100" style="backdrop-filter:blur(5px);mask-image:linear-gradient(to top, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 1) 100%);-webkit-mask-image:linear-gradient(to top, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 1) 100%)"></div></div>
    </div>
    <div class="fixed max-w-6xl mx-auto top-2 left-2 right-2 py-1 px-1 rounded-2xl border border-zinc-200 dark:border-zinc-600">
      <div class="py-1 px-2 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 shadow-lg">
        <div class="flex justify-between items-center ">
          <div class="flex gap-1">
            <NuxtLink :to="localePath('/')" title="Home page">
              <NuxtImg src="/logo.png" alt="Makoto Logo" aria-hidden class="h-7 dark:block hidden" />
              <NuxtImg src="/logo-dark.png" alt="Makoto Logo" aria-hidden class=" h-7 dark:hidden block" />
            </NuxtLink>
            <UColorModeButton />
          </div>



          <div class="hidden md:flex gap-x-1">
            <UButton 
              v-for="link in links"
              :key="link.to"
              variant="ghost" 
              :to="localePath(link.to)"
              prefetch
              active-class="bg-gradient-to-t from-sky-300 dark:from-sky-700/40 to-transparent" 
              class="relative z-20 font-normal text-black/80 dark:text-white/80 rounded-lg px-3 duration-150 hover:bg-gradient-to-t from-zinc-300/60 dark:from-zinc-700/30 to-transparent/10"
            >
              {{ link.label }}
            </UButton>
            <UButton 
              variant="ghost" 
              class="group relative z-20 font-normal text-black/80 dark:text-white/80 rounded-lg px-3 duration-150 hover:bg-gradient-to-t from-zinc-300/60 dark:from-zinc-700/30 to-transparent/10"
            >
              {{ $t('menu.more') }}

              <span class="absolute right-0 translate-x-1 top-[100%] pt-2 opacity-0 scale-95 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-in-out">
                <div  class="z-[100] px-2 py-2 text-black dark:text-white rounded-3xl border border-zinc-600/20 dark:border-zinc-400/20 bg-white dark:bg-black flex flex-col gap-y-1">
                  <div class="flex gap-x-4">
                    <div>
                      <NuxtLink prefetch :to="localePath('/portfolio')" class="z-[40] h-full w-64 relative group/portfolio flex flex-col justify-end items-start p-4">
                        <div>
                          <p class="serif text-2xl group-hover/portfolio:text-3xl duration-300 text-white">Portfolio</p>
                        </div>
                        <NuxtImg src="/imgs/portfolio.webp" alt="Portfolio image" loading="lazy" aria-hidden class="absolute -z-10 top-0 left-0 w-full h-full object-cover rounded-2xl opacity-55 group-hover/portfolio:opacity-100 duration-300" />
                      </NuxtLink>
                    </div>
                    <div class="flex flex-col gap-2">
                      <NuxtLink prefetch :to="localePath('/links')" class="w-72 bg-zinc-300/30 dark:bg-zinc-700/30 flex hover:bg-zinc-300/50 hover:dark:bg-zinc-700/50 duration-100 rounded-2xl p-4">
                        <div class="h-12 w-12 min-w-12 flex justify-center items-center bg-zinc-500/30 rounded-xl">
                          <UIcon name="i-solar-link-line-duotone" class="size-6" />
                        </div>
                        <div class="px-4 text-left">
                          <p class="font-semibold mb-1">{{ $t('menu.more.links') }}</p>
                          <p class="font-normal text-black/50 dark:text-white/50">{{ $t('menu.more.links.desc') }}</p>
                        </div>
                      </NuxtLink>
                      <NuxtLink prefetch :to="localePath('/uses')" class="bg-zinc-300/30 dark:bg-zinc-700/30 flex hover:bg-zinc-300/50 hover:dark:bg-zinc-700/50 duration-100 rounded-2xl p-4">
                        <div class="h-12 w-12 min-w-12 flex justify-center items-center bg-zinc-500/30 rounded-xl">
                          <UIcon name="i-solar-laptop-line-duotone" class="size-6" />
                        </div>
                        <div class="px-4 text-left">
                          <p class="font-semibold mb-1">{{ $t('menu.more.uses') }}</p>
                          <p class="font-normal text-black/50 dark:text-white/50">{{ $t('menu.more.uses.desc') }}</p>
                        </div>
                      </NuxtLink>
                      <NuxtLink prefetch :to="localePath('/faq')" class="bg-zinc-300/30 dark:bg-zinc-700/30 flex hover:bg-zinc-300/50 hover:dark:bg-zinc-700/50 duration-100 rounded-2xl p-4">
                        <div class="h-12 w-12 min-w-12 flex justify-center items-center bg-zinc-500/30 rounded-xl">
                          <UIcon name="i-solar-question-square-line-duotone" class="size-6" />
                        </div>
                        <div class="px-4 text-left">
                          <p class="font-semibold mb-1">{{ $t('menu.more.attributons') }}</p>
                          <p class="font-normal text-black/50 dark:text-white/50">{{ $t('menu.more.attributons.desc') }}</p>
                        </div>
                      </NuxtLink>
                    </div>
                  </div>
                  <div class="flex gap-3 justify-end pr-2 w-full">
                    <p class="test-xm text-neutral-600">{{ $t('changelang') }}:</p>
                    <ClientOnly>
                      <div class="flex justify-center gap-x-2">
                        <button class="bg-zinc-200/60 dark:bg-neutral-800/60 rounded-md border border-neutral-700/50 hover:bg-neutral-800/30 duration-200 px-1 text-neutral-500 flex items-center gap-1" v-for="locale in availableLocales" :key="locale.code" @click.prevent.stop="setLocale(locale.code)">
                          <NuxtImg :src="'/lang/'+locale.code+'.png'" class="object-contain h-4" height="16px" :alt="locale.code" />
                          {{ locale.name }}
                        </button>
                      </div>
                    </ClientOnly>
                  </div>

                </div>
              </span>

            </UButton>

            <UDrawer should-scale-background set-background-color-on-scale >
              <UButton 
                variant="soft" 
                class="relative z-20 font-normal text-black/80 dark:text-white/80 rounded-lg px-3 bg-gradient-to-t from-gray-500/30 to-gray-400/10 hover:bg-zinc-300 hover:dark:bg-zinc-600"
              >
                {{t('menu.call')}}
              </UButton>

              <template #content>
                <UiConnectform />
              </template>
            </UDrawer>
          </div>

          <div class="flex md:hidden">
            <UButton  @click="togglemobilemenu" :icon="isClicked ? 'i-lucide-x' : 'i-lucide-align-justify'" size="md" color="primary" variant="soft" class="text-black dark:text-white"></UButton>
          </div>
        </div>
        <div ref="mobilemenu" class="w-full overflow-hidden max-h-0 transition-all duration-300 text-black dark:text-white">
          <div class="py-4 flex flex-col">
            <NuxtLink prefetch :to="localePath('/')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
              <UIcon name="i-solar-home-smile-line-duotone" class="size-6" />
              {{t('menu.home')}}
            </NuxtLink>
            <NuxtLink prefetch :to="localePath('/about')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
              <UIcon name="i-solar-user-rounded-line-duotone" class="size-6" />
              {{t('menu.about')}}
            </NuxtLink>
            <NuxtLink prefetch :to="localePath('/work')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
              <UIcon name="i-solar-buildings-line-duotone" class="size-6" />
              {{t('menu.work')}}
            </NuxtLink>
            <NuxtLink prefetch :to="localePath('/blog')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
              <UIcon name="i-solar-document-text-line-duotone" class="size-6" />
              {{t('menu.blog')}}
            </NuxtLink>
            <button @click="openMoreMobile" class="flex items-center justify-between gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
              <div class="flex items-center gap-3">
                <UIcon name="i-solar-layers-minimalistic-line-duotone" class="size-6" />
                {{t('menu.more')}}
              </div>
              <UIcon :name="toggleMoreMobileButtonIcon ? 'i-solar-alt-arrow-up-line-duotone' : 'i-solar-alt-arrow-down-line-duotone'" class="size-6" />
            </button>
            <div ref="moreMenuMobile" class="px-2 overflow-hidden max-h-0 transition-all duration-300">
              <NuxtLink prefetch :to="localePath('/portfolio')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
                <UIcon name="i-solar-folder-path-connect-line-duotone" class="size-6" />
                Portfolio
              </NuxtLink>
              <NuxtLink prefetch :to="localePath('/uses')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
                <UIcon name="i-solar-laptop-line-duotone" class="size-6" />
                {{ t('menu.more.uses') }}
              </NuxtLink>
              <NuxtLink prefetch :to="localePath('/faq')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
                <UIcon name="i-solar-question-square-line-duotone" class="size-6" />
                {{ t('menu.more.attributons') }}
              </NuxtLink>
              <NuxtLink prefetch :to="localePath('/links')" class="flex items-center gap-3 border-b border-zinc-300 dark:border-zinc-700 py-2">
                <UIcon name="i-solar-link-line-duotone" class="size-6" />
                {{ t('menu.more.links') }}
              </NuxtLink>
            </div>

            <UDrawer should-scale-background set-background-color-on-scale>
              <button class="flex items-center gap-3 py-2">
                <UIcon name="i-solar-chat-round-call-line-duotone" class="size-6" />
                {{ t('menu.call') }}
              </button>

              <template #content>
                  <UiConnectform />
                </template>
            </UDrawer>
            
          </div>
          <div>
            <div class="flex gap-3 justify-end pr-2 w-full">
              <p class="test-xm text-neutral-400">{{ $t('changelang') }}:</p>
              <ClientOnly>
                <div class="flex justify-center gap-x-2">
                  <button class="py-0 bg-zinc-200/60 dark:bg-neutral-800/60 rounded-md border border-neutral-700/50 hover:bg-neutral-800/30 duration-200 px-1 text-neutral-500 flex items-center gap-1" v-for="locale in availableLocales" :key="locale.code" @click.prevent.stop="setLocale(locale.code)">
                    <NuxtImg :src="'/lang/'+locale.code+'.png'" class="object-contain h-4" height="16px" :alt="locale.code" />
                    {{ locale.name }}
                  </button>
                </div>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

const { locale, locales, setLocale, t } = useI18n()

const currentLocale = locale.value

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code)
})

const localePath = useLocalePath()
const route = useRoute()

// Refs for mobile menu
const mobilemenu = ref<HTMLElement | null>(null)
const isClicked = ref(false)
const toggleMoreMobileButtonIcon = ref(false)
const moreMenuMobile = ref<HTMLElement | null>(null)

// Mobile menu toggle
const togglemobilemenu = (e: Event) => {
  e.preventDefault()
  if (mobilemenu.value) {
    mobilemenu.value.classList.toggle('max-h-[30rem]')
    isClicked.value = !isClicked.value
  }
}

// More mobile menu toggle
const openMoreMobile = () => {
  if (moreMenuMobile.value) {
    moreMenuMobile.value.classList.toggle('max-h-[28rem]')
    toggleMoreMobileButtonIcon.value = !toggleMoreMobileButtonIcon.value
  }
}

// Navigation links
const links = computed(() => [
  { label: t('menu.home'), to: '/' },
  { label: t('menu.about'), to: '/about' },
  { label: t('menu.work'), to: '/work' },
  { label: t('menu.blog'), to: '/blog' },
])

// More menu items
const more = [
  {
    type: 'label',
    slot: 'links' as const
  },
  {
    type: 'label',
    slot: 'uses' as const
  },
  {
    type: 'label',
    slot: 'attr' as const
  },
] as const


</script>

<style scoped>
.indicator {
	opacity: 0;
	transition: opacity 0.2s ease-out, transform 0.4s ease-out;
}

.indicator .indicatorBox{
	transform: translateY(-5px);
	transition: opacity 0.2s ease-out, transform 0.4s ease-out;
}

.indicator.active {
	opacity: 1;
}



.indicator.active .indicatorBox{
	opacity: 1;
	transform: translateY(0);
}
</style>