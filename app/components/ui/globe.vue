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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
const colorMode = useColorMode()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let globe: any = null
let phi = 0
let theta = 0
let width = 0
const canvasOpacity = ref(0)


// Dragging state
let isDragging = false
let pointerInteracting: number | null = null
let pointerInteractionMovement = 0
let lastPointerX = 0

function resizeGlobe() {
  if (containerRef.value && canvasRef.value) {
    width = containerRef.value.offsetWidth
    if (globe && typeof globe.resize === 'function') {
      globe.resize(width * 2, width * 2 * 0.4)
    }
  }
}

onMounted(async () => {
  watch(
    colorMode,
    async () => {
      if (process.client && canvasRef.value) {
        await nextTick()
        try {
            // Dynamically import cobe only on client side
            const cobeModule = await import('cobe')
            const createGlobe = cobeModule.default || cobeModule
            resizeGlobe()
              if(colorMode.preference == 'dark'){
                globe = createGlobe(canvasRef.value, {
                  devicePixelRatio: 2,
                  width: width * 2,
                  height: width * 2 * 0.4,
                  phi: 0,
                  theta: 0,
                  dark: 1,
                  diffuse: 1.2,
                  scale: 1.5,  // Increased scale to make globe bigger
                  mapSamples: 16000,
                  mapBrightness: 0.98,
                  baseColor: [1, 1, 1],
                  markerColor: [0.4, 0.8, 1],
                  glowColor: [52/225, 92/255, 112/255],
                  offset: [0, -0.3],  // Move globe up to show only top 2/3
                  markers: [
                    { location: [37.7595, -122.4367], size: 0.05 },
                    { location: [40.7128, -74.006], size: 0.1 },
                    { location: [52.1423, 20.3612], size: 0.1 },
                    { location: [-6.6090, -36.1789], size: 0.05 },
                    { location: [-35.4713, 149.8242], size: 0.1 },
                    { location: [35.6630, 139.7411], size: 0.05 },
                  ],
                  onRender: (state: any) => {
                    // Called on every animation frame.
                    // `state` will be an empty object, return updated params.
                    if (!pointerInteracting) {
                      phi += 0.004
                    }
                    state.phi = phi
                    state.theta = theta
                    state.width = width * 2
                    state.height = width * 2 * 0.7
                    state.scale = 1.5
                    state.offset = [0, -0.3]
                  },
                })
              } else {
                globe = createGlobe(canvasRef.value, {
                devicePixelRatio: 2,
                width: width * 2,
                height: width * 2 * 0.4,
                phi: 0,
                theta: 0,
                dark: 0,
                diffuse: 1.2,
                scale: 1.5,  // Increased scale to make globe bigger
                mapSamples: 16000,
                mapBrightness: 0.98,
                baseColor: [1, 1, 1],
                markerColor: [0.4, 0.8, 1],
                glowColor: [168/225, 202/255, 219/255],
                offset: [0, -0.3],  // Move globe up to show only top 2/3
                markers: [
                  { location: [37.7595, -122.4367], size: 0.05 },
                  { location: [40.7128, -74.006], size: 0.1 },
                  { location: [52.1423, 20.3612], size: 0.1 },
                  { location: [-6.6090, -36.1789], size: 0.05 },
                  { location: [-35.4713, 149.8242], size: 0.1 },
                  { location: [35.6630, 139.7411], size: 0.05 },
                ],
                onRender: (state: any) => {
                  // Called on every animation frame.
                  // `state` will be an empty object, return updated params.
                  if (!pointerInteracting) {
                    phi += 0.004
                  }
                  state.phi = phi
                  state.theta = theta
                  state.width = width * 2
                  state.height = width * 2 * 0.7
                  state.scale = 1.5
                  state.offset = [0, -0.3]
                },
              })
              }
              
            setTimeout(() => {
            canvasOpacity.value = 1
          }, 0)

            // Add mouse/touch event listeners for dragging
            const canvas = canvasRef.value
            window.addEventListener('resize', resizeGlobe)
            // Mouse events
            // canvas.addEventListener('mousedown', onPointerDown)
            // canvas.addEventListener('mousemove', onPointerMove)
            // canvas.addEventListener('mouseup', onPointerUp)
            // canvas.addEventListener('mouseleave', onPointerUp)
            
            // // Touch events
            // canvas.addEventListener('touchstart', onTouchStart, { passive: false })
            // canvas.addEventListener('touchmove', onTouchMove, { passive: false })
            // canvas.addEventListener('touchend', onPointerUp)
            
            // Prevent context menu on right click
            canvas.addEventListener('contextmenu', (e) => e.preventDefault())
            
        } catch (error) {
          console.error('Failed to initialize globe:', error)
        }
      }
    },
    { immediate: true }
  )

})

const onPointerDown = (e: MouseEvent) => {
  pointerInteracting = e.clientX - pointerInteractionMovement
  lastPointerX = e.clientX
  isDragging = true
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grabbing'
  }
}

const onTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (touch) {
    pointerInteracting = touch.clientX - pointerInteractionMovement
    lastPointerX = touch.clientX
	isDragging = true
  }
}

const onPointerMove = (e: MouseEvent) => {
  if (pointerInteracting !== null) {
    const deltaX = e.clientX - lastPointerX
    
    pointerInteractionMovement = e.clientX - pointerInteracting
    phi = phi + deltaX * 0.003  // Reduced sensitivity from 0.01 to 0.003
    // Removed vertical (theta) rotation
    
    lastPointerX = e.clientX
  }
}

const onTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (pointerInteracting !== null && e.touches.length > 0) {
    const touch = e.touches[0]
    if (touch) {
      const deltaX = touch.clientX - lastPointerX
      
      pointerInteractionMovement = touch.clientX - pointerInteracting
      phi = phi + deltaX * 0.003  // Reduced sensitivity from 0.01 to 0.003
      // Removed vertical (theta) rotation
      
      lastPointerX = touch.clientX
    }
  }
}

const onPointerUp = () => {
  pointerInteracting = null
  isDragging = false
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grab'
  }
}

onUnmounted(() => {
  if (globe && typeof globe.destroy === 'function') {
    globe.destroy()
  }
  
  // Clean up event listeners
  if (canvasRef.value) {
    const canvas = canvasRef.value
    canvas.removeEventListener('mousedown', onPointerDown)
    canvas.removeEventListener('mousemove', onPointerMove)
    canvas.removeEventListener('mouseup', onPointerUp)
    canvas.removeEventListener('mouseleave', onPointerUp)
    canvas.removeEventListener('touchstart', onTouchStart as any)
    canvas.removeEventListener('touchmove', onTouchMove as any)
    canvas.removeEventListener('touchend', onPointerUp)
  }
})

onBeforeUnmount(() => {
  if (globe) globe.destroy()
  window.removeEventListener('resize', resizeGlobe)
})
</script>