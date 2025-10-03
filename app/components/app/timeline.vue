<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-16 relative">
    <!-- Główna linia timeline -->
    <div class="absolute left-[35.5%] transform -translate-x-1/2 top-0 bottom-0 w-px bg-gray-700 hidden md:block"></div>
    
    <!-- Animowana linia postępu -->
    <div 
      class="timeline-progress absolute left-[35.5%] transform -translate-x-1/2 top-0 w-px hidden md:block"
      :style="{ 
        backgroundColor: accentColor,
        height: progressHeight + '%',
        boxShadow: `0 0 10px ${accentColor}`
      }"
    ></div>

    <div class="space-y-16">
      <div
        v-for="(item, index) in timelineData"
        :key="item.id || index"
        class="timeline-item relative"
        :data-index="index"
      >
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_2fr] gap-8 items-start">
          <!-- Lewa kolumna -->
          <div
            class="timeline-left md:text-left space-y-2 opacity-0 transition-all duration-700"
            :class="{ 'timeline-visible': true }"
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
              class="timeline-dot w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-600 relative z-10 transition-all duration-500"
              :class="{ 'dot-active': false }"
            ></div>
          </div>

          <!-- Prawa kolumna -->
          <div
            class="timeline-right space-y-3 opacity-0 transition-all duration-700"
            :class="{ 'timeline-visible': true }"
          >
            <h4 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ item.title || item.Title }}
            </h4>
            <StrapiBlocksRichText class="text-gray-300 leading-relaxed !text-sm" :body="item.description" />

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
const progressHeight = ref(0)

const handleScroll = () => {
  const timelineContainer = document.querySelector('.max-w-7xl')
  if (!timelineContainer) return

  const containerRect = timelineContainer.getBoundingClientRect()
  const containerTop = containerRect.top
  const containerHeight = containerRect.height
  const windowHeight = window.innerHeight

  // Oblicz procent przewinięcia timeline
  const scrollStart = containerTop
  const scrollEnd = containerTop + containerHeight - windowHeight
  const scrollProgress = Math.max(0, Math.min(1, -scrollStart / (containerHeight - windowHeight)))
  
  progressHeight.value = scrollProgress * 100

  // Animacja elementów
  const items = document.querySelectorAll('.timeline-item')
  
  items.forEach((item) => {
    const rect = item.getBoundingClientRect()
    const isVisible = rect.top < windowHeight * 0.8 && rect.bottom > 0
    
    const leftContent = item.querySelector('.timeline-left')
    const rightContent = item.querySelector('.timeline-right')
    const dot = item.querySelector('.timeline-dot')
    
    if (isVisible) {
      leftContent.classList.add('timeline-visible')
      rightContent.classList.add('timeline-visible')
      
      // Sprawdź czy kropka jest w zakresie animowanej linii
      const dotRect = dot.getBoundingClientRect()
      const dotCenter = dotRect.top + dotRect.height / 2
      const progressLine = document.querySelector('.timeline-progress')
      const progressRect = progressLine?.getBoundingClientRect()
      
      if (progressRect && dotCenter <= progressRect.bottom) {
        dot.classList.add('dot-active')
        dot.style.backgroundColor = accentColor.value
        dot.style.transform = 'scale(1.3)'
        dot.style.boxShadow = `0 0 20px ${accentColor.value}`
      } else {
        dot.classList.remove('dot-active')
        dot.style.backgroundColor = ''
        dot.style.transform = 'scale(1)'
        dot.style.boxShadow = 'none'
      }
    } else {
      leftContent.classList.remove('timeline-visible')
      rightContent.classList.remove('timeline-visible')
      dot.classList.remove('dot-active')
      dot.style.backgroundColor = ''
      dot.style.transform = 'scale(1)'
      dot.style.boxShadow = 'none'
    }
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.timeline-progress {
  transition: height 0.1s linear;
}

.timeline-left {
  transform: translateX(-30px);
}

.timeline-right {
  transform: translateX(30px);
}

.timeline-left.timeline-visible,
.timeline-right.timeline-visible {
  opacity: 1 !important;
  transform: translateX(0);
}

.timeline-dot {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (max-width: 768px) {
  .timeline-left,
  .timeline-right {
    transform: translateY(20px);
  }
  
  .timeline-left.timeline-visible,
  .timeline-right.timeline-visible {
    transform: translateY(0);
  }
}
</style>