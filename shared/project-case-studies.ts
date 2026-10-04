import type { Locale } from './content'

export function projectCaseStudy(slug: string, locale: Locale) {
  const pl = locale === 'pl'
  const entries = {
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
  return entries[slug as keyof typeof entries]
}
