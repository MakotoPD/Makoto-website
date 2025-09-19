<template>
	<blockquote class="p-4 my-4 border-l-4 border-gray-300 bg-gray-50">
	  <h3 v-if="title" class="text-xl font-semibold">{{ title }}</h3>
	  <p class="text-lg italic leading-relaxed text-gray-900">"{{ body }}"</p>
	</blockquote>
  </template>
  
  <script setup lang="ts">
  defineProps<{
	title?: string;
	body: string;
  }>();
  </script>