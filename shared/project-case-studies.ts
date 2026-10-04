import type { Locale, RichNode } from './content'

export function projectCaseStudy(slug: string, locale: Locale) {
  const pl = locale === 'pl'
  const entries = {
    'hog-copernicus-chapter': {
      summary: pl ? 'Strona internetowa i forum dla HOG Copernicus Chapter z Torunia, organizacji zrzeszającej miłośników motocykli Harley-Davidson.' : 'A website and forum for HOG Copernicus Chapter in Toruń, an organization bringing together Harley-Davidson enthusiasts.',
      seoTitle: pl ? 'HOG Copernicus — strona i forum w Toruniu | Makoto' : 'HOG Copernicus — website and forum in Toruń | Makoto',
      data: {
        projectOwnership: 'client', clientName: 'HOG Copernicus Chapter', clientCity: 'Toruń', industry: pl ? 'Społeczność motocyklistów' : 'Motorcycling community', serviceSlugs: [pl ? 'strony-internetowe' : 'websites'],
        caseStudy: {
          challenge: pl ? 'Organizacja z Torunia zrzeszająca fanów marki Harley-Davidson nie miała własnej strony internetowej ani forum. Celem było stworzenie miejsca, w którym mogłaby zaistnieć w sieci i utrzymywać kontakt z członkami.' : 'The Toruń-based organization of Harley-Davidson enthusiasts had no website or forum. The goal was to establish an online presence and provide a place for members to stay in touch.',
          solution: pl ? 'Stworzyłem stronę prezentującą HOG Copernicus Chapter oraz forum dostępne po zalogowaniu. Serwis przedstawia społeczność, a forum służy członkom do wymiany informacji i rozmów.' : 'I built a website presenting HOG Copernicus Chapter and a forum accessible after signing in. The website introduces the community, while the forum lets members exchange information and keep in touch.',
          outcome: pl ? 'Organizacja zyskała własną obecność w internecie: stronę, na której można poznać chapter, oraz forum do komunikacji między członkami.' : 'The organization gained an online presence: a website where people can learn about the chapter and a forum for communication between members.'
        }
      }
    },
    voidlink: {
      summary: pl ? 'Mój projekt własny: aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi, zbudowana w Tauri 2.0, Nuxt 3 i TypeScript.' : 'My own project: a desktop application for creating and managing Minecraft servers, built with Tauri 2.0, Nuxt 3 and TypeScript.',
      seoTitle: pl ? 'VoidLink — aplikacja do serwerów Minecraft | Makoto' : 'VoidLink — Minecraft server application | Makoto',
      data: {
        projectOwnership: 'own', industry: pl ? 'Minecraft / aplikacje komputerowe' : 'Minecraft / desktop applications', serviceSlugs: [pl ? 'aplikacje-internetowe' : 'web-applications'],
        caseStudy: {
          challenge: pl ? 'Chciałem stworzyć własną aplikację, która ułatwia tworzenie serwerów Minecraft i zarządzanie nimi.' : 'I wanted to build my own application to make creating and managing Minecraft servers easier.',
          solution: pl ? 'Rozwijam VoidLink jako aplikację komputerową opartą na Tauri 2.0, Nuxt 3 i TypeScript, z interfejsem do obsługi serwerów Minecraft.' : 'I develop VoidLink as a desktop application based on Tauri 2.0, Nuxt 3 and TypeScript, with an interface for managing Minecraft servers.',
          outcome: pl ? 'Powstało własne narzędzie do tworzenia i obsługi serwerów Minecraft. VoidLink jest moją aplikacją, rozwijaną jako projekt własny.' : 'The result is my own tool for creating and managing Minecraft servers. VoidLink is an application I develop as a personal project.'
        }
      }
    },
    spectra: {
      summary: pl ? 'Mój launcher do gry Minecraft. Projekt własny z interfejsem zbudowanym w Nuxt i Vue.js oraz przechowywaniem plików w Cloudflare R2.' : 'My Minecraft launcher. A personal project with an interface built in Nuxt and Vue.js and file storage in Cloudflare R2.',
      seoTitle: pl ? 'Spectra — launcher Minecraft | Makoto' : 'Spectra — Minecraft launcher | Makoto',
      data: {
        projectOwnership: 'own', industry: pl ? 'Minecraft / aplikacje dla graczy' : 'Minecraft / gaming applications', serviceSlugs: [pl ? 'aplikacje-internetowe' : 'web-applications'],
        caseStudy: {
          challenge: pl ? 'Celem projektu było stworzenie własnego launchera do gry Minecraft.' : 'The goal was to create my own launcher for Minecraft.',
          solution: pl ? 'Rozwijam Spectra, wykorzystując Nuxt i Vue.js do budowy interfejsu oraz Cloudflare R2 do przechowywania plików.' : 'I develop Spectra using Nuxt and Vue.js for the interface and Cloudflare R2 for file storage.',
          outcome: pl ? 'Spectra to mój własny launcher Minecraft. Projekt łączy aplikację dla graczy z jej stroną internetową.' : 'Spectra is my own Minecraft launcher. The project brings together a gaming application and its website.'
        }
      }
    },
    denalify: {
      summary: pl ? 'Moja aplikacja webowa dla organizacji i mniejszych zespołów: zadania Kanban, CRM, ERP, czat oraz tworzenie sklepów internetowych w Liquid.' : 'My web application for organizations and small teams: Kanban tasks, CRM, ERP, chat and online store creation using Liquid.',
      seoTitle: pl ? 'Denalify — Kanban, CRM i ERP dla zespołów | Makoto' : 'Denalify — Kanban, CRM and ERP for teams | Makoto',
      data: {
        projectOwnership: 'own', clientCity: 'Inowrocław', industry: pl ? 'Systemy dla organizacji i zespołów' : 'Organization and team software', serviceSlugs: [pl ? 'aplikacje-internetowe' : 'web-applications', pl ? 'sklepy-internetowe' : 'online-stores'],
        caseStudy: {
          challenge: pl ? 'Celem było stworzenie własnego systemu, który łączy narzędzia do pracy organizacji i mniejszych zespołów w jednej aplikacji webowej.' : 'The goal was to build my own web application bringing together the tools organizations and small teams use for their work.',
          solution: pl ? 'Rozwijam Denalify z menedżerem zadań Kanban, modułami CRM i ERP, czatem oraz możliwością tworzenia sklepów internetowych w Liquid. Interfejs powstaje w Nuxt i Vue.js, backend w AdonisJS, a pliki są przechowywane w Cloudflare R2.' : 'I develop Denalify with Kanban task management, CRM and ERP modules, chat and online store creation using Liquid. The interface uses Nuxt and Vue.js, the backend uses AdonisJS and files are stored in Cloudflare R2.',
          outcome: pl ? 'Powstała moja aplikacja webowa łącząca zarządzanie zadaniami, relacjami z klientami, procesami organizacji, komunikacją i sklepami internetowymi.' : 'The result is my web application combining task management, customer relationships, organizational processes, communication and online stores.'
        }
      }
    },
    radec24: {
      summary: pl ? 'Strona firmy montującej sufity napinane: projekt identyfikacji, interfejsu oraz wdrożenie serwisu z panelem do edycji treści.' : 'A website for a stretch-ceiling installation company, including brand identity, interface design and a content-managed implementation.',
      seoTitle: pl ? 'Radec24 — strona firmy usługowej | Makoto' : 'Radec24 — service business website | Makoto',
      data: {
        clientName: 'Radec24', industry: pl ? 'Montaż sufitów napinanych' : 'Stretch-ceiling installation', serviceSlugs: [pl ? 'strony-internetowe' : 'websites'],
        caseStudy: {
          challenge: pl ? 'Firma potrzebowała strony prezentującej ofertę oraz możliwości aktualizowania treści bez angażowania programisty przy każdej zmianie.' : 'The business needed a website presenting its services and a way to update content without involving a developer for each change.',
          solution: pl ? 'Przygotowałem logo i identyfikację wizualną, projekt interfejsu w Figma oraz wdrożenie w Nuxt i TypeScript. Strapi pełnił rolę panelu treści połączonego z aplikacją.' : 'I created the logo and visual identity, designed the interface in Figma and implemented the site with Nuxt and TypeScript. Strapi provided the content management interface.',
          outcome: pl ? 'Firma otrzymała spójny serwis i panel umożliwiający samodzielną edycję treści. Projekt objął identyfikację marki, interfejs i wdrożenie obu warstw aplikacji.' : 'The business received a consistent website and a panel for editing its own content. The work covered brand identity, interface design and both application layers.'
        }
      }
    },
    '8bitjelly': {
      summary: pl ? 'Strona grupy tworzącej gry komputerowe, z blogiem do publikowania postępów prac i panelem do samodzielnego zarządzania treścią.' : 'A website for a game development group, with a development blog and a panel for managing content.',
      seoTitle: pl ? '8BitJelly — strona z blogiem i CMS | Makoto' : '8BitJelly — website, blog and CMS | Makoto',
      data: {
        clientName: '8BitJelly', industry: pl ? 'Tworzenie gier komputerowych' : 'Game development', serviceSlugs: [pl ? 'strony-internetowe' : 'websites'],
        caseStudy: {
          challenge: pl ? 'Grupa potrzebowała wspólnego miejsca do przedstawienia projektów i dzielenia się postępami prac nad grami.' : 'The group needed a shared place to present its projects and publish progress on its games.',
          solution: pl ? 'Zaprojektowałem interfejs w Figma i wdrożyłem stronę w Nuxt oraz TypeScript. Panel Strapi pozwalał członkom grupy zarządzać treściami i publikować wpisy na blogu.' : 'I designed the interface in Figma and implemented the site with Nuxt and TypeScript. The Strapi panel let the group manage content and publish blog posts.',
          outcome: pl ? 'Zespół otrzymał oficjalną stronę i kanał publikowania aktualności o grach. Treści bloga można było dodawać przez CMS, bez zmian w kodzie strony.' : 'The team received an official website and a channel for publishing game updates. Blog content could be added through the CMS without changing website code.'
        }
      }
    },
    yescandles: {
      summary: pl ? 'Sklep z ręcznie robionymi świecami i dekoracjami, wdrożony na WordPress i WooCommerce z obsługą produktów, płatności oraz dostaw.' : 'An online store for handmade candles and decorations, implemented with WordPress and WooCommerce, including products, payments and shipping.',
      seoTitle: pl ? 'YesCandles — sklep internetowy WooCommerce | Makoto' : 'YesCandles — WooCommerce online store | Makoto',
      data: {
        clientName: 'YesCandles', industry: pl ? 'Świece i dekoracje' : 'Candles and home decor', serviceSlugs: [pl ? 'sklepy-internetowe' : 'online-stores'],
        caseStudy: {
          challenge: pl ? 'Marka potrzebowała uruchomienia sprzedaży świec i dekoracji online, z kompletnym procesem zakupu.' : 'The brand needed to launch online sales of candles and decorations with a complete purchase process.',
          solution: pl ? 'Przygotowałem projekt interfejsu w Figma, skonfigurowałem WordPress i WooCommerce oraz dostosowałem sklep do marki. Wdrożenie obejmowało produkty, bramki płatności i metody wysyłki.' : 'I designed the interface in Figma, configured WordPress and WooCommerce and adapted the store to the brand. The implementation included products, payment gateways and shipping methods.',
          outcome: pl ? 'Klient otrzymał sklep pozwalający prezentować ofertę i obsługiwać zakupy online. Produkty i zamówienia były zarządzane w panelu WooCommerce.' : 'The client received a store for presenting products and handling online purchases. Products and orders were managed in WooCommerce.'
        }
      }
    }
  }
  const entry = entries[slug as keyof typeof entries]
  if (!entry) return undefined
  const body: RichNode | undefined = ['hog-copernicus-chapter', 'voidlink', 'spectra', 'denalify'].includes(slug)
    ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: entry.summary }] }] }
    : undefined
  return { ...entry, body }
}
