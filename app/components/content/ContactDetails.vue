<script setup lang="ts">
const { locale } = useI18n()
const { info } = await useSiteContact()
</script>

<template>
  <address class="makoto-muted space-y-3 text-sm leading-relaxed not-italic">
    <p class="font-semibold text-black dark:text-white">{{ info.name }}</p>
    <p v-if="info.areas.length">{{ locale === 'pl' ? 'Obszar współpracy:' : 'Working with businesses in:' }} {{ info.areas.join(', ') }}</p>
    <div class="flex flex-wrap gap-x-5 gap-y-2">
      <a :href="`mailto:${info.email}`" class="link-underline">{{ info.email }}</a>
      <a v-if="info.phoneHref" :href="info.phoneHref" class="link-underline">{{ info.phone }}</a>
      <a v-if="info.mapsUrl" :href="info.mapsUrl" target="_blank" rel="noopener noreferrer" class="link-underline">{{ locale === 'pl' ? 'Profil w Google' : 'Google Business Profile' }} <UIcon name="i-mkt-arrow-up-right" class="inline size-3" aria-hidden="true" /></a>
    </div>
    <p v-if="info.note" class="max-w-2xl">{{ info.note }}</p>
  </address>
</template>
