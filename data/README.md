# Kopia publicznych treści Strapi

Plik `strapi-public-export.json` zawiera odpowiedzi publicznego API `https://api.makoto.com.pl` dla treści używanych przez stronę. Pola `documentId`, `locale`, `localizations`, oryginalne slugi, daty i powiązania pozostają w odpowiedziach. Pole `records` jest podzielone według typu treści i języka, np. `articles:pl`. Pole `media` mapuje oryginalny adres pliku na kopię w `strapi-media/`, rozmiar i sumę SHA-256.

## Ponowne użycie

1. Sprawdź kopię: `node scripts/verify-strapi-export.mjs` z katalogu głównego repozytorium.
2. Przy imporcie do nowego CMS-u przetwarzaj rekordy z `records` według typu. Użyj `documentId` jako identyfikatora źródłowego i `locale` do powiązania tłumaczeń. Zachowaj `slug`, `createdAt`, `updatedAt`, `publishedAt` oraz pola SEO.
3. Wgraj pliki z `strapi-media/` do docelowego magazynu. Mapowanie `media` pozwala zamienić adresy `/uploads/...` w rekordach na nowe adresy.
4. Po imporcie porównaj liczby rekordów z raportem weryfikatora, slugi i powiązania językowe oraz sprawdź losowe artykuły i obrazy.

Odświeżenie kopii: `node scripts/export-strapi.mjs`. Można ustawić `STRAPI_URL` i `STRAPI_TOKEN` w środowisku; skrypt nie wypisuje tokenu.

To kopia danych udostępnianych przez API, a nie pełny backup bazy Strapi. Nie obejmuje szkiców, kont, uprawnień, konfiguracji pluginów ani plików, których nie wskazują pobrane rekordy. Token nie zmienia automatycznie tego zakresu. Do pełnego odtworzenia samego Strapi potrzebny jest backup jego bazy i katalogu uploadów albo eksport wykonany na serwerze Strapi. Nie uruchamiaj importu w produkcji bez kopii docelowej bazy.
