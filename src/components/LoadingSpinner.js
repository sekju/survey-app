/**
 * LoadingSpinner Component
 * Displays a loading spinner with customizable message
 */
export class LoadingSpinner {
  /**
   * @param {HTMLElement} container - Container element to append spinner to
   */
  constructor(container) {
    this.container = container;
    this.element = null;
    this.messageElement = null;
  }

  /**
   * Show the loading spinner with a message
   * @param {string} message - Message to display
   */
  show(message = 'Loading...') {
    if (this.element) {
      // Already showing, just update message
      this.updateMessage(message);
      return;
    }

    this.element = document.createElement('div');
    this.element.className = 'loading-spinner-overlay';
    this.element.innerHTML = `
      <div class="loading-spinner-content">
        <div class="spinner">
          <div class="spinner-circle"></div>
        </div>
        <p class="loading-message">${this.escapeHtml(message)}</p>
        <div class="loading-progress">
          <div class="loading-progress-bar"></div>
        </div>
      </div>
    `;

    this.messageElement = this.element.querySelector('.loading-message');
    this.container.appendChild(this.element);

    // Trigger animation
    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  /**
   * Update the loading message
   * @param {string} message - New message to display
   */
  updateMessage(message) {
    if (this.messageElement) {
      this.messageElement.textContent = message;
    }
  }

  /**
   * Set progress (0-100)
   * @param {number} percent - Progress percentage (0-100)
   */
  setProgress(percent) {
    const progressBar = this.element?.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }

  /**
   * Hide the loading spinner
   */
  hide() {
    if (!this.element) return;

    this.element.classList.remove('visible');
    this.element.classList.add('hiding');

    setTimeout(() => {
      if (this.element && this.element.parentElement) {
        this.element.remove();
      }
      this.element = null;
      this.messageElement = null;
    }, 300);
  }

  /**
   * Show spinner inline (not as overlay)
   * @param {string} message - Message to display
   * @returns {HTMLElement} The spinner element
   */
  static createInline(message = 'Loading...') {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-inline';
    spinner.innerHTML = `
      <div class="spinner-small">
        <div class="spinner-circle"></div>
      </div>
      <span class="loading-message-inline">${this.escapeHtml(message)}</span>
    `;
    return spinner;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape HTML (instance method)
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    return LoadingSpinner.escapeHtml(text);
  }
}
