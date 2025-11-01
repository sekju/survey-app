/**
 * AppState - Centralized state management for the application
 * Manages files, tabs, editor state, and provides event system
 */
export class AppState {
  constructor() {
    // File system state
    this.files = {}; // { path: { name, content, isDirty } }

    // Tab state
    this.tabs = []; // [{ path, name, content, isDirty }]
    this.activeTabPath = null;

    // Editor state
    this.editorContent = '';
    this.editorCursorPosition = { line: 0, column: 0 };

    // UI state
    this.theme = 'oneDark';
    this.fontSize = 14;
    this.lineWrap = false;

    // Server state
    this.serverUrl = null;
    this.serverPort = null;
    this.isServerRunning = false;

    // Event listeners
    this.listeners = {
      'file:loaded': [],
      'file:saved': [],
      'file:created': [],
      'file:deleted': [],
      'file:renamed': [],
      'tab:opened': [],
      'tab:closed': [],
      'tab:switched': [],
      'tab:dirty': [],
      'editor:changed': [],
      'state:changed': [],
    };
  }

  /**
   * Subscribe to state changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    };
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Always emit state:changed
    if (event !== 'state:changed') {
      this.emit('state:changed', { event, data });
    }
  }

  // ==================== FILE OPERATIONS ====================

  /**
   * Load a file into state
   * @param {string} path - File path
   * @param {string} content - File content
   */
  loadFile(path, content) {
    const name = path.split('/').pop() || path;
    this.files[path] = {
      name,
      content,
      isDirty: false,
    };
    this.emit('file:loaded', { path, content });
  }

  /**
   * Get file from state
   * @param {string} path - File path
   * @returns {Object|null} File object or null
   */
  getFile(path) {
    return this.files[path] || null;
  }

  /**
   * Update file content
   * @param {string} path - File path
   * @param {string} content - New content
   */
  updateFileContent(path, content) {
    if (!this.files[path]) {
      console.warn(`File ${path} not loaded in state`);
      return;
    }

    const isDirty = this.files[path].content !== content;
    this.files[path].content = content;
    this.files[path].isDirty = isDirty;

    this.emit('file:saved', { path, content, isDirty });
  }

  /**
   * Create a new file
   * @param {string} path - File path
   * @param {string} content - Initial content
   */
  createFile(path, content = '') {
    const name = path.split('/').pop() || path;
    this.files[path] = {
      name,
      content,
      isDirty: false,
    };
    this.emit('file:created', { path, content });
  }

  /**
   * Delete a file
   * @param {string} path - File path
   */
  deleteFile(path) {
    if (!this.files[path]) {
      console.warn(`File ${path} not found in state`);
      return;
    }

    delete this.files[path];

    // Close associated tab if open
    const tabIndex = this.tabs.findIndex(t => t.path === path);
    if (tabIndex > -1) {
      this.closeTab(path);
    }

    this.emit('file:deleted', { path });
  }

  /**
   * Rename a file
   * @param {string} oldPath - Old file path
   * @param {string} newPath - New file path
   */
  renameFile(oldPath, newPath) {
    if (!this.files[oldPath]) {
      console.warn(`File ${oldPath} not found in state`);
      return;
    }

    const file = this.files[oldPath];
    const newName = newPath.split('/').pop() || newPath;

    // Create new file entry
    this.files[newPath] = {
      name: newName,
      content: file.content,
      isDirty: file.isDirty,
    };

    // Delete old entry
    delete this.files[oldPath];

    // Update tab if open
    const tab = this.tabs.find(t => t.path === oldPath);
    if (tab) {
      tab.path = newPath;
      tab.name = newName;

      if (this.activeTabPath === oldPath) {
        this.activeTabPath = newPath;
      }
    }

    this.emit('file:renamed', { oldPath, newPath });
  }

  // ==================== TAB OPERATIONS ====================

  /**
   * Open a tab
   * @param {string} path - File path
   * @param {string} name - File name
   * @param {string} content - File content
   * @returns {boolean} True if tab was opened/switched
   */
  openTab(path, name, content) {
    // Check if tab already exists
    const existingTab = this.tabs.find(t => t.path === path);
    if (existingTab) {
      this.switchTab(path);
      return false;
    }

    // Create new tab
    const tab = {
      path,
      name,
      content,
      isDirty: false,
    };

    this.tabs.push(tab);
    this.activeTabPath = path;

    // Load file into state if not already loaded
    if (!this.files[path]) {
      this.loadFile(path, content);
    }

    this.emit('tab:opened', { path, name, content });
    return true;
  }

  /**
   * Switch to a tab
   * @param {string} path - File path
   */
  switchTab(path) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) {
      console.warn(`Tab ${path} not found`);
      return;
    }

    this.activeTabPath = path;
    this.editorContent = tab.content;

    this.emit('tab:switched', { path, content: tab.content });
  }

  /**
   * Close a tab
   * @param {string} path - File path
   * @returns {string|null} Next active tab path or null
   */
  closeTab(path) {
    const index = this.tabs.findIndex(t => t.path === path);
    if (index === -1) {
      console.warn(`Tab ${path} not found`);
      return null;
    }

    // Remove tab
    this.tabs.splice(index, 1);

    // Determine next active tab
    let nextActivePath = null;
    if (this.activeTabPath === path) {
      if (this.tabs.length > 0) {
        // Switch to previous tab or first tab
        const nextTab = this.tabs[Math.max(0, index - 1)];
        nextActivePath = nextTab.path;
        this.switchTab(nextActivePath);
      } else {
        this.activeTabPath = null;
        this.editorContent = '';
      }
    }

    this.emit('tab:closed', { path, nextActivePath });
    return nextActivePath;
  }

  /**
   * Get active tab
   * @returns {Object|null} Active tab or null
   */
  getActiveTab() {
    return this.tabs.find(t => t.path === this.activeTabPath) || null;
  }

  /**
   * Set tab dirty state
   * @param {string} path - File path
   * @param {boolean} isDirty - Is dirty
   */
  setTabDirty(path, isDirty) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) {
      console.warn(`Tab ${path} not found`);
      return;
    }

    tab.isDirty = isDirty;

    // Also update file state
    if (this.files[path]) {
      this.files[path].isDirty = isDirty;
    }

    this.emit('tab:dirty', { path, isDirty });
  }

  /**
   * Update tab content
   * @param {string} path - File path
   * @param {string} content - New content
   */
  updateTabContent(path, content) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) {
      console.warn(`Tab ${path} not found`);
      return;
    }

    const isDirty = tab.content !== content;
    tab.content = content;
    tab.isDirty = isDirty;
  }

  // ==================== EDITOR OPERATIONS ====================

  /**
   * Update editor content
   * @param {string} content - New content
   */
  updateEditorContent(content) {
    this.editorContent = content;

    // Update active tab content
    if (this.activeTabPath) {
      this.updateTabContent(this.activeTabPath, content);
    }

    this.emit('editor:changed', { content });
  }

  /**
   * Update editor cursor position
   * @param {Object} position - Cursor position {line, column}
   */
  updateCursorPosition(position) {
    this.editorCursorPosition = position;
  }

  // ==================== SERVER OPERATIONS ====================

  /**
   * Set server info
   * @param {number} port - Server port
   * @param {string} url - Server URL
   */
  setServerInfo(port, url) {
    this.serverPort = port;
    this.serverUrl = url;
    this.isServerRunning = true;
  }

  /**
   * Clear server info
   */
  clearServerInfo() {
    this.serverPort = null;
    this.serverUrl = null;
    this.isServerRunning = false;
  }

  // ==================== UI OPERATIONS ====================

  /**
   * Set theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    this.theme = theme;
  }

  /**
   * Set font size
   * @param {number} size - Font size in px
   */
  setFontSize(size) {
    this.fontSize = size;
  }

  /**
   * Set line wrap
   * @param {boolean} wrap - Enable line wrap
   */
  setLineWrap(wrap) {
    this.lineWrap = wrap;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current state snapshot
   * @returns {Object} Current state
   */
  getState() {
    return {
      files: { ...this.files },
      tabs: [...this.tabs],
      activeTabPath: this.activeTabPath,
      editorContent: this.editorContent,
      editorCursorPosition: { ...this.editorCursorPosition },
      theme: this.theme,
      fontSize: this.fontSize,
      lineWrap: this.lineWrap,
      serverUrl: this.serverUrl,
      serverPort: this.serverPort,
      isServerRunning: this.isServerRunning,
    };
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.files = {};
    this.tabs = [];
    this.activeTabPath = null;
    this.editorContent = '';
    this.editorCursorPosition = { line: 0, column: 0 };
    this.serverUrl = null;
    this.serverPort = null;
    this.isServerRunning = false;

    this.emit('state:changed', { event: 'reset' });
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      fileCount: Object.keys(this.files).length,
      tabCount: this.tabs.length,
      dirtyFileCount: Object.values(this.files).filter(f => f.isDirty).length,
      dirtyTabCount: this.tabs.filter(t => t.isDirty).length,
      activeTab: this.activeTabPath,
      serverRunning: this.isServerRunning,
    };
  }
}

// Create singleton instance
export const appState = new AppState();
