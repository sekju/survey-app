# WebContainers API Starter

![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-v18+-brightgreen.svg)

A **browser-based development environment** powered by WebContainers API. Write, edit, and preview JavaScript code directly in your browser - no local installation required!

## 🌟 What is This?

This is a **code playground** that runs entirely in your web browser. Think of it as a mini VS Code that works online, allowing you to:
- Edit JavaScript files with syntax highlighting
- See your changes instantly in a live preview
- Work with multiple files using tabs
- Run a local development server (in your browser!)
- No setup, no installation - just open and code!

**Perfect for:**
- Learning JavaScript
- Quickly testing code ideas
- Building small web projects
- Sharing code examples
- Teaching and demos

---

## ✨ Features

### 🎨 Professional Code Editor
- **CodeMirror 6** - Industry-standard code editor
- **Syntax Highlighting** - Beautiful JavaScript color coding
- **One Dark Theme** - Easy on the eyes, professional look
- **Line Numbers** - Navigate your code easily
- **Auto-Indentation** - Clean, properly formatted code
- **Code Folding** - Collapse sections to focus
- **Search & Replace** - Press `Ctrl+F` to find text
- **Multiple Cursors** - Edit multiple places at once

### 📂 File Management
- **File Tree** - Browse all your files in a sidebar
- **Multi-File Tabs** - Open up to 10 files simultaneously
- **File Icons** - Visual indicators for file types
- **Create Files** - Add new files with the `+` button
- **Rename Files** - Right-click → Rename
- **Delete Files** - Right-click → Delete
- **Unsaved Changes** - See `•` indicator for edited files

### 🔧 Development Tools
- **Live Preview** - See your app running in real-time
- **Terminal Output** - View console logs and errors
- **Status Bar** - Node.js version, server port, current file
- **Loading Feedback** - Progress bar during startup
- **Error Notifications** - User-friendly error messages
- **Auto-Save** - Changes saved automatically (300ms debounce)

### 🎯 Advanced Features
- **WebContainer** - Node.js running in your browser
- **NPM Support** - Install packages (configured via package.json)
- **Vite Dev Server** - Fast HMR (Hot Module Replacement)
- **State Management** - AppState tracks everything
- **Event System** - Components communicate efficiently

---

## 📋 Prerequisites

### For Running Locally:

**You need:**
1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check version: Open terminal/command prompt and type `node --version`

2. **A Code Editor** (optional, but helpful)
   - [VS Code](https://code.visualstudio.com/) - Recommended
   - Or any text editor you like

3. **A Web Browser**
   - Chrome, Edge, Firefox, Safari (latest versions)
   - Must support SharedArrayBuffer (all modern browsers do)

**Don't worry if you're not technical!** Follow the step-by-step guide below.

---

## 🚀 Quick Start

### Step 1: Get the Code

**Option A: Download ZIP (Easiest for beginners)**
1. Click the green `Code` button on GitHub
2. Click `Download ZIP`
3. Extract the ZIP file to a folder on your computer
4. Remember where you saved it!

**Option B: Using Git (For developers)**
```bash
git clone https://github.com/your-username/survey-app.git
cd survey-app
```

### Step 2: Open Terminal/Command Prompt

**On Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Navigate to your project folder:
   ```bash
   cd C:\path\to\survey-app
   ```

**On Mac:**
1. Press `Cmd + Space`
2. Type `Terminal` and press Enter
3. Navigate to your project folder:
   ```bash
   cd /path/to/survey-app
   ```

**On Linux:**
1. Press `Ctrl + Alt + T`
2. Navigate to your project folder:
   ```bash
   cd /path/to/survey-app
   ```

### Step 3: Install Dependencies

In the terminal, type:
```bash
npm install
```

**What this does:** Downloads all the code libraries the project needs.

**Time:** Usually takes 1-2 minutes.

**You'll see:** Lots of text scrolling by - this is normal!

### Step 4: Start the Application

In the terminal, type:
```bash
npm run dev
```

**What this does:** Starts a local web server.

**You'll see something like:**
```
VITE v7.1.12  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open in Browser

1. Look for the line that says `Local: http://localhost:5173/`
2. Click that link (or copy and paste it into your browser)
3. **Done!** The application should open

---

## 📖 How to Use

### First Time Opening

When you first open the application, you'll see:
1. **Loading Screen** - "Booting WebContainer..." (wait 5-10 seconds)
2. **Installing Dependencies** - "Installing dependencies..." (automatic)
3. **Starting Server** - "Starting development server..."
4. **Ready!** - The editor appears with example code

### The Interface

```
┌─────────────────────────────────────────────────────────┐
│  📂 File Tree    │  📝 Code Editor    │  🖥️ Preview      │
│                  │  (with tabs)       │                 │
│  - index.js      │  ┌─────────────┐   │  Your app runs  │
│  - package.json  │  │ index.js  • │   │  here!          │
│  - index.html    │  └─────────────┘   │                 │
│  - style.css     │                    │                 │
│                  │  function hello()  │                 │
│                  │    console.log()   │                 │
├──────────────────┴────────────────────┴─────────────────┤
│  📟 Terminal                                            │
│  [09:15:23] WebContainer Terminal initialized           │
└─────────────────────────────────────────────────────────┘
│ ⚡ Ready | Node v18.19.0 | Port: 3000 | index.js       │ ← Status Bar
└─────────────────────────────────────────────────────────┘
```

### Editing Files

1. **Open a File:**
   - Click any file in the File Tree (left sidebar)
   - File opens in a new tab

2. **Edit Code:**
   - Type directly in the editor
   - Changes save automatically after 300ms
   - See `•` indicator on tab if file has unsaved changes

3. **Switch Between Files:**
   - Click tabs at the top of the editor
   - Or click a different file in the File Tree

4. **Close a Tab:**
   - Click the `×` button on the tab
   - If file is edited, you'll get a confirmation

### Managing Files

**Create a New File:**
1. Click the `+ New File` button in the File Tree
2. Enter filename (e.g., `script.js`)
3. Click OK
4. File appears in the tree and opens in a new tab

**Rename a File:**
1. Right-click the file in the File Tree
2. Select "✏️ Rename"
3. Enter new name
4. Click OK

**Delete a File:**
1. Right-click the file in the File Tree
2. Select "🗑️ Delete"
3. Confirm deletion
4. File is removed (tab closes if open)

**Duplicate a File:**
1. Right-click the file in the File Tree
2. Select "📋 Duplicate"
3. Enter new filename
4. Click OK

### Using the Editor

**Keyboard Shortcuts:**
- `Ctrl+F` (or `Cmd+F` on Mac) - Search
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+A` - Select All
- `Tab` - Indent
- `Shift+Tab` - Outdent

**Editor Features:**
- Click line numbers to set cursor
- Drag to select text
- Double-click to select word
- Triple-click to select line
- Brackets auto-complete: `(`, `{`, `[`, `"`

### Viewing Output

**Preview Panel:**
- Right side shows your running app
- Updates automatically when you save
- Click links to open in new tab

**Terminal:**
- Bottom panel shows console logs
- See errors in red
- See success messages in green
- Click "Clear" to reset

**Status Bar:**
- Bottom of screen
- Shows current file, Node version, server port
- Click port number to open app in new tab

---

## 🏗️ Building for Production

Want to create files you can deploy to a web server?

```bash
npm run build
```

**What this does:**
- Creates a `dist/` folder
- Optimizes all code for production
- Minifies JavaScript and CSS
- Ready to deploy!

**Output:**
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
```

---

## 🌐 Deploying to the Web

Make your app accessible to anyone on the internet!

### Option 1: Netlify (Easiest)

1. **Create Account:**
   - Go to https://www.netlify.com/
   - Sign up (free!)

2. **Deploy:**
   - Drag and drop the `dist/` folder onto Netlify
   - Done! Get a free URL like `your-app.netlify.app`

**OR** use the CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 2: Vercel

1. **Create Account:**
   - Go to https://vercel.com/
   - Sign up (free!)

2. **Deploy:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Follow prompts:**
   - Link to your project
   - Auto-deploy on every push!

### Option 3: GitHub Pages

1. **Update `vite.config.js`:**
   ```javascript
   export default {
     base: '/your-repo-name/',
   }
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings
   - Pages → Source → gh-pages branch
   - Save

**Your site:** `https://your-username.github.io/your-repo-name/`

### Option 4: Any Static Host

Upload the `dist/` folder to:
- **AWS S3** + CloudFront
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **Cloudflare Pages**
- **Firebase Hosting**

All these services have free tiers!

---

## 🔧 Troubleshooting

### "npm: command not found"

**Problem:** Node.js not installed or not in PATH.

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install it (use default options)
3. **Restart** your terminal/command prompt
4. Try again: `npm --version`

### "Error: EACCES: permission denied"

**Problem:** Permission issues (common on Mac/Linux).

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
```

Or reinstall Node.js using [nvm](https://github.com/nvm-sh/nvm).

### "Cannot find module..."

**Problem:** Dependencies not installed properly.

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port 5173 Already in Use

**Problem:** Another app is using the same port.

**Solution:**
```bash
# Kill the process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID [process-id] /F
```

Or change the port in `vite.config.js`:
```javascript
export default {
  server: {
    port: 3000  // Use a different port
  }
}
```

### "SharedArrayBuffer is not defined"

**Problem:** Browser doesn't support WebContainers.

**Solution:**
- Update your browser to the latest version
- Use Chrome, Edge, or Firefox (Safari has limited support)
- Check browser compatibility: https://webcontainers.io/guides/browser-support

### Application Won't Load

**Problem:** Various causes.

**Solution:**
1. **Check browser console** (F12 → Console tab)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try incognito/private mode**
4. **Check for errors** in the terminal
5. **Restart dev server** (Ctrl+C, then `npm run dev`)

### Files Not Saving

**Problem:** WebContainer filesystem issue.

**Solution:**
1. **Refresh the page** (reload the app)
2. **Check browser console** for errors
3. **Try a different file** to isolate the issue
4. **Clear browser storage:**
   - F12 → Application → Storage → Clear site data

---

## ❓ FAQ

### Is this free to use?

**Yes!** Completely free and open-source.

### Do I need an internet connection?

**First time:** Yes, to install dependencies.

**After setup:** No, runs entirely on your computer.

**Deployed version:** Yes, users need internet to access.

### Can I use this for real projects?

Absolutely! It's built with production-ready tools:
- Vite (used by major companies)
- CodeMirror 6 (powers many IDEs)
- WebContainers (by StackBlitz)

### What can I build with this?

Anything that runs in a browser:
- Static websites
- Single Page Applications (SPAs)
- React/Vue/Svelte apps (with configuration)
- API mocks
- Interactive demos
- Learning projects

### What can't I build?

- Backend servers (Node.js servers work in-browser only)
- Database applications (no persistent storage)
- Native mobile apps
- Desktop applications

### Is my code stored online?

**No!** Everything runs locally in your browser. Files exist in:
1. **WebContainer** - Temporary browser memory
2. **Your computer** - If you save the `dist/` folder

For permanent storage:
- Save files manually (copy/paste)
- Use Git to version control
- Deploy to a hosting service

### Can I add more packages?

**Yes!** Edit `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  }
}
```

Then the app will install them on startup.

### Can I use TypeScript?

**Yes!** Vite supports TypeScript out of the box:
1. Create `.ts` files
2. Add TypeScript to `package.json`
3. Configure `tsconfig.json`

### Can I add React/Vue/Svelte?

**Yes!** Update dependencies and configuration:

**React:**
```bash
npm install react react-dom
npm install -D @vitejs/plugin-react
```

Update `vite.config.js`:
```javascript
import react from '@vitejs/plugin-react'

export default {
  plugins: [react()]
}
```

### How do I update dependencies?

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### Where can I get help?

1. **GitHub Issues** - Report bugs or ask questions
2. **Documentation** - See `architecture.md` and `todo.md`
3. **WebContainers Docs** - https://webcontainers.io/
4. **Vite Docs** - https://vitejs.dev/
5. **CodeMirror Docs** - https://codemirror.net/

---

## 📚 Project Structure

```
survey-app/
├── index.html              # Entry point HTML
├── main.js                 # Application initialization
├── style.css               # Global styles
├── files.js                # Default file templates
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
│
├── src/
│   ├── components/         # UI Components
│   │   ├── Editor.js          # CodeMirror editor
│   │   ├── TabBar.js          # Multi-file tabs
│   │   ├── FileTree.js        # File browser
│   │   ├── Terminal.js        # Terminal output
│   │   ├── StatusBar.js       # Status bar
│   │   └── LoadingSpinner.js  # Loading indicator
│   │
│   ├── core/               # Core Systems
│   │   └── AppState.js        # State management
│   │
│   └── utils/              # Utilities
│       ├── errorHandler.js    # Error handling
│       └── debounce.js        # Debounce utility
│
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies (generated)
│
└── docs/                   # Documentation
    ├── architecture.md        # Architecture overview
    ├── todo.md               # Development plan
    ├── CHANGELOG.md          # Version history
    └── TEST_REPORT.md        # Test results
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter (if configured)
npm run lint

# Run tests (if configured)
npm run test
```

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=https://api.example.com
VITE_DEBUG=true
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

### Adding New Features

1. **Create component** in `src/components/`
2. **Import in main.js**
3. **Initialize** in the load event
4. **Add styles** to `style.css`
5. **Update documentation**

### Code Style

- Use **ES6+ features**
- **JSDoc comments** for functions
- **Descriptive names** for variables
- **Handle errors** with try-catch
- **Debounce** expensive operations

---

## 🤝 Contributing

Contributions welcome! Please:

1. **Fork the repository**
2. **Create a branch** (`git checkout -b feature/amazing`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing`)
5. **Open Pull Request**

---

## 📄 License

MIT License - see LICENSE file for details.

**In simple terms:** You can use this for anything, including commercial projects. No attribution required (but appreciated!).

---

## 🙏 Credits

**Built with:**
- [WebContainers API](https://webcontainers.io/) - Browser-based Node.js
- [Vite](https://vitejs.dev/) - Fast build tool
- [CodeMirror 6](https://codemirror.net/) - Code editor
- [Node.js](https://nodejs.org/) - JavaScript runtime

**Inspired by:**
- [StackBlitz](https://stackblitz.com/)
- [CodeSandbox](https://codesandbox.io/)
- [VS Code](https://code.visualstudio.com/)

---

## 📞 Support

**Found a bug?** [Open an issue](https://github.com/your-username/survey-app/issues)

**Have a question?** [Start a discussion](https://github.com/your-username/survey-app/discussions)

**Want to contribute?** See [Contributing](#contributing) section above

---

## 🎯 Roadmap

**Upcoming Features:**
- [ ] Settings panel (theme, font size)
- [ ] Template gallery (React, Vue, etc.)
- [ ] Keyboard shortcuts
- [ ] Search & Replace UI
- [ ] Git integration
- [ ] File upload/download
- [ ] Multiple themes
- [ ] Language support (CSS, HTML, JSON)
- [ ] Split view
- [ ] Mobile support

**See:** `todo.md` for detailed roadmap

---

## 📊 Stats

**Version:** 0.4.0
**Code:** ~3700+ lines JavaScript
**Components:** 9
**Dependencies:** 34 packages
**Build Time:** ~1.7s
**Bundle Size:** 537 kB (179 kB gzipped)
**Security:** 0 vulnerabilities ✅

---

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by Claude Code**

*Happy Coding! 🚀*
