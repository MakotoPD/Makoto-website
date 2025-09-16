<template>
  <Environment preset="city" />
  <primitive :object="nodes.Curve" >
    <MeshPhysicalMaterial color="#049ef4" :roughness="1" emissive="#4754ff" :ior="1" :iridescence="1" :iridescenceIOR="2.16" :clearcoat="0.8" />
  </primitive>
  <primitive :object="nodes.Curve001">
    <MeshPhysicalMaterial color="#049ef4" :roughness="1" emissive="#4754ff" :ior="1" :iridescence="1" :iridescenceIOR="2.16" :clearcoat="0.8"  />
  </primitive>
</template>

<script setup lang="ts">
import { useGLTF } from '@tresjs/cientos'


const { scene: model, nodes } = await useGLTF('/models/makoto.glb')

</script>