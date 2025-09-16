import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

export default defineNuxtPlugin((nuxtApp) => {
  // Rejestrujemy wtyczkę w aplikacji Vue, przekazując opcje inicjalizacji
  nuxtApp.vueApp.use(Particles, {
    init: async (engine) => {
      // Asynchronicznie ładujemy silnik cząsteczek
      await loadSlim(engine);
    },
  });
});