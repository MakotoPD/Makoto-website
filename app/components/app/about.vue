<template>
    <div class="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 pb-12 lg:size-full lg:flex-row lg:justify-between">
        <div class="max-w-[90%] lg:max-w-[60%]">
            <h2 style="text-shadow:0px 4px 8px rgba(255,255,255,.05),0px 8px 30px rgba(255,255,255,.25)"
                class="relative z-2 font-medium tracking-tight md:mb-36 md:text-6xl text-center lg:text-left !mb-8 text-3xl sm:text-4xl text-balance md:mt-28">
                
                <p class="mb-3 text-xs font-normal tracking-widest text-black/80 uppercase md:text-sm dark:text-white/70">
                    {{ $t('page.home.aboutMe.subtitle') }}
                </p>

                <i18n-t keypath="page.home.aboutMe.heading" tag="span" class="serif text-black dark:text-white" scope="global">
                    <template #highlighted>
                        <span class="italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent serif pe-2 tracking-tight">
                            {{ $t('page.home.aboutMe.highlightedWord') }}
                        </span>
                    </template>
                </i18n-t>
            </h2>

            <div class="relative z-5 mx-auto flex max-w-xl flex-col gap-y-8 text-center text-base font-light tracking-wider text-black/80 lg:mx-0 lg:max-w-[550px] lg:text-left lg:text-lg dark:text-neutral-300">
                
                <p>{{ $t('page.home.aboutMe.descriptionP1') }}</p>
                
                <p>{{ $t('page.home.aboutMe.descriptionP2') }}</p>

                <div class="flex gap-3 mx-auto -mt-4 w-fit lg:mx-0">
                    <LazyNuxtLink to="https://github.com/makotopd" target="_blank" class="group flex items-center gap-1">
                        <UIcon name="i-simple-icons-github" />
                        <span class="max-w-0 group-hover:max-w-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            {{ $t('page.home.aboutMe.github') }}
                        </span>
                    </LazyNuxtLink>

                    <LazyNuxtLink to="https://www.linkedin.com/in/makotopd/" target="_blank" class="group flex items-center gap-1">
                        <UIcon name="i-simple-icons-linkedin" />
                        <span class="max-w-0 group-hover:max-w-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            {{ $t('page.home.aboutMe.linkedin') }}
                        </span>
                    </LazyNuxtLink>

                    <LazyNuxtLink to="mailto:contact@makoto.com.pl" target="_blank" class="group flex items-center gap-1">
                        <UIcon name="i-simple-icons-maildotru" />
                        <span class="max-w-0 group-hover:max-w-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            {{ $t('page.home.aboutMe.email') }}
                        </span>
                    </LazyNuxtLink>
                </div>
            </div>
        </div>
        <div class="relative grid aspect-square w-92 place-content-center lg:me-10 lg:mt-20 lg:w-[500px]">
            <NuxtImg loading="lazy" src="/imgs/avatar-square.webp" alt="Makoto Picture" class="w-full h-full object-contain rounded-4xl rotate-3 drop-shadow-[0_8px_20px_rgb(76_179_202_/_0.5)] hover:scale-105 hover:-rotate-1 duration-300" />
        </div>
    </div>
</template>