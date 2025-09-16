<template>
  <TresMeshTransmissionMaterial
    :args="[props.samples, props.transmissionSampler]"
    ref="materialRef"
    v-bind="filteredProps"
    :_transmission="props.transmission"
    :transmission="props.transmissionSampler ? props.transmission : 0"
    :anisotropicBlur="anisotropicBlur"
  />
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { extend, useRenderLoop } from '@tresjs/core'
import { useFBO } from '@tresjs/cientos'
import { shallowRef, computed, onMounted, watch, getCurrentInstance } from 'vue'
import { MeshTransmissionMaterialImpl } from '~/utils/MeshTransmissionMaterialImpl'
import { DiscardMaterial } from '~/utils/DiscardMaterial'

// Rozszerzamy Tres, aby mógł używać naszego materiału jako komponentu
extend({ MeshTransmissionMaterial: MeshTransmissionMaterialImpl })

// Definicja propsów, analogiczna do tej z Reacta
interface MeshTransmissionMaterialProps {
  transmissionSampler?: boolean
  backside?: boolean
  side?: THREE.Side
  transmission?: number
  thickness?: number
  backsideThickness?: number
  backsideEnvMapIntensity?: number
  samples?: number
  resolution?: number
  backsideResolution?: number
  background?: THREE.Texture | THREE.Color
  buffer?: THREE.Texture
  chromaticAberration?: number
  anisotropy?: number
  anisotropicBlur?: number
  distortion?: number
  distortionScale?: number
  temporalDistortion?: number
  envMapIntensity?: number
}

const props = withDefaults(defineProps<MeshTransmissionMaterialProps>(), {
  transmissionSampler: false,
  backside: false,
  side: THREE.FrontSide,
  transmission: 1,
  thickness: 0,
  backsideThickness: 0,
  backsideEnvMapIntensity: 1,
  samples: 10,
  resolution: undefined,
  backsideResolution: undefined,
  background: undefined,
  buffer: undefined,
  chromaticAberration: 0.03,
  anisotropy: 0.1,
  anisotropicBlur: undefined,
  distortion: 0,
  distortionScale: 0.5,
  temporalDistortion: 0,
  envMapIntensity: 1,
})

// Odfiltrowanie propsów, które nie powinny być przekazywane bezpośrednio do <TresMeshTransmissionMaterial>
const filteredProps = computed(() => {
  const { buffer, transmission, anisotropicBlur, ...rest } = props
  return rest
})

const anisotropicBlur = computed(() => props.anisotropicBlur ?? props.anisotropy)

const materialRef = shallowRef<MeshTransmissionMaterialImpl | null>(null)
const discardMaterial = new DiscardMaterial()

// Używamy useFBO z @tresjs/cientos do tworzenia buforów renderowania
const fboBack = useFBO({ width: props.backsideResolution || props.resolution, height: props.backsideResolution || props.resolution })
const fboMain = useFBO({ width: props.resolution, height: props.resolution })

let parent: THREE.Mesh | null = null

// Pobieramy rodzica (obiekt Mesh), do którego przypięty jest materiał
onMounted(() => {
  const instance = getCurrentInstance()
  if (instance?.parent?.ctx) {
    parent = (instance.parent.ctx as any).instance as THREE.Mesh
  }
  // Set the initial buffer AFTER the first mount so that it is never the active draw target
  // if (materialRef.value) {
  //   materialRef.value.buffer = props.buffer ?? fboMain.value.texture
  // }
})

const { onLoop } = useRenderLoop()

onLoop(({ delta, clock, renderer, scene, camera }) => {
  if (!materialRef.value || !parent) return

  materialRef.value.time = clock.getElapsedTime()

  if (materialRef.value.buffer === fboMain.value.texture && !props.transmissionSampler) {
    // Zapisz stan początkowy
    const oldTone = renderer.toneMapping
    const oldBg = scene.background
    const oldEnvMapIntensity = (parent.material as MeshTransmissionMaterialImpl).envMapIntensity

    // Przełącz mapowanie tonów i tło
    renderer.toneMapping = THREE.NoToneMapping
    if (props.background) scene.background = props.background
    parent.material = discardMaterial

    if (props.backside) {
      // Renderowanie "tyłu" do bufora fboBack
      renderer.setRenderTarget(fboBack.value)
      renderer.render(scene, camera)

      // Przygotowanie materiału do głównego renderowania z użyciem bufora fboBack
      parent.material = materialRef.value
      materialRef.value.buffer = fboBack.value.texture
      materialRef.value.thickness = props.backsideThickness
      materialRef.value.side = THREE.BackSide
      materialRef.value.envMapIntensity = props.backsideEnvMapIntensity
    }

    // Renderowanie "przodu" do bufora fboMain
    renderer.setRenderTarget(fboMain.value)
    renderer.render(scene, camera)

    // Przywróć stan renderera
    scene.background = oldBg
    renderer.setRenderTarget(null)
    renderer.toneMapping = oldTone

    // Ustawienie ostatecznych właściwości materiału (już PO zwolnieniu fboMain)
    parent.material = materialRef.value
    materialRef.value.thickness = props.thickness
    materialRef.value.side = props.side
    materialRef.value.buffer = fboMain.value.texture
    materialRef.value.envMapIntensity = oldEnvMapIntensity
  }
})

// Wystawiamy ref dla rodzica (opcjonalne, ale dobra praktyka)
defineExpose({
  value: materialRef,
})
</script>