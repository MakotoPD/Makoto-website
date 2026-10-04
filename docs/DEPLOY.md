# Konfiguracja i wdrożenie

## Usługi i zmienne

Użyj PostgreSQL z regularnymi kopiami i prywatnego bucketa Cloudflare R2. Nadaj kluczowi R2 dostęp tylko do tego bucketa. Ustaw zmienne z `.env.example` w środowisku serwera. `DATABASE_URL`, hasło administratora, sekret TOTP, sekret sesji, klucze R2, sekret Turnstile i klucz Web3Forms pozostają po stronie serwera. `TURNSTILE_SITE_KEY` jest kluczem publicznym. `SITE_URL` ustaw na adres origin strony bez końcowego ukośnika; w produkcji `https://makoto.com.pl`.

Bucket z jurysdykcją UE wymaga `R2_ENDPOINT=https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`. Bez tej zmiennej klient używa standardowego endpointu R2. Przy prywatnych mediach pozostaw `R2_PUBLIC_BASE_URL` puste i wyłącz publiczną domenę oraz adres r2.dev bucketa. Aplikacja udostępnia opublikowane zdjęcia przez `/api/media/:id`; parametr `?size=small`, `medium` lub `big` tworzy wariant w tle. Szkice wymagają sesji panelu.

## Obraz Docker i pierwszy import

Obraz jest budowany na Node.js 24 i zawiera narzędzia migracji oraz zweryfikowane archiwum Strapi. `.dockerignore` wyklucza lokalne sekrety, `.data`, pliki Git i zależności Windows. W Dokploy ustaw Dockerfile `/Dockerfile`, a w Build Arguments wyłącznie publiczny `TURNSTILE_SITE_KEY`. Sekrety ustaw w Environment; nie przekazuj ich jako argumentów budowania.

Przed pierwszym uruchomieniem wykonaj w prywatnej sieci Dokploy:

```sh
docker run --rm --network dokploy-network --env-file /bezpieczna/sciezka/production.env \
  makoto-portfolio:prepared-new-seo node scripts/setup-production.mjs --import-strapi
```

To sprawdza pliki archiwum, wykonuje próbny import, migracje schematu, seed i właściwy import do PostgreSQL/R2. Ponowne wykonanie pomija istniejące rekordy źródłowe, więc nie aktualizuje już zaimportowanych tekstów ani zmian z lokalnego panelu. Raport znajduje się w `data/strapi-migration-report.json`; przy kontenerze jednorazowym zamontuj ten plik z hosta, aby zachować raport.

Zwykły start obrazu wykonuje tylko migracje schematu, a potem uruchamia Nuxt. Blokada PostgreSQL zapobiega równoległemu wykonaniu migracji. Import Strapi jest osobną, świadomą operacją; kolejne wdrożenia nie nadpisują edytowanych treści. Healthcheck `/api/healthz` sprawdza również dostęp do tabel CMS.

## Wdrożenie Makoto z main

Aplikacja **Portfolio** w projekcie **Makoto** korzysta z repozytorium `MakotoPD/Makoto-website`, gałęzi `main` i obrazu budowanego z `/Dockerfile`. W Dokploy źródło to GitHub, a automatyczne wdrażanie jest włączone dla zdarzeń push. Aby opublikować kolejne zapisane zmiany:

```sh
git push origin main
```

Pierwszy import Strapi do docelowego PostgreSQL i R2 został wykonany 4 października 2026. Kolejne wdrożenia uruchamiają migracje schematu i korzystają z istniejących treści; nie wymagają ponownego importu Strapi.

Docelowa usługa PostgreSQL to `maindatabase`, baza `dabropat`, z osobnym użytkownikiem `makoto_portfolio`. Strapi, `strapidb` i Umami pozostają osobnymi usługami. Kopie sprzed migracji, raport importu i pliki przygotowania są przechowywane w `/etc/dokploy/makoto-migration/2026-10-04-preparation/`, z ograniczonym dostępem. Kopie zawierają pełną bazę Strapi i jego uploady; publiczny eksport w repozytorium ich nie zastępuje.

### Login, hasło i sekrety panelu

W terminalu projektu wygeneruj hash hasła:

```sh
pnpm cms:password
```

Podaj wybrane hasło mające co najmniej 14 znaków. Skrypt ukrywa wpisywane hasło i wypisuje `ADMIN_PASSWORD_HASH=...`. W **Dokploy → Makoto → Portfolio → Environment** ustaw `ADMIN_LOGIN` na wybrany login, a `ADMIN_PASSWORD_HASH` na wygenerowany hash. Zapisz środowisko i wykonaj **Deploy**, aby zastosować nowe dane.

Nowy sekret sesji, np. aby unieważnić wcześniejsze cookies po zmianie hasła:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Wynik ustaw jako `ADMIN_SESSION_SECRET`. Osobny klucz szyfrowania 2FA generuj tylko przy pierwszej konfiguracji; produkcja ma go już ustawionego:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Wynik to `ADMIN_2FA_ENCRYPTION_KEY`. Zachowaj istniejący klucz, jeśli 2FA jest już skonfigurowane. Panel logowania jest dostępny pod `https://makoto.com.pl/panel/login`.

Domyślnie logowanie wymaga loginu, hasła i poprawnego tokenu Turnstile zweryfikowanego przez serwer (hostname i akcja `admin-login`). Produkcja odrzuca testowe klucze Cloudflare. Lokalny `pnpm dev` używa oficjalnych kluczy testowych tylko dla adresów loopback; akceptuje formularz z `localhost` i `127.0.0.1` pod warunkiem zgodności Origin z adresem żądania. Nie oznacza to skutecznej ochrony przed botami w trybie developerskim.

Opcjonalne 2FA konfiguruje się w panelu **Ochrona**. Wygeneruj osobny `ADMIN_2FA_ENCRYPTION_KEY` poleceniem `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` i zachowaj go w menedżerze sekretów wraz z kopią bazy. Sekrety TOTP są szyfrowane AES-256-GCM. Kod QR jest tworzony lokalnie na serwerze, udostępniany tylko po potwierdzeniu hasła i nie trafia do zewnętrznego generatora. Konfiguracja wygasa po 10 minutach, jest związana z bieżącą sesją i wymaga potwierdzenia kodem przed aktywacją. Wyłączenie 2FA wymaga ponownego podania hasła. Zmiana 2FA unieważnia pozostałe sesje. TOTP dopuszcza jedną sąsiednią jednostkę 30 sekund i blokuje ponowne użycie zaakceptowanego kodu.

Migracja `0002_admin_security.sql` rozpoczyna nową konfigurację z wyłączonym 2FA; wcześniejszy `ADMIN_TOTP_SECRET` i skrypt `cms:totp` nie sterują już panelem. Po migracji można ponownie włączyć 2FA w zakładce Ochrona. Po ręcznej zmianie hasła unieważnij sesje (`UPDATE admin_sessions SET revoked_at = now() WHERE revoked_at IS NULL;`). Zmiana sekretu sesji unieważnia cookies, ale nie zmienia osobnego klucza szyfrowania 2FA. Nie usuwaj klucza szyfrowania przy aktywnym 2FA. Awaryjne odzyskanie dostępu wymaga administracyjnego dostępu do bazy: wyczyść `totp_secret`, `enabled_at`, `pending_secret`, `pending_expires_at` i `pending_session_hash` w wierszu `admin_security` oraz unieważnij wszystkie sesje, a potem skonfiguruj 2FA ponownie.

Zastosuj `pnpm db:migrate`, potem `pnpm db:seed` i import opisany w [CONTENT.md](CONTENT.md). Użyj `pnpm build` i uruchom `node .output/server/index.mjs` na serwerze Node obsługującym tę samą architekturę co build (Nuxt Image dołącza natywne `sharp`). Reverse proxy powinno ograniczać upload do 12 MB, terminować HTTPS i przekazywać prawidłowy nagłówek Host. Produkcyjne cookies panelu mają `Secure`, `HttpOnly` i `SameSite=Strict`.

## Przed przełączeniem ruchu

1. Zrób kopię PostgreSQL, R2 i źródłowego Strapi. Zapisz wynik `pnpm cms:migrate:dry-run` i zweryfikuj archiwum `node scripts/verify-strapi-export.mjs`.
2. Uzupełnij prawdziwe sekrety, wykonaj migracje, seed i import. Przejrzyj błędy i nieobsługiwane bloki w raporcie.
3. Sprawdź logowanie, szkice, publikację, media i formularz na środowisku testowym z osobnymi kluczami. Nie wysyłaj próbnych wiadomości do prawdziwych klientów.
4. Sprawdź po polsku i angielsku stronę główną, ofertę, lokalizacje, realizacje, artykuły, podgląd oraz widok mobilny. Porównaj canonical, hreflang i `/sitemap.xml` z opublikowanymi rekordami. Nieistniejące adresy mają zwracać 404.
5. Po wdrożeniu zgłoś nową sitemapę w Google Search Console, sprawdź indeksację ważnych adresów i błędy w raportach. W Profilu Firmy w Google zweryfikuj docelowy adres strony, obszar obsługi, usługi i zgodność informacji kontaktowych; nie dodawaj niepotwierdzonego adresu biura.

Przełączenie ruchu wymaga osobnej decyzji. Stara instancja Strapi i jej dane pozostają bez zmian do czasu potwierdzenia kompletności nowego CMS-u.
