# Treści, migracja i kopie danych

## Model

`content_entries` przechowuje artykuły, kategorie, autorów, realizacje, usługi, lokalizacje i strony. Każdy rekord ma język, slug, wspólny identyfikator grupy tłumaczeń, status, daty publikacji, pola SEO, strukturalne `sections` i dokument Tiptap JSON w `body`. `content_versions` przechowuje kolejne stany; przywrócenie tworzy nowy szkic i ponownie wiąże media. `media` zawiera klucz obiektu R2 i metadane, a `content_media` wiąże pliki z wpisami.

Publiczne API (`/api/content/...`), strony i sitemap zwracają tylko treści opublikowane. Jedna treść może mieć tylko jeden H1 w szablonie; dokument Tiptap dopuszcza nagłówki H2–H6 (H1 z importowanego Markdown jest zamieniany na H2). Dokumenty są walidowane po stronie serwera i renderowane jako elementy Vue. Edytor jest ładowany tylko w panelu.

Edytor i publiczny widok obsługują alerty NOTE, SUCCESS, INFO, TIP, IMPORTANT, WARNING i CAUTION, listy zadań, tabele z wyrównaniem kolumn, kolorowanie składni kodu, wyróżnienie `<mark>`, klawisze `<kbd>` i indeksy `<sub>`/`<sup>`. Przycisk „Wstaw Markdown” importuje tekst w miejscu kursora. Parser zamienia dozwolone tagi w znaczniki dokumentu; pozostały HTML jest zwykłym tekstem. W trybie developerskim `/__preview/markdown` pokazuje pełny przykład z `tests/fixtures/markdown-rendering.md`; w produkcji adres zwraca 404.

## Archiwum Strapi

`data/strapi-public-export.json` oraz `data/strapi-media/` to pobrana kopia publicznych treści z `https://api.makoto.com.pl`. Sprawdzenie: `node scripts/verify-strapi-export.mjs`. Odświeżenie: `node scripts/export-strapi.mjs`. Archiwum obejmuje tylko rekordy i pliki udostępniane przez API; szkice, role, konta i konfiguracja Strapi wymagają osobnej kopii wykonanej na jego serwerze.

## Import

Po `pnpm db:migrate` i ustawieniu R2 uruchom `pnpm cms:migrate:dry-run`, przejrzyj `data/strapi-migration-report.json`, a następnie `pnpm cms:migrate`. Skrypt zachowuje klucze źródłowe i pomija zaimportowane rekordy oraz pliki przy ponownym uruchomieniu. Zachowuje język, slug, daty, metadane i oryginalne bloki, a obsługiwane bloki przekształca w Tiptap JSON. Raport zawiera elementy nieobsługiwane i błędy. Nie modyfikuje Strapi.

Przed przełączeniem produkcji porównaj liczbę rekordów, slugi i języki z archiwum; sprawdź wybrane artykuły, realizacje, załączniki i linki w panelu. Tabele i rozszerzone formatowanie Markdown są zachowywane przez importer. Testowy artykuł o identyfikatorze `g0yx9cn74oizdsrs0fn8xb73` trafia do szkiców.

## Naprawa wcześniejszego importu

`node scripts/repair-rich-content.mjs` pokazuje plan odtworzenia formatowania z `data.originalBlocks` i archiwum Strapi. `--apply` zapisuje zmiany w bazie wskazanej przez `DATABASE_URL`. Skrypt pomija treści edytowane w CMS (mające już historię wersji), zapisuje poprzedni stan w `.data/content-backups/` oraz wersje przed i po zmianie. Zachowuje status publikacji, slugi, tłumaczenia i linki do mediów. Ponowne uruchomienie nie zmienia odtworzonych rekordów. Uruchamiaj na Node.js 24, tak jak pozostałe narzędzia projektu.

## Kopia i odtworzenie

Przed migracją produkcyjną wykonaj `pg_dump -Fc` bazy docelowej i zachowaj kopię w bezpiecznym miejscu. Przy odtworzeniu użyj `pg_restore --clean --if-exists` na przygotowanej bazie. Włącz wersjonowanie lub regularne kopie prywatnego bucketa R2 i przechowuj je oddzielnie od bazy. Dla starego Strapi potrzebna jest też osobna kopia jego bazy i uploadów; archiwum w tym repozytorium nie zastępuje pełnego backupu.

Pliki R2 są udostępniane przez `/api/media/:id` tylko wtedy, gdy używa ich opublikowana treść. Media szkiców i pliki nieużywane wymagają sesji administratora. Pliku powiązanego z treścią nie można usunąć; najpierw usuń powiązanie z każdego wpisu, potem potwierdź usunięcie w bibliotece. `R2_PUBLIC_BASE_URL` pozostaje puste przy prywatnym bucketcie: publiczny adres bucketa omijałby kontrolę dostępu.
