<template>
	<blockquote class="relative p-4 mb-4 bg-gray-950/40 border border-[#222530] rounded-xl">
		<div class=" backdrop-blur-sm absolute -left-4 -top-4 flex items-center justify-center h-10 w-10 bg-gray-950/40 border border-[#222530] rounded-lg">
			<UIcon name="i-lucide-quote" class="size-5" />
		</div>
		<h3 v-if="title" class="text-xl font-semibold serif">{{ title }}</h3>
		<p class="text-lg italic leading-relaxed text-gray-100/90">{{ body }}</p>
	</blockquote>
  </template>
  
  <script setup lang="ts">
  defineProps<{
	title?: string;
	body: string;
  }>();
  </script>