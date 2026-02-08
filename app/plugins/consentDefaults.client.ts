export default defineNuxtPlugin({
  name: 'consent-defaults',
  enforce: 'pre',
  setup() {
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }
  // @ts-ignore - assign gtag globally for Consent Mode v2
  window.gtag = gtag

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    personalization_storage: 'denied',
    wait_for_update: 500,
  })
  },
})

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
