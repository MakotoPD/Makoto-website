<template>
  <div ref="viewport" class="model-viewport">
    <TresCanvas v-bind="gl" :style="{ pointerEvents: 'none', touchAction: 'auto' }" :render-mode="isAnimating ? 'always' : 'on-demand'" :dpr="[1, 1.5]">
      <TresPerspectiveCamera :position="[0, 0, 0.9]" />
      <TresAmbientLight />
      <TresDirectionalLight :position="[1, 1, 2]" />
      <Stars :rotation="[0, yRotation, 0]" :radius="50" :depth="50" :count="5000" :size="0.3" :size-attenuation="true" />
      <TresGroup ref="modelRef" :rotation="[0, -0.4, -0.2]">
        <Suspense><ModelsLogo :animated="isAnimating" /></Suspense>
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { BasicShadowMap, NoToneMapping, SRGBColorSpace } from 'three'
import { useIntersectionObserver, usePreferredReducedMotion, useDocumentVisibility } from '@vueuse/core'

const viewport = useTemplateRef('viewport')
const modelRef = ref()
const yRotation = shallowRef(0)
const reducedMotion = usePreferredReducedMotion()
const visibility = useDocumentVisibility()
const inView = ref(true)
useIntersectionObserver(viewport, ([entry]) => { inView.value = entry?.isIntersecting ?? false })
const isAnimating = computed(() => reducedMotion.value !== 'reduce' && inView.value && visibility.value === 'visible')
let frameId = 0
let lastFrame = 0
const animate = (time: number) => {
  const delta = lastFrame ? Math.min((time - lastFrame) / 1000, .1) : 0
  lastFrame = time
  yRotation.value += .02 * delta
  if (modelRef.value) modelRef.value.rotation.y -= delta * .8
  frameId = requestAnimationFrame(animate)
}
onMounted(() => {
  watch(isAnimating, (running) => {
    cancelAnimationFrame(frameId)
    lastFrame = 0
    if (running) frameId = requestAnimationFrame(animate)
  }, { immediate: true })
})
onBeforeUnmount(() => cancelAnimationFrame(frameId))
const gl = { shadows: true, alpha: true, clearAlpha: 0, shadowMapType: BasicShadowMap, outputColorSpace: SRGBColorSpace, toneMapping: NoToneMapping }
</script>

<style scoped>
.model-viewport { width: 100%; height: 100%; pointer-events: none; touch-action: auto; }
</style>
