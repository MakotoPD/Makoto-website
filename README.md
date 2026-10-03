# Makoto

Dwujęzyczna strona Makoto w Nuxt 4. Treści są renderowane po stronie serwera z PostgreSQL. Panel `/panel` służy do edycji treści, tłumaczeń i mediów; pliki są przechowywane w prywatnym bucketcie Cloudflare R2.

## Uruchomienie lokalne

Wymagane są Node.js 22.19+ i pnpm. Skopiuj `.env.example` do `.env` i ustaw `DATABASE_URL`. Następnie:

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm cms:migrate:dry-run
pnpm dev
```

`db:seed` dodaje 17 edytowalnych wpisów bazowych dla ofert, stron lokalnych, strony głównej i kontaktu. `cms:migrate:dry-run` sprawdza archiwum publicznych danych Strapi bez zapisu do bazy. Import pełnych treści i mediów do R2 wymaga prawdziwych danych dostępowych. Szczegóły: [Konfiguracja i wdrożenie](docs/DEPLOY.md), [model treści i migracja](docs/CONTENT.md), [kopia publicznych danych Strapi](data/README.md).

## Kontrole

```bash
pnpm typecheck
pnpm test
pnpm build
```

Test HTTP panelu i publikacji uruchamia `pnpm test:integration`. Wymaga lokalnej bazy PostgreSQL o nazwie `makoto_verify`, wykonanych `pnpm db:migrate` i `pnpm db:seed` oraz `TEST_DATABASE_URL` wskazującego tę bazę. Test sam uruchamia zbudowany serwer na `127.0.0.1:3101`, tworzy wyłącznie lokalne sekrety i nie wysyła formularza do odbiorcy. Czyści sesje i próby logowania w tej bazie. `pnpm test:visual` sprawdza sześć podstron na szerokościach desktopowej i mobilnej; wymaga uruchomionej lokalnej strony z zaimportowanymi przykładowymi treściami oraz Chromium z Playwright.

Nie umieszczaj sekretów w repozytorium. `.env` jest ignorowany przez Git. Wersja angielska działa pod `/`, polska pod `/pl`.
