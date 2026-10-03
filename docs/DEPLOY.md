# Konfiguracja i wdrożenie

## Usługi i zmienne

Użyj PostgreSQL z regularnymi kopiami i prywatnego bucketa Cloudflare R2. Nadaj kluczowi R2 dostęp tylko do tego bucketa. Ustaw zmienne z `.env.example` w środowisku serwera. `DATABASE_URL`, hasło administratora, sekret TOTP, sekret sesji, klucze R2, sekret Turnstile i klucz Web3Forms pozostają po stronie serwera. `TURNSTILE_SITE_KEY` jest kluczem publicznym. `SITE_URL` ustaw na adres origin strony bez końcowego ukośnika; w produkcji `https://makoto.com.pl`.

Wygeneruj hash hasła interaktywnie przez `pnpm cms:password`. Hasło musi mieć co najmniej 14 znaków, a `ADMIN_SESSION_SECRET` co najmniej 32 losowe znaki. Domyślnie logowanie wymaga loginu, hasła i poprawnego tokenu Turnstile zweryfikowanego przez serwer (hostname i akcja `admin-login`). Produkcja odrzuca testowe klucze Cloudflare. Lokalny `pnpm dev` używa oficjalnych kluczy testowych tylko dla adresów loopback; akceptuje formularz z `localhost` i `127.0.0.1` pod warunkiem zgodności Origin z adresem żądania. Nie oznacza to skutecznej ochrony przed botami w trybie developerskim.

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
