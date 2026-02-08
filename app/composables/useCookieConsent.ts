export interface CookieConsentState {
  analytics: boolean
  marketing: boolean
}

const COOKIE_NAME = 'cookie_consent'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

export function useCookieConsent() {
  const consentCookie = useCookie<CookieConsentState | null>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    default: () => null,
  })

  const showBanner = useState('cookie-banner-visible', () => consentCookie.value === null)
  const showSettings = useState('cookie-settings-visible', () => false)

  const hasConsented = computed(() => consentCookie.value !== null)

  const consentState = useState<CookieConsentState>('cookie-consent-state', () => ({
    analytics: consentCookie.value?.analytics ?? false,
    marketing: consentCookie.value?.marketing ?? false,
  }))

  function getConsentModeSignals(state: CookieConsentState) {
    return {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      personalization_storage: state.marketing ? 'granted' : 'denied',
    } as const
  }

  function updateGoogleConsent(state: CookieConsentState) {
    if (!import.meta.client) return
    const w = window as any
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', getConsentModeSignals(state))
    }
  }

  function loadTrackingScripts(state: CookieConsentState) {
    if (!import.meta.client) return

    if (state.marketing) {
      injectGTM()
      injectFBPixel()
      injectAdSense()
    }

    if (state.analytics) {
      injectUmami()
    }
  }

  function saveConsent(state: CookieConsentState) {
    consentCookie.value = state
    consentState.value = state
    showBanner.value = false
    showSettings.value = false
    updateGoogleConsent(state)
    loadTrackingScripts(state)
  }

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true })
  }

  function rejectAll() {
    saveConsent({ analytics: false, marketing: false })
  }

  function savePreferences() {
    saveConsent({ ...consentState.value })
  }

  // On app init: if user already consented, restore consent signals + scripts
  function initConsent() {
    if (!import.meta.client) return
    if (consentCookie.value) {
      updateGoogleConsent(consentCookie.value)
      loadTrackingScripts(consentCookie.value)
    }
  }

  return {
    showBanner,
    showSettings,
    hasConsented,
    consentState,
    acceptAll,
    rejectAll,
    savePreferences,
    initConsent,
  }
}

// --- Script injection helpers ---

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v))
  document.head.appendChild(script)
}

function injectInlineScript(content: string, id: string) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.textContent = content
  document.head.appendChild(script)
}

function injectGTM() {
  injectInlineScript(
    `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MMVH46RC');`,
    'gtm-script'
  )
}

function injectFBPixel() {
  injectInlineScript(
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1516447535903195');fbq('track','PageView');`,
    'fb-pixel-script'
  )
}

function injectAdSense() {
  injectScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7443176231652937', {
    crossorigin: 'anonymous',
  })
}

function injectUmami() {
  injectScript('https://cloud.umami.is/script.js', {
    defer: '',
    'data-website-id': '84056d40-a170-4a24-9d8a-e10d2144dd7e',
  })
}
