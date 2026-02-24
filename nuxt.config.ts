// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {
		enabled: true
	},

	features: {
		inlineStyles: false
	},

	vite: {
		plugins: [
			tailwindcss()
		]
	},

	modules: [
		'@nuxt/ui', 
		'@nuxt/image', 
		'@nuxtjs/color-mode', 
		'@nuxt/scripts', 
		'@tresjs/nuxt', 
		'@nuxtjs/google-fonts', 
		'@nuxtjs/i18n', 
		'nuxt-vitalizer', 
		'@nuxtjs/sitemap', 
		'@nuxtjs/turnstile', 
		'@nuxtjs/fontaine', 
		'nuxt-gtag'
	],


	image: {
		domains: ['makoto.com.pl', 'api.makoto.com.pl'],
		strapi: {
			baseURL: 'https://api.makoto.com.pl'
		}
	},

	sitemap: {
		hostname: 'https://makoto.com.pl',
		gzip: true,
		defaults: {
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
		},
		autoLastmod: true,
		exclude: ['/panel/**'],
		sources: [
			'/api/__sitemap__/blog'
		],
		i18n: true,
		autoI18n: true,
	},

	site: {
		url: 'https://makoto.com.pl',
	},

	tres: {
		devtools: true,
		glsl: true,
	},

	build: {
		transpile: ['gsap', 'sharp'],
	},

	tailwindcss: {
		config: {
			content: [
				'./app/components/**/*.{js,vue,ts}',
				'./app/layouts/**/*.vue',
				'./app/pages/**/*.vue',
				'.app/plugins/**/*.{js,ts}',
				'./nuxt.config.{js,ts}',
			],
			plugins: [
				require('@tailwindcss/typography'),
			],
		},
	},

	css: [
		'~/assets/css/main.css',
	],


	colorMode: {
		preference: 'dark',
		fallback: 'dark',
		hid: 'nuxt-color-mode-script',
		globalName: '__NUXT_COLOR_MODE__',
		componentName: 'ColorScheme',
		classPrefix: '',
		classSuffix: '',
		storageKey: 'nuxt-color-mode'
	},

	ui: {
		colorMode: true
	},

	googleFonts: {
		download: true,
		display: 'swap',
		families: {
			'Roboto Flex': '100..900',
			'Outfit': '100..900',
			'Instrument Serif': '100..900',
			'Playfair Display': '100..900'
		}
	},

	turnstile: {
		siteKey: process.env.TURNSTILE_SITE_KEY,
	},


	i18n: {
		locales: [{
				code: 'en',
				name: 'English',
				iso: 'en-US',
				file: 'en.json',
				dir: 'ltr'
			},
			{
				code: 'pl',
				name: 'Polski',
				iso: 'pl-PL',
				file: 'pl.json',
				dir: 'ltr'
			}
		],
		langDir: 'lang/',
		defaultLocale: 'en',
		baseUrl: 'https://makoto.com.pl',
		strategy: 'prefix_except_default',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_locale',
			redirectOn: 'root',
		}
	},

	gtag: {
		id: 'G-7P472XF9TT',
	},

	runtimeConfig: {
		turnstile: {
			secretKey: process.env.TURNSTILE_SECRET_KEY,
		},
		public: {
			apiUrl: process.env.STRAPI_URL || 'https://api.makoto.com.pl',
			siteUrl: 'https://makoto.com.pl',
			web3formsKey: process.env.WEB3FORMS_KEY || '',
		}
	},



	postcss: {
		plugins: {
			'@tailwindcss/postcss': {},
		},
	},

	app: {
		pageTransition: {
			name: 'page',
			mode: 'out-in'
		},
		head: {
			title: 'Makoto - Website Developer and Graphic designer',
			meta: [{
					charset: 'utf-8'
				},
				{
					name: 'viewport',
					content: 'width=device-width, initial-scale=1'
				},
				{
					name: 'format-detection',
					content: 'telephone=no'
				},
				{
					name: 'description',
					content: 'Makoto - Web developer. Experienced web developer offers modern, responsive designs, SEO optimization and technical support. Specializing in JavaScript, VueJS and more. Create exceptional websites with us!'
				},
					{
					name: 'og:image',
					content: '/og.png'
				}
			],
			link: [{
					rel: 'icon',
					type: 'image/png',
					href: '/favicon.png'
				},
				{
					rel: 'alternate',
					hreflang: 'pl-PL',
					href: 'https://makoto.com.pl/pl'
				},
				{
					rel: 'alternate',
					hreflang: 'en',
					href: 'https://makoto.com.pl'
				},
				{
					rel: 'alternate',
					hreflang: 'x-default',
					href: 'https://makoto.com.pl'
				},
				{
					rel: 'canonical',
					href: 'https://makoto.com.pl'
				},
				{
					rel: 'apple-touch-icon',
					sizes: '512x512',
					href: '/icon512_maskable.png'
				},
				{
					rel: 'manifest',
					href: '/manifest.json'
				}
			],
			script: [
				{
					type: 'application/ld+json',
					children: '{"@context": "https://schema.org","@type": "Corporation","name": "Makoto - Strony internetowe","alternateName": "MakotoPD","url": "https://makoto.com.pl/","logo": "https://makoto.com.pl/logo.png","contactPoint": {"@type": "ContactPoint","telephone": "500408357","contactType": "customer service","contactOption": ["TollFree","HearingImpairedSupported"],"areaServed": "PL","availableLanguage": ["Polish","en"]},"sameAs": ["https://www.facebook.com/MakotoPL","https://www.instagram.com/MakotoPD","https://www.linkedin.com/in/makotopd/","https://www.github.com/MakotoPD","https://www.makoto.com.pl"],"keywords":"programista stron internetowych, tworzenie stron www, nowoczesne technologie webowe, Nuxt.js, Vue.js, React, optymalizacja SEO, responsywne strony, projektowanie stron internetowych, wsparcie techniczne, HTML5, CSS3, JavaScript, Node.js, WordPress, portfolio web development, usługi webowe, aktualizacja stron, utrzymanie stron internetowych, rozwój aplikacji webowych, Makoto, MakotoPD, web developer, website development, modern web technologies, Nuxt.js, Vue.js, React, SEO optimization, responsive websites, web design, technical support, HTML5, CSS3, JavaScript, Node.js, WordPress, web development portfolio, web services, website updates, website maintenance, web application development"}'
				},
			],
		},

	},

})