# Plan Naprawy i Rozwoju Aplikacji WebContainers

**Data utworzenia**: 2025-10-28
**Status projektu**: Analiza zakończona, gotowe do implementacji
**Priorytety**: P0 (Krytyczne) → P1 (Wysokie) → P2 (Średnie) → P3 (Niskie)

---

## 🔴 FAZA 1: NAPRAWA KRYTYCZNYCH BŁĘDÓW (P0)

### 1.1 Napraw Race Condition w DOM ✅
**Priorytet**: P0 (Krytyczny)
**Czas**: 15 min
**Pliki**: `main.js`

**Problem**:
```javascript
// Obecnie: elementy używane przed utworzeniem
window.addEventListener('load', async () => {
  textareaEl.value = files['index.js'].file.contents; // ❌ undefined!
  // ... później ...
  document.querySelector('#app').innerHTML = `...`;   // Dopiero tutaj tworzy DOM
  const textareaEl = document.querySelector('textarea'); // Dopiero tutaj dostępny
});
```

**Rozwiązanie**:
- Przenieś innerHTML PRZED window.load handler
- LUB: przenieś querySelector PRZED użyciem elementów
- Dodaj null checks

**Kroki**:
1. Przenieś `document.querySelector('#app').innerHTML` na początek load handlera
2. Przenieś deklaracje `textareaEl` i `iframeEl` zaraz po innerHTML
3. Dodaj walidację: `if (!textareaEl || !iframeEl) throw new Error('DOM not ready')`
4. Przetestuj w różnych przeglądarkach

---

### 1.2 Dodaj Globalną Obsługę Błędów ✅
**Priorytet**: P0 (Krytyczny)
**Czas**: 1h
**Pliki**: `main.js`, nowy `utils/errorHandler.js`

**Problem**:
- Brak try-catch blocks
- Błędy nie są pokazywane użytkownikowi
- Brak logowania błędów

**Rozwiązanie**:
```javascript
// utils/errorHandler.js
export class ErrorHandler {
  static async handle(error, context) {
    console.error(`[${context}]`, error);
    this.showUserError(error.message);
    // Optional: send to error tracking service
  }

  static showUserError(message) {
    // Display error in UI
  }
}

// main.js
try {
  webcontainerInstance = await WebContainer.boot();
} catch (error) {
  await ErrorHandler.handle(error, 'WebContainer Boot');
}
```

**Kroki**:
1. Stwórz `src/utils/errorHandler.js`
2. Opakuj wszystkie async operacje w try-catch
3. Dodaj UI element dla wyświetlania błędów
4. Dodaj style dla error toast/banner
5. Przetestuj różne scenariusze błędów

---

### 1.3 Napraw Brak Error Handling w installDependencies ✅
**Priorytet**: P0 (Krytyczny)
**Czas**: 30 min
**Pliki**: `main.js`

**Problem**:
```javascript
async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      console.log(data); // ❌ Tylko console.log, brak error handling
    }
  }))
  return installProcess.exit;
}
```

**Rozwiązanie**:
```javascript
async function installDependencies() {
  try {
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
        updateLoadingMessage(data); // Show to user
      }
    }));

    const exitCode = await installProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`npm install failed with exit code ${exitCode}`);
    }

    return exitCode;
  } catch (error) {
    await ErrorHandler.handle(error, 'Install Dependencies');
    throw error;
  }
}
```

**Kroki**:
1. Dodaj try-catch wrapper
2. Dodaj walidację exit code
3. Przekaż output do UI zamiast tylko console
4. Dodaj timeout (np. 60s)
5. Testuj z błędnymi dependencies

---

### 1.4 Update Dependencies do Najnowszych Wersji ✅
**Priorytet**: P0 (Krytyczny)
**Czas**: 30 min
**Pliki**: `package.json`, `files.js`

**Problem**:
```json
{
  "vite": "^4.1.0",              // Aktualna: 5.4.x
  "@webcontainer/api": "^1.1.3"  // Aktualna: 1.3.x
}
```

**Kroki**:
1. Run: `npm outdated`
2. Update `package.json`:
   ```json
   {
     "vite": "^5.4.0",
     "@webcontainer/api": "^1.3.0"
   }
   ```
3. Run: `npm install`
4. Sprawdź breaking changes w CHANGELOG
5. Update code jeśli API się zmieniło
6. Przetestuj build i dev server
7. Update również dependencies w `files.js` (usunąć "latest")

---

## 🟡 FAZA 2: POPRAWA UX I LOADING STATES (P1)

### 2.1 Stwórz Komponent Loading Spinner ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 1h
**Pliki**: nowy `src/components/LoadingSpinner.js`, `style.css`

**Funkcjonalność**:
```javascript
class LoadingSpinner {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  show(message = 'Loading...') {
    this.element = document.createElement('div');
    this.element.className = 'loading-spinner';
    this.element.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `;
    this.container.appendChild(this.element);
  }

  updateMessage(message) {
    if (this.element) {
      this.element.querySelector('p').textContent = message;
    }
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
```

**Kroki**:
1. Stwórz komponent LoadingSpinner
2. Dodaj CSS animations (spinner rotation)
3. Zintegruj z main.js:
   - Show: "Booting WebContainer..."
   - Update: "Installing dependencies..."
   - Update: "Starting dev server..."
   - Hide: when ready
4. Popraw loading.html z lepszym stylem

---

### 2.2 Dodaj Terminal Output Panel ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 2h
**Pliki**: nowy `src/components/Terminal.js`, `style.css`, `main.js`

**Layout**:
```
┌────────────────────┬────────────────────────┐
│   Editor           │     Preview            │
│                    │                        │
├────────────────────┴────────────────────────┤
│   Terminal Output (collapsible)            │
│   $ npm install                             │
│   added 57 packages in 3s                  │
│   $ npm run start                           │
│   App is live at http://localhost:3111     │
└────────────────────────────────────────────┘
```

**Funkcjonalność**:
```javascript
class Terminal {
  constructor(container) {
    this.lines = [];
    this.maxLines = 1000;
  }

  writeLine(text, type = 'info') {
    this.lines.push({ text, type, timestamp: Date.now() });
    if (this.lines.length > this.maxLines) {
      this.lines.shift();
    }
    this.render();
  }

  clear() {
    this.lines = [];
    this.render();
  }

  render() {
    // Update DOM
  }
}
```

**Kroki**:
1. Stwórz Terminal komponent
2. Update layout CSS (3-panel layout)
3. Dodaj przycisk collapse/expand
4. Pipe WebContainer output do terminal:
   ```javascript
   installProcess.output.pipeTo(new WritableStream({
     write(data) {
       terminal.writeLine(data);
     }
   }));
   ```
5. Dodaj auto-scroll do bottom
6. Dodaj kolorowanie (error: red, success: green)

---

### 2.3 Dodaj Status Bar ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 1h
**Pliki**: nowy `src/components/StatusBar.js`, `style.css`

**Design**:
```
┌──────────────────────────────────────────────────┐
│ ● Ready  │  index.js  │  Node v18.19.0  │  3111 │
└──────────────────────────────────────────────────┘
```

**Status States**:
- 🔴 Error
- 🟡 Loading
- 🟢 Ready
- 🔵 Running

**Kroki**:
1. Stwórz StatusBar komponent
2. Dodaj CSS (fixed bottom, flex layout)
3. Update status on events:
   - Boot: "Booting..."
   - Install: "Installing..."
   - Starting: "Starting server..."
   - Ready: "Ready"
   - Error: "Error: ..."
4. Pokazuj: current file, Node version, port

---

### 2.4 Dodaj Debounce dla Textarea Input ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 30 min
**Pliki**: nowy `src/utils/debounce.js`, `main.js`

**Problem**:
```javascript
textareaEl.addEventListener('input', (e) => {
  writeIndexJS(e.currentTarget.value); // ❌ Zapisuje przy każdym klawiszu!
});
```

**Rozwiązanie**:
```javascript
// utils/debounce.js
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// main.js
import { debounce } from './utils/debounce.js';

const debouncedWrite = debounce((content) => {
  writeIndexJS(content);
}, 300); // 300ms delay

textareaEl.addEventListener('input', (e) => {
  debouncedWrite(e.currentTarget.value);
});
```

**Kroki**:
1. Stwórz debounce utility
2. Wrap writeIndexJS
3. Ustaw delay na 300ms
4. Dodaj visual indicator "Saving..." podczas write
5. Test: szybkie pisanie nie powinno blokować UI

---

## 🟢 FAZA 3: FILE MANAGER & EDITOR ENHANCEMENT (P1)

### 3.1 Stwórz File Tree Component ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 3h
**Pliki**: nowy `src/components/FileTree.js`, `style.css`

**Layout**:
```
┌──────────┬──────────────────┬────────────────┐
│ Files    │  Editor          │   Preview      │
│ 📁 /     │                  │                │
│  📄 index│                  │                │
│  📄 pkg  │                  │                │
│  ➕ New  │                  │                │
└──────────┴──────────────────┴────────────────┘
```

**Funkcjonalność**:
- Wyświetl drzewo plików
- Click = open file
- Right-click menu: New, Delete, Rename
- Drag & drop (future)
- Icons dla różnych typów plików

**Kroki**:
1. Stwórz FileTree komponent
2. Render drzewa z FileSystemTree
3. Dodaj event handlers (click, right-click)
4. Dodaj CSS (tree indentation, icons)
5. Integruj z głównym UI
6. Update layout: 3-column grid

---

### 3.2 Dodaj Syntax Highlighting (CodeMirror) ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 2h
**Pliki**: `main.js`, `package.json`, `style.css`

**Dependencies**:
```bash
npm install codemirror @codemirror/lang-javascript @codemirror/theme-one-dark
```

**Implementacja**:
```javascript
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const editor = new EditorView({
  doc: files['index.js'].file.contents,
  extensions: [
    basicSetup,
    javascript(),
    oneDark,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        debouncedWrite(update.state.doc.toString());
      }
    })
  ],
  parent: document.querySelector('.editor')
});
```

**Kroki**:
1. Install CodeMirror 6
2. Zastąp textarea CodeMirror EditorView
3. Configure extensions (syntax, theme, basic setup)
4. Update event handler (EditorView.updateListener)
5. Dodaj language detection based on file extension
6. Dodaj theme switcher (light/dark)

---

### 3.3 Implementuj Multi-File Editing ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 2h
**Pliki**: `main.js`, nowy `src/state.js`

**State Management**:
```javascript
class AppState {
  constructor() {
    this.files = {};           // All files in memory
    this.currentFile = 'index.js';
    this.openFiles = new Set(['index.js']);
  }

  openFile(path) {
    this.openFiles.add(path);
    this.currentFile = path;
    this.emit('fileChanged', path);
  }

  closeFile(path) {
    this.openFiles.delete(path);
    if (this.currentFile === path) {
      this.currentFile = Array.from(this.openFiles)[0] || null;
    }
  }

  updateFile(path, content) {
    this.files[path] = content;
    this.emit('fileUpdated', { path, content });
  }
}
```

**UI - Tabs**:
```
┌─────────────────────────────────────────┐
│ [ index.js ✕ ] [ package.json ✕ ] [ + ]│
├─────────────────────────────────────────┤
│ Editor content here                     │
└─────────────────────────────────────────┘
```

**Kroki**:
1. Stwórz AppState class (state management)
2. Dodaj tabs UI nad editorem
3. Dodaj open/close file logic
4. Sync EditorView z currentFile
5. Persist state w sessionStorage
6. Dodaj "unsaved changes" indicator (*)

---

### 3.4 Dodaj File Operations (CRUD) ✅
**Priorytet**: P1 (Wysoki)
**Czas**: 2h
**Pliki**: nowy `src/core/fileSystem.js`, `FileTree.js`

**FileSystem Wrapper**:
```javascript
class FileSystemManager {
  constructor(webcontainer) {
    this.wc = webcontainer;
  }

  async createFile(path, content = '') {
    await this.wc.fs.writeFile(path, content);
  }

  async readFile(path) {
    return await this.wc.fs.readFile(path, 'utf-8');
  }

  async deleteFile(path) {
    await this.wc.fs.rm(path);
  }

  async renameFile(oldPath, newPath) {
    const content = await this.readFile(oldPath);
    await this.createFile(newPath, content);
    await this.deleteFile(oldPath);
  }

  async listFiles(dir = '/') {
    return await this.wc.fs.readdir(dir);
  }
}
```

**UI**:
- Right-click menu na FileTree:
  - New File
  - New Folder
  - Rename
  - Delete
  - Duplicate

**Kroki**:
1. Stwórz FileSystemManager wrapper
2. Dodaj context menu do FileTree
3. Implement modal dialogs (prompt for name)
4. Dodaj confirmation dla delete
5. Update FileTree po operacji
6. Handle errors (file exists, etc.)

---

## 🔵 FAZA 4: ADVANCED FEATURES (P2)

### 4.1 Dodaj Settings Panel ✅
**Priorytet**: P2 (Średni)
**Czas**: 2h
**Pliki**: nowy `src/components/Settings.js`

**Settings**:
```javascript
{
  theme: 'dark' | 'light',
  fontSize: 12-20,
  tabSize: 2 | 4,
  autoSave: boolean,
  autoSaveDelay: 500-5000,
  showLineNumbers: boolean,
  wordWrap: boolean
}
```

**UI**:
- Gear icon w header
- Modal overlay z settings
- Save to localStorage
- Apply immediately

**Kroki**:
1. Stwórz Settings komponent
2. Dodaj localStorage persistence
3. Apply settings do EditorView
4. Dodaj theme switcher
5. Dodaj font size slider
6. Test all settings

---

### 4.2 Implementuj Save/Load Projects (localStorage) ✅
**Priorytet**: P2 (Średni)
**Czas**: 2h
**Pliki**: nowy `src/core/projectManager.js`

**Funkcjonalność**:
```javascript
class ProjectManager {
  saveProject(name) {
    const project = {
      name,
      files: appState.files,
      timestamp: Date.now()
    };
    localStorage.setItem(`project:${name}`, JSON.stringify(project));
  }

  loadProject(name) {
    const data = localStorage.getItem(`project:${name}`);
    if (!data) throw new Error('Project not found');
    return JSON.parse(data);
  }

  listProjects() {
    const keys = Object.keys(localStorage);
    return keys
      .filter(k => k.startsWith('project:'))
      .map(k => k.replace('project:', ''));
  }

  deleteProject(name) {
    localStorage.removeItem(`project:${name}`);
  }
}
```

**UI**:
- "Save Project" button
- "Load Project" dropdown
- Auto-save on change (optional)
- Export/Import (JSON download)

**Kroki**:
1. Stwórz ProjectManager
2. Dodaj UI buttons (header)
3. Implement save/load logic
4. Dodaj modal dla project name input
5. Dodaj project list dropdown
6. Dodaj export/import as JSON
7. Handle quota exceeded error

---

### 4.3 Stwórz Template Gallery ✅
**Priorytet**: P2 (Średni)
**Czas**: 3h
**Pliki**: nowy `src/templates/`, `src/components/TemplateGallery.js`

**Templates**:
1. **Express.js** (current default)
2. **Express + TypeScript**
3. **React Vite App**
4. **Vue Vite App**
5. **Node.js CLI Tool**
6. **REST API with SQLite**
7. **WebSocket Server**

**Template Structure**:
```javascript
export const expressTemplate = {
  name: 'Express.js Server',
  description: 'Basic Express.js HTTP server',
  icon: '🚀',
  files: {
    'index.js': { file: { contents: '...' } },
    'package.json': { file: { contents: '...' } }
  }
};
```

**UI**:
- Welcome screen z template cards
- "New from Template" button
- Search/filter templates
- Preview code before creating

**Kroki**:
1. Stwórz template definitions (src/templates/)
2. Stwórz TemplateGallery komponent
3. Dodaj template cards z preview
4. Implement "Use Template" button
5. Load template files do WebContainer
6. Dodaj custom template upload
7. Style gallery (grid layout)

---

### 4.4 Dodaj Responsive Mobile Design ✅
**Priorytet**: P2 (Średni)
**Czas**: 3h
**Pliki**: `style.css`, nowy `src/styles/responsive.css`

**Breakpoints**:
```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr; /* Stack vertically */
    grid-template-rows: auto auto auto;
  }

  .file-tree {
    display: none; /* Hide on mobile, show as drawer */
  }
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    grid-template-columns: 200px 1fr; /* Narrow file tree */
  }
}
```

**Mobile Features**:
- Hamburger menu dla File Tree
- Swipeable tabs
- Bottom toolbar
- Responsive font sizes
- Touch-friendly buttons (min 44x44px)

**Kroki**:
1. Dodaj viewport meta tag
2. Stwórz responsive.css
3. Implement mobile breakpoints
4. Dodaj hamburger menu
5. Stack editor/preview vertically na mobile
6. Dodaj swipe gestures (optional)
7. Test na urządzeniach mobile

---

## 🟣 FAZA 5: QUALITY & TOOLING (P2)

### 5.1 Setup ESLint + Prettier ✅
**Priorytet**: P2 (Średni)
**Czas**: 1h
**Pliki**: nowy `.eslintrc.json`, `.prettierrc`, `package.json`

**Install**:
```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-import
```

**Config**:
```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "prettier"],
  "env": {
    "browser": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Scripts**:
```json
{
  "scripts": {
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.{js,css,html}\""
  }
}
```

**Kroki**:
1. Install dependencies
2. Create config files
3. Add npm scripts
4. Run lint:fix
5. Setup pre-commit hook (husky)
6. Add to CI/CD

---

### 5.2 Migrate to TypeScript ✅
**Priorytet**: P2 (Średni)
**Czas**: 4h
**Pliki**: wszystkie `.js` → `.ts`, nowy `tsconfig.json`

**Install**:
```bash
npm install -D typescript @types/node
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Migracja**:
1. Rename `.js` → `.ts`
2. Add type annotations
3. Define interfaces
4. Fix type errors
5. Update Vite config (already supports TS)
6. Update import statements

**Kroki**:
1. Install TypeScript
2. Create tsconfig.json
3. Rename files incrementally
4. Add types for WebContainer API
5. Define AppState types
6. Add component prop types
7. Run tsc --noEmit to check errors
8. Update npm scripts: `"type-check": "tsc --noEmit"`

---

### 5.3 Add Unit Tests (Vitest) ✅
**Priorytet**: P2 (Średni)
**Czas**: 3h
**Pliki**: nowy `src/**/*.test.js`, `vitest.config.js`

**Install**:
```bash
npm install -D vitest @vitest/ui happy-dom
```

**vitest.config.js**:
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
```

**Test Cases**:
```javascript
// debounce.test.js
import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
  it('should delay function execution', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(fn).toHaveBeenCalledOnce();
  });
});
```

**Kroki**:
1. Install Vitest
2. Create vitest.config.js
3. Write tests for utilities (debounce, errorHandler)
4. Write tests for FileSystemManager
5. Write tests for AppState
6. Add npm scripts: `"test": "vitest"`, `"test:ui": "vitest --ui"`
7. Run tests, achieve > 70% coverage

---

### 5.4 Setup GitHub Actions CI ✅
**Priorytet**: P2 (Średni)
**Czas**: 1h
**Pliki**: nowy `.github/workflows/ci.yml`

**Workflow**:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

**Kroki**:
1. Create `.github/workflows/ci.yml`
2. Setup linting step
3. Setup test step
4. Setup build step
5. Add deploy step (Vercel/Netlify)
6. Test workflow
7. Add status badge to README

---

## 🌟 FAZA 6: ADVANCED FEATURES (P3)

### 6.1 Dodaj Git Integration ✅
**Priorytet**: P3 (Niski)
**Czas**: 4h
**Pliki**: nowy `src/core/gitManager.js`

**Funkcjonalność**:
- Init git repo
- Commit changes
- Branch management
- Diff viewer
- Basic merge

**Library**: isomorphic-git (works in browser)

**Kroki**:
1. Install isomorphic-git
2. Initialize git repo w WebContainer
3. Auto-commit on file save
4. Show git status in StatusBar
5. Dodaj commit message dialog
6. Show commit history

---

### 6.2 Dodaj Code Completion (AI) ✅
**Priorytet**: P3 (Niski)
**Czas**: 6h
**Pliki**: nowy `src/ai/completion.js`

**Options**:
- Local: use CodeMirror autocomplete
- AI: integrate OpenAI/Anthropic API
- GitHub Copilot (if API available)

**Funkcjonalność**:
- Inline suggestions
- Trigger on Ctrl+Space
- Context-aware
- Multi-language support

**Kroki**:
1. Choose provider
2. Setup API integration
3. Add completion provider to CodeMirror
4. Handle streaming responses
5. Add accept/reject UI
6. Rate limit requests

---

### 6.3 Dodaj Collaboration Features (Realtime) ✅
**Priorytet**: P3 (Niski)
**Czas**: 8h
**Pliki**: nowy backend, `src/collaboration/`

**Stack**:
- WebSocket server (Node.js)
- CRDT (Conflict-free Replicated Data Type)
- Y.js dla collaborative editing
- WebRTC dla P2P (optional)

**Funkcjonalność**:
- Multi-user editing
- Cursors pokazujące innych użytkowników
- Chat
- Share link

**Kroki**:
1. Setup WebSocket server
2. Integrate Y.js z CodeMirror
3. Implement presence (cursors)
4. Add user authentication
5. Generate share links
6. Handle conflicts

---

### 6.4 Dodaj Cloud Sync (Firebase/Supabase) ✅
**Priorytet**: P3 (Niski)
**Czas**: 6h
**Pliki**: nowy `src/cloud/syncManager.js`

**Provider**: Firebase lub Supabase

**Funkcjonalność**:
- User authentication
- Save projects to cloud
- Sync across devices
- Share projects publicly
- Conflict resolution

**Kroki**:
1. Setup Firebase/Supabase project
2. Add authentication
3. Implement sync logic
4. Handle offline mode
5. Add conflict resolution
6. Show sync status

---

## 📊 FAZA 7: OPTIMIZATION & MONITORING (P3)

### 7.1 Performance Optimization ✅
**Priorytet**: P3 (Niski)
**Czas**: 4h

**Optimizations**:
1. **Code Splitting**:
   ```javascript
   // Lazy load editor
   const CodeMirror = await import('codemirror');
   ```

2. **Virtual Scrolling** dla FileTree (dla dużych projektów)

3. **Service Worker** do cache npm packages

4. **Bundle Size Optimization**:
   - Tree-shaking
   - Minification
   - Compression (gzip/brotli)

5. **CDN dla dependencies**

**Kroki**:
1. Analyze bundle size (vite-bundle-visualizer)
2. Implement code splitting
3. Add lazy loading
4. Setup Service Worker
5. Enable compression
6. Test performance (Lighthouse)

---

### 7.2 Add Error Tracking (Sentry) ✅
**Priorytet**: P3 (Niski)
**Czas**: 2h

**Install**:
```bash
npm install @sentry/browser
```

**Setup**:
```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_DSN',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

**Kroki**:
1. Create Sentry account
2. Install SDK
3. Initialize w main.js
4. Capture errors automatically
5. Add custom breadcrumbs
6. Setup alerts

---

### 7.3 Add Analytics ✅
**Priorytet**: P3 (Niski)
**Czas**: 2h

**Provider**: Plausible lub Google Analytics

**Events to Track**:
- Page views
- Project created
- File created/edited
- Template used
- Error occurred
- Average session time

**Kroki**:
1. Choose analytics provider
2. Install tracking script
3. Define events
4. Implement tracking calls
5. Setup dashboard
6. GDPR compliance (consent)

---

## 🎨 FAZA 8: POLISH & DOCUMENTATION (P3)

### 8.1 Improve UI/UX Design ✅
**Priorytet**: P3 (Niski)
**Czas**: 4h

**Improvements**:
- Better color scheme
- Consistent spacing
- Icons (Feather/Heroicons)
- Smooth transitions
- Loading skeletons
- Empty states
- Better error messages
- Tooltips
- Keyboard shortcuts overlay

**Kroki**:
1. Design new color palette
2. Add icon library
3. Update all components
4. Add transitions
5. Implement empty states
6. Add tooltips
7. Create shortcuts overlay

---

### 8.2 Write Comprehensive Documentation ✅
**Priorytet**: P3 (Niski)
**Czas**: 4h

**Documents**:
1. **README.md** - Updated overview
2. **CONTRIBUTING.md** - How to contribute
3. **ARCHITECTURE.md** - Already created ✅
4. **API.md** - API reference
5. **DEPLOYMENT.md** - Deployment guide
6. **TROUBLESHOOTING.md** - Common issues

**Kroki**:
1. Update README with new features
2. Add screenshots
3. Write API docs
4. Document all components
5. Add code examples
6. Create video tutorial

---

### 8.3 Create Landing Page ✅
**Priorytet**: P3 (Niski)
**Czas**: 4h

**Sections**:
- Hero (heading + CTA)
- Features grid
- Demo video/GIF
- Template showcase
- Testimonials
- FAQ
- Footer

**Tech**:
- Static HTML/CSS lub Astro
- Separate from main app
- SEO optimized

**Kroki**:
1. Design landing page
2. Create static page
3. Add demo video
4. Optimize for SEO
5. Deploy separately
6. Link from main app

---

## 📈 SUMMARY & METRICS

### Completion Checklist

**P0 - Krytyczne (must-have)**:
- [ ] 1.1 Race condition fix
- [ ] 1.2 Global error handling
- [ ] 1.3 Install error handling
- [ ] 1.4 Update dependencies

**P1 - Wysokie (should-have)**:
- [ ] 2.1 Loading spinner
- [ ] 2.2 Terminal output
- [ ] 2.3 Status bar
- [ ] 2.4 Debounce input
- [ ] 3.1 File tree
- [ ] 3.2 Syntax highlighting
- [ ] 3.3 Multi-file editing
- [ ] 3.4 File operations (CRUD)

**P2 - Średnie (nice-to-have)**:
- [ ] 4.1 Settings panel
- [ ] 4.2 Save/load projects
- [ ] 4.3 Template gallery
- [ ] 4.4 Responsive design
- [ ] 5.1 ESLint + Prettier
- [ ] 5.2 TypeScript migration
- [ ] 5.3 Unit tests
- [ ] 5.4 CI/CD

**P3 - Niskie (future)**:
- [ ] 6.1 Git integration
- [ ] 6.2 Code completion (AI)
- [ ] 6.3 Collaboration
- [ ] 6.4 Cloud sync
- [ ] 7.1 Performance optimization
- [ ] 7.2 Error tracking
- [ ] 7.3 Analytics
- [ ] 8.1 UI/UX polish
- [ ] 8.2 Documentation
- [ ] 8.3 Landing page

---

### Estimated Timeline

| Faza | Czas | Priorytet | Status |
|------|------|-----------|--------|
| Faza 1 | 3h | P0 | ⏳ Pending |
| Faza 2 | 5.5h | P1 | ⏳ Pending |
| Faza 3 | 9h | P1 | ⏳ Pending |
| Faza 4 | 10h | P2 | ⏳ Pending |
| Faza 5 | 9h | P2 | ⏳ Pending |
| Faza 6 | 24h | P3 | ⏳ Pending |
| Faza 7 | 8h | P3 | ⏳ Pending |
| Faza 8 | 12h | P3 | ⏳ Pending |
| **TOTAL** | **~80h** | | |

**MVP (Fazy 1-3)**: ~17.5 godzin
**Full Product (Fazy 1-5)**: ~36.5 godzin
**Complete (All)**: ~80 godzin

---

### Success Metrics

**Po Fazie 1-2 (MVP Bugs Fixed)**:
- ✅ Zero race conditions
- ✅ All errors handled gracefully
- ✅ Clear user feedback for all operations
- ✅ Dependencies up-to-date

**Po Fazie 3 (MVP Complete)**:
- ✅ Multi-file editing works
- ✅ Syntax highlighting enabled
- ✅ File tree functional
- ✅ Professional editor experience

**Po Fazie 5 (Production Ready)**:
- ✅ TypeScript migration complete
- ✅ Test coverage > 70%
- ✅ CI/CD pipeline running
- ✅ Code quality: ESLint 0 errors

**Final Product**:
- ✅ All P0-P2 features implemented
- ✅ Performance: Lighthouse > 90
- ✅ Responsive: works on mobile
- ✅ Accessible: WCAG 2.1 AA
- ✅ Documented: comprehensive docs

---

## 🚀 Quick Start Guide

### Rozpoczęcie pracy (Developers):

1. **Setup lokalny**:
   ```bash
   git clone <repo>
   cd survey-app
   npm install
   npm run dev
   ```

2. **Zacznij od P0 issues**:
   - Stwórz branch: `fix/race-condition`
   - Zaimplementuj fix
   - Napisz test
   - Submit PR

3. **Follow checklist**:
   - Zaznaczaj [ ] → [x] po ukończeniu
   - Update estimated time jeśli się różni
   - Dodaj notes o problemach

4. **Testing**:
   - Testuj każdą feature przed merge
   - Run full test suite: `npm test`
   - Check Lighthouse score

---

**Ostatnia aktualizacja**: 2025-10-28
**Wersja**: 1.0
**Autor**: Claude
**Status**: Ready for implementation 🚀
