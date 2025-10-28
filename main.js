import './style.css'
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { ErrorHandler } from './src/utils/errorHandler.js';
import { debounce } from './src/utils/debounce.js';
import { LoadingSpinner } from './src/components/LoadingSpinner.js';
import { Terminal } from './src/components/Terminal.js';
import { StatusBar } from './src/components/StatusBar.js';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

/** @type {HTMLIFrameElement | null} */
let iframeEl = null;

/** @type {HTMLTextAreaElement | null} */
let textareaEl = null;

/** @type {Terminal | null} */
let terminal = null;

/** @type {StatusBar | null} */
let statusBar = null;

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

    // Initialize Terminal
    const terminalContainer = document.querySelector('#terminal-container');
    if (terminalContainer) {
      terminal = new Terminal(terminalContainer);
      terminal.init();
      terminal.writeLine('WebContainer Terminal initialized', 'success');
    }

    // Get DOM elements after UI is created
    iframeEl = document.querySelector('iframe');
    textareaEl = document.querySelector('textarea');

    // Validate DOM elements exist
    if (!textareaEl || !iframeEl) {
      throw new Error('Required DOM elements not found');
    }

    // Set initial content
    textareaEl.value = files['index.js'].file.contents;

    // Create debounced write function (300ms delay)
    const debouncedWrite = debounce((content) => {
      writeIndexJS(content);
    }, 300);

    // Attach event listeners with debounce
    textareaEl.addEventListener('input', (e) => {
      debouncedWrite(e.currentTarget.value);
    });

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
      <div class="editor">
        <textarea>I am a textarea</textarea>
      </div>
      <div class="preview">
        <iframe src="loading.html"></iframe>
      </div>
      <div class="terminal-wrapper" id="terminal-container"></div>
    </div>
  `;
}