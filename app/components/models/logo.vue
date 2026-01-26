<template>
  <Environment preset="city" />
  
  <!-- First curve with liquid glass effect -->
  <TresMesh 
    ref="mesh1Ref" 
    :geometry="nodes.Curve.geometry"
    :position="[nodes.Curve.position.x, nodes.Curve.position.y, nodes.Curve.position.z]"
    :rotation="[nodes.Curve.rotation.x, nodes.Curve.rotation.y, nodes.Curve.rotation.z]"
    :scale="[nodes.Curve.scale.x, nodes.Curve.scale.y, nodes.Curve.scale.z]"
  >
    <TresMeshTransmissionMaterial
      :transmission="0"
      :thickness="0.4"
      :roughness="0.05"
      :ior="1.6"
      :color="new THREE.Color('#88ccff')"
      :transparent="true"
      :chromatic-aberration="0.08"
      :anisotropic-blur="0.4"
      :distortion="0.15"
      :distortion-scale="0.6"
      :temporal-distortion="0.1"
      :_transmission="1"
      :attenuation-distance="0.5"
      :attenuation-color="new THREE.Color('#ffffff')"
    />
  </TresMesh>
  
  <!-- Second curve with liquid glass effect -->
  <TresMesh 
    ref="mesh2Ref" 
    :geometry="nodes.Curve001.geometry"
    :position="[nodes.Curve001.position.x, nodes.Curve001.position.y, nodes.Curve001.position.z]"
    :rotation="[nodes.Curve001.rotation.x, nodes.Curve001.rotation.y, nodes.Curve001.rotation.z]"
    :scale="[nodes.Curve001.scale.x, nodes.Curve001.scale.y, nodes.Curve001.scale.z]"
  >
    <TresMeshTransmissionMaterial
      :transmission="0"
      :thickness="0.4"
      :roughness="0.05"
      :ior="1.6"
      :color="new THREE.Color('#88ccff')"
      :transparent="true"
      :chromatic-aberration="0.08"
      :anisotropic-blur="0.4"
      :distortion="0.15"
      :distortion-scale="0.6"
      :temporal-distortion="0.1"
      :_transmission="1"
      :attenuation-distance="0.5"
      :attenuation-color="new THREE.Color('#ffffff')"
    />
  </TresMesh>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'
import { extend, useTresContext, useRenderLoop } from '@tresjs/core'
import { MeshTransmissionMaterialImpl } from '~/utils/MeshTransmissionMaterialImpl'

// Get color mode for theme-aware background
const colorMode = useColorMode()

// Extend TresJS with our custom material
extend({ MeshTransmissionMaterial: MeshTransmissionMaterialImpl })

const { nodes } = await useGLTF('/models/makoto.glb')

const mesh1Ref = shallowRef<THREE.Mesh | null>(null)
const mesh2Ref = shallowRef<THREE.Mesh | null>(null)

const { scene, renderer, camera } = useTresContext()

// Create FBO for transmission buffer
const fboResolution = 1024
const fboMain = new THREE.WebGLRenderTarget(fboResolution, fboResolution, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  type: THREE.HalfFloatType,
  samples: 4,
  format: THREE.RGBAFormat,
})

// Render loop for FBO updates
const { onLoop } = useRenderLoop()
let elapsedTime = 0

onLoop(({ delta }) => {
  if (!renderer.value || !camera.value || !scene.value) return
  
  elapsedTime += delta
  
  const meshes = [mesh1Ref.value, mesh2Ref.value].filter(Boolean) as THREE.Mesh[]
  if (meshes.length === 0) return
  
  const sceneRef = scene.value
  const gl = renderer.value
  
  // Store original state
  const oldBg = sceneRef.background
  const oldClearColor = gl.getClearColor(new THREE.Color())
  const oldClearAlpha = gl.getClearAlpha()
  
  // Hide all glass meshes
  const oldVisibilities = meshes.map(mesh => {
    const v = mesh.visible
    mesh.visible = false
    return v
  })
  
  // Set background based on theme for proper transmission
  const isLightMode = colorMode.value === 'light'
  const bgColor = isLightMode ? new THREE.Color(0xffffff) : new THREE.Color(0x000000)
  sceneRef.background = bgColor
  gl.setClearColor(bgColor, 1)
  
  // Render scene to FBO
  gl.setRenderTarget(fboMain)
  gl.clear()
  gl.render(sceneRef, camera.value)
  gl.setRenderTarget(null)
  
  // Restore original state
  gl.setClearColor(oldClearColor, oldClearAlpha)
  sceneRef.background = oldBg
  
  // Restore visibility and update materials
  meshes.forEach((mesh, i) => {
    mesh.visible = oldVisibilities[i] ?? true
    
    const mat = mesh.material as MeshTransmissionMaterialImpl
    if (mat && mat.uniforms) {
      mat.uniforms.time.value = elapsedTime
      mat.uniforms.buffer.value = fboMain.texture
    }
  })
})

// Cleanup
onUnmounted(() => {
  fboMain.dispose()
})
</script>