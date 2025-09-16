import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Draggable } from 'gsap/Draggable'

export default defineNuxtPlugin(() => {
  // Dzięki nazwie pliku `.client.ts`, Nuxt gwarantuje, że ten kod
  // uruchomi się tylko w przeglądarce, gdzie obiekty DOM są dostępne.
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable)

  // Udostępnienie instancji GSAP i wtyczek całej aplikacji
  return {
    provide: {
      gsap,
      ScrollTrigger,
      ScrollToPlugin,
      Draggable,
    },
  }
})