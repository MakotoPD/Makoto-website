<template>
    <div
      ref="containerRef"
      :style="{
        width: '100%',
        aspectRatio: '1 / 0.4',
        margin: 'auto',
        position: 'relative',
      }"
    >
      <canvas
        ref="canvasRef"
        :style="{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          opacity: canvasOpacity,
          transition: 'opacity 1s ease',
        }"
        style="width: 500px; height: 500px; user-select: none;"
        width="1000"
        height="1000"
      >
      </canvas>
    </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let globe: any = null
let phi = 0
let width = 0
const canvasOpacity = ref(0)
let pointerInteracting: number | null = null

function resizeGlobe() {
  if (containerRef.value && canvasRef.value) {
    width = containerRef.value.offsetWidth
    if (globe && typeof globe.resize === 'function') {
      globe.resize(width * 2, width * 2 * 0.4)
    }
  }
}

const MARKERS = [
  { location: [37.7595, -122.4367], size: 0.05 },
  { location: [40.7128, -74.006], size: 0.1 },
  { location: [52.1423, 20.3612], size: 0.1 },
  { location: [-6.6090, -36.1789], size: 0.05 },
  { location: [-35.4713, 149.8242], size: 0.1 },
  { location: [35.6630, 139.7411], size: 0.05 },
]

async function createOrUpdateGlobe() {
  if (!canvasRef.value) return

  // Zniszcz stary glob przed stworzeniem nowego
  if (globe?.destroy) globe.destroy()
  canvasOpacity.value = 0

  try {
    const { default: createGlobe } = await import('cobe')
    const isDark = colorMode.preference === 'dark'

    resizeGlobe()

    globe = createGlobe(canvasRef.value, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2 * 0.4,
      phi: 0,
      theta: 0,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      scale: 1.5,
      mapSamples: 16000,
      mapBrightness: 0.98,
      baseColor: [1, 1, 1],
      markerColor: [0.4, 0.8, 1],
      glowColor: isDark
        ? [52 / 225, 92 / 255, 112 / 255]
        : [168 / 225, 202 / 255, 219 / 255],
      offset: [0, -0.3],
      markers: MARKERS,
      onRender: (state: any) => {
        if (!pointerInteracting) phi += 0.004
        state.phi = phi
        state.width = width * 2
        state.height = width * 2 * 0.7
        state.scale = 1.5
        state.offset = [0, -0.3]
      },
    })

    canvasOpacity.value = 1
    canvasRef.value.addEventListener('contextmenu', e => e.preventDefault())
  } catch (error) {
    console.error('Failed to initialize globe:', error)
  }
}

let stopColorWatch: (() => void) | null = null

onMounted(() => {
  window.addEventListener('resize', resizeGlobe)
  stopColorWatch = watch(colorMode, createOrUpdateGlobe, { immediate: true })
})

onUnmounted(() => {
  stopColorWatch?.()
  globe?.destroy?.()
  window.removeEventListener('resize', resizeGlobe)
})
</script>
