<script setup lang="ts">
definePageMeta({ layout: 'admin', i18n: false, pageTransition: false })
useSeoMeta({ title: 'Ochrona | Panel Makoto', robots: 'noindex, nofollow' })
const session = usePanelSession()
</script>
<template><PanelSecurity :csrf="session?.csrf || ''" /></template>
