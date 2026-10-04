import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  features: { inlineStyles: false },
  vite: { plugins: [tailwindcss()] },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@tresjs/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
    'nuxt-vitalizer',
    '@nuxtjs/turnstile',
    'nuxt-gtag'
  ],
  image: { domains: ['makoto.com.pl'] },
  tres: { devtools: false, glsl: true },
  build: { transpile: ['gsap'] },
  nitro: { externals: { external: ['sharp'] } },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  ui: { colorMode: true },
  googleFonts: {
    download: true,
    display: 'swap',
    families: {
      'Roboto Flex': '100..900',
      Outfit: '100..900',
      'Instrument Serif': '100..900',
      'Playfair Display': '100..900'
    }
  },
  turnstile: { siteKey: process.env.TURNSTILE_SITE_KEY },
  i18n: {
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json', dir: 'ltr' },
      { code: 'pl', name: 'Polski', language: 'pl-PL', file: 'pl.json', dir: 'ltr' }
    ],
    langDir: 'lang/',
    defaultLocale: 'en',
    baseUrl: 'https://makoto.com.pl',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'i18n_locale', redirectOn: 'root' }
  },
  gtag: { id: 'G-7P472XF9TT' },
  runtimeConfig: {
    public: {
      siteUrl: 'https://makoto.com.pl',
      adminTurnstileSiteKey: process.env.NODE_ENV === 'development' ? '1x00000000000000000000AA' : process.env.TURNSTILE_SITE_KEY || ''
    }
  },
  icon: {
    customCollections: [{ prefix: 'mkt', dir: './app/assets/icons' }]
  },
  postcss: { plugins: { '@tailwindcss/postcss': {} } },
  routeRules: {
    '/panel/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/admin': { redirect: { to: '/panel', statusCode: 308 } },
    '/api/admin/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Makoto',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/icon512_maskable.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  }
})
