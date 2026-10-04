<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  label?: string
  locale?: string
  cover?: string
  revision?: string
}>(), { title: 'Makoto', description: '', label: 'Patryk Dąbrowski', locale: 'en', cover: '' })
const fontSize = computed(() => props.title.length > 95 ? 48 : props.title.length > 65 ? 58 : 70)
</script>

<template>
  <div style="width: 1200px; height: 630px; display: flex; position: relative; overflow: hidden; background: #101214; color: #f1f0ee; font-family: 'Outfit'; padding: 54px 60px;">
    <div style="position: absolute; left: 0; top: 0; width: 1200px; height: 630px; display: flex;">
      <div v-for="n in 65" :key="n" :style="{ position: 'absolute', left: `${(n * 137) % 1200}px`, top: `${(n * 83) % 630}px`, width: n % 4 === 0 ? '3px' : '2px', height: n % 4 === 0 ? '3px' : '2px', borderRadius: '50%', background: '#45545c', opacity: 0.45 }" />
    </div>
    <div style="display: flex; flex-direction: column; justify-content: space-between; position: relative; width: 100%; height: 100%;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="/Sygnet.svg" width="44" height="36" />
        <span style="font-size: 27px; font-weight: 600;">Makoto</span>
        <span style="margin-left: auto; font-size: 18px; color: #9ba7ae;">makoto.com.pl</span>
      </div>
      <div style="display: flex; align-items: center; gap: 42px;">
        <div :style="{ display: 'flex', flexDirection: 'column', width: cover ? '695px' : '1020px' }">
          <div style="display: flex; font-size: 19px; color: #66cff3; margin-bottom: 22px;">{{ label }}</div>
          <div :style="{ fontFamily: 'Playfair Display', fontSize: `${fontSize}px`, lineHeight: 1.13, fontWeight: 500, maxHeight: '245px', overflow: 'hidden' }">{{ title }}</div>
          <div style="font-size: 23px; line-height: 1.5; margin-top: 26px; color: #a4acb1; max-height: 105px; overflow: hidden;">{{ description.slice(0, 180) }}</div>
        </div>
        <div v-if="cover" style="display: flex; width: 330px; height: 300px; border: 1px solid #39424a; border-radius: 18px; overflow: hidden;">
          <img :src="cover" width="330" height="300" style="object-fit: cover;" />
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; font-size: 18px; color: #a4acb1;">
        <img src="/imgs/smallAvatar.jpg" width="34" height="34" style="border-radius: 50%; object-fit: cover;" />
        <span>Patryk Dąbrowski</span>
        <span style="margin-left: auto; color: #66cff3;">{{ locale === 'pl' ? 'Strony · Sklepy · Aplikacje' : 'Websites · E-commerce · Applications' }}</span>
      </div>
    </div>
  </div>
</template>
