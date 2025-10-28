/**
 * Global error handler for the application
 * Handles logging, user notifications, and optional error tracking
 */
export class ErrorHandler {
  static errorContainer = null;

  /**
   * Initialize error handler and create error display container
   */
  static init() {
    // Create error display container if it doesn't exist
    if (!this.errorContainer) {
      this.errorContainer = document.createElement('div');
      this.errorContainer.id = 'error-container';
      this.errorContainer.className = 'error-container';
      document.body.appendChild(this.errorContainer);
    }

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.handle(event.error, 'Unhandled Error');
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, 'Unhandled Promise Rejection');
    });
  }

  /**
   * Handle an error by logging it and showing it to the user
   * @param {Error | string} error - The error to handle
   * @param {string} context - Context where the error occurred
   */
  static async handle(error, context = 'Error') {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    // Log to console for debugging
    console.error(`[${context}]`, errorMessage);
    if (errorStack) {
      console.error('Stack:', errorStack);
    }

    // Show to user
    this.showUserError(errorMessage, context);

    // Optional: Send to error tracking service (e.g., Sentry)
    // await this.sendToErrorTracking(error, context);
  }

  /**
   * Show error message to user in the UI
   * @param {string} message - Error message to display
   * @param {string} context - Context of the error
   */
  static showUserError(message, context = 'Error') {
    if (!this.errorContainer) {
      this.init();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
      <div class="error-content">
        <div class="error-header">
          <span class="error-icon">⚠️</span>
          <strong>${context}</strong>
          <button class="error-close" aria-label="Close error message">×</button>
        </div>
        <div class="error-body">${this.escapeHtml(message)}</div>
      </div>
    `;

    // Add close button functionality
    const closeBtn = errorElement.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
      errorElement.classList.add('error-hiding');
      setTimeout(() => errorElement.remove(), 300);
    });

    // Append to container
    this.errorContainer.appendChild(errorElement);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (errorElement.parentElement) {
        errorElement.classList.add('error-hiding');
        setTimeout(() => errorElement.remove(), 300);
      }
    }, 10000);
  }

  /**
   * Show success message to user
   * @param {string} message - Success message to display
   * @param {string} context - Context of the success
   */
  static showSuccess(message, context = 'Success') {
    if (!this.errorContainer) {
      this.init();
    }

    const successElement = document.createElement('div');
    successElement.className = 'error-message success-message';
    successElement.innerHTML = `
      <div class="error-content">
        <div class="error-header">
          <span class="error-icon">✅</span>
          <strong>${context}</strong>
          <button class="error-close" aria-label="Close success message">×</button>
        </div>
        <div class="error-body">${this.escapeHtml(message)}</div>
      </div>
    `;

    const closeBtn = successElement.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
      successElement.classList.add('error-hiding');
      setTimeout(() => successElement.remove(), 300);
    });

    this.errorContainer.appendChild(successElement);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (successElement.parentElement) {
        successElement.classList.add('error-hiding');
        setTimeout(() => successElement.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Show info message to user
   * @param {string} message - Info message to display
   * @param {string} context - Context of the info
   */
  static showInfo(message, context = 'Info') {
    if (!this.errorContainer) {
      this.init();
    }

    const infoElement = document.createElement('div');
    infoElement.className = 'error-message info-message';
    infoElement.innerHTML = `
      <div class="error-content">
        <div class="error-header">
          <span class="error-icon">ℹ️</span>
          <strong>${context}</strong>
          <button class="error-close" aria-label="Close info message">×</button>
        </div>
        <div class="error-body">${this.escapeHtml(message)}</div>
      </div>
    `;

    const closeBtn = infoElement.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
      infoElement.classList.add('error-hiding');
      setTimeout(() => infoElement.remove(), 300);
    });

    this.errorContainer.appendChild(infoElement);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (infoElement.parentElement) {
        infoElement.classList.add('error-hiding');
        setTimeout(() => infoElement.remove(), 300);
      }
    }, 5000);
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
   * Optional: Send error to tracking service
   * @param {Error | string} error - The error to track
   * @param {string} context - Context where error occurred
   */
  static async sendToErrorTracking(error, context) {
    // Implement integration with Sentry, LogRocket, etc.
    // Example:
    // if (window.Sentry) {
    //   Sentry.captureException(error, { tags: { context } });
    // }
  }
}
