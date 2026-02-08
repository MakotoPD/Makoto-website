// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

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

	modules: ['@nuxt/ui', '@nuxt/image', '@nuxtjs/color-mode', '@nuxt/scripts', '@tresjs/nuxt', '@nuxtjs/google-fonts', '@nuxtjs/i18n', '@nuxtjs/strapi', 'nuxt-vitalizer', '@nuxtjs/sitemap', '@nuxtjs/turnstile', '@nuxtjs/fontaine', 'nuxt-gtag'],


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
		siteKey: process.env.TURNSTILE,
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

	strapi: {
		url: process.env.STRAPI_URL,
		token: process.env.STRAPI_TOKEN,
		prefix: '/api',
		admin: '/admin',
		version: 'v5',
		cookie: {
			path: '/',
			maxAge: 14 * 24 * 60 * 60,
			secure: process.env.NODE_ENV === 'production',
			sameSite: true
		},
		cookieName: 'strapi_jwt'
	},

	gtag: {
		id: 'G-7P472XF9TT',
	},

	runtimeConfig: {

		strapiToken: process.env.STRAPI_TOKEN,
		turnstile: {
			secretKey: process.env.TURNSTILE,
		},
		public: {
			apiUrl: process.env.STRAPI_URL,
			siteUrl: 'https://makoto.com.pl'
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
					name: 'keywords',
					content: 'strony internetowe inowrocław, strony internetowe, strony, internetowe, inowrocław, łódź, bydgoszcz, toruń, strony internetowe bydgoszcz, strony internetowe toruń, strony internetowe torun, programista stron internetowych, tworzenie stron www, nowoczesne technologie webowe, Nuxt.js, Vue.js, React, optymalizacja SEO, responsywne strony, projektowanie stron internetowych, wsparcie techniczne, HTML5, CSS3, JavaScript, Node.js, WordPress, portfolio web development, usługi webowe, aktualizacja stron, utrzymanie stron internetowych, rozwój aplikacji webowych, Makoto, MakotoPD, web developer, website development, modern web technologies, Nuxt.js, Vue.js, React, SEO optimization, responsive websites, web design, technical support, HTML5, CSS3, JavaScript, Node.js, WordPress, web development portfolio, web services, website updates, website maintenance, web application development, Tworzenie stron internetowych Inowrocław, Profesjonalne strony internetowe, Projektowanie stron WWW, Nowoczesne strony internetowe, Projektowanie logo Inowrocław, Branding graficzny, Responsywne strony internetowe, Sklepy internetowe na zamówienie, Strony internetowe dla firm, Tworzenie sklepów internetowych, Projektowanie UI/UX, Web development Inowrocław, Grafik na zamówienie, Tworzenie logo na zamówienie, SEO optymalizacja stron, Profesjonalne bannery reklamowe, Tworzenie stron korporacyjnych, Projektowanie stron e-commerce, Pozycjonowanie stron internetowych, Kreatywne logo dla firm, Tworzenie unikalnych projektów graficznych, Innowacyjne strony internetowe, Studio graficzne Inowrocław, Grafik komputerowy na zlecenie, Skuteczna reklama online, Projektowanie identyfikacji wizualnej, Przebudowa i optymalizacja stron, Nowoczesny design stron, Wsparcie i aktualizacje stron internetowych, Projektowanie banerów internetowych, Profesjonalna grafika dla firm, Kompleksowe usługi graficzne, Strony internetowe dla międzynarodowych klientów, Tworzenie animowanych grafik, Wizualizacje dla stron WWW, Usługi projektowania graficznego, Blog o projektowaniu stron internetowych, Inowrocław usługi graficzne, Tworzenie minimalistycznych logo, Kreatywne rozwiązania graficzne, Projektowanie mobilnych wersji stron, Grafika komputerowa i branding, Rozwój i projektowanie stron, Studio tworzenia stron WWW, Optymalizacja stron pod SEO, Profesjonalne portfolio online, Nowe technologie w projektowaniu stron, Tworzenie treści SEO, Branding i wizerunek marki, Tworzenie stron dla startupów, Unikalne projekty graficzne, Projektowanie stron w oparciu o WordPress, Freelancer Inowrocław web developer, Projektowanie stron przyjaznych użytkownikom, Grafika komputerowa Inowrocław, Nowoczesne logo dla firm, Zwiększanie widoczności online, Usługi zdalnego web developmentu, Banery reklamowe na zamówienie, Grafik i web designer w Inowrocław.'
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
					href: 'https://dmakoto.com.pl'
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