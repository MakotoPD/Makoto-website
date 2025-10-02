<template>
  <div ref="timelineContainer" class="w-full max-w-7xl mx-auto px-4 py-16 relative">
    <!-- Główna linia timeline -->
    <div ref="timelineLine" class="absolute left-[35.5%] transform -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
    
    <!-- Animowana linia postępu -->
    <div 
      ref="progressLine"
      class="timeline-progress absolute left-[35.5%] transform -translate-x-1/2 top-0 w-px hidden md:block"
      :style="{ 
        backgroundColor: accentColor,
        height: '0%',
        boxShadow: `0 0 10px ${accentColor}`
      }"
    ></div>

    <div class="space-y-16">
      <div
        v-for="(item, index) in timelineData"
        :key="index"
        class="timeline-item relative"
        :data-index="index"
      >
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_2fr] gap-8 items-start">
          <!-- Lewa kolumna -->
          <div
            class="timeline-left md:text-left space-y-2 opacity-0"
          >
            <h3 class="text-4xl serif">
              {{ item.company }}
            </h3>
            <div class="text-gray-600 dark:text-gray-400 space-y-1">
              <p class="font-medium text-sm">
                {{ item.from }} - {{ item.to }}
              </p>
              <p v-if="item.isRemote" class="text-sm flex items-center md:justify-start gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Remote
              </p>
              <p v-else class="text-sm flex items-center md:justify-start gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ item.location }}
              </p>
            </div>
          </div>

          <!-- Środek - Timeline -->
          <div class="timeline-center flex flex-col items-center relative z-10">
            <div
              class="timeline-dot w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-600 relative z-10"
            ></div>
          </div>

          <!-- Prawa kolumna -->
          <div
            class="timeline-right space-y-3 opacity-0"
          >
            <h4 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ item.Title }}
            </h4>
            <StrapiBlocksRichText class="text-gray-700 dark:text-gray-300 leading-relaxed !text-sm" :body="item.description" />

            <div class="flex flex-wrap gap-2">
              <UBadge variant="soft" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      {
        company: 'Tech Corp',
        from: '2022',
        to: '2024',
        location: 'Warsaw, Poland',
        isRemote: false,
        title: 'Senior Frontend Developer',
        description: 'Led the development of modern web applications using Vue.js and Nuxt. Implemented responsive designs and optimized performance.',
        tags: ['Vue.js', 'Nuxt', 'TypeScript', 'Tailwind CSS']
      },
      {
        company: 'Digital Agency',
        from: '2020',
        to: '2022',
        location: '',
        isRemote: true,
        title: 'Full Stack Developer',
        description: 'Developed and maintained multiple client projects. Worked with both frontend and backend technologies.',
        tags: ['React', 'Node.js', 'MongoDB', 'AWS']
      },
      {
        company: 'StartUp Inc',
        from: '2018',
        to: '2020',
        location: 'Krakow, Poland',
        isRemote: false,
        title: 'Junior Developer',
        description: 'Started career in web development. Learned modern frameworks and best practices.',
        tags: ['JavaScript', 'HTML', 'CSS', 'Git']
      }
    ]
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
})

const timelineData = ref(props.data)
const accentColor = ref(props.color)
const timelineContainer = ref(null)
const progressLine = ref(null)
const timelineLine = ref(null)

let scrollTriggerInstances = []

onMounted(() => {
  if (!timelineContainer.value) return

  // Animacja linii postępu
  const progressAnimation = gsap.to(progressLine.value, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: timelineContainer.value,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    }
  })
  scrollTriggerInstances.push(progressAnimation.scrollTrigger)

  // Animacja dla każdego elementu timeline
  const items = timelineContainer.value.querySelectorAll('.timeline-item')
  
  items.forEach((item, index) => {
    const leftContent = item.querySelector('.timeline-left')
    const rightContent = item.querySelector('.timeline-right')
    const dot = item.querySelector('.timeline-dot')

    // Animacja lewej kolumny
    const leftAnim = gsap.fromTo(leftContent,
      {
        opacity: 0,
        x: -50
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse'
        }
      }
    )
    scrollTriggerInstances.push(leftAnim.scrollTrigger)

    // Animacja prawej kolumny
    const rightAnim = gsap.fromTo(rightContent,
      {
        opacity: 0,
        x: 50
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse'
        }
      }
    )
    scrollTriggerInstances.push(rightAnim.scrollTrigger)

    // Animacja kropki
    const dotAnim = gsap.fromTo(dot,
      {
        backgroundColor: '#d1d5db',
        scale: 1,
        boxShadow: 'none'
      },
      {
        backgroundColor: accentColor.value,
        scale: 1.3,
        boxShadow: `0 0 20px ${accentColor.value}`,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: item,
          start: 'top 60%',
          end: 'top 40%',
          toggleActions: 'play none none reverse'
        }
      }
    )
    scrollTriggerInstances.push(dotAnim.scrollTrigger)
  })
})

onUnmounted(() => {
  // Cleanup ScrollTrigger instances
  scrollTriggerInstances.forEach(st => {
    if (st) st.kill()
  })
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>

<style scoped>
.timeline-progress {
  transition: none;
}

@media (max-width: 768px) {
  .timeline-left,
  .timeline-right {
    transform: translateY(20px);
  }
}
</style>