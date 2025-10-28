import './style.css'
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { ErrorHandler } from './src/utils/errorHandler.js';
import { debounce } from './src/utils/debounce.js';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

/** @type {HTMLIFrameElement | null} */
let iframeEl = null;

/** @type {HTMLTextAreaElement | null} */
let textareaEl = null;

// Initialize error handler
ErrorHandler.init();

window.addEventListener('load', async () => {
  try {
    // Initialize DOM first
    initializeUI();

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

    ErrorHandler.showInfo('Booting WebContainer...', 'Initialization');

    // Call only once
    webcontainerInstance = await WebContainer.boot();
    await webcontainerInstance.mount(files);

    ErrorHandler.showInfo('Installing dependencies...', 'Setup');

    const exitCode = await installDependencies();
    if (exitCode !== 0) {
      throw new Error('Installation failed with exit code: ' + exitCode);
    }

    ErrorHandler.showInfo('Starting dev server...', 'Setup');

    await startDevServer();

    ErrorHandler.showSuccess('Application ready!', 'Success');
  } catch (error) {
    await ErrorHandler.handle(error, 'Application Initialization');
  }
});

async function installDependencies() {
  try {
    // Install dependencies
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    // Wait for install command to exit
    const exitCode = await installProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`npm install failed with exit code ${exitCode}`);
    }

    return exitCode;
  } catch (error) {
    await ErrorHandler.handle(error, 'Install Dependencies');
    throw error;
  }
}

async function startDevServer() {
  try {
    // Run `npm run start` to start the Express app
    const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);

    // Log server output
    serverProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log('[Server]', data);
      }
    }));

    // Wait for `server-ready` event
    webcontainerInstance.on('server-ready', (port, url) => {
      console.log(`Server ready at ${url}`);
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
    </div>
  `;
}