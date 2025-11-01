/**
 * Editor Component
 * CodeMirror 6 editor with JavaScript syntax highlighting
 */
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

export class Editor {
  /**
   * @param {HTMLElement} container - Container element for the editor
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.editorView = null;
    this.onChange = options.onChange || (() => {});
    this.initialContent = options.content || '';
    this.language = options.language || 'javascript';
    this.theme = options.theme || 'oneDark';
    this.readOnly = options.readOnly || false;
  }

  /**
   * Initialize and render the editor
   */
  init() {
    // Clear container
    this.container.innerHTML = '';

    // Create editor wrapper
    const editorWrapper = document.createElement('div');
    editorWrapper.className = 'editor-wrapper';

    // Configure extensions
    const extensions = [
      basicSetup,
      this.getLanguageExtension(),
      this.getThemeExtension(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.handleChange(update);
        }
      }),
    ];

    // Add read-only if needed
    if (this.readOnly) {
      extensions.push(EditorView.editable.of(false));
    }

    // Create CodeMirror editor
    this.editorView = new EditorView({
      doc: this.initialContent,
      extensions: extensions,
      parent: editorWrapper,
    });

    this.container.appendChild(editorWrapper);
  }

  /**
   * Get language extension based on selected language
   * @returns {Extension} Language extension
   */
  getLanguageExtension() {
    switch (this.language) {
      case 'javascript':
      case 'js':
        return javascript();
      default:
        return javascript();
    }
  }

  /**
   * Get theme extension based on selected theme
   * @returns {Extension} Theme extension
   */
  getThemeExtension() {
    switch (this.theme) {
      case 'oneDark':
        return oneDark;
      default:
        return oneDark;
    }
  }

  /**
   * Handle content change
   * @param {ViewUpdate} update - CodeMirror update object
   */
  handleChange(update) {
    const content = update.state.doc.toString();
    this.onChange(content);
  }

  /**
   * Get current editor content
   * @returns {string} Current content
   */
  getValue() {
    if (!this.editorView) return '';
    return this.editorView.state.doc.toString();
  }

  /**
   * Set editor content
   * @param {string} content - New content
   */
  setValue(content) {
    if (!this.editorView) return;

    this.editorView.dispatch({
      changes: {
        from: 0,
        to: this.editorView.state.doc.length,
        insert: content,
      },
    });
  }

  /**
   * Get current cursor position
   * @returns {Object} Cursor position {line, column}
   */
  getCursorPosition() {
    if (!this.editorView) return { line: 0, column: 0 };

    const pos = this.editorView.state.selection.main.head;
    const line = this.editorView.state.doc.lineAt(pos);

    return {
      line: line.number,
      column: pos - line.from,
      position: pos,
    };
  }

  /**
   * Focus the editor
   */
  focus() {
    if (this.editorView) {
      this.editorView.focus();
    }
  }

  /**
   * Enable or disable read-only mode
   * @param {boolean} readOnly - Whether editor should be read-only
   */
  setReadOnly(readOnly) {
    if (!this.editorView) return;

    this.readOnly = readOnly;
    this.editorView.dispatch({
      effects: EditorView.editable.reconfigure(EditorView.editable.of(!readOnly)),
    });
  }

  /**
   * Change the editor language
   * @param {string} language - Language name (e.g., 'javascript')
   */
  setLanguage(language) {
    if (!this.editorView) return;

    this.language = language;
    // For dynamic language switching, we would need to reconfigure the language extension
    // This is a simplified version - would need more complex state management for full implementation
    console.warn('Dynamic language switching requires editor reconfiguration');
  }

  /**
   * Insert text at cursor position
   * @param {string} text - Text to insert
   */
  insertText(text) {
    if (!this.editorView) return;

    const pos = this.editorView.state.selection.main.head;
    this.editorView.dispatch({
      changes: { from: pos, insert: text },
      selection: { anchor: pos + text.length },
    });
  }

  /**
   * Destroy the editor and clean up
   */
  destroy() {
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Show the editor
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Hide the editor
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}
