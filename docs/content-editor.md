# Edycja treści

## Formularze

Wybierz treść w panelu i przełącz język PL / EN. Zmiany zapisujesz osobno dla bieżącego języka, tak jak treść wpisu.

- **Realizacje:** adres projektu, hasło przy zdjęciu, technologie z ikonami, ich kolejność oraz kolor primary. Paleta zachowuje dotychczasowe gradienty; można też wybrać własny kolor. Podgląd używa tej samej funkcji co sekcja realizacji na stronie.
- **Doświadczenie:** firma, daty zatrudnienia, bieżąca praca, lokalizacja, praca zdalna, technologie i umiejętności jako tagi.
- **Blog:** autor i kategorie wybierane po nazwach.
- **Portfolio:** rodzaj pracy i obraz wybierany z biblioteki mediów.
- **Autorzy:** dane autora, e-mail i zdjęcie.
- **O mnie / Linki:** nazwy, adresy, ikony i kolejność linków; strona Linki ma też osobną listę wyróżnionych linków.
- **Sekcje stron:** nagłówki, tekst, listy, pytania i odpowiedzi oraz wybór powiązanych realizacji, usług i lokalizacji po tytułach.

## Lokalne SEO i kontakt

W **Strony → Porozmawiajmy o Twoim projekcie** znajduje się formularz „Publiczne dane kontaktowe”: nazwa, e-mail, telefon, adres wizytówki Google, obszar współpracy i dodatkowy opis. Dane pojawiają się na stronie kontaktowej, stronie głównej i w stopce. Formularz kontaktowy używa tego samego publicznego adresu e-mail. Wysyłka wiadomości nadal korzysta z konfiguracji poczty aplikacji.

W **Realizacje** dostępne są „Klient i efekty projektu” oraz „Opinia klienta”. Miejscowość klienta automatycznie wiąże projekt ze stronami tego miasta. Można też wybrać dodatkowe lokalizacje i powiązane usługi. Opinia jest wyświetlana, gdy ma treść i autora; źródło jest opcjonalnym linkiem.

W **Lokalizacje** możesz wpisać dowolną miejscowość i wybrać nadrzędną usługę. Podstrony miast i usług łączą się automatycznie. Nagłówki, FAQ, opis współpracy, przykłady projektów i powiązane poradniki edytuje się w sekcjach. Sekcja „Powiązane poradniki” wybiera opublikowane artykuły po tytule.

`0004_local_seo_content.sql` aktualizuje wcześniejsze domyślne treści i dodaje dwa poradniki. Migracja zapisuje poprzedni i nowy stan w historii wpisu. Zmienione przez użytkownika pola są zachowywane; nowe pola danych łączą się z istniejącymi. Migracja nie kasuje zdjęć, technologii ani kolorów realizacji.

„Zaawansowane dane strony” było surowym zapisem ustawień szablonu w JSON. Standardowe ustawienia mają teraz formularze. Pozostałe niestandardowe pola techniczne pojawiają się w osobnej, opcjonalnej sekcji. Ich edycja nie zastępuje ustawień w formularzach. Dane archiwalne ze Strapi są zachowane.

## Dodawanie technologii, np. Angular

1. Zapisz ikonę jako `app/assets/icons/angular.svg`. Używaj nazw plików małymi literami, bez spacji.
2. W `shared/technology-catalog.ts` dodaj do tablicy:

```ts
{ name: 'Angular', file: 'angular.svg' },
```

3. Commit, push i deploy.

Angular pojawi się w katalogu technologii edytora realizacji oraz w wyborze tagów doświadczenia. Plik SVG trafi również automatycznie do wizualnej biblioteki ikon. Nie trzeba aktualizować żadnej drugiej listy ani dodawać kodu w komponencie edytora. Ścieżki w katalogu są liczone względem `app/assets/icons`; pozycje bez istniejącego pliku nie są wyświetlane.

Nowa technologia jest opcją do wybrania; nie jest automatycznie dopisywana do wcześniej zapisanych realizacji. Po wybraniu i zapisaniu realizacji jej nazwa oraz identyfikator ikony trafiają do istniejącego pola `data.stack`. Usunięcie pozycji z katalogu nie kasuje technologii z wpisów.

Nazwy technologii i ikony są wspólne dla języków. Lista użytych technologii oraz kolor realizacji należą do aktualnie edytowanej wersji językowej.
