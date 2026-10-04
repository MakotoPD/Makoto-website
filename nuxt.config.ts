import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

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
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    'nuxt-ai-ready',
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
  fonts: {
    defaults: { display: 'swap', subsets: ['latin', 'latin-ext'] },
    families: [
      { name: 'Outfit', provider: 'fontsource', weights: ['100 900'], styles: ['normal'], global: true },
      { name: 'Roboto Flex', provider: 'fontsource', weights: ['100 900'], styles: ['normal'], global: true },
      { name: 'Playfair Display', provider: 'fontsource', weights: ['400 900'], styles: ['normal', 'italic'], global: true },
      { name: 'Instrument Serif', provider: 'fontsource', weights: [400], styles: ['normal', 'italic'], global: true }
    ]
  },
  site: { url: 'https://makoto.com.pl', name: 'Makoto', defaultLocale: 'en-US', trailingSlash: false },
  seo: { canonicalQueryWhitelist: [], metaDataFiles: false },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    excludeAppSources: true,
    autoI18n: false,
    autoLastmod: false,
    cacheMaxAgeSeconds: 300,
    credits: false
  },
  robots: {
    disallow: ['/panel', '/admin', '/preview', '/__preview', '/pl/panel', '/pl/admin', '/pl/preview', '/pl/__preview', '/api/admin/', '/api/content/', '/api/__sitemap__/'],
    credits: false
  },
  schemaOrg: {
    identity: {
      type: 'Person', name: 'Patryk Dąbrowski', alternateName: 'Makoto',
      image: '/imgs/smallAvatar.jpg', url: 'https://makoto.com.pl/about',
      email: 'contact@makoto.com.pl', jobTitle: 'Web Developer'
    }
  },
  ogImage: {
    defaults: { width: 1200, height: 630, extension: 'png', emojis: false, cacheMaxAgeSeconds: 86400 },
    security: { maxDimension: 1600, maxDpr: 1, maxQueryParamSize: 4096, renderTimeout: 10000, restrictRuntimeImagesToOrigin: true }
  },
  aiReady: {
    database: false,
    webmcp: false,
    contentNegotiation: false,
    sitemapMd: false,
    agentSkills: false,
    markdownCacheHeaders: { maxAge: 300, swr: false }
  },
  hooks: {
    'nitro:config'(config) {
      config.handlers = (config.handlers || []).filter(handler => !['/llms.txt', '/llms-full.txt'].includes(handler.route || ''))
      for (const name of ['llms.txt', 'llms-full.txt']) {
        config.handlers.push({ route: `/${name}`, handler: resolve(config.rootDir || '.', `server/handlers/${name}.get.ts`) })
      }
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
    '/panel/**': { robots: false, ogImage: false, schemaOrg: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/preview/**': { robots: false, ogImage: false, schemaOrg: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/__preview/**': { robots: false, ogImage: false, schemaOrg: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/admin': { redirect: { to: '/panel', statusCode: 308 } },
    '/api/admin/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Makoto',
      titleTemplate: '%s',
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
