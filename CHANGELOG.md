# Changelog

Wszystkie istotne zmiany w projekcie WebContainers API Starter będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planowane
- Settings panel
- Template gallery
- Keyboard shortcuts
- Search & Replace UI
- Git integration
- File upload/download

---

## [0.4.0] - 2025-10-29

### Added - Phase 3 Complete ✅
- **CodeMirror 6 Editor** (src/components/Editor.js - 213 lines)
  - Professional code editor replacing textarea
  - JavaScript syntax highlighting (@codemirror/lang-javascript)
  - One Dark theme (@codemirror/theme-one-dark)
  - Line numbers and gutters
  - Code folding support
  - Auto-indentation
  - Bracket matching
  - Search & replace (Ctrl+F)
  - Multiple cursors
  - getValue/setValue API
  - Focus, read-only, cursor position APIs
  - Full editor lifecycle management

- **TabBar Component** (src/components/TabBar.js - 327 lines)
  - Multi-file tab management
  - Active tab highlighting (#007acc border)
  - Unsaved changes indicator (• cyan dot)
  - Close button (×) with dirty confirmation
  - Max 10 tabs limit (configurable)
  - File icons by extension
  - Horizontal scroll for overflow
  - Empty state message
  - Click to switch between files
  - XSS protection

- **AppState System** (src/core/AppState.js - 475 lines)
  - Centralized state management
  - Event-driven architecture (pub/sub)
  - File state management
  - Tab state management
  - Editor state tracking
  - Server state tracking
  - UI preferences storage
  - Event system with 10+ events
  - Subscribe/unsubscribe API
  - State snapshots (getState)
  - Statistics API (getStats)
  - Reset functionality

### Changed
- **Layout Enhancement**
  - Editor wrapped in flex column container
  - TabBar placed above editor (36px height)
  - Editor takes remaining height (flex: 1)
  - Seamless integration with grid layout

- **Main.js Integration**
  - Imported and initialized AppState
  - All file operations route through AppState
  - Tab operations synchronized with AppState
  - Editor onChange updates AppState
  - Event listeners for debugging
  - Initial files loaded into state on startup

- **Dependencies Updated**
  - Added codemirror ^6.0.1
  - Added @codemirror/lang-javascript ^6.2.2
  - Added @codemirror/theme-one-dark ^6.1.2
  - Total: 18 new packages
  - Still 0 vulnerabilities ✅

### CSS
- **CodeMirror Styles** (~60 lines)
  - .editor-wrapper container styles
  - .cm-editor height and font styling
  - .cm-scroller overflow handling
  - Custom scrollbar (#282c34 track)
  - 14px Menlo/Monaco font

- **TabBar Styles** (~130 lines)
  - Dark theme (#2d2d2d background)
  - Tab styling with hover effects
  - Active tab highlighting
  - Dirty indicator styling
  - Close button animations
  - Horizontal scroll
  - Min/max width (100-200px)

### Performance
- Build time: 1.70s (up from 244ms due to CM6)
- Bundle size: 537.67 kB (179.34 kB gzipped)
- 47 modules transformed (was 45)
- No performance issues observed
- Memory efficient state management

### Commits
1. `28d9220` - CodeMirror 6 integration
2. `83834cc` - TabBar multi-file tabs
3. `7a6285d` - AppState management system

---

## [0.3.0] - 2025-10-28

### Added - Phase 3 (Partial - FileTree only)
- **FileTree Component** (src/components/FileTree.js)
  - File browser with tree view (200px left panel)
  - File icons based on extension (📜 .js, 📋 .json, 🌐 .html, 🎨 .css, etc.)
  - Click to select and load files
  - Active file highlighting (#007acc blue)
  - Hover delete button
  - Right-click context menu:
    - ✏️ Rename file
    - 📋 Duplicate file
    - 🗑️ Delete file
  - New file creation with ➕ button
  - File operations integrated with WebContainer FS
  - Terminal feedback for all operations
  - Error notifications on failures
  - XSS protection (escapeHtml)

### Changed
- Updated layout from 2-column to 3-column grid
- Layout now: FileTree (200px) | Editor (1fr) | Preview (1fr)
- Terminal spans full width below main panels
- Added file operation handlers:
  - `handleFileSelect()` - loads file content
  - `handleFileCreate()` - creates in WebContainer FS
  - `handleFileDelete()` - removes from WebContainer FS
  - `handleFileRename()` - renames in WebContainer FS

### CSS
- Added 180+ lines of FileTree CSS
- File tree styling (light theme #f5f5f5)
- Context menu styling
- Hover effects and transitions
- Custom scrollbar for file tree

### Documentation
- Updated architecture.md to v2.0
- Updated todo.md to v2.0
- Created CHANGELOG.md

---

## [0.2.0] - 2025-10-28

### Added - Phase 2 Complete
- **LoadingSpinner Component** (src/components/LoadingSpinner.js)
  - Fullscreen overlay with animated spinner
  - Progress bar (0-100%)
  - Dynamic message updates
  - Smooth fade in/out animations
  - Shows during: boot, install, server start

- **Terminal Component** (src/components/Terminal.js)
  - Live output from WebContainer processes
  - Timestamps for each line
  - Color-coded messages:
    - Info (default)
    - Error (red)
    - Success (green)
    - Command (cyan)
  - Collapsible/expandable panel
  - Auto-scroll with manual override
  - Clear button
  - Max 1000 lines (circular buffer)
  - VS Code dark theme
  - Custom scrollbar

- **StatusBar Component** (src/components/StatusBar.js)
  - Fixed bar at bottom (VS Code style)
  - Animated status indicator (pulsing dot)
  - Status states: idle, loading, ready, error
  - Displays current file name
  - Shows Node.js version
  - Shows server port with clickable link
  - Color-coded states:
    - Gray (idle)
    - Orange pulsing (loading)
    - Green (ready)
    - Red pulsing (error)

### Changed
- Updated layout to support terminal panel
- Terminal placed below editor/preview (full width)
- Status bar fixed at bottom (28px height)
- main.js: integrated all new components
- Better user feedback during initialization

### CSS
- Added 250+ lines of new CSS
- Loading spinner animations
- Terminal dark theme
- Status bar styling
- Smooth transitions

---

## [0.1.0] - 2025-10-28

### Added - Phase 1 Complete
- **ErrorHandler Component** (src/utils/errorHandler.js)
  - Global error handling system
  - Toast notifications (error, success, info)
  - Auto-dismiss after 10 seconds
  - Manual close button
  - Slide in/out animations
  - Unhandled error listeners
  - Unhandled promise rejection listeners
  - XSS protection

- **Debounce Utility** (src/utils/debounce.js)
  - Standard debounce function
  - Leading edge debounce
  - Throttle function
  - 300ms delay for textarea input

- **Project Structure**
  - Created src/utils/ directory
  - Created src/components/ directory
  - Created src/core/ directory (for future use)

### Changed
- **Fixed Race Condition** in main.js
  - DOM elements now created before use
  - Added `initializeUI()` function
  - Proper element query order
  - Added null checks

- **Updated Dependencies**
  - Vite: 4.1.0 → 7.1.12 (major update!)
  - @webcontainer/api: 1.1.3 → 1.6.1
  - Ran `npm audit fix --force`
  - **Result: 0 vulnerabilities** ✅

- **Improved Error Handling**
  - All async operations wrapped in try-catch
  - installDependencies() now validates exit code
  - startDevServer() handles errors gracefully
  - writeIndexJS() catches file write errors
  - User-friendly error messages

- **Performance Optimization**
  - Added debounce to textarea input (300ms)
  - Significantly reduced file system writes
  - Better responsiveness during typing

### CSS
- Added error handling styles (~100 lines)
- Toast notification animations
- Slide in/out keyframes

### Documentation
- Created architecture.md (1100+ lines)
- Created todo.md (800+ lines)
- Created TEST_REPORT.md (600+ lines)

### Testing
- Comprehensive test report
- All 9 test categories passing
- Build: 244ms
- Bundle: 43 KB (11 KB gzipped)
- Code quality: 5/5

---

## [0.0.0] - Initial State

### Initial Features
- Basic WebContainer API integration
- Simple textarea editor
- iframe preview
- Express.js example application
- Vite build setup
- COOP/COEP headers configured

### Known Issues (Fixed in 0.1.0)
- Race condition in DOM manipulation
- No error handling
- Outdated dependencies (5 vulnerabilities)
- No debouncing (writes on every keystroke)
- No user feedback during operations

---

## Statistics

### Code Metrics (v0.4.0)
- **Total JavaScript**: ~3700+ lines (was ~2200)
- **Total CSS**: ~1100+ lines (was ~900)
- **Components**: 9 (was 6)
  - LoadingSpinner, Terminal, StatusBar (Phase 2)
  - FileTree, Editor, TabBar (Phase 3)
- **Core Modules**: 1
  - AppState (Phase 3)
- **Utilities**: 2
  - ErrorHandler, debounce
- **Documentation**: ~3000+ lines

### Files Created
1. src/utils/errorHandler.js (195 lines) - Phase 1
2. src/utils/debounce.js (89 lines) - Phase 1
3. src/components/LoadingSpinner.js (122 lines) - Phase 2
4. src/components/Terminal.js (226 lines) - Phase 2
5. src/components/StatusBar.js (181 lines) - Phase 2
6. src/components/FileTree.js (400+ lines) - Phase 3
7. src/components/Editor.js (213 lines) - Phase 3 ⭐
8. src/components/TabBar.js (327 lines) - Phase 3 ⭐
9. src/core/AppState.js (475 lines) - Phase 3 ⭐
10. architecture.md (documentation)
11. todo.md (plan)
12. TEST_REPORT.md (tests)
13. CHANGELOG.md (this file)

### Commits
1. `b9c95bf` - Phase 1 complete (critical fixes)
2. `a21efa1` - Phase 2 partial (Loading + Terminal)
3. `c86d33b` - Phase 2 complete (Status Bar)
4. `adac752` - Test report
5. `4f25ccc` - Phase 3 partial (FileTree)
6. `c3a23df` - Documentation update
7. `28d9220` - CodeMirror 6 integration ⭐
8. `83834cc` - TabBar multi-file tabs ⭐
9. `7a6285d` - AppState management ⭐

### Time Invested
- Phase 1: 3h (Critical Fixes)
- Phase 2: 5.5h (UX Improvements)
- Phase 3: 6h (File Manager & Editor)
- Documentation: 1.5h
- **Total**: 16h / 17.5h MVP (91% complete)

---

## Version History

| Version | Date | Phase | Status | Features |
|---------|------|-------|--------|----------|
| 0.4.0 | 2025-10-29 | Phase 3 | Complete ✅ | CodeMirror 6, Tabs, AppState |
| 0.3.0 | 2025-10-28 | Phase 3 | Partial | FileTree, File Operations |
| 0.2.0 | 2025-10-28 | Phase 2 | Complete | Loading, Terminal, StatusBar |
| 0.1.0 | 2025-10-28 | Phase 1 | Complete | Error handling, Dependencies |
| 0.0.0 | Initial | - | Base | Basic WebContainer demo |

---

**Maintained by**: Claude Code
**Project**: WebContainers API Starter
**Repository**: survey-app
