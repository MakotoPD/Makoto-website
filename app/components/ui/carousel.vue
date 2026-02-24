<template>
<div class="carousel-container">
	<div class="carousel-track-wrapper">
		<div class="carousel-track scroll-left">
			<div v-for="(badge, index) in [...topBadges, ...topBadges]" :key="`top-${index}`">
				<UBadge
				size="lg"
				color="neutral"
				variant="outline"
				:icon="badge.logo"
				
				>
					{{ badge.name }}
				</UBadge>
			</div>
		</div>
	</div>

	<div class="carousel-track-wrapper">
		<div class="carousel-track scroll-right">
			<div v-for="(badge, index) in [...middleBadges, ...middleBadges]" :key="`middle-${index}`">
				<UBadge
				size="lg"
				color="neutral"
				variant="outline"
				:icon="badge.logo"
				
				>
					{{ badge.name }}
				</UBadge>
			</div>
		</div>
	</div>

	<div class="carousel-track-wrapper">
		<div class="carousel-track scroll-left">
			<div v-for="(badge, index) in [...bottomBadges, ...bottomBadges]" :key="`bottom-${index}`">
				<UBadge
				size="lg"
				color="neutral"
				variant="outline"
				:icon="badge.logo"
				
				>
					{{ badge.name }}
				</UBadge>
			</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
// Zdefiniuj dane dla swoich plakietek. 
// Możesz je wczytywać z API lub zdefiniować bezpośrednio tutaj.
const topBadges = [
  { name: 'NuxtJS', logo:'i-mkt-nuxt-icon' },
  { name: 'TailwindCSS', logo:'i-mkt-tailwindcss-icon' },
  { name: 'VueJS', logo:'i-mkt-vue' },
  { name: 'TypeScript', logo:'i-mkt-typescript-icon' },
  { name: 'GraphQL', logo:'i-mkt-graphql' },
];

const middleBadges = [
  { name: 'NuxtUI', logo:'i-mkt-vueuse' },
  { name: 'Fastify', logo:'i-mkt-fastify' },
  { name: 'NodeJS', logo:'i-mkt-nodejs-icon' },
  { name: 'Express', logo:'i-mkt-express' },
  { name: 'Pinia', logo:'i-mkt-pinia' },
];

const bottomBadges = [
  { name: 'Docker', logo:'i-mkt-docker-icon' },
  { name: 'Bun', logo:'i-mkt-bun' },
  { name: 'Framer', logo:'i-mkt-framer' },
  { name: 'Strapi', logo:'i-mkt-strapi-icon' },
  { name: 'Figma', logo:'i-mkt-figma' },
];
</script>

<style scoped>
.carousel-container {
  display: flex;
  flex-direction: column;
  gap: 3rem; /* Odstęp między rzędami */
  width: 100%;
  padding: 2rem 0;
}

.carousel-track-wrapper {
  overflow: hidden; /* Ukrywa elementy, które wychodzą poza kontener */
  width: 100%;
}

.carousel-track {
  display: flex;
  gap: 2rem; /* Odstęp między plakietkami */
  /* Klucz do płynnej animacji: szerokość musi być wystarczająca, aby pomieścić powielone elementy */
  width: fit-content; 
}

/* Definicja animacji przewijania */
@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    /* Przesuwamy o -50%, ponieważ mamy powieloną listę. 
      Gdy pierwsza połowa zniknie z ekranu, animacja się zresetuje, 
      a druga połowa będzie dokładnie w pozycji startowej, co daje efekt pętli.
    */
    transform: translateX(-50%);
  }
}

.scroll-left {
  animation: scroll 30s linear infinite;
}

.scroll-right {
  /* Używamy tej samej animacji, ale w odwrotnym kierunku */
  animation: scroll 40s linear infinite reverse;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2a2a2a;
  color: #f0f0f0;
  border-radius: 1rem;
  border: 1px solid #444;
  white-space: nowrap; /* Zapobiega łamaniu tekstu */
  font-family: sans-serif;
  font-size: 0.9rem;
  cursor: default;
  transition: background-color 0.2s ease;
}

.badge:hover {
    background-color: #3f3f3f;
}

/* Efekt gradientu na krawędziach, aby przewijanie wyglądało na bardziej naturalne */
.carousel-track-wrapper {
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%);
}
</style>