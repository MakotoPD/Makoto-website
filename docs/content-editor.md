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
