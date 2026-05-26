import { ref, getCurrentInstance, onUnmounted } from 'vue'

export const useReducedMotion = () => {
  const reduced = ref(false)

  if (import.meta.client) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches

    const handler = (e: MediaQueryListEvent) => { reduced.value = e.matches }
    mq.addEventListener('change', handler)

    if (getCurrentInstance()) {
      onUnmounted(() => mq.removeEventListener('change', handler))
    }
  }

  return reduced
}
