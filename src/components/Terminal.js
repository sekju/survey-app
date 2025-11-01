/**
 * Terminal Component
 * Displays terminal output from WebContainer processes
 */
export class Terminal {
  /**
   * @param {HTMLElement} container - Container element for the terminal
   */
  constructor(container) {
    this.container = container;
    this.element = null;
    this.outputElement = null;
    this.lines = [];
    this.maxLines = 1000;
    this.isCollapsed = false;
    this.autoScroll = true;
  }

  /**
   * Initialize and render the terminal
   */
  init() {
    this.element = document.createElement('div');
    this.element.className = 'terminal-container';
    this.element.innerHTML = `
      <div class="terminal-header">
        <div class="terminal-title">
          <span class="terminal-icon">⌘</span>
          <span>Terminal Output</span>
        </div>
        <div class="terminal-controls">
          <button class="terminal-btn terminal-clear" title="Clear terminal" aria-label="Clear terminal">
            Clear
          </button>
          <button class="terminal-btn terminal-scroll" title="Toggle auto-scroll" aria-label="Toggle auto-scroll">
            📜
          </button>
          <button class="terminal-btn terminal-toggle" title="Collapse/Expand" aria-label="Toggle terminal">
            ▼
          </button>
        </div>
      </div>
      <div class="terminal-body">
        <div class="terminal-output"></div>
      </div>
    `;

    this.outputElement = this.element.querySelector('.terminal-output');

    // Add event listeners
    this.element.querySelector('.terminal-clear').addEventListener('click', () => this.clear());
    this.element.querySelector('.terminal-toggle').addEventListener('click', () => this.toggle());
    this.element.querySelector('.terminal-scroll').addEventListener('click', () => this.toggleAutoScroll());

    // Add scroll listener to detect manual scrolling
    const body = this.element.querySelector('.terminal-body');
    body.addEventListener('scroll', () => {
      const isAtBottom = body.scrollHeight - body.scrollTop <= body.clientHeight + 50;
      if (!isAtBottom && this.autoScroll) {
        // User scrolled up manually, disable auto-scroll temporarily
        this.setAutoScrollIndicator(false);
      } else if (isAtBottom && !this.autoScroll) {
        // User scrolled to bottom, re-enable auto-scroll
        this.setAutoScrollIndicator(true);
      }
    });

    this.container.appendChild(this.element);
  }

  /**
   * Write a line to the terminal
   * @param {string} text - Text to write
   * @param {string} type - Type of message ('info', 'error', 'success', 'command')
   */
  writeLine(text, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const line = {
      text: String(text).trim(),
      type,
      timestamp
    };

    this.lines.push(line);

    // Limit number of lines
    if (this.lines.length > this.maxLines) {
      this.lines.shift();
    }

    this.renderLine(line);

    // Auto-scroll to bottom if enabled
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Write command to terminal
   * @param {string} command - Command that was executed
   */
  writeCommand(command) {
    this.writeLine(`$ ${command}`, 'command');
  }

  /**
   * Render a single line
   * @param {Object} line - Line object to render
   */
  renderLine(line) {
    const lineElement = document.createElement('div');
    lineElement.className = `terminal-line terminal-${line.type}`;

    const timeElement = document.createElement('span');
    timeElement.className = 'terminal-time';
    timeElement.textContent = line.timestamp;

    const textElement = document.createElement('span');
    textElement.className = 'terminal-text';
    textElement.textContent = line.text;

    lineElement.appendChild(timeElement);
    lineElement.appendChild(textElement);

    this.outputElement.appendChild(lineElement);
  }

  /**
   * Clear all terminal output
   */
  clear() {
    this.lines = [];
    this.outputElement.innerHTML = '';
    this.writeLine('Terminal cleared', 'info');
  }

  /**
   * Toggle terminal collapsed/expanded
   */
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    const body = this.element.querySelector('.terminal-body');
    const toggleBtn = this.element.querySelector('.terminal-toggle');

    if (this.isCollapsed) {
      body.style.display = 'none';
      toggleBtn.textContent = '▶';
      this.element.classList.add('terminal-collapsed');
    } else {
      body.style.display = 'block';
      toggleBtn.textContent = '▼';
      this.element.classList.remove('terminal-collapsed');
      if (this.autoScroll) {
        this.scrollToBottom();
      }
    }
  }

  /**
   * Toggle auto-scroll
   */
  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
    this.setAutoScrollIndicator(this.autoScroll);

    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Set auto-scroll indicator
   * @param {boolean} enabled - Whether auto-scroll is enabled
   */
  setAutoScrollIndicator(enabled) {
    this.autoScroll = enabled;
    const scrollBtn = this.element.querySelector('.terminal-scroll');
    scrollBtn.style.opacity = enabled ? '1' : '0.5';
    scrollBtn.title = enabled ? 'Auto-scroll enabled' : 'Auto-scroll disabled';
  }

  /**
   * Scroll to bottom of terminal
   */
  scrollToBottom() {
    const body = this.element.querySelector('.terminal-body');
    body.scrollTop = body.scrollHeight;
  }

  /**
   * Show the terminal
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Hide the terminal
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Pipe a ReadableStream to the terminal
   * @param {ReadableStream} stream - Stream to pipe
   * @param {string} type - Type of output
   */
  pipeStream(stream, type = 'info') {
    stream.pipeTo(new WritableStream({
      write: (data) => {
        // Split by lines and write each
        const lines = String(data).split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            this.writeLine(line, type);
          }
        });
      }
    }));
  }
}
