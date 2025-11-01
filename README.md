# WebContainer Live Coding Demo

Interaktywna aplikacja demonstracyjna pokazująca możliwości WebContainer API - uruchamianie Node.js i serwera Express bezpośrednio w przeglądarce.

## Czym jest ta aplikacja?

To demonstracja WebContainer API, która tworzy **środowisko kodowania na żywo w przeglądarce**. Aplikacja składa się z dwóch głównych części:

- **Edytor kodu** (textarea) - lewa strona ekranu
- **Podgląd na żywo** (iframe) - prawa strona ekranu

Edytor pozwala na modyfikowanie kodu Express.js w czasie rzeczywistym, a zmiany są natychmiast widoczne w podglądzie.

## Jak to działa?

1. **Inicjalizacja WebContainer** - Aplikacja uruchamia WebContainer (Node.js w przeglądarce)
2. **Montowanie systemu plików** - Tworzy wirtualny system plików z:
   - `index.js` - serwer Express.js
   - `package.json` - zależności (express, nodemon)
3. **Instalacja zależności** - Automatycznie uruchamia `npm install` w kontenerze
4. **Uruchomienie serwera** - Startuje Express.js przy użyciu `npm run start` (nodemon)
5. **Live preview** - Wyświetla działający serwer w iframe
6. **Edycja na żywo** - Każda zmiana w edytorze zapisuje plik `/index.js` w WebContainer

## Aplikacja Express

Domyślnie uruchamiana aplikacja Express to prosty serwer, który:
- Nasłuchuje na porcie 3111
- Odpowiada na żądania GET do `/` wiadomością: "Welcome to a WebContainers app! 🥳"
- Używa nodemon do automatycznego przeładowania przy zmianach

## Wymagania techniczne

### Cross-Origin Isolation

WebContainer wymaga [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), co z kolei wymaga [cross-origin isolation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements).

Serwer musi zwracać następujące nagłówki:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Więcej informacji:
- [Artykuł o COOP/COEP](https://blog.stackblitz.com/posts/cross-browser-with-coop-coep/)
- [Dokumentacja wsparcia przeglądarek](https://developer.stackblitz.com/docs/platform/browser-support)

### HTTPS w produkcji

W środowisku produkcyjnym aplikacja **musi być serwowana przez HTTPS**. Localhost jest zwolniony z tego wymogu podczas rozwoju.

## Uruchomienie projektu

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Build produkcyjny
npm run build

# Podgląd builda
npm run preview
```

## Struktura projektu

```
.
├── index.html      # Strona główna z headerem
├── loading.html    # Ekran ładowania podczas instalacji npm
├── main.js         # Główna logika WebContainer
├── files.js        # Definicja systemu plików (index.js i package.json dla Express)
├── style.css       # Style aplikacji (grid layout, dark textarea)
├── package.json    # Zależności projektu (Vite, WebContainer API)
└── vite.config.js  # Konfiguracja Vite
```

## Technologie

- **WebContainer API** (v1.1.3) - Runtime Node.js w przeglądarce
- **Vite** (v4.1.0) - Build tool i dev server
- **Express.js** - Framework uruchamiany w WebContainer
- **Nodemon** - Auto-reload serwera przy zmianach

## Troubleshooting

### Cookie blockers

Blokery ciasteczek (wtyczki lub wbudowane w przeglądarkę) mogą uniemożliwić działanie WebContainer. Sprawdź:
- Event `on('error')` w WebContainer
- [Dokumentację o blokerach](https://developer.stackblitz.com/docs/platform/third-party-blocker)

### Inne problemy

Zobacz [stronę Troubleshooting](https://webcontainers.io/guides/troubleshooting) w dokumentacji.

## Dodatkowe zasoby

- [Dokumentacja WebContainer API](https://webcontainers.io)
- [WebContainer API demo](https://webcontainer.new)

## Licencja

Copyright 2023 StackBlitz, Inc.
