<template>
	<UError
		:ui="{
			statusCode: 'text-8xl serif font-light italic text-sky-500',
			statusMessage: 'serif mt-2 text-4xl sm:text-5xl font-bold text-highlighted text-balance'
		}"
		:clear="{
		color: 'neutral',
		size: 'xl',
		icon: 'i-mkt-arrow-left',
		class: 'rounded-xl hover:scale-105 duration-300'
		}"
		:error="{
		statusCode: error?.statusCode,
		statusMessage: error?.statusMessage,
		}"
	/>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
	error: Object as () => NuxtError
})

</script>