import './style.css'
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { ErrorHandler } from './src/utils/errorHandler.js';
import { debounce } from './src/utils/debounce.js';
import { LoadingSpinner } from './src/components/LoadingSpinner.js';
import { Terminal } from './src/components/Terminal.js';
import { StatusBar } from './src/components/StatusBar.js';
import { FileTree } from './src/components/FileTree.js';
import { Editor } from './src/components/Editor.js';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

/** @type {HTMLIFrameElement | null} */
let iframeEl = null;

/** @type {Editor | null} */
let editor = null;

/** @type {Terminal | null} */
let terminal = null;

/** @type {StatusBar | null} */
let statusBar = null;

/** @type {FileTree | null} */
let fileTree = null;

// Initialize error handler
ErrorHandler.init();

window.addEventListener('load', async () => {
  // Create loading spinner
  const spinner = new LoadingSpinner(document.body);

  try {
    // Show initial loading
    spinner.show('Initializing application...');

    // Initialize DOM first
    initializeUI();

    // Initialize StatusBar
    statusBar = new StatusBar(document.body);
    statusBar.init();
    statusBar.setStatus('loading', 'Initializing...');

    // Initialize FileTree
    const fileTreeContainer = document.querySelector('#file-tree-container');
    if (fileTreeContainer) {
      fileTree = new FileTree(fileTreeContainer, {
        files: files,
        currentFile: 'index.js',
        onFileSelect: (path) => handleFileSelect(path),
        onFileCreate: (path, data) => handleFileCreate(path, data),
        onFileDelete: (path) => handleFileDelete(path),
        onFileRename: (oldPath, newPath) => handleFileRename(oldPath, newPath)
      });
      fileTree.init();
    }

    // Initialize Terminal
    const terminalContainer = document.querySelector('#terminal-container');
    if (terminalContainer) {
      terminal = new Terminal(terminalContainer);
      terminal.init();
      terminal.writeLine('WebContainer Terminal initialized', 'success');
    }

    // Get DOM elements after UI is created
    iframeEl = document.querySelector('iframe');
    const editorContainer = document.querySelector('.editor');

    // Validate DOM elements exist
    if (!editorContainer || !iframeEl) {
      throw new Error('Required DOM elements not found');
    }

    // Create debounced write function (300ms delay)
    const debouncedWrite = debounce((content) => {
      writeIndexJS(content);
    }, 300);

    // Initialize CodeMirror Editor
    editor = new Editor(editorContainer, {
      content: files['index.js'].file.contents,
      language: 'javascript',
      theme: 'oneDark',
      onChange: (content) => {
        debouncedWrite(content);
      }
    });
    editor.init();

    // Boot WebContainer
    spinner.updateMessage('Booting WebContainer...');
    spinner.setProgress(20);
    statusBar.setStatus('booting');

    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);

    // Get Node version
    const nodeVersionProcess = await webcontainerInstance.spawn('node', ['--version']);
    let nodeVersion = '';
    nodeVersionProcess.output.pipeTo(new WritableStream({
      write(data) {
        nodeVersion += data;
      }
    }));
    await nodeVersionProcess.exit;
    statusBar.setNodeVersion(nodeVersion.trim());

    // Install dependencies
    spinner.updateMessage('Installing dependencies...');
    spinner.setProgress(50);
    statusBar.setStatus('installing');

    const exitCode = await installDependencies();
    if (exitCode !== 0) {
      statusBar.setStatus('error', 'Installation failed');
      throw new Error('Installation failed with exit code: ' + exitCode);
    }

    // Start dev server
    spinner.updateMessage('Starting development server...');
    spinner.setProgress(80);
    statusBar.setStatus('starting');

    await startDevServer();

    // Complete
    spinner.setProgress(100);
    spinner.updateMessage('Application ready!');
    statusBar.setStatus('ready');

    // Hide spinner after brief delay
    setTimeout(() => {
      spinner.hide();
      ErrorHandler.showSuccess('WebContainer application is ready!', 'Success');
    }, 500);

  } catch (error) {
    spinner.hide();
    statusBar?.setStatus('error', 'Initialization failed');
    await ErrorHandler.handle(error, 'Application Initialization');
  }
});

async function installDependencies() {
  try {
    terminal?.writeCommand('npm install');

    // Install dependencies
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
        terminal?.writeLine(data, 'info');
      }
    }));

    // Wait for install command to exit
    const exitCode = await installProcess.exit;

    if (exitCode !== 0) {
      terminal?.writeLine(`npm install failed with exit code ${exitCode}`, 'error');
      throw new Error(`npm install failed with exit code ${exitCode}`);
    }

    terminal?.writeLine('Dependencies installed successfully', 'success');
    return exitCode;
  } catch (error) {
    await ErrorHandler.handle(error, 'Install Dependencies');
    throw error;
  }
}

async function startDevServer() {
  try {
    terminal?.writeCommand('npm run start');

    // Run `npm run start` to start the Express app
    const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);

    // Log server output
    serverProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log('[Server]', data);
        terminal?.writeLine(data, 'info');
      }
    }));

    // Wait for `server-ready` event
    webcontainerInstance.on('server-ready', (port, url) => {
      console.log(`Server ready at ${url}`);
      terminal?.writeLine(`Server ready at ${url}`, 'success');
      terminal?.writeLine(`Preview available in iframe`, 'info');
      statusBar?.setServerInfo(port, url);
      iframeEl.src = url;
    });

    return serverProcess;
  } catch (error) {
    await ErrorHandler.handle(error, 'Start Dev Server');
    throw error;
  }
}

/**
 * @param {string} content
 */
async function writeIndexJS(content) {
  try {
    await webcontainerInstance.fs.writeFile('/index.js', content);
  } catch (error) {
    await ErrorHandler.handle(error, 'Write File');
  }
}

/**
 * Initialize the UI by rendering the main application layout
 */
function initializeUI() {
  const appContainer = document.querySelector('#app');
  if (!appContainer) {
    throw new Error('#app container not found');
  }

  appContainer.innerHTML = `
    <div class="container">
      <div class="file-tree-wrapper" id="file-tree-container"></div>
      <div class="editor"></div>
      <div class="preview">
        <iframe src="loading.html"></iframe>
      </div>
      <div class="terminal-wrapper" id="terminal-container"></div>
    </div>
  `;
}

/**
 * Handle file selection from FileTree
 * @param {string} path - Selected file path
 */
function handleFileSelect(path) {
  console.log('File selected:', path);
  statusBar?.setCurrentFile(path);

  // Load file content into editor
  if (files[path] && files[path].file && files[path].file.contents) {
    editor?.setValue(files[path].file.contents);
  }
}

/**
 * Handle new file creation
 * @param {string} path - New file path
 * @param {Object} data - File data
 */
async function handleFileCreate(path, data) {
  console.log('File created:', path);
  terminal?.writeLine(`Created file: ${path}`, 'success');

  try {
    await webcontainerInstance.fs.writeFile(`/${path}`, data.file.contents);
    ErrorHandler.showSuccess(`File created: ${path}`, 'File System');
  } catch (error) {
    await ErrorHandler.handle(error, 'Create File');
  }
}

/**
 * Handle file deletion
 * @param {string} path - File path to delete
 */
async function handleFileDelete(path) {
  console.log('File deleted:', path);
  terminal?.writeLine(`Deleted file: ${path}`, 'info');

  try {
    await webcontainerInstance.fs.rm(`/${path}`);
    ErrorHandler.showSuccess(`File deleted: ${path}`, 'File System');
  } catch (error) {
    await ErrorHandler.handle(error, 'Delete File');
  }
}

/**
 * Handle file rename
 * @param {string} oldPath - Old file path
 * @param {string} newPath - New file path
 */
async function handleFileRename(oldPath, newPath) {
  console.log('File renamed:', oldPath, '→', newPath);
  terminal?.writeLine(`Renamed: ${oldPath} → ${newPath}`, 'info');

  try {
    const content = await webcontainerInstance.fs.readFile(`/${oldPath}`, 'utf-8');
    await webcontainerInstance.fs.writeFile(`/${newPath}`, content);
    await webcontainerInstance.fs.rm(`/${oldPath}`);
    ErrorHandler.showSuccess(`File renamed to: ${newPath}`, 'File System');
  } catch (error) {
    await ErrorHandler.handle(error, 'Rename File');
  }
}