# Konfiguracja i wdrożenie

## Usługi i zmienne

Użyj PostgreSQL z regularnymi kopiami i prywatnego bucketa Cloudflare R2. Nadaj kluczowi R2 dostęp tylko do tego bucketa. Ustaw zmienne z `.env.example` w środowisku serwera. `DATABASE_URL`, hasło administratora, sekret TOTP, sekret sesji, klucze R2, sekret Turnstile i klucz Web3Forms pozostają po stronie serwera. `TURNSTILE_SITE_KEY` jest kluczem publicznym. `SITE_URL` ustaw na adres origin strony bez końcowego ukośnika; w produkcji `https://makoto.com.pl`.

Wygeneruj hash hasła interaktywnie przez `pnpm cms:password`, a sekret i URI dla aplikacji uwierzytelniającej przez `pnpm cms:totp`. Wklej wynik do bezpiecznego menedżera sekretów i ustaw w środowisku; nie zapisuj go w Git. Hasło musi mieć co najmniej 14 znaków, a `ADMIN_SESSION_SECRET` co najmniej 32 losowe znaki. Login wymaga hasła i TOTP. Po zmianie hasła lub TOTP unieważnij sesje (`UPDATE admin_sessions SET revoked_at = now() WHERE revoked_at IS NULL;`). Przy zmianie sekretu sesji wszystkie bieżące cookies przestaną działać. TOTP dopuszcza jedną sąsiednią jednostkę 30 sekund i blokuje ponowne użycie zaakceptowanego kodu.

Zastosuj `pnpm db:migrate`, potem `pnpm db:seed` i import opisany w [CONTENT.md](CONTENT.md). Użyj `pnpm build` i uruchom `node .output/server/index.mjs` na serwerze Node obsługującym tę samą architekturę co build (Nuxt Image dołącza natywne `sharp`). Reverse proxy powinno ograniczać upload do 12 MB, terminować HTTPS i przekazywać prawidłowy nagłówek Host. Produkcyjne cookies panelu mają `Secure`, `HttpOnly` i `SameSite=Strict`.

## Przed przełączeniem ruchu

1. Zrób kopię PostgreSQL, R2 i źródłowego Strapi. Zapisz wynik `pnpm cms:migrate:dry-run` i zweryfikuj archiwum `node scripts/verify-strapi-export.mjs`.
2. Uzupełnij prawdziwe sekrety, wykonaj migracje, seed i import. Przejrzyj błędy i nieobsługiwane bloki w raporcie.
3. Sprawdź logowanie, szkice, publikację, media i formularz na środowisku testowym z osobnymi kluczami. Nie wysyłaj próbnych wiadomości do prawdziwych klientów.
4. Sprawdź po polsku i angielsku stronę główną, ofertę, lokalizacje, realizacje, artykuły, podgląd oraz widok mobilny. Porównaj canonical, hreflang i `/sitemap.xml` z opublikowanymi rekordami. Nieistniejące adresy mają zwracać 404.
5. Po wdrożeniu zgłoś nową sitemapę w Google Search Console, sprawdź indeksację ważnych adresów i błędy w raportach. W Profilu Firmy w Google zweryfikuj docelowy adres strony, obszar obsługi, usługi i zgodność informacji kontaktowych; nie dodawaj niepotwierdzonego adresu biura.

Przełączenie ruchu wymaga osobnej decyzji. Stara instancja Strapi i jej dane pozostają bez zmian do czasu potwierdzenia kompletności nowego CMS-u.
