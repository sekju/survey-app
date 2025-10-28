# Changelog

Wszystkie istotne zmiany w projekcie WebContainers API Starter będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planowane
- CodeMirror 6 integration
- Syntax highlighting (JavaScript)
- Multi-file tabs
- AppState management
- Settings panel
- Template gallery

---

## [0.3.0] - 2025-10-28

### Added - Phase 3 (Partial)
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

### Code Metrics
- **Total JavaScript**: ~2200+ lines
- **Total CSS**: ~900+ lines
- **Components**: 6
- **Utilities**: 2
- **Documentation**: ~2500+ lines

### Files Created
1. src/utils/errorHandler.js (195 lines)
2. src/utils/debounce.js (89 lines)
3. src/components/LoadingSpinner.js (122 lines)
4. src/components/Terminal.js (226 lines)
5. src/components/StatusBar.js (181 lines)
6. src/components/FileTree.js (400+ lines)
7. architecture.md (documentation)
8. todo.md (plan)
9. TEST_REPORT.md (tests)
10. CHANGELOG.md (this file)

### Commits
1. `b9c95bf` - Phase 1 complete (critical fixes)
2. `a21efa1` - Phase 2 partial (Loading + Terminal)
3. `c86d33b` - Phase 2 complete (Status Bar)
4. `adac752` - Test report
5. `4f25ccc` - Phase 3 partial (FileTree)

### Time Invested
- Phase 1: 3h
- Phase 2: 5.5h
- Phase 3: 1.5h (so far)
- **Total**: 10h / 17.5h MVP (57% complete)

---

## Version History

| Version | Date | Phase | Status | Features |
|---------|------|-------|--------|----------|
| 0.3.0 | 2025-10-28 | Phase 3 | In Progress | FileTree, File Operations |
| 0.2.0 | 2025-10-28 | Phase 2 | Complete | Loading, Terminal, StatusBar |
| 0.1.0 | 2025-10-28 | Phase 1 | Complete | Error handling, Dependencies |
| 0.0.0 | Initial | - | Base | Basic WebContainer demo |

---

**Maintained by**: Claude Code
**Project**: WebContainers API Starter
**Repository**: survey-app
