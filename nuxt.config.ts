// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {
		enabled: true
	},

	modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/scripts', '@tresjs/nuxt', '@nuxtjs/google-fonts', '@nuxtjs/i18n'],
	
	// Konfiguracja Nuxt Image – wymuszenie providera IPX (lokalny),
	// dzięki czemu obrazy z katalogu `public/` działają bez zewnętrznych usług
	image: {
		provider: process.env.NUXT_IMAGE_PROVIDER || 'ipx',
		// Domyślny katalog publicznych assetów – używamy ścieżek zaczynających się od '/'
		// np. <NuxtImg src="/imgs/steel-flower.webp" />
		quality: 85,
		format: ['webp', 'avif', 'jpeg'],
		// Jeśli użyjesz zewnętrznych źródeł, dodaj je tutaj
		domains: ['dev.makoto.com.pl', 'makoto.com.pl']
	},

	tres: {
		devtools: true,
		glsl: true,
	},

	build: {
		transpile: ['gsap', 'sharp'],
	},

	css: [
		'~/assets/css/main.css',
	],


	colorMode: {
		preference: 'system', // domyślnie używaj preferencji systemowych
		fallback: 'dark', // fallback gdy nie można wykryć preferencji
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
		families: {
			Poppins: '100..900',
			'Roboto Flex': '100..900',
			'Instrument Serif': '100..900'
		}
	},


	i18n: {
		locales: [
			{
				code: 'en',
				name: 'English',
				iso: 'en-US',
				file: 'en.json'
			},
			{
				code: 'pl',
				name: 'Polski',
				iso: 'pl-PL',
				file: 'pl.json'
			}
		],
		langDir: 'lang/',
		defaultLocale: 'en',
		strategy: 'no_prefix', // Unika przekierowań URL
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_locale',
			redirectOn: 'root',
			alwaysRedirect: false, // Zapobiega automatycznym przekierowaniom
		}
	},

	runtimeConfig: {

		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://api.makoto.com.pl'
		}
	},

	postcss: {
		plugins: {
		  '@tailwindcss/postcss': {},
		},
	  },

	app: {
		head: {
			title: 'Makoto - Web developer',
			htmlAttrs: {
				lang: 'en',
			},
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
					hreflang: 'pl',
					href: 'https://makoto.com.pl/pl'
				},
				{
					rel: 'alternate',
					hreflang: 'en-GB',
					href: 'https://makoto.com.pl'
				},
				{
					rel: 'canonical',
					href: 'https://makoto.com.pl'
				}
			],
			script: [{
					children: "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MMVH46RC');"
				},
				{
					children: "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '1516447535903195');fbq('track', 'PageView');"
				},
				{
					defer: true,
					src: 'https://cloud.umami.is/script.js',
					"data-website-id": '84056d40-a170-4a24-9d8a-e10d2144dd7e'
				},
				{
					type: 'application/ld+json',
					children: '{"@context": "https://schema.org","@type": "Corporation","name": "Makoto","alternateName": "MakotoPD","url": "https://makoto.com.pl/","logo": "https://makoto.com.pl/logo.png","contactPoint": {"@type": "ContactPoint","telephone": "500408357","contactType": "customer service","contactOption": ["TollFree","HearingImpairedSupported"],"areaServed": "PL","availableLanguage": ["Polish","en"]},"sameAs": ["https://www.facebook.com/MakotoPL","https://www.instagram.com/MakotoPD","https://www.linkedin.com/in/makotopd/","https://www.github.com/MakotoPD","https://www.makoto.com.pl"],"keywords":"programista stron internetowych, tworzenie stron www, nowoczesne technologie webowe, Nuxt.js, Vue.js, React, optymalizacja SEO, responsywne strony, projektowanie stron internetowych, wsparcie techniczne, HTML5, CSS3, JavaScript, Node.js, WordPress, portfolio web development, usługi webowe, aktualizacja stron, utrzymanie stron internetowych, rozwój aplikacji webowych, Makoto, MakotoPD, web developer, website development, modern web technologies, Nuxt.js, Vue.js, React, SEO optimization, responsive websites, web design, technical support, HTML5, CSS3, JavaScript, Node.js, WordPress, web development portfolio, web services, website updates, website maintenance, web application development"}'
				},
				{
					async: true,
					src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7443176231652937',
					crossorigin: "anonymous"
				}
			],
		},

	},

})