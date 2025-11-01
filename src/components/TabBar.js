/**
 * TabBar Component
 * Manages multiple open file tabs with switching and closing functionality
 */
export class TabBar {
  /**
   * @param {HTMLElement} container - Container element for the tab bar
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.element = null;
    this.tabs = options.tabs || [];
    this.activeTabPath = options.activeTabPath || null;
    this.onTabChange = options.onTabChange || (() => {});
    this.onTabClose = options.onTabClose || (() => {});
    this.maxTabs = options.maxTabs || 10;
  }

  /**
   * Initialize and render the tab bar
   */
  init() {
    this.element = document.createElement('div');
    this.element.className = 'tab-bar';
    this.element.innerHTML = `
      <div class="tab-bar-tabs" id="tab-bar-tabs">
        <!-- Tabs will be rendered here -->
      </div>
    `;

    this.container.appendChild(this.element);
    this.render();
  }

  /**
   * Render all tabs
   */
  render() {
    const tabsContainer = this.element?.querySelector('#tab-bar-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    if (this.tabs.length === 0) {
      tabsContainer.innerHTML = '<div class="tab-bar-empty">No files open</div>';
      return;
    }

    // Render each tab
    this.tabs.forEach(tab => {
      const tabElement = this.createTabElement(tab);
      tabsContainer.appendChild(tabElement);
    });
  }

  /**
   * Create a tab element
   * @param {Object} tab - Tab object {path, name, isDirty}
   * @returns {HTMLElement} Tab element
   */
  createTabElement(tab) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.dataset.path = tab.path;

    if (this.activeTabPath === tab.path) {
      tabEl.classList.add('tab-active');
    }

    const icon = this.getFileIcon(tab.path);
    const name = this.escapeHtml(tab.name);

    tabEl.innerHTML = `
      <span class="tab-icon">${icon}</span>
      <span class="tab-name">${name}</span>
      ${tab.isDirty ? '<span class="tab-dirty">•</span>' : ''}
      <button class="tab-close" title="Close tab" aria-label="Close ${name}">×</button>
    `;

    // Click to switch tab
    tabEl.addEventListener('click', (e) => {
      // Don't switch if clicking close button
      if (e.target.classList.contains('tab-close')) return;
      this.switchTab(tab.path);
    });

    // Close button
    const closeBtn = tabEl.querySelector('.tab-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tab.path);
    });

    return tabEl;
  }

  /**
   * Get icon for file based on extension
   * @param {string} path - File path
   * @returns {string} Icon emoji
   */
  getFileIcon(path) {
    const ext = path.split('.').pop().toLowerCase();
    const icons = {
      'js': '📜',
      'json': '📋',
      'html': '🌐',
      'css': '🎨',
      'md': '📝',
      'ts': '📘',
      'tsx': '⚛️',
      'jsx': '⚛️',
      'txt': '📄',
    };
    return icons[ext] || '📄';
  }

  /**
   * Add or switch to a tab
   * @param {string} path - File path
   * @param {string} name - File name
   * @param {string} content - File content
   */
  addTab(path, name, content = '') {
    // Check if tab already exists
    const existingTab = this.tabs.find(t => t.path === path);
    if (existingTab) {
      this.switchTab(path);
      return;
    }

    // Check max tabs limit
    if (this.tabs.length >= this.maxTabs) {
      console.warn(`Maximum ${this.maxTabs} tabs allowed`);
      return;
    }

    // Add new tab
    const newTab = {
      path,
      name,
      content,
      isDirty: false,
    };

    this.tabs.push(newTab);
    this.activeTabPath = path;
    this.render();
    this.onTabChange(path, content);
  }

  /**
   * Switch to a tab
   * @param {string} path - File path
   */
  switchTab(path) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;

    this.activeTabPath = path;
    this.render();
    this.onTabChange(path, tab.content);
  }

  /**
   * Close a tab
   * @param {string} path - File path
   */
  closeTab(path) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;

    // Confirm if dirty
    if (tab.isDirty) {
      const confirmed = confirm(`"${tab.name}" has unsaved changes. Close anyway?`);
      if (!confirmed) return;
    }

    // Remove tab
    const index = this.tabs.findIndex(t => t.path === path);
    this.tabs.splice(index, 1);

    // Switch to another tab if this was active
    if (this.activeTabPath === path) {
      if (this.tabs.length > 0) {
        // Switch to previous tab or first tab
        const newActiveTab = this.tabs[Math.max(0, index - 1)];
        this.switchTab(newActiveTab.path);
      } else {
        this.activeTabPath = null;
        this.onTabClose(path);
      }
    }

    this.render();
  }

  /**
   * Update tab content
   * @param {string} path - File path
   * @param {string} content - New content
   */
  updateTabContent(path, content) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;

    tab.content = content;
  }

  /**
   * Mark tab as dirty (unsaved changes)
   * @param {string} path - File path
   * @param {boolean} isDirty - Whether tab is dirty
   */
  setTabDirty(path, isDirty) {
    const tab = this.tabs.find(t => t.path === path);
    if (!tab) return;

    tab.isDirty = isDirty;
    this.render();
  }

  /**
   * Get active tab
   * @returns {Object|null} Active tab object
   */
  getActiveTab() {
    return this.tabs.find(t => t.path === this.activeTabPath) || null;
  }

  /**
   * Get all tabs
   * @returns {Array} Array of tab objects
   */
  getTabs() {
    return this.tabs;
  }

  /**
   * Close all tabs
   */
  closeAllTabs() {
    // Check for dirty tabs
    const dirtyTabs = this.tabs.filter(t => t.isDirty);
    if (dirtyTabs.length > 0) {
      const confirmed = confirm(`${dirtyTabs.length} file(s) have unsaved changes. Close all anyway?`);
      if (!confirmed) return;
    }

    this.tabs = [];
    this.activeTabPath = null;
    this.render();
    this.onTabClose(null);
  }

  /**
   * Close other tabs (keep only active)
   */
  closeOtherTabs() {
    if (!this.activeTabPath) return;

    const activeTab = this.getActiveTab();
    if (!activeTab) return;

    // Check for dirty tabs
    const dirtyTabs = this.tabs.filter(t => t.isDirty && t.path !== this.activeTabPath);
    if (dirtyTabs.length > 0) {
      const confirmed = confirm(`${dirtyTabs.length} file(s) have unsaved changes. Close anyway?`);
      if (!confirmed) return;
    }

    this.tabs = [activeTab];
    this.render();
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show the tab bar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Hide the tab bar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Destroy the tab bar and clean up
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.tabs = [];
    this.activeTabPath = null;
  }
}
