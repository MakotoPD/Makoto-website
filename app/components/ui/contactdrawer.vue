<script setup lang="ts">
const { locale } = useI18n()
</script>

<template>
  <UDrawer
    :title="locale === 'pl' ? 'Wyślij zapytanie' : 'Send an enquiry'"
    :description="locale === 'pl' ? 'Opisz projekt, a skontaktuję się z Tobą, aby ustalić szczegóły.' : 'Describe your project and I will follow up to discuss the details.'"
    handle-only
    should-scale-background
    set-background-color-on-scale
  >
    <slot />
    <template #close>
      <UButton color="neutral" variant="ghost" icon="i-mkt-x" :aria-label="locale === 'pl' ? 'Zamknij formularz kontaktowy' : 'Close contact form'" />
    </template>
    <template #body>
      <UiConnectform embedded />
    </template>
  </UDrawer>
</template>
