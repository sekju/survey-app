/**
 * FileTree Component
 * Displays a tree view of files and folders in the virtual file system
 */
export class FileTree {
  /**
   * @param {HTMLElement} container - Container element for the file tree
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.element = null;
    this.files = options.files || {};
    this.currentFile = options.currentFile || null;
    this.onFileSelect = options.onFileSelect || (() => {});
    this.onFileCreate = options.onFileCreate || (() => {});
    this.onFileDelete = options.onFileDelete || (() => {});
    this.onFileRename = options.onFileRename || (() => {});
  }

  /**
   * Initialize and render the file tree
   */
  init() {
    this.element = document.createElement('div');
    this.element.className = 'file-tree';
    this.element.innerHTML = `
      <div class="file-tree-header">
        <span class="file-tree-title">📁 FILES</span>
        <button class="file-tree-btn" id="new-file-btn" title="New File" aria-label="Create new file">
          ➕
        </button>
      </div>
      <div class="file-tree-body" id="file-tree-content">
        <!-- Files will be rendered here -->
      </div>
    `;

    // Add event listeners
    const newFileBtn = this.element.querySelector('#new-file-btn');
    newFileBtn.addEventListener('click', () => this.handleNewFile());

    this.container.appendChild(this.element);
    this.render();
  }

  /**
   * Render the file tree
   */
  render() {
    const treeBody = this.element.querySelector('#file-tree-content');
    if (!treeBody) return;

    treeBody.innerHTML = '';

    // Render each file
    Object.keys(this.files).forEach(path => {
      const fileItem = this.createFileItem(path, this.files[path]);
      treeBody.appendChild(fileItem);
    });
  }

  /**
   * Create a file item element
   * @param {string} path - File path
   * @param {Object} fileData - File data object
   * @returns {HTMLElement} File item element
   */
  createFileItem(path, fileData) {
    const item = document.createElement('div');
    item.className = 'file-tree-item';
    item.dataset.path = path;

    if (this.currentFile === path) {
      item.classList.add('active');
    }

    const icon = this.getFileIcon(path);
    const name = path.split('/').pop() || path;

    item.innerHTML = `
      <div class="file-tree-item-content">
        <span class="file-tree-icon">${icon}</span>
        <span class="file-tree-name">${this.escapeHtml(name)}</span>
      </div>
      <div class="file-tree-actions">
        <button class="file-tree-action-btn file-delete-btn" title="Delete file" aria-label="Delete ${name}">
          🗑️
        </button>
      </div>
    `;

    // Click to select file
    const content = item.querySelector('.file-tree-item-content');
    content.addEventListener('click', () => {
      this.selectFile(path);
    });

    // Delete button
    const deleteBtn = item.querySelector('.file-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleDeleteFile(path);
    });

    // Right-click context menu
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, path);
    });

    return item;
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
   * Select a file
   * @param {string} path - File path to select
   */
  selectFile(path) {
    this.currentFile = path;

    // Update UI
    const items = this.element.querySelectorAll('.file-tree-item');
    items.forEach(item => {
      if (item.dataset.path === path) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Callback
    this.onFileSelect(path);
  }

  /**
   * Update files in the tree
   * @param {Object} files - New files object
   */
  updateFiles(files) {
    this.files = files;
    this.render();
  }

  /**
   * Add a new file to the tree
   * @param {string} path - File path
   * @param {Object} fileData - File data
   */
  addFile(path, fileData) {
    this.files[path] = fileData;
    this.render();
  }

  /**
   * Remove a file from the tree
   * @param {string} path - File path to remove
   */
  removeFile(path) {
    delete this.files[path];
    if (this.currentFile === path) {
      this.currentFile = null;
    }
    this.render();
  }

  /**
   * Handle new file creation
   */
  handleNewFile() {
    const fileName = prompt('Enter file name:', 'newfile.js');
    if (!fileName) return;

    // Validate filename
    if (this.files[fileName]) {
      alert('File already exists!');
      return;
    }

    const fileData = {
      file: {
        contents: '// New file\n'
      }
    };

    this.addFile(fileName, fileData);
    this.selectFile(fileName);
    this.onFileCreate(fileName, fileData);
  }

  /**
   * Handle file deletion
   * @param {string} path - File path to delete
   */
  handleDeleteFile(path) {
    const fileName = path.split('/').pop();
    const confirmed = confirm(`Delete "${fileName}"?`);

    if (confirmed) {
      this.removeFile(path);
      this.onFileDelete(path);
    }
  }

  /**
   * Show context menu for file operations
   * @param {MouseEvent} e - Mouse event
   * @param {string} path - File path
   */
  showContextMenu(e, path) {
    // Remove existing context menu
    const existing = document.querySelector('.file-tree-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'file-tree-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const fileName = path.split('/').pop();

    menu.innerHTML = `
      <div class="context-menu-item" data-action="rename">
        ✏️ Rename
      </div>
      <div class="context-menu-item" data-action="duplicate">
        📋 Duplicate
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item context-menu-danger" data-action="delete">
        🗑️ Delete
      </div>
    `;

    // Add click handlers
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleContextMenuAction(action, path);
        menu.remove();
      });
    });

    document.body.appendChild(menu);

    // Close menu on click outside
    const closeMenu = (event) => {
      if (!menu.contains(event.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  /**
   * Handle context menu action
   * @param {string} action - Action to perform
   * @param {string} path - File path
   */
  handleContextMenuAction(action, path) {
    const fileName = path.split('/').pop();

    switch (action) {
      case 'rename':
        const newName = prompt('Enter new name:', fileName);
        if (newName && newName !== fileName) {
          this.handleRenameFile(path, newName);
        }
        break;

      case 'duplicate':
        const duplicateName = prompt('Enter duplicate name:', `${fileName}.copy`);
        if (duplicateName) {
          this.handleDuplicateFile(path, duplicateName);
        }
        break;

      case 'delete':
        this.handleDeleteFile(path);
        break;
    }
  }

  /**
   * Handle file rename
   * @param {string} oldPath - Old file path
   * @param {string} newName - New file name
   */
  handleRenameFile(oldPath, newName) {
    if (this.files[newName]) {
      alert('File already exists!');
      return;
    }

    const fileData = this.files[oldPath];
    this.files[newName] = fileData;
    delete this.files[oldPath];

    if (this.currentFile === oldPath) {
      this.currentFile = newName;
    }

    this.render();
    this.onFileRename(oldPath, newName);
  }

  /**
   * Handle file duplication
   * @param {string} sourcePath - Source file path
   * @param {string} newName - New file name
   */
  handleDuplicateFile(sourcePath, newName) {
    if (this.files[newName]) {
      alert('File already exists!');
      return;
    }

    const sourceData = this.files[sourcePath];
    const duplicateData = JSON.parse(JSON.stringify(sourceData));

    this.addFile(newName, duplicateData);
    this.onFileCreate(newName, duplicateData);
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
   * Show the file tree
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Hide the file tree
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}
