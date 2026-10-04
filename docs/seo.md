# SEO i udostępnianie treści

Konfiguracja korzysta z `@nuxtjs/seo`: sitemap, robots, canonical, Schema.org i obrazów OpenGraph. `nuxt-ai-ready` udostępnia wersje Markdown stron. Źródłem treści pozostaje istniejący CMS PostgreSQL.

## Adresy

- `/sitemap.xml` — opublikowane strony CMS i istniejące strony list, z datami zmian, obrazami oraz powiązaniami PL/EN. Cache: 5 minut. Wpisy zaplanowane na przyszłość i szkice są pomijane.
- `/robots.txt` — reguły indeksowania i adres mapy witryny. Panel, podglądy i prywatne API są wyłączone z indeksowania.
- `/llms.txt` — aktualny spis publicznych treści z CMS.
- `/llms-full.txt` — spis i treść opublikowanych stron.
- `/about.md`, `/pl/about.md`, `/blog/<slug>.md` itd. — publiczna treść w Markdown. Panel i podglądy nie mają publicznej wersji Markdown.

Canonical usuwa parametry śledzące. Alternatywne wersje językowe wpisów wskazują wyłącznie istniejące, opublikowane tłumaczenia. `x-default` wskazuje angielską wersję, jeśli jest dostępna.

## OpenGraph i fonty

`app/components/OgImage/MakotoCard.takumi.vue` renderuje PNG 1200 × 630 w stylistyce Makoto. Każda publiczna strona otrzymuje własny tytuł, opis i język; wpisy i projekty mogą zawierać zdjęcie główne. Data zmiany wpisu jest częścią parametrów obrazu, więc edycja treści zmienia jego adres. Moduł obsługuje podpisy adresów i cache renderera.

Outfit, Roboto Flex, Playfair Display i Instrument Serif są pobierane przez `@nuxt/fonts` podczas budowania i dołączane do aplikacji. Włączone są zestawy latin i latin-ext oraz potrzebne kursywy. Te same pliki fontów są dostępne dla renderera Takumi; przeglądarka nie pobiera ich z Google Fonts.

## Zarządzanie

Tytuł i opis SEO edytuje się we wpisie CMS. Pozostawienie ich pustych używa tytułu i podsumowania wpisu. Zmiany sitemap i plików llms nie wymagają nowego deployu. Nie jest potrzebna dodatkowa migracja bazy ani ponowny import ze Strapi.

Schematy obejmują osobę, witrynę, strony, okruszki nawigacji, artykuły, usługi i realizacje. Dane pochodzą z publicznej treści; konfiguracja nie dodaje nieistniejących opinii ani adresów biur. Ułatwienie dostępu wyszukiwarkom i narzędziom AI nie gwarantuje pozycji ani cytowania.

## Lokalne usługi i realizacje

Strona usługi automatycznie pokazuje opublikowane lokalizacje, których `data.parentService` wskazuje jej adres. Okruszki na stronie miasta, także w JSON-LD, zawierają rzeczywistą usługę nadrzędną. Nazwa miasta obsługuje dotychczasowe identyfikatory i dowolną nazwę wpisaną w panelu.

Miejscowość klienta w realizacji oraz dodatkowe wybrane lokalizacje łączą projekt z właściwymi stronami lokalnymi. Ogólne przykłady projektów są opisane jako przykłady, bez przypisywania im niepotwierdzonej miejscowości. Wspólna osoba usługodawcy ma identyfikator `https://makoto.com.pl/#identity`.

Dwa poradniki dla zamawiających stronę są zwykłymi artykułami CMS. Ich treść, opis i publikację można zmieniać w panelu. Sitemap i OpenGraph korzystają z istniejących mechanizmów artykułów. Wersje Markdown uwzględniają opis celu, rozwiązania i efektów realizacji, publiczny kontakt oraz odnośniki do opublikowanych treści powiązanych.
