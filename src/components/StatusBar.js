/**
 * StatusBar Component
 * Displays application status, current file, Node version, and server port
 */
export class StatusBar {
  /**
   * @param {HTMLElement} container - Container element for the status bar
   */
  constructor(container) {
    this.container = container;
    this.element = null;
    this.status = 'idle';
    this.currentFile = 'index.js';
    this.nodeVersion = 'Unknown';
    this.port = null;
    this.serverUrl = null;
  }

  /**
   * Initialize and render the status bar
   */
  init() {
    this.element = document.createElement('div');
    this.element.className = 'status-bar';
    this.element.innerHTML = `
      <div class="status-bar-section status-bar-left">
        <div class="status-indicator" data-status="idle">
          <span class="status-dot"></span>
          <span class="status-text">Idle</span>
        </div>
      </div>
      <div class="status-bar-section status-bar-center">
        <div class="status-item">
          <span class="status-icon">📄</span>
          <span class="status-file">index.js</span>
        </div>
      </div>
      <div class="status-bar-section status-bar-right">
        <div class="status-item status-node" title="Node.js version">
          <span class="status-icon">⬢</span>
          <span class="status-value">Node v...</span>
        </div>
        <div class="status-item status-port" title="Server port" style="display: none;">
          <span class="status-icon">🌐</span>
          <span class="status-value">Port: -</span>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);
  }

  /**
   * Set the application status
   * @param {string} status - Status: 'idle', 'loading', 'ready', 'error'
   * @param {string} message - Status message
   */
  setStatus(status, message = '') {
    this.status = status;
    const indicator = this.element?.querySelector('.status-indicator');
    const statusText = this.element?.querySelector('.status-text');

    if (!indicator || !statusText) return;

    indicator.setAttribute('data-status', status);

    const statusMessages = {
      idle: 'Idle',
      loading: message || 'Loading...',
      booting: 'Booting WebContainer...',
      installing: 'Installing dependencies...',
      starting: 'Starting server...',
      ready: 'Ready',
      error: message || 'Error'
    };

    statusText.textContent = statusMessages[status] || message || 'Unknown';
  }

  /**
   * Set the current file name
   * @param {string} fileName - Name of the current file
   */
  setCurrentFile(fileName) {
    this.currentFile = fileName;
    const fileElement = this.element?.querySelector('.status-file');
    if (fileElement) {
      fileElement.textContent = fileName;
    }
  }

  /**
   * Set the Node.js version
   * @param {string} version - Node.js version string
   */
  setNodeVersion(version) {
    this.nodeVersion = version;
    const nodeElement = this.element?.querySelector('.status-node .status-value');
    if (nodeElement) {
      nodeElement.textContent = `Node ${version}`;
    }
  }

  /**
   * Set the server port and URL
   * @param {number} port - Server port number
   * @param {string} url - Server URL
   */
  setServerInfo(port, url) {
    this.port = port;
    this.serverUrl = url;

    const portItem = this.element?.querySelector('.status-port');
    const portValue = this.element?.querySelector('.status-port .status-value');

    if (portItem && portValue) {
      portItem.style.display = 'flex';
      portValue.textContent = `Port: ${port}`;
      portItem.title = `Server running at ${url}`;
      portItem.style.cursor = 'pointer';

      // Make it clickable
      portItem.onclick = () => {
        window.open(url, '_blank');
      };
    }
  }

  /**
   * Clear server info
   */
  clearServerInfo() {
    this.port = null;
    this.serverUrl = null;

    const portItem = this.element?.querySelector('.status-port');
    if (portItem) {
      portItem.style.display = 'none';
    }
  }

  /**
   * Show a temporary message in the status bar
   * @param {string} message - Message to show
   * @param {number} duration - Duration in milliseconds
   */
  showMessage(message, duration = 3000) {
    const previousStatus = this.status;
    const statusText = this.element?.querySelector('.status-text');

    if (statusText) {
      const originalText = statusText.textContent;
      statusText.textContent = message;

      setTimeout(() => {
        if (statusText.textContent === message) {
          this.setStatus(previousStatus);
        }
      }, duration);
    }
  }

  /**
   * Show the status bar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Hide the status bar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}
