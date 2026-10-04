import type { Seed } from './site-seed'
import type { RichNode } from './content'

const guideSlugs = ['co-przygotowac-przed-zamowieniem-strony', 'jak-porownac-wyceny-strony-internetowej']
const examples = ['radec24', '8bitjelly', 'hog-copernicus-chapter']
const localCopy: Record<string, { note: string; delivery: string; faq: string[][] }> = {
  inowroclaw: {
    note: 'Przy stronie lokalnej firmy zaczynam od pytań, z którymi przychodzą klienci: jakie usługi wykonujesz, gdzie działasz i jak zamówić pracę. Na tej podstawie układam ofertę, realizacje i kontakt. Współpracę możemy prowadzić zdalnie, a materiały i uwagi zebrać w jednym miejscu. Jeśli masz już stronę, jej adres prześlij razem z opisem planowanych zmian.',
    delivery: 'Dla firmy obsługującej Inowrocław i okolice ważne jest, by klient szybko rozpoznał obszar działania. W projekcie możemy uwzględnić osobne opisy usług, zdjęcia wykonanych prac oraz wygodny kontakt z telefonu. Nazwy miejscowości i dane kontaktowe ustalamy na podstawie rzeczywistej oferty firmy. Gdy chcesz samodzielnie publikować nowe realizacje, uwzględnimy tę możliwość w panelu treści.',
    faq: [
      ['Mam małą firmę usługową. Czy potrzebuję rozbudowanej strony?', 'Zakres dobieramy do oferty. Warto zacząć od czytelnego opisu usług, przykładów pracy i kontaktu. Więcej podstron ma sens, gdy odpowiadają na inne pytania klientów, a nie tylko powtarzają ten sam tekst.'],
      ['Czy pomożesz uporządkować ofertę dla klientów z okolic Inowrocławia?', 'Tak. Ustalamy, które usługi wykonujesz i na jakim obszarze, a następnie planujemy ich prezentację. Możemy też pokazać miejscowości przy poszczególnych realizacjach.'],
      ['Co przesłać, żeby otrzymać wycenę?', 'Opis działalności, listę usług, adres obecnej strony oraz potrzebne funkcje. Przydatne są również logo, zdjęcia realizacji i informacja, kto przygotuje teksty.'],
      ['Czy kontakt i formularz będą wygodne na telefonie?', 'Tak. Układ strony i formularze uwzględniają małe ekrany. Jeśli udostępniasz numer telefonu, może prowadzić bezpośrednio do połączenia.']
    ]
  },
  torun: {
    note: 'Przy rozbudowanej ofercie najpierw porządkuję ścieżkę klienta: od wyboru usługi, przez przykład realizacji, do zapytania. Omawiamy, które informacje powinny być osobnymi podstronami i kto będzie je aktualizować. Dla firmy z Torunia współpracę możemy prowadzić zdalnie, z kolejnymi etapami projektu przekazywanymi do akceptacji.',
    delivery: 'Gdy firma kieruje ofertę do kilku grup odbiorców, jedna długa strona często utrudnia wybór. Projekt może obejmować oddzielne opisy usług, realizacje z przypisanym zakresem i panel do publikowania aktualności. Jeśli potrzebujesz wersji angielskiej, planujemy strukturę obu języków oraz materiały do tłumaczenia jeszcze przed wdrożeniem. Dzięki temu wiadomo, co trzeba przygotować i jakie widoki obejmuje wycena.',
    faq: [
      ['Czy strona może mieć polską i angielską wersję?', 'Tak. Ustalamy, które treści będą dostępne w obu językach i kto przygotuje tłumaczenia. Odpowiadające sobie podstrony zostają powiązane, aby użytkownik przełączał język w odpowiednim miejscu.'],
      ['Mam wiele usług. Jak je pokazać na stronie?', 'Zaczynamy od podziału oferty według potrzeb klientów. Ważne usługi mogą otrzymać własne podstrony, z przykładami prac i wyraźnym kolejnym krokiem.'],
      ['Czy po wdrożeniu mogę dodawać realizacje i aktualności?', 'Jeśli potrzebujesz samodzielnej publikacji, uwzględniamy panel w zakresie. Ustalamy wcześniej rodzaje treści, pola do edycji oraz sposób dodawania zdjęć.'],
      ['Czy muszę mieć gotowy projekt graficzny?', 'Nie. Możemy rozpocząć od materiałów marki i rozmowy o odbiorcach. Jeśli masz projekt lub identyfikację wizualną, przesyłasz je do oceny zakresu.']
    ]
  },
  bydgoszcz: {
    note: 'Przy ofercie B2B ważne jest, żeby odbiorca zrozumiał zakres usługi przed rozmową. Ustalamy, czego potrzebuje do podjęcia decyzji: opisu procesu, przykładów projektów, informacji technicznych czy materiałów do pobrania. Stronę dla firmy z Bydgoszczy możemy opracować zdalnie, z uzgodnionym zakresem i etapami akceptacji.',
    delivery: 'W projekcie strony B2B można połączyć opisy usług z konkretnymi przykładami zastosowania i formularzem zapytania. Przed wdrożeniem ustalamy, jakie informacje powinien podać klient oraz gdzie ma trafić wiadomość. Jeśli planujesz integrację z CRM lub innym systemem, potrzebna jest jego dokumentacja i opis procesu. Pozwala to ocenić pracę przed obietnicą terminu i przygotować użyteczny pierwszy zakres.',
    faq: [
      ['Czy formularz może zbierać informacje potrzebne do wyceny?', 'Tak. Dobieramy pytania do Twojej usługi, tak aby ułatwić przygotowanie odpowiedzi i nie obciążać klienta zbędnymi polami.'],
      ['Czy połączysz stronę z CRM?', 'Możliwość i zakres integracji określam po sprawdzeniu API systemu oraz sposobu obsługi zapytań w firmie. Dostępy i wymagania omawiamy przed wyceną tej części.'],
      ['Czy możesz przebudować działającą stronę?', 'Tak. Najpierw analizujemy obecne treści, funkcje i adresy podstron. Plan przeniesienia uwzględnia potrzebne materiały, hosting oraz zachowanie ważnych adresów lub ich przekierowanie.'],
      ['Jak pokazać złożoną usługę na stronie?', 'Dzielimy opis na problem klienta, zakres rozwiązania, przebieg współpracy i przykład realizacji. Szczegóły techniczne pozostają dostępne dla osób, które ich potrzebują.']
    ]
  }
}

export function improveLocalContent(entry: Seed) {
  const pl = entry.locale === 'pl'
  if (entry.kind === 'location') {
    const text = localCopy[String(entry.data.city)]
    if (!text) return
    const note = entry.sections.find(section => section.type === 'note')
    if (note) note.text = text.note
    const faq = entry.sections.find(section => section.type === 'faq')
    if (faq) { faq.title = 'Przed zamówieniem strony'; faq.items = text.faq }
    entry.sections.splice(3, 0, { type: 'note', title: 'Strona dopasowana do sposobu pracy firmy', text: text.delivery })
    entry.sections.push(
      { type: 'related', title: 'Przykłady wykonanych stron', slugs: examples },
      { type: 'services', title: 'Usługi, które mogą uzupełnić stronę', slugs: ['strony-internetowe', 'sklepy-internetowe', 'opieka-techniczna'] },
      { type: 'articles', title: 'Przygotuj się do projektu', slugs: guideSlugs }
    )
  }
  if (entry.kind === 'service') {
    entry.sections.splice(2, 0, {
      type: 'note', title: pl ? 'Zakres przed rozpoczęciem' : 'Agreeing the scope',
      text: pl
        ? 'Przed wyceną ustalamy potrzebne widoki, funkcje i materiały oraz odpowiedzialność za teksty, zdjęcia i tłumaczenia. Omawiamy także hosting, domenę, dostępy i utrzymanie po uruchomieniu. Te informacje pozwalają porównać zakres prac i zaplanować termin. Jeśli masz działającą stronę, prześlij jej adres i opisz, co chcesz zachować.'
        : 'Before estimating, we agree the pages, features and materials, including who provides copy, images and translations. We also discuss hosting, the domain, account access and support after launch. This makes the scope and schedule clear. If you already have a website, send its address and describe what you want to retain.'
    })
    const faq = entry.sections.find(section => section.type === 'faq')
    if (faq && Array.isArray(faq.items)) faq.items.push(...(pl ? [
      ['Jak ustalamy termin?', 'Termin zależy od zakresu funkcji, dostępności materiałów i akceptacji kolejnych etapów. Ustalamy go po rozmowie o projekcie; w wycenie uwzględniamy także przygotowanie treści i integracje.'],
      ['Co z hostingiem i opieką po uruchomieniu?', 'Omawiamy środowisko, dostępy oraz zakres utrzymania przed wdrożeniem. Opieka techniczna i dalszy rozwój mogą być osobną częścią współpracy.']
    ] : [
      ['How is the schedule agreed?', 'The schedule depends on features, available materials and approval of project stages. We agree it after discussing the scope, including content and integrations.'],
      ['What about hosting and support after launch?', 'We discuss the environment, access and maintenance before deployment. Technical care and future improvements can be a separate part of the work.']
    ]))
    if (pl && entry.data.serviceKey === 'websites') entry.sections.push({ type: 'articles', title: 'Przed zamówieniem strony', slugs: guideSlugs })
  }
  if (entry.kind === 'page' && ['kontakt', 'contact'].includes(entry.slug)) {
    entry.data = {
      ...entry.data, contactName: 'Patryk Dąbrowski — Makoto', contactEmail: 'contact@makoto.com.pl',
      serviceArea: ['Inowrocław', 'Toruń', 'Bydgoszcz'],
      contactNote: pl ? 'Opisz cel projektu, potrzebne funkcje i materiały, które już masz. Jeśli planujesz przebudowę, dołącz adres obecnej strony.' : 'Describe the project goal, required features and materials you already have. If you are planning a redesign, include your current website address.'
    }
    entry.body = paragraphDocument(pl
      ? 'Tworzę strony, sklepy i aplikacje internetowe dla firm z Inowrocławia, Torunia, Bydgoszczy i okolic. W wiadomości podaj, czym zajmuje się Twoja firma, do kogo kierujesz ofertę i co użytkownik ma zrobić na stronie. Możesz dołączyć linki do obecnej witryny i przykładów, które Ci odpowiadają. Na tej podstawie omówimy zakres projektu i informacje potrzebne do wyceny.'
      : 'I build websites, stores and web applications for businesses in Inowrocław, Toruń, Bydgoszcz and nearby areas. Tell me about your business, audience and what visitors should do on the website. You can include links to your existing site and examples you like. We can then discuss the scope and details needed for an estimate.')
  }
}

const paragraph = (text: string): RichNode => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const heading = (text: string): RichNode => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] })
const list = (items: string[]): RichNode => ({ type: 'bulletList', content: items.map(text => ({ type: 'listItem', content: [paragraph(text)] })) })
const link = (text: string, href: string): RichNode => ({ type: 'paragraph', content: [{ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] }] })
function paragraphDocument(text: string): RichNode { return { type: 'doc', content: [paragraph(text)] } }

export const buyerGuides: Seed[] = [
  {
    kind: 'article', locale: 'pl', slug: guideSlugs[0]!, translationGroup: 'guide:website-preparation',
    title: 'Co przygotować przed zamówieniem strony internetowej?',
    summary: 'Lista materiałów i decyzji, które pomagają ustalić zakres, wycenę i sposób pracy nad stroną firmową.',
    seoTitle: 'Co przygotować przed zamówieniem strony internetowej? | Makoto',
    seoDescription: 'Cel strony, oferta, zdjęcia, teksty, funkcje i dostępy. Sprawdź, co przygotować przed rozmową o stronie dla Twojej firmy.',
    sections: [], data: {}, body: { type: 'doc', content: [
      paragraph('Nie musisz mieć gotowych tekstów ani projektu, żeby zapytać o stronę. Najwięcej daje krótki opis firmy i tego, co ma zmienić nowa witryna. Czy klient ma zadzwonić, wysłać zapytanie, umówić wizytę czy kupić produkt? Odpowiedź porządkuje zakres znacznie lepiej niż lista stron, które podobają Ci się wizualnie.'),
      heading('1. Opisz ofertę i odbiorcę'),
      paragraph('Wypisz usługi lub grupy produktów. Przy każdej dodaj, dla kogo jest przeznaczona i o co klient pyta przed zakupem. Jeśli działasz lokalnie, podaj rzeczywisty obszar obsługi. Firma z Inowrocławia, Torunia czy Bydgoszczy może obsługiwać klientów w mieście, w regionie albo zdalnie — na stronie powinno to być jednoznaczne.'),
      list(['Czym zajmuje się firma i kto korzysta z jej usług?', 'Które usługi są najważniejsze?', 'Jakie pytania najczęściej pojawiają się przed zamówieniem?', 'Gdzie faktycznie obsługujesz klientów?']),
      heading('2. Zbierz materiały, które już masz'),
      paragraph('Przygotuj logo w najlepszej dostępnej jakości, zdjęcia produktów lub wykonanych prac i istniejące opisy oferty. Nie musisz od razu porządkować wszystkiego. Warto jednak zaznaczyć, które materiały są aktualne i do których masz prawo publikacji. Zdjęcia z własnych realizacji zwykle pomagają lepiej zrozumieć usługę niż przypadkowe fotografie ze stocka.'),
      paragraph('Jeśli chcesz pokazać opinię klienta, zachowaj jej treść, autora i źródło. Dane kontaktowe, nazwa firmy i informacje o sposobie obsługi powinny odpowiadać temu, co podajesz również w innych miejscach w internecie.'),
      heading('3. Oddziel potrzebne funkcje od pomysłów na później'),
      paragraph('Formularz, rezerwacje, katalog produktów, sklep, konto klienta i integracja z CRM oznaczają różny zakres pracy. Opisz funkcję przez sposób użycia: kto z niej korzysta, jakie informacje wpisuje i co ma się wydarzyć dalej. To pozwala ocenić, czy wystarczy proste rozwiązanie, czy potrzebny jest osobny proces lub aplikacja.'),
      list(['Jakie dane ma zbierać formularz i gdzie ma trafić wiadomość?', 'Czy potrzebujesz drugiego języka?', 'Kto będzie zmieniać teksty, zdjęcia i ofertę?', 'Czy stronę trzeba połączyć z innym systemem?']),
      heading('4. Ustal, kto przygotuje treści'),
      paragraph('Teksty, tłumaczenia i zdjęcia mają wpływ na termin. W wiadomości zaznacz, co dostarczysz samodzielnie, a przy czym potrzebujesz pomocy. Jeżeli ofertę trzeba dopiero uporządkować, warto omówić to przed wyceną. Inny zakres ma przeniesienie gotowych materiałów, a inny opracowanie struktury i opisów od początku.'),
      heading('5. Przy przebudowie dołącz adres obecnej strony'),
      paragraph('Wskaż elementy, które chcesz zachować: opisy, blog, realizacje, formularze lub katalog. Napisz też, co dziś utrudnia pracę. Przed zmianą trzeba ustalić dostęp do domeny, hostingu i poczty oraz sposób przeniesienia treści. Nie wysyłaj haseł w pierwszym zapytaniu; na tym etapie wystarczy informacja, jakie konta i systemy posiadasz.'),
      heading('Krótka wiadomość wystarczy na początek'),
      paragraph('Możesz napisać: „Prowadzę firmę zajmującą się…, obsługuję…, potrzebuję strony, na której klient będzie mógł…. Mam logo i zdjęcia, ale potrzebuję pomocy z tekstami. Obecna strona to…”. Dodaj oczekiwany termin oraz budżet, jeśli został już określony. Taki opis pozwala zacząć od właściwych pytań.'),
      link('Sprawdź zakres tworzenia stron internetowych dla firm.', '/pl/strony-internetowe'),
      link('Zobacz przykłady wykonanych realizacji.', '/pl/work'),
      link('Prześlij opis swojego projektu.', '/pl/kontakt')
    ] }
  },
  {
    kind: 'article', locale: 'pl', slug: guideSlugs[1]!, translationGroup: 'guide:website-estimates',
    title: 'Jak porównać wyceny strony internetowej?',
    summary: 'Co sprawdzić w zakresie projektu, treściach, CMS, utrzymaniu i przekazaniu strony, żeby porównywać rzeczywiście podobne oferty.',
    seoTitle: 'Jak porównać wyceny strony internetowej dla firmy? | Makoto',
    seoDescription: 'Porównaj zakres, projekt graficzny, treści, CMS, hosting i opiekę. Lista pytań przed wyborem wykonawcy strony internetowej.',
    sections: [], data: {}, body: { type: 'doc', content: [
      paragraph('Dwie oferty opisane jako „strona firmowa” mogą obejmować zupełnie inną pracę. W jednej cenie są gotowe teksty i indywidualny projekt, w drugiej tylko wdrożenie dostarczonych materiałów. Zanim porównasz kwoty, sprawdź, co dokładnie otrzymasz i jakie koszty pojawią się po uruchomieniu.'),
      heading('Porównaj podstrony i funkcje'),
      paragraph('Sama liczba podstron nie opisuje złożoności projektu. Prosty opis usługi, katalog z filtrowaniem i panel klienta to różne zadania. W wycenie powinien być czytelny zakres: widoki, formularze, języki, integracje oraz sposób publikacji treści. Zwróć uwagę, czy oferta uwzględnia wersję mobilną i działanie elementów, a nie tylko ich wygląd.'),
      list(['Jakie podstrony i funkcje obejmuje cena?', 'Które materiały przygotowuje wykonawca?', 'Czy w zakresie są integracje i przeniesienie danych?', 'Co jest opcją dodatkową i jak zostanie wycenione?']),
      heading('Sprawdź sposób przygotowania projektu'),
      paragraph('Adaptacja istniejącego szablonu i indywidualny projekt interfejsu mogą być właściwymi rozwiązaniami, ale powinny być opisane wprost. Zapytaj, co dostajesz do akceptacji, kiedy przekazujesz uwagi i jakie poprawki obejmuje ustalony zakres. Przy istniejącej identyfikacji ustal również, czy logo, typografia i materiały zostaną wykorzystane w projekcie.'),
      heading('Teksty i zdjęcia też są częścią pracy'),
      paragraph('Wyjaśnij, czy dostarczasz gotowe treści, czy potrzebujesz pomocy w ich uporządkowaniu. Sprawdź zakres redakcji, tłumaczeń i przygotowania zdjęć. Przy stronie lokalnej ważne są prawdziwe przykłady realizacji, aktualne dane firmy i jasny obszar obsługi. Ich zebranie zajmuje czas, który warto uwzględnić w harmonogramie.'),
      heading('Zapytaj, co samodzielnie zmienisz w CMS'),
      paragraph('Hasło „panel do edycji” nie mówi jeszcze, które elementy są dostępne. Poproś o listę: teksty oferty, zdjęcia, realizacje, blog, dane kontaktowe czy wersje językowe. Zapytaj o sposób dodawania nowych treści i materiały pokazujące obsługę. Dobrze dobrany panel odpowiada codziennej pracy firmy, a jego zakres powinien być znany przed wdrożeniem.'),
      heading('Rozdziel wdrożenie i koszty utrzymania'),
      paragraph('Domena, hosting, poczta, płatne usługi i opieka mogą być rozliczane osobno. Poproś o wskazanie, kto zakłada i opłaca konta, jak odnawiane są usługi i kto otrzymuje dostępy. Zapytaj również o aktualizacje, kopie zapasowe i procedurę zgłoszenia usterki. Zakres utrzymania dobiera się do konkretnego środowiska; warto mieć go zapisany.'),
      list(['Jakie opłaty są jednorazowe, a jakie cykliczne?', 'Na kogo zarejestrowana będzie domena i konta usług?', 'Kto odpowiada za kopie, aktualizacje i odtwarzanie strony?', 'Jak wyceniane będą późniejsze zmiany?']),
      heading('Przy przebudowie uwzględnij przeniesienie'),
      paragraph('Jeśli strona już działa, wycena powinna określać, które treści i funkcje zostaną przeniesione. Warto omówić obecne adresy podstron, domenę, pocztę i formularze. Zmiana wyglądu jest jednym z etapów; równie ważny jest plan uruchomienia i sprawdzenia działania po przeniesieniu.'),
      heading('Termin powinien wynikać z zakresu'),
      paragraph('Zapytaj, kiedy wykonawca potrzebuje materiałów i kto akceptuje etapy projektu. Oczekiwany termin można ocenić dopiero razem z funkcjami, przygotowaniem treści i integracjami. Przed wyborem warto zobaczyć realizacje podobne do Twojej potrzeby i dowiedzieć się, jaki zakres wykonała osoba przedstawiająca ofertę.'),
      paragraph('Najwygodniej porównywać oferty w krótkiej tabeli: zakres, materiały, funkcje, edycja, termin, wdrożenie i utrzymanie. Jeżeli przy którejś pozycji brakuje informacji, dopytaj przed podjęciem decyzji. Dzięki temu cena odnosi się do konkretnego projektu.'),
      link('Poznaj zakres projektowania i tworzenia stron firmowych.', '/pl/strony-internetowe'),
      link('Sprawdź ofertę opieki technicznej nad stroną.', '/pl/opieka-techniczna'),
      link('Opisz projekt, który chcesz wycenić.', '/pl/kontakt')
    ] }
  }
]
