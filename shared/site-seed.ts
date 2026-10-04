import type { ContentKind, Locale, RichNode } from './content'
import { improveLocalContent, buyerGuides } from './local-seo-content.ts'

export interface Seed {
  kind: ContentKind
  locale: Locale
  slug: string
  translationGroup: string
  title: string
  summary: string
  body: RichNode
  sections: Record<string, unknown>[]
  data: Record<string, unknown>
  seoTitle: string
  seoDescription: string
}

const doc = (text: string): RichNode => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
const processPl = ['Rozmowa o celu i odbiorcach', 'Ustalenie zakresu i wycena', 'Projekt i akceptacja kierunku', 'Implementacja', 'Testy na urządzeniach', 'Wdrożenie i opieka']
const processEn = ['Discuss goals and audience', 'Agree scope and estimate', 'Design and approve direction', 'Implementation', 'Testing across devices', 'Launch and ongoing care']

const services = [
  {
    key: 'websites', slugs: { pl: 'strony-internetowe', en: 'websites' },
    pl: {
      title: 'Strony internetowe dla firm', summary: 'Projektuję i tworzę strony, które jasno przedstawiają ofertę i ułatwiają kontakt z firmą. Obsługuję klientów z Inowrocławia, Torunia, Bydgoszczy i okolic.',
      audience: ['Firmy usługowe, które potrzebują czytelnej oferty online', 'Marki odświeżające przestarzałą stronę', 'Zespoły, którym trudno samodzielnie aktualizować treści'],
      scope: ['Architektura informacji i układ pod potrzeby klientów', 'Responsywny interfejs z dostępną nawigacją i formularzami', 'Szybkie ładowanie, podstawy technicznego SEO i pomiar działania', 'Panel do edycji treści, gdy jest potrzebny'],
      pricing: ['Liczba i złożoność podstron', 'Projekt indywidualny lub adaptacja istniejącej identyfikacji', 'Funkcje takie jak formularze, wielojęzyczność i integracje', 'Przygotowanie treści oraz zakres późniejszej opieki'],
      faq: [
        ['Czy mogę później zmieniać teksty?', 'Tak. Jeśli potrzebujesz samodzielnej edycji, uwzględnimy panel treści w zakresie projektu.'],
        ['Czy strona będzie działać na telefonie?', 'Tak. Układ i formularze projektuję z myślą o małych ekranach oraz obsłudze klawiaturą.'],
        ['Ile kosztuje strona?', 'Wycenę przygotowuję po rozmowie o liczbie widoków, treściach i funkcjach. Nie podaję kwoty bez poznania zakresu.']
      ],
      related: ['radec24', '8bitjelly', 'hog-copernicus-chapter']
    },
    en: {
      title: 'Business websites', summary: 'I design and build websites that explain what a business offers and make it easy to get in touch. I work with clients in Inowrocław, Toruń, Bydgoszcz and nearby areas.',
      audience: ['Service businesses that need a clear online offer', 'Brands replacing an outdated website', 'Teams that need to update content themselves'],
      scope: ['Information architecture shaped around customer questions', 'Responsive interface with accessible navigation and forms', 'Fast loading, technical SEO foundations and performance measurement', 'Content editing tools where needed'],
      pricing: ['Number and complexity of pages', 'Bespoke design or adapting existing brand materials', 'Forms, languages and integrations', 'Content preparation and ongoing support'],
      faq: [
        ['Can I edit the text later?', 'Yes. We can include a content editor in the project scope.'],
        ['Will it work on mobile?', 'Yes. I design layouts and forms for small screens and keyboard use.'],
        ['How much does a website cost?', 'I prepare an individual estimate after discussing pages, content and features.']
      ],
      related: ['radec24', '8bitjelly', 'hog-copernicus-chapter']
    }
  },
  {
    key: 'stores', slugs: { pl: 'sklepy-internetowe', en: 'online-stores' },
    pl: {
      title: 'Sklepy internetowe', summary: 'Buduję sklepy, w których klient może łatwo znaleźć produkt i przejść przez zakup, a właściciel sprawnie obsługiwać zamówienia.',
      audience: ['Marki rozpoczynające sprzedaż online', 'Sklepy wymagające uporządkowania katalogu i procesu zakupu', 'Firmy potrzebujące połączenia sklepu z używanymi narzędziami'],
      scope: ['Katalog, warianty i strony produktów', 'Koszyk, zamówienia oraz komunikacja po zakupie', 'Integracja dostępnych metod płatności i dostawy', 'Panel sprzedaży i uzgodnione integracje zewnętrzne', 'Responsywny checkout i podstawy widoczności produktów w wyszukiwarce'],
      pricing: ['Wielkość i struktura katalogu', 'Warianty produktów oraz reguły cenowe', 'Liczba płatności, przewoźników i integracji', 'Migracja produktów i zamówień z istniejącego sklepu'],
      faq: [
        ['Czy sklep obsłuży płatności i dostawy?', 'Dobieramy dostawców płatności i przewoźników do sposobu sprzedaży; integracje ustalamy przed wyceną.'],
        ['Czy mogę samodzielnie dodawać produkty?', 'Tak. Sposób zarządzania katalogiem dobieram do liczby i rodzaju produktów.'],
        ['Czy przeniesiesz istniejące produkty?', 'Możemy zaplanować import po sprawdzeniu formatu danych i jakości obecnego katalogu.']
      ],
      related: ['yescandles']
    },
    en: {
      title: 'Online stores', summary: 'I build stores where customers can find products and complete a purchase, while owners can manage orders efficiently.',
      audience: ['Brands starting online sales', 'Stores improving catalogues and checkout', 'Businesses connecting commerce with existing tools'],
      scope: ['Catalogue, variants and product pages', 'Cart, orders and post-purchase communication', 'Available payment and delivery integrations', 'Sales administration and agreed external integrations', 'Responsive checkout and search visibility foundations'],
      pricing: ['Catalogue size and structure', 'Product variants and pricing rules', 'Payment, carrier and other integrations', 'Migration of products and orders'],
      faq: [
        ['Can the store handle payments and shipping?', 'We choose providers to fit the sales model and agree integrations before estimating.'],
        ['Can I add products myself?', 'Yes. The catalogue management workflow is chosen for the products you sell.'],
        ['Can you migrate my products?', 'We can plan an import after checking the current data format and quality.']
      ],
      related: ['yescandles']
    }
  },
  {
    key: 'applications', slugs: { pl: 'aplikacje-internetowe', en: 'web-applications' },
    pl: {
      title: 'Aplikacje internetowe', summary: 'Tworzę narzędzia webowe dopasowane do konkretnego procesu: od rezerwacji po panele klientów i systemy B2B.',
      audience: ['Firmy zastępujące ręczną pracę powtarzalnym procesem', 'Zespoły potrzebujące panelu dla klientów lub pracowników', 'Produkty wymagające indywidualnych funkcji'],
      scope: ['Analiza procesu i makiety przepływów', 'Interfejs oraz backend z uprawnieniami dostępu', 'Rezerwacje, panele klientów, systemy B2B lub automatyzacje zgodnie z zakresem', 'Integracje z istniejącymi systemami po sprawdzeniu ich API', 'Testy, wdrożenie i dokumentacja obsługi'],
      pricing: ['Liczba ról, widoków i reguł biznesowych', 'Złożoność danych i integracji', 'Wymagania bezpieczeństwa oraz utrzymania', 'Zakres pierwszej wersji i dalszego rozwoju'],
      faq: [
        ['Czy muszę mieć gotową specyfikację?', 'Nie. Rozpoczynamy od rozmowy i ustalenia najważniejszego procesu oraz pierwszej wersji.'],
        ['Czy aplikacja połączy się z moim systemem?', 'Możliwość integracji sprawdzam na podstawie dokumentacji lub dostępu do API tego systemu.'],
        ['Czy możesz rozwijać aplikację po wdrożeniu?', 'Tak, zakres opieki i kolejnych etapów ustalamy osobno.']
      ],
      related: ['samvolvo', 'voidlink']
    },
    en: {
      title: 'Web applications', summary: 'I build web tools around a specific process, from bookings to client portals and B2B systems.',
      audience: ['Businesses replacing repetitive manual work', 'Teams needing customer or staff portals', 'Products with custom workflow requirements'],
      scope: ['Process discovery and user flow sketches', 'Interface and backend with access controls', 'Bookings, client portals, B2B systems or automation as agreed', 'Integrations after reviewing existing APIs', 'Testing, launch and usage documentation'],
      pricing: ['Roles, views and business rules', 'Data and integration complexity', 'Security and maintenance needs', 'First release and later development scope'],
      faq: [
        ['Do I need a full specification?', 'No. We start by identifying the key process and a useful first release.'],
        ['Can it connect to my current system?', 'I assess that after reviewing its API documentation or available access.'],
        ['Can you keep developing it?', 'Yes. We can agree ongoing support and further phases separately.']
      ],
      related: ['samvolvo', 'voidlink']
    }
  },
  {
    key: 'seo', slugs: { pl: 'optymalizacja-seo', en: 'technical-seo' },
    pl: {
      title: 'Techniczna optymalizacja SEO', summary: 'Sprawdzam i poprawiam techniczne przeszkody, które utrudniają wyszukiwarkom odczytanie strony i użytkownikom korzystanie z niej.',
      audience: ['Właściciele stron z problemami indeksowania', 'Firmy po przebudowie lub migracji witryny', 'Zespoły chcące uporządkować szybkość i strukturę serwisu'],
      scope: ['Analiza indeksowania, metadanych, canonical, hreflang i sitemap', 'Poprawa renderowania, linkowania wewnętrznego i struktury adresów', 'Przegląd wydajności i podstaw dostępności', 'Wdrożenie uzgodnionych poprawek oraz kontrola po zmianach'],
      pricing: ['Wielkość i technologia serwisu', 'Liczba języków i typów podstron', 'Stan techniczny i zakres wdrożenia', 'Dostęp do narzędzi analitycznych i Search Console'],
      faq: [
        ['Czy gwarantujesz pozycję w Google?', 'Nie. Usuwam techniczne problemy i poprawiam podstawy serwisu, ale pozycje zależą także od treści, konkurencji i wielu innych czynników.'],
        ['Czy zajmujesz się treściami i link buildingiem?', 'Ta oferta dotyczy przede wszystkim technicznej strony SEO. Dodatkowy zakres omawiamy oddzielnie.'],
        ['Czy potrzebujesz dostępu do Search Console?', 'Pomaga on ustalić priorytety i sprawdzić efekty, ale wstępną ocenę można rozpocząć bez niego.']
      ],
      related: []
    },
    en: {
      title: 'Technical SEO improvements', summary: 'I identify and fix technical issues that make a website harder for search engines to understand and harder for people to use.',
      audience: ['Site owners facing indexing issues', 'Businesses after a redesign or migration', 'Teams improving speed and site structure'],
      scope: ['Review of indexing, metadata, canonicals, hreflang and sitemaps', 'Rendering, internal links and URL structure improvements', 'Performance and accessibility review', 'Agreed fixes and checks after release'],
      pricing: ['Site size and technology', 'Languages and page types', 'Technical condition and implementation scope', 'Access to analytics and Search Console'],
      faq: [
        ['Do you guarantee rankings?', 'No. I address technical problems, while rankings also depend on content, competition and other factors.'],
        ['Do you write content or build links?', 'This offer focuses on technical SEO. We can discuss any wider work separately.'],
        ['Do you need Search Console access?', 'It helps prioritise and verify work, but an initial review can start without it.']
      ],
      related: []
    }
  },
  {
    key: 'care', slugs: { pl: 'opieka-techniczna', en: 'website-care' },
    pl: {
      title: 'Opieka techniczna nad stroną', summary: 'Pomagam utrzymać stronę lub aplikację w dobrym stanie: aktualizuję, diagnozuję błędy i rozwijam uzgodnione funkcje.',
      audience: ['Firmy bez własnego zespołu technicznego', 'Właściciele stron wymagających regularnych zmian', 'Zespoły potrzebujące wsparcia po wdrożeniu'],
      scope: ['Aktualizacje zależności i kontrola po zmianach', 'Diagnoza usterek oraz poprawki', 'Monitoring uzgodnionych elementów i kopie zapasowe według środowiska', 'Rozwój treści i funkcji w ramach ustalonego zakresu'],
      pricing: ['Technologia i aktualny stan projektu', 'Oczekiwany czas reakcji i zakres dostępności', 'Liczba zmian oraz integracji', 'Sposób hostingu i istniejące procedury kopii zapasowych'],
      faq: [
        ['Czy przejmiesz opiekę nad istniejącą stroną?', 'Najpierw sprawdzę kod, hosting i dokumentację, a potem zaproponuję możliwy zakres.'],
        ['Czy opieka obejmuje nowe funkcje?', 'Może obejmować rozwój, jeśli ustalimy go w zakresie współpracy.'],
        ['Czy zapewniasz kopie zapasowe?', 'Sposób tworzenia i odtwarzania kopii ustalam po poznaniu środowiska oraz dostępów.']
      ],
      related: []
    },
    en: {
      title: 'Website care and technical support', summary: 'I help keep websites and applications working well through updates, troubleshooting and agreed improvements.',
      audience: ['Businesses without an in-house technical team', 'Site owners making regular changes', 'Teams needing support after launch'],
      scope: ['Dependency updates and checks after changes', 'Issue diagnosis and fixes', 'Agreed monitoring and backups suited to the hosting setup', 'Content and feature improvements within the agreed scope'],
      pricing: ['Technology and current project condition', 'Response expectations and availability', 'Number of changes and integrations', 'Hosting and existing backup procedures'],
      faq: [
        ['Can you take over an existing website?', 'I first review the code, hosting and documentation, then propose a realistic scope.'],
        ['Does care include new features?', 'It can, when development is part of the agreed scope.'],
        ['Do you provide backups?', 'I define backup and restore procedures after understanding the environment and access.']
      ],
      related: []
    }
  }
]

const localPages = [
  {
    slug: 'inowroclaw', title: 'Strony internetowe dla firm w Inowrocławiu',
    summary: 'Pomagam firmom z Inowrocławia przedstawić usługi online w sposób zrozumiały dla osób, które właśnie szukają wykonawcy.',
    audience: ['Lokalna firma usługowa potrzebująca czytelnego cennika lub sposobu wyceny', 'Specjalista, który chce pokazać zakres pracy i ułatwić pierwsze zapytanie', 'Firma z ofertą kierowaną także do pobliskich miejscowości'],
    scope: ['Struktura oferty odpowiadająca na najczęstsze pytania klienta', 'Formularz lub wyraźna ścieżka do kontaktu', 'Dane firmy i obszar obsługi przedstawione zgodnie z faktami', 'Techniczne podstawy lokalnej widoczności w wyszukiwarce'],
    note: 'Współpracę można prowadzić zdalnie. Nie zakładam lokalnego biura ani spotkań osobistych bez wcześniejszego uzgodnienia.',
    faq: [['Czy strona może opisywać także okolice Inowrocławia?', 'Tak, gdy faktycznie obsługujesz te miejscowości. Zakres opisujemy konkretnie, bez tworzenia wielu niemal identycznych stron.']]
  },
  {
    slug: 'torun', title: 'Strony internetowe dla firm w Toruniu',
    summary: 'Tworzę strony dla firm z Torunia, które potrzebują uporządkować rozbudowaną ofertę i pomóc odbiorcy wybrać właściwą usługę.',
    audience: ['Firma z kilkoma grupami usług lub odbiorców', 'Zespół publikujący artykuły, aktualności lub realizacje', 'Marka wymagająca polskiej i angielskiej wersji strony'],
    scope: ['Logiczna nawigacja i osobne podstrony dla ważnych usług', 'System edycji treści dopasowany do rzeczywistych potrzeb', 'Wersje językowe z poprawnymi odpowiednikami adresów', 'Testy użyteczności na telefonie i komputerze'],
    note: 'Punktem wyjścia jest istniejąca oferta i materiały firmy. Nie dopisuję niepotwierdzonych realizacji ani lokalnych referencji.',
    faq: [['Czy możesz przygotować dwie wersje językowe?', 'Tak. Omawiamy zakres tłumaczeń i dbamy o prawidłowe powiązanie odpowiadających sobie podstron.']]
  },
  {
    slug: 'bydgoszcz', title: 'Strony internetowe dla firm w Bydgoszczy',
    summary: 'Pomagam firmom z Bydgoszczy zbudować stronę, która pokazuje zakres współpracy, prezentuje wiarygodne materiały i prowadzi do zapytania.',
    audience: ['Firma B2B wyjaśniająca złożoną usługę', 'Zespół pokazujący projekty i konkretny zakres wykonanych prac', 'Biznes potrzebujący połączyć stronę z procesem pozyskiwania zapytań'],
    scope: ['Podstrony usług z problemami, zakresem i kolejnymi krokami', 'Prezentacja realizacji bez przypisywania niepotwierdzonych wyników', 'Kontakt z walidacją i ochroną antyspamową', 'Pomiar działania formularzy i techniczne podstawy SEO'],
    note: 'Projekt planuję wokół procesu sprzedaży klienta i materiałów, które można rzetelnie opublikować.',
    faq: [['Czy strona może połączyć się z CRM?', 'Możliwość integracji ocenię po sprawdzeniu API i sposobu pracy Twojego zespołu.']]
  }
]

export const siteSeed: Seed[] = []
for (const service of services) {
  for (const locale of ['pl', 'en'] as const) {
    const text = service[locale]
    siteSeed.push({
      kind: 'service', locale, slug: service.slugs[locale], translationGroup: `service:${service.key}`,
      title: text.title, summary: text.summary, body: doc(text.summary),
      sections: [
        { type: 'audience', title: locale === 'pl' ? 'Dla kogo' : 'Who it helps', items: text.audience },
        { type: 'scope', title: locale === 'pl' ? 'Zakres i korzyści' : 'Scope and benefits', items: text.scope },
        { type: 'process', title: locale === 'pl' ? 'Jak pracujemy' : 'How we work', items: locale === 'pl' ? processPl : processEn },
        { type: 'pricing', title: locale === 'pl' ? 'Co wpływa na wycenę i termin' : 'What shapes the estimate and schedule', items: text.pricing },
        { type: 'related', title: locale === 'pl' ? 'Powiązane realizacje' : 'Related work', slugs: text.related },
        { type: 'faq', title: locale === 'pl' ? 'Najczęstsze pytania' : 'Common questions', items: text.faq }
      ],
      data: { serviceKey: service.key },
      seoTitle: `${text.title} | Makoto`,
      seoDescription: text.summary
    })
  }
}

for (const place of localPages) siteSeed.push({
  kind: 'location', locale: 'pl', slug: `strony-internetowe/${place.slug}`, translationGroup: `location:${place.slug}`,
  title: place.title, summary: place.summary, body: doc(place.summary),
  sections: [
    { type: 'audience', title: 'Kiedy taka strona pomaga', items: place.audience },
    { type: 'scope', title: 'Co może obejmować projekt', items: place.scope },
    { type: 'note', title: 'Sposób współpracy', text: place.note },
    { type: 'process', title: 'Etapy współpracy', items: processPl },
    { type: 'pricing', title: 'Wycena', items: ['Liczba podstron i ilość materiałów', 'Potrzebne funkcje i integracje', 'Zakres treści oraz późniejszej opieki'] },
    { type: 'faq', title: 'Pytania', items: place.faq }
  ],
  data: { city: place.slug, parentService: 'strony-internetowe' },
  seoTitle: `${place.title} | Makoto`, seoDescription: place.summary
})

const home = {
  pl: {
    title: 'Strony, sklepy i aplikacje internetowe',
    summary: 'Projektuję i rozwijam rozwiązania internetowe dla firm. Współpracuję z klientami z Inowrocławia, Torunia, Bydgoszczy i okolic.',
    facts: ['Pracuję nad stronami, sklepami i aplikacjami webowymi', 'Pokazuję zakres wykonanej pracy przy realizacjach', 'Łączę projekt interfejsu z implementacją i opieką techniczną'],
    faq: [['Od czego zaczynamy?', 'Od rozmowy o celu strony, odbiorcach, materiałach i potrzebnych funkcjach.'], ['Czy możesz pomóc po uruchomieniu?', 'Tak. Zakres opieki i kolejnych zmian ustalamy przy planowaniu projektu.'], ['Jak otrzymam wycenę?', 'Wyślij opis projektu przez formularz. Dopytam o szczegóły i przygotuję indywidualny zakres.']]
  },
  en: {
    title: 'Websites, online stores and web applications',
    summary: 'I design and develop web solutions for businesses, working with clients in Inowrocław, Toruń, Bydgoszcz and nearby areas.',
    facts: ['I work on websites, stores and web applications', 'Project pages describe my actual role', 'I combine interface design, implementation and technical care'],
    faq: [['How do we start?', 'We discuss the goal, audience, available materials and required features.'], ['Can you support the site after launch?', 'Yes. We agree ongoing care and future changes as part of the project planning.'], ['How can I get an estimate?', 'Send a project outline through the contact form. I will ask about the details and propose a scope.']]
  }
}
for (const locale of ['pl', 'en'] as const) siteSeed.push({
  kind: 'home', locale, slug: 'home', translationGroup: 'home',
  title: home[locale].title, summary: home[locale].summary, body: doc(home[locale].summary),
  sections: [
    { type: 'services', slugs: services.map(service => service.slugs[locale]) },
    { type: 'featured', slugs: ['radec24', '8bitjelly', 'hog-copernicus-chapter'] },
    { type: 'facts', items: home[locale].facts },
    { type: 'process', items: locale === 'pl' ? processPl : processEn },
    { type: 'locations', slugs: localPages.map(place => `strony-internetowe/${place.slug}`) },
    { type: 'faq', items: home[locale].faq }
  ],
  data: {}, seoTitle: `${home[locale].title} | Makoto`, seoDescription: home[locale].summary
})

for (const locale of ['pl', 'en'] as const) siteSeed.push({
  kind: 'page', locale, slug: locale === 'pl' ? 'kontakt' : 'contact', translationGroup: 'contact',
  title: locale === 'pl' ? 'Porozmawiajmy o Twoim projekcie' : "Let's discuss your project",
  summary: locale === 'pl'
    ? 'Opisz, czego potrzebujesz i na jakim etapie jesteś. Odpowiem z pytaniami potrzebnymi do przygotowania zakresu.'
    : 'Tell me what you need and where your project stands. I will follow up with the questions needed to define the scope.',
  body: doc(locale === 'pl' ? 'Napisz o swojej firmie, odbiorcach i najważniejszym celu projektu.' : 'Share your business, audience and main project goal.'),
  sections: [], data: {},
  seoTitle: locale === 'pl' ? 'Kontakt i wycena | Makoto' : 'Contact and project estimate | Makoto',
  seoDescription: locale === 'pl' ? 'Zapytaj o wycenę strony, sklepu lub aplikacji internetowej.' : 'Ask for an estimate for a website, store or web application.'
})

for (const entry of siteSeed) improveLocalContent(entry)
siteSeed.push(...buyerGuides)
