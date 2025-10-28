# Architektura Aplikacji WebContainers

## 1. Przegląd Aplikacji

**Nazwa**: WebContainers API Starter
**Typ**: Przeglądarkowe IDE/środowisko deweloperskie
**Główna Funkcjonalność**: Uruchamianie aplikacji Node.js bezpośrednio w przeglądarce bez backendu

### Cel Aplikacji
Aplikacja demonstracyjna pokazująca możliwości WebContainer API - technologii umożliwiającej uruchamianie Node.js, npm i systemu plików w przeglądarce. Przeznaczona jako starter dla:
- Interaktywnych platform edukacyjnych
- Narzędzi do onboardingu pracowników
- Interaktywnych tutoriali programowania
- Browser-based IDE

---

## 2. Stack Technologiczny

### Frontend
- **Build Tool**: Vite 4.1.0 (do aktualizacji)
- **Runtime**: Vanilla JavaScript (ES Modules)
- **Styling**: Pure CSS (bez preprocessorów)

### Runtime API
- **WebContainer API** 1.1.3 (do aktualizacji)
  - Browser-based Node.js runtime
  - Wirtualny system plików w pamięci
  - Obsługa npm i spawning procesów

### Wymagania Przeglądarki
- SharedArrayBuffer support
- Cross-Origin Isolation (COOP/COEP headers)
- Nowoczesna przeglądarka (Chrome 89+, Edge 89+, Safari 15.2+)
- HTTPS w produkcji

---

## 3. Architektura Systemu

### Struktura Katalogów
```
/home/user/survey-app/
├── src/                          # [DO UTWORZENIA] Kod źródłowy
│   ├── main.js                   # Główna logika aplikacji
│   ├── files.js                  # Definicja wirtualnego systemu plików
│   ├── components/               # [DO UTWORZENIA] Komponenty UI
│   ├── utils/                    # [DO UTWORZENIA] Funkcje pomocnicze
│   └── styles/                   # [DO UTWORZENIA] Moduły CSS
├── public/                       # Zasoby statyczne
│   ├── loading.html             # Ekran ładowania
│   └── stackblitz-favicon-editor.png
├── index.html                    # Główny punkt wejścia HTML
├── style.css                     # Główne style
├── vite.config.js               # Konfiguracja Vite
└── package.json                  # Zależności projektu
```

### Komponenty Aplikacji

#### 3.1 Główny UI (index.html + style.css)
```
┌─────────────────────────────────────────────────┐
│            Header (Tytuł + Link do docs)        │
├────────────────────┬────────────────────────────┤
│   Editor Pane      │     Preview Pane           │
│  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │  <textarea>  │  │  │   <iframe>           │  │
│  │  (Kod)       │  │  │   (Live Preview)     │  │
│  │              │  │  │                      │  │
│  └──────────────┘  │  └──────────────────────┘  │
└────────────────────┴────────────────────────────┘
```

#### 3.2 Moduł Główny (main.js)

**Odpowiedzialności**:
- Inicjalizacja UI
- Zarządzanie WebContainer instance
- Obsługa zdarzeń textarea
- Instalacja zależności
- Uruchamianie dev server
- Routing preview do iframe

**Funkcje**:
```javascript
- window.addEventListener('load')     // Entry point
- installDependencies()               // npm install
- startDevServer()                    // npm run start
- writeIndexJS(content)               // Zapis do FS
```

**Globalny Stan**:
- `webcontainerInstance`: WebContainer
- `textareaEl`: HTMLTextAreaElement
- `iframeEl`: HTMLIFrameElement

#### 3.3 Wirtualny System Plików (files.js)

**Struktura**:
```javascript
{
  'index.js': {
    file: { contents: '...' }  // Express.js server
  },
  'package.json': {
    file: { contents: '...' }  // Dependencies + scripts
  }
}
```

**Zawartość Wirtualnych Plików**:
- `index.js`: Express.js server na porcie 3111
- `package.json`: express + nodemon + start script

---

## 4. Przepływ Danych i Cykl Życia

### 4.1 Inicjalizacja Aplikacji
```
User loads page
      ↓
index.html renders
      ↓
main.js module loads
      ↓
window.load event fires
      ↓
┌─────────────────────┐
│ 1. Render UI        │ ← document.querySelector('#app').innerHTML = ...
│ 2. Query DOM        │ ← const textarea = querySelector('textarea')
│ 3. Set textarea     │ ← textareaEl.value = files['index.js']...
│ 4. Attach listener  │ ← textareaEl.addEventListener('input', ...)
└─────────────────────┘
      ↓
┌─────────────────────┐
│ WebContainer Boot   │
├─────────────────────┤
│ 1. Boot container   │ ← WebContainer.boot()
│ 2. Mount files      │ ← webcontainerInstance.mount(files)
│ 3. Install deps     │ ← spawn('npm', ['install'])
│ 4. Start dev server │ ← spawn('npm', ['run', 'start'])
│ 5. Listen ready     │ ← on('server-ready', ...)
│ 6. Set iframe src   │ ← iframeEl.src = url
└─────────────────────┘
      ↓
Application Ready
```

### 4.2 Runtime - Edycja Kodu
```
User types in textarea
      ↓
Input event fires
      ↓
writeIndexJS(content)
      ↓
webcontainerInstance.fs.writeFile('/index.js', content)
      ↓
Nodemon detects change
      ↓
Express server restarts
      ↓
New output in iframe
```

### 4.3 Process Management
```
WebContainer Instance
      ├── npm install process
      │     └── output → console.log
      │     └── exit code → check success
      │
      └── npm run start process
            └── nodemon index.js
                  └── Express server (port 3111)
                        └── server-ready event → iframe
```

---

## 5. Aktualne Funkcjonalności

### ✅ Zaimplementowane
1. **Split-pane editor** - Podział ekranu (kod | preview)
2. **Live code editing** - Edycja kodu w textarea
3. **Auto-reload** - Nodemon automatycznie restartuje server
4. **Virtual filesystem** - Pliki w pamięci przeglądarki
5. **npm support** - Instalacja dependencies
6. **Live preview** - iframe z działającą aplikacją
7. **Loading state** - Podstawowy ekran ładowania
8. **Express.js example** - Działający przykładowy serwer

---

## 6. Zidentyfikowane Problemy

### 🔴 Krytyczne Błędy

#### 6.1 Race Condition w DOM
**Lokalizacja**: main.js:9-12 vs 56-71
**Problem**:
```javascript
// Linia 9: textareaEl używany zanim DOM jest gotowy
textareaEl.value = files['index.js'].file.contents;

// Linie 56-65: innerHTML ustawiony TUTAJ
document.querySelector('#app').innerHTML = `...`;

// Linie 68-71: Elementy query tutaj
const iframeEl = document.querySelector('iframe');
const textareaEl = document.querySelector('textarea');
```
**Skutek**: Kod działa przez szczęście kolejności wykonania, ale jest kruchy

#### 6.2 Brak Obsługi Błędów
**Problemy**:
- Brak try-catch dla operacji WebContainer
- Brak feedbacku dla użytkownika przy błędach
- installDependencies() tylko loguje do konsoli
- startDevServer() nie obsługuje niepowodzeń spawn
- Brak timeout dla długich operacji
- Rzucany Error nie jest łapany (linia 20)

#### 6.3 Nieaktualne Zależności
```json
{
  "vite": "^4.1.0",           // Aktualna: 5.x/6.x
  "@webcontainer/api": "^1.1.3" // Aktualna: 1.3.x
}
```
**Skutek**: Brak nowych funkcji, potencjalne dziury bezpieczeństwa

### 🟡 Średnie Problemy

#### 6.4 UX Issues
- Brak wskaźników postępu instalacji
- Brak statusów operacji
- loading.html jest nieostylowany
- Brak możliwości resetu środowiska
- Brak informacji o błędach dla użytkownika

#### 6.5 Code Quality
- Brak debounce dla textarea input (zapis na każdym klawiszu)
- Zmienne globalne (webcontainerInstance)
- Brak TypeScript (tylko JSDoc)
- Brak walidacji input użytkownika
- Kruchy pattern querySelector po innerHTML

#### 6.6 Accessibility
- Brak labels dla textarea/iframe
- Brak ARIA attributes
- Brak keyboard navigation
- Brak focus management

### 🟢 Drobne Problemy

#### 6.7 CSS Issues
- Stała wysokość (20rem) - nie responsive
- Brak media queries
- container height: 100% nie działa bez html/body height
- Brak mobile breakpoints

#### 6.8 Configuration
- vite.config.js: brak headers dla preview (tylko dev)
- Brak build optimizations
- Brak compression config

---

## 7. Brakujące Funkcjonalności

### Podstawowe
1. ❌ **File Tree/Browser** - Zarządzanie wieloma plikami
2. ❌ **Syntax Highlighting** - Kolorowanie składni
3. ❌ **Terminal Output** - Panel z wyjściem konsoli
4. ❌ **Error Display** - Wyświetlanie błędów użytkownikowi
5. ❌ **Loading Indicators** - Wskaźniki postępu operacji

### Zaawansowane
6. ❌ **File Manager** - CRUD operacje na plikach
7. ❌ **Code Completion** - Autouzupełnianie
8. ❌ **Save/Load Projects** - Zapis do localStorage/cloud
9. ❌ **Example Templates** - Gotowe szablony projektów
10. ❌ **Settings Panel** - Konfiguracja edytora
11. ❌ **Dark Mode** - Przełącznik motywu
12. ❌ **Responsive Mobile** - Wsparcie dla mobile
13. ❌ **Process Management** - Stop/restart procesów
14. ❌ **Multiple Files Editing** - Tabs dla plików

---

## 8. Proponowana Nowa Architektura

### 8.1 Refaktor Struktury
```
/src
  /core
    - webcontainer.js      # WebContainer singleton
    - fileSystem.js        # FS operations wrapper
    - processManager.js    # Process spawning/management
  /components
    - Editor.js            # Code editor component
    - FileTree.js          # File browser
    - Terminal.js          # Terminal output
    - Preview.js           # iframe wrapper
    - LoadingSpinner.js    # Loading states
    - ErrorBoundary.js     # Error handling
  /utils
    - debounce.js          # Debounce utility
    - logger.js            # Logging system
    - errorHandler.js      # Centralized error handling
  /styles
    - variables.css        # CSS custom properties
    - components.css       # Component styles
    - responsive.css       # Media queries
  /templates
    - express.js           # Express template
    - react.js             # React template
    - vue.js               # Vue template
  - main.js               # Application entry
  - state.js              # State management
```

### 8.2 Separacja Odpowiedzialności

**State Management Layer**:
```javascript
class AppState {
  webcontainer: WebContainer | null
  currentFile: string
  files: FileSystemTree
  terminal: TerminalOutput[]
  isLoading: boolean
  error: Error | null
}
```

**UI Layer**:
- Komponenty są niezależne
- Komunikacja przez events/callbacks
- Każdy komponent ma własny CSS module

**Core Layer**:
- WebContainer wrapper z error handling
- FileSystem API z walidacją
- Process manager z lifecycle hooks

---

## 9. Security Considerations

### Obecne
- ✅ COOP/COEP headers skonfigurowane
- ✅ WebContainer izolacja sandbox
- ⚠️ Brak sanityzacji input użytkownika
- ⚠️ Bezpośrednie wykonanie kodu użytkownika

### Do Implementacji
- 🔒 Input validation
- 🔒 CSP (Content Security Policy)
- 🔒 Rate limiting dla operacji FS
- 🔒 Whitelist dozwolonych pakietów npm
- 🔒 Timeout dla długo działających procesów

---

## 10. Performance Considerations

### Obecne Bottlenecki
1. **Textarea zapisuje na każdy keystroke** - brak debounce
2. **Brak code splitting** - wszystko w jednym bundle
3. **Brak lazy loading** - WebContainer boot od razu
4. **Brak cache** - każde przeładowanie reinstaluje deps

### Optymalizacje
1. Debounce dla writeFile (300ms)
2. Code splitting (lazy load components)
3. Service Worker dla cache npm packages
4. Virtual scrolling dla długich plików
5. Web Workers dla ciężkich operacji

---

## 11. Deployment Architecture

### Development
```
Developer Machine
      ↓
npm run dev
      ↓
Vite Dev Server (localhost:5173)
  ├── COOP/COEP headers
  ├── HMR enabled
  └── Source maps
      ↓
Browser
  └── WebContainer Runtime
        └── Virtual Node.js + npm
```

### Production
```
Source Code
      ↓
npm run build
      ↓
Vite Build (dist/)
  ├── Minified JS
  ├── Optimized CSS
  └── Hashed assets
      ↓
Static Hosting (Vercel/Netlify/CF Pages)
  ├── HTTPS required
  ├── COOP/COEP headers
  └── CDN distribution
      ↓
User Browser
  └── WebContainer Runtime
```

### Required Headers for Production
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Content-Type: text/html; charset=utf-8
```

---

## 12. Testing Strategy (Do Implementacji)

### Unit Tests
- FileSystem operations
- Debounce utilities
- Error handlers
- State management

### Integration Tests
- WebContainer boot sequence
- File write → server restart flow
- npm install process
- iframe loading

### E2E Tests
- User edits code → sees changes
- Error handling flows
- Loading states
- Multi-file editing

### Test Tools (Proponowane)
- Vitest (unit + integration)
- Playwright (E2E)
- Testing Library (component)

---

## 13. Roadmap

### Faza 1: Stabilizacja (Priorytet 1)
- ✅ Napraw race condition
- ✅ Dodaj error handling
- ✅ Update dependencies
- ✅ Popraw loading states
- ✅ Dodaj user feedback

### Faza 2: Core Features (Priorytet 2)
- ✅ File tree/browser
- ✅ Syntax highlighting (CodeMirror/Monaco)
- ✅ Terminal output panel
- ✅ Multiple file editing

### Faza 3: Enhancement (Priorytet 3)
- ✅ Save/load to localStorage
- ✅ Template gallery
- ✅ Settings panel
- ✅ Responsive design

### Faza 4: Advanced (Priorytet 4)
- ✅ Code completion
- ✅ Git integration
- ✅ Cloud sync
- ✅ Collaboration features

---

## 14. Metryki Sukcesu

### Performance
- Time to Interactive: < 3s
- WebContainer boot: < 2s
- npm install: < 10s
- File write latency: < 100ms

### Code Quality
- Test coverage: > 80%
- No TypeScript errors
- ESLint: 0 warnings
- Lighthouse: > 90/100

### User Experience
- Error recovery rate: > 95%
- Loading time perception: "fast"
- Feature discovery: intuitive
- Mobile usability: good

---

## 15. Dokumentacja Techniczna

### API Reference
- WebContainer API: https://webcontainers.io/api
- FileSystem API: https://webcontainers.io/api/filesystem
- Process API: https://webcontainers.io/api/processes

### Resources
- Vite Documentation: https://vitejs.dev
- ES Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- COOP/COEP: https://web.dev/coop-coep

---

**Wersja dokumentu**: 1.0
**Data utworzenia**: 2025-10-28
**Autor**: Claude (Analiza kodu)
**Status**: Draft - wymaga review
