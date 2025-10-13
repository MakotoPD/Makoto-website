
<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const config = useRuntimeConfig()
const { find } = useStrapi()
const { locale, t } = useI18n();

const localePath = useLocalePath()


gsap.registerPlugin(ScrollTrigger);
// Indeks aktywnego projektu
const activeProjectIndex = ref(0);

const queryParams = computed(() => {
  return {
    locale: locale.value,
    populate: '*',
  }
})


const STRAPI_URL = config.public.apiUrl;


const { data: projects, pending, error, refresh } = await useAsyncData(
  'featured-projects', // Unikalny klucz dla danych
  () => find('featured-projects', queryParams.value), // Funkcja pobierająca dane
  {
    watch: [queryParams] // Obserwuj zmiany w parametrach i wykonaj zapytanie ponownie
  }
  
)

onMounted(() => {

	
  // Czekamy, aż DOM będzie gotowy
  // Używamy setTimeout, aby upewnić się, że wszystko jest wyrenderowane przed inicjalizacją GSAP
  setTimeout(() => {
    // Pobieramy wszystkie elementy projektów
    const projectItems = gsap.utils.toArray('.project-item');

    projectItems.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item, // Element, który śledzimy
        start: 'top center', // Uruchom, gdy góra elementu dotknie środka ekranu
        end: 'bottom center', // Zakończ, gdy dół elementu opuści środek ekranu
        
        // Funkcja wywoływana, gdy element wchodzi w zdefiniowany obszar (scrollując w dół)
        onEnter: () => {
          activeProjectIndex.value = index;
        },
        // Funkcja wywoływana, gdy element wchodzi w obszar (scrollując w górę)
        onEnterBack: () => {
          activeProjectIndex.value = index;
        },
        
        // Włącz markery do debugowania - bardzo pomocne!
        // markers: true, 
      });
    });
  }, 100);
});


watch(activeProjectIndex, (newIndex, oldIndex) => {
  if (oldIndex === undefined) return; // Pomiń pierwszą inicjalizację

  const descriptions = gsap.utils.toArray('.description-content');
  const oldDescription = descriptions[oldIndex];
  const newDescription = descriptions[newIndex];

  // Użyj timeline GSAP do zsynchronizowania animacji
  const tl = gsap.timeline();
  tl.to(oldDescription, { autoAlpha: 0, y: -20, duration: 0.2, ease: 'power2.in' })
    .fromTo(newDescription, 
      { autoAlpha: 0, y: 20 }, 
      { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      '>-0.2' // Zacznij tę animację 0.2s przed końcem poprzedniej
    );
});



const styleMap = {
  'red': {
    bg: 'bg-gradient-to-br from-red-800 via-red-800 to-red-400',
    textColor: 'text-red-300',
    accentColor: 'bg-red-700',
    imgGlow: 'shadow-red-400'
  },
  'orange': {
    bg: 'bg-gradient-to-br from-orange-800 via-orange-800 to-orange-400',
    textColor: 'text-orange-300',
    accentColor: 'bg-orange-700',
    imgGlow: 'shadow-orange-400'
  },
  'amber': {
    bg: 'bg-gradient-to-br from-amber-800 via-amber-800 to-amber-400',
    textColor: 'text-amber-300',
    accentColor: 'bg-amber-700',
    imgGlow: 'shadow-amber-400'
  },
  'yellow': {
    bg: 'bg-gradient-to-br from-yellow-800 via-yellow-800 to-yellow-400',
    textColor: 'text-yellow-300',
    accentColor: 'bg-yellow-700',
    imgGlow: 'shadow-yellow-400'
  },
  'lime': {
    bg: 'bg-gradient-to-br from-lime-800 via-lime-800 to-lime-400',
    textColor: 'text-lime-300',
    accentColor: 'bg-lime-700',
    imgGlow: 'shadow-lime-400'
  },
  'green': {
    bg: 'bg-gradient-to-br from-green-800 via-green-800 to-green-400',
    textColor: 'text-green-300',
    accentColor: 'bg-green-700',
    imgGlow: 'shadow-green-400'
  },
  'emerald': {
    bg: 'bg-gradient-to-br from-emerald-800 via-emerald-800 to-emerald-400',
    textColor: 'text-emerald-300',
    accentColor: 'bg-emerald-700',
    imgGlow: 'shadow-emerald-400'
  },
  'teal': {
    bg: 'bg-gradient-to-br from-teal-800 via-teal-800 to-teal-400',
    textColor: 'text-teal-300',
    accentColor: 'bg-teal-700',
    imgGlow: 'shadow-teal-400'
  },
  'cyan': {
    bg: 'bg-gradient-to-br from-cyan-800 via-cyan-800 to-cyan-400',
    textColor: 'text-cyan-300',
    accentColor: 'bg-cyan-700',
    imgGlow: 'shadow-cyan-400'
  },
  'sky': {
    bg: 'bg-gradient-to-br from-sky-800 via-sky-800 to-sky-400',
    textColor: 'text-sky-300',
    accentColor: 'bg-sky-700',
    imgGlow: 'shadow-sky-400'
  },
  'blue': {
    bg: 'bg-gradient-to-br from-blue-800 via-blue-800 to-blue-400',
    textColor: 'text-blue-300',
    accentColor: 'bg-blue-700',
    imgGlow: 'shadow-blue-400'
  },
  'indigo': {
    bg: 'bg-gradient-to-br from-indigo-800 via-indigo-800 to-indigo-400',
    textColor: 'text-indigo-300',
    accentColor: 'bg-indigo-700',
    imgGlow: 'shadow-indigo-400'
  },
  'violet': {
    bg: 'bg-gradient-to-br from-violet-800 via-violet-800 to-violet-400',
    textColor: 'text-violet-300',
    accentColor: 'bg-violet-700',
    imgGlow: 'shadow-violet-400'
  },
  'purple': {
    bg: 'bg-gradient-to-br from-purple-800 via-purple-800 to-purple-400',
    textColor: 'text-purple-300',
    accentColor: 'bg-purple-700',
    imgGlow: 'shadow-purple-400'
  },
  'fuchsia': {
    bg: 'bg-gradient-to-br from-fuchsia-800 via-fuchsia-800 to-fuchsia-400',
    textColor: 'text-fuchsia-300',
    accentColor: 'bg-fuchsia-700',
    imgGlow: 'shadow-fuchsia-400'
  },
  'pink': {
    bg: 'bg-gradient-to-br from-pink-800 via-pink-800 to-pink-400',
    textColor: 'text-pink-300',
    accentColor: 'bg-pink-700',
    imgGlow: 'shadow-pink-400'
  },
  'rose': {
    bg: 'bg-gradient-to-br from-rose-800 via-rose-800 to-rose-400',
    textColor: 'text-rose-300',
    accentColor: 'bg-rose-700',
    imgGlow: 'shadow-rose-400'
  },
  'slate': {
    bg: 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-400',
    textColor: 'text-slate-300',
    accentColor: 'bg-slate-700',
    imgGlow: 'shadow-slate-400'
  },
  'gray': {
    bg: 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-400',
    textColor: 'text-gray-300',
    accentColor: 'bg-gray-700',
    imgGlow: 'shadow-gray-400'
  },
  'zinc': {
    bg: 'bg-gradient-to-br from-zinc-800 via-zinc-800 to-zinc-400',
    textColor: 'text-zinc-300',
    accentColor: 'bg-zinc-700',
    imgGlow: 'shadow-zinc-400'
  },
  'neutral': {
    bg: 'bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-400',
    textColor: 'text-neutral-300',
    accentColor: 'bg-neutral-700',
    imgGlow: 'shadow-neutral-400'
  },
  'stone': {
    bg: 'bg-gradient-to-br from-stone-800 via-stone-800 to-stone-400',
    textColor: 'text-stone-300',
    accentColor: 'bg-stone-700',
    imgGlow: 'shadow-stone-400'
  }
};
</script>

<template>
	<div class="mt-24">
		<h2 class="text-shadow-[0_8px_30px_rgb(255_255_255_/_0.25)] relative text-5xl font-medium tracking-tight text-balance sm:text-5xl md:text-6xl text-center z-40 mb-8 md:mb-24 size-full -translate-y-6 md:-translate-y-10">
			<p class="mb-3 text-xs font-normal tracking-widest uppercase md:text-sm text-black/70 dark:text-white/70">{{ $t('page.home.projects.line1') }}</p>
			<span class="serif">
				<span class="text-black dark:text-white">{{ $t('page.home.projects.line2') }}</span> 
				<span class="pl-2 tracking-tight italic bg-gradient-to-r from-cyan-400 to-blue-700 bg-clip-text text-transparent">{{ $t('page.home.projects.greeting') }}</span>
			</span>
		</h2>
		<div class="flex relative gap-x-4">
			<div class="grid grid-cols-1 gap-x-6 px-4 lg:px-0 gap-y-6 md:grid-cols-2 lg:flex lg:flex-col lg:gap-y-36 lg:w-7/12">
				<div 
					v-for="project in projects.data" 
					:key="project.id" 
					class="project-item lg:flex justify-end lg:pr-8 items-center rounded-2xl"
				>
					<NuxtLink :to="localePath(`/work#${project.title}`)" class="group block relative max-w-2xl bg-gray-200 dark:bg-gray-900/80  rounded-2xl p-1 lg:p-2 border border-gray-300 dark:border-gray-700 shadow-2xl lg:shadow-gray-800/40">
						<div class="absolute -top-0.5 left-0 w-full h-px glowbig"></div>
						<div :class="styleMap[project.theme]?.bg" class="overflow-hidden rounded-xl pt-2 lg:pt-8 px-8 relative flex flex-col justify-end" >
							<div class="absolute -top-0 left-0 w-full h-px glow"></div>

							<p :class="styleMap[project.theme]?.textColor" class="hidden lg:block serif text-2xl mb-12">
								{{ project.slogan }}
							</p>
							<img class="scale-105 -rotate-3 lg:scale-100 lg:rotate-0 relative top-5 group-hover:scale-105 group-hover:-rotate-3 group-hover:translate-y-4 duration-100 rounded-t-xl shadow-[0px_-4px_25px_0px]"
                :class="styleMap[project.theme]?.imgGlow"
                :src="'https://api.makoto.com.pl'+project.image.url"
                :alt="project.title"
              />
						</div>
					</NuxtLink>
					
					<div class="block mt-3 lg:hidden">
						<h3 class="serif text-xl text-black dark:text-white">{{ project.title }}</h3>
						<div class="py-0.5 text-sm text-neutral-400">
							<p>{{ project.description }}</p>
						</div>
						<div class="tech-stack">
							<UBadge class="text-black dark:text-white" variant="soft" :class="styleMap[project.theme]?.textColor" v-for="tech in project.stack" :key="tech">{{ tech.name }}</UBadge>
						</div>
					</div>

				</div>
			</div>

			<div class="hidden h-[500px] w-5/12 lg:sticky top-64 lg:flex justify-center items-top pt-0">
				<div class="relative w-full h-64">
					<div
						v-for="(project, index) in projects.data"
						:key="project.id"
						class="description-content"
						:class="{ 'is-active': activeProjectIndex === index }"
					>
						<div class="flex">
							<div aria-hidden="true" class="my-4 mr-4 h-1 min-w-6 rounded-full" :class="styleMap[project.theme]?.accentColor"></div>
							<div class="max-w-md">
								<h3 class="serif text-3xl text-black dark:text-white">{{ project.title }}</h3>
								<div class="py-4 text-md text-neutral-400">
									<p>{{ project.description }}</p>
								</div>
								<div class="tech-stack">
									<UBadge class="text-black dark:text-white" variant="subtle" :icon="tech.logo" v-for="tech in project.stack" :key="tech">{{ tech.name }}</UBadge>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>


<style scoped>
.glowbig{
	background: linear-gradient(to right, transparent 5%, white 50%, transparent 95%)
}
.glow{
	background: linear-gradient(to right, transparent 10%, rgba(255, 255, 255, 0.80) 50%, transparent 90%)
}

.description-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0; /* Domyślnie ukryte */
  visibility: hidden;
  transform: translateY(20px); /* Lekko przesunięte w dół */
  transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s;
}

.description-content.is-active {
  opacity: 1; /* Aktywny jest widoczny */
  visibility: visible;
  transform: translateY(0); /* Wjeżdża na swoje miejsce */
}

.tech-stack {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>