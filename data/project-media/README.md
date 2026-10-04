# Zdjęcia realizacji

Oryginalne zrzuty Spectra i Denalify przekazane przez autora strony. `manifest.json` zawiera metadane, sumy kontrolne i klucze plików w R2. Migracja `0005_project_content.sql` dodaje ich powiązania z realizacjami PL/EN, a kolejne zmiany wykonuje się w panelu CMS.

Przy odtwarzaniu zawartości w nowym bucketcie, przed migracją bazy uruchom z konfiguracją R2 w środowisku:

```sh
node scripts/restore-project-media.mjs
```

Skrypt pomija już istniejące obiekty. `cms:setup` wykonuje ten krok automatycznie. Miniatury są generowane przez aplikację przy użyciu `?size=small`, `?size=medium` lub `?size=big`.
