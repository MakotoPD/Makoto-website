<template>
	<TresCanvas v-bind="gl" >
		<TresPerspectiveCamera :position="[0, 0, 0.9]"/>
		<TresAmbientLight />
		<TresDirectionalLight :position="[1, 1, 2]" />
		<Stars
			:rotation="[0, yRotation, 0]"
			:radius="50"
			:depth="50"
			:count="5000"
			:size="0.3"
			:size-attenuation="true"
		/>
		<TresGroup ref="modelRef" :rotation="[0, 0, -0.2]">
			<Suspense>
				<ModelsLogo/>
				
			</Suspense>
		</TresGroup>
	</TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'

import { BasicShadowMap, NoToneMapping, SRGBColorSpace } from 'three'

const modelRef = ref()

const { onLoop } = useRenderLoop()
const yRotation = shallowRef(0)
onLoop(({ delta }) => {
	yRotation.value += 0.02 * delta
})
onMounted(() => {
	onLoop(({ delta }) => {
		if(modelRef.value) {
			modelRef.value.rotation.y -= delta * 0.8
			modelRef.value.position.y = progress.value * 2
		}
	})
})

const progress = ref(0)

const gl = {

  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}

</script>