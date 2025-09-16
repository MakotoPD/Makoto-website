export const useGsap = () => {
  const { $gsap, $ScrollTrigger, $ScrollToPlugin, $Draggable } = useNuxtApp()
  return { gsap: $gsap, ScrollTrigger: $ScrollTrigger, ScrollToPlugin: $ScrollToPlugin, Draggable: $Draggable }
}