# Calaveras County Grants Portal - Implementation Guide
## GitHub Pages + VS Code Development

**Last Updated:** January 2025  
**Deployment:** GitHub Pages  
**IDE:** Visual Studio Code

---

## Project Overview

A React-based web application that helps Calaveras County staff discover relevant funding opportunities from California's state grants portal. Features intelligent filtering, automatic caching, and department-specific matching.

**Live URL (after deployment):** `https://[your-github-org].github.io/calaveras-grants-portal/`

---

## Technical Stack

- **Frontend Framework**: React 18+ with Hooks
- **Icons**: Lucide React
- **Data Source**: California State Grants Portal API (CKAN)
- **Caching**: Browser LocalStorage (12-hour TTL)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions
- **IDE**: Visual Studio Code

---

## Phase 1: Initial Setup (Day 1)

### 1.1 VS Code Setup

**Required Extensions:**
```
Install in VS Code (Ctrl+Shift+X):
1. ES7+ React/Redux/React-Native snippets
2. Prettier - Code formatter
3. ESLint
4. GitHub Pull Requests and Issues
5. GitLens (optional but helpful)
```

**VS Code Settings (Ctrl+,):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "onFocusChange"
}
```

### 1.2 Create GitHub Repository

**Option A: Using VS Code**
1. Open VS Code
2. Press `Ctrl+Shift+P` → "Git: Clone"
3. Create new repository on GitHub
4. Clone to local machine

**Option B: Using GitHub.com**
1. Go to https://github.com/[your-org]
2. Click "New repository"
3. Name: `calaveras-grants-portal`
4. Public or Private (your choice)
5. Initialize with README
6. Clone to local: `git clone [repository-url]`

### 1.3 Create React App

```bash
# Navigate to your projects folder
cd [your-projects-folder]

# Create React app (recommended: Vite for faster development)
npm create vite@latest calaveras-grants-portal -- --template react
cd calaveras-grants-portal

# Install dependencies
npm install
npm install lucide-react gh-pages

# Open in VS Code
code .
```

**Alternative: Create React App**
```bash
npx create-react-app calaveras-grants-portal
cd calaveras-grants-portal
npm install lucide-react gh-pages
code .
```

### 1.4 Configure for GitHub Pages

**Update `package.json`:**
```json
{
  "name": "calaveras-grants-portal",
  "version": "1.0.0",
  "homepage": "https://[your-github-org].github.io/calaveras-grants-portal/",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Create `.env` file in root:**
```env
REACT_APP_API_BASE_URL=https://data.ca.gov/api/3/action
REACT_APP_RESOURCE_ID=111c8c88-21f6-453c-ae2c-b4785a0624f5
REACT_APP_CACHE_DURATION=43200000
REACT_APP_COUNTY_NAME=Calaveras County
```

**Create `.gitignore` (if not exists):**
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
```

### 1.5 Project Structure

```
calaveras-grants-portal/
├── public/
│   ├── index.html
│   └── favicon.ico (add County logo)
├── src/
│   ├── components/
│   │   ├── CalaverrasGrantsDashboard.jsx
│   │   ├── Header.jsx
│   │   ├── FilterSection.jsx
│   │   └── GrantCard.jsx
│   ├── services/
│   │   ├── grantService.js
│   │   └── cacheService.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── eligibilityFilters.js
│   ├── config/
│   │   └── departments.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Phase 2: Development in VS Code (Week 1)

### 2.1 Initial Development

**Start the dashboard component:**
1. Copy `calaveras-grants-dashboard.jsx` content
2. Create `src/App.js`:

```javascript
import React from 'react';
import CalaverrasGrantsDashboard from './components/CalaverrasGrantsDashboard';

function App() {
  return <CalaverrasGrantsDashboard />;
}

export default App;
```

3. Run development server:
```bash
npm start
```

4. Opens at `http://localhost:3000` automatically

### 2.2 Using VS Code Shortcuts

**Essential Keyboard Shortcuts:**
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Find in all files
- `Alt+Up/Down` - Move line up/down
- `Ctrl+D` - Select next occurrence
- `Ctrl+/` - Toggle comment
- `Ctrl+`` - Toggle terminal
- `F2` - Rename symbol

**Multi-cursor editing:**
- `Alt+Click` - Add cursor
- `Ctrl+Alt+Up/Down` - Add cursor above/below

### 2.3 Refactoring in VS Code

**Extract Component (built-in):**
1. Select JSX code
2. Right-click → "Refactor..."
3. Choose "Extract to function in module scope"

**Or manually create files:**

**Create `src/services/grantService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const RESOURCE_ID = process.env.REACT_APP_RESOURCE_ID;

export const fetchGrants = async () => {
  const response = await fetch(
    `${API_BASE_URL}/datastore_search?resource_id=${RESOURCE_ID}&limit=10000`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.result.records;
};
```

**Create `src/services/cacheService.js`:**
```javascript
const CACHE_KEY = 'calaverrasGrantsCache';
const CACHE_TIME_KEY = 'calaverrasGrantsCacheTime';
const CACHE_DURATION = parseInt(process.env.REACT_APP_CACHE_DURATION);

export const getCachedGrants = () => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(CACHE_TIME_KEY);
  
  if (!cachedData || !cacheTimestamp) return null;
  
  const age = Date.now() - parseInt(cacheTimestamp);
  if (age >= CACHE_DURATION) {
    clearCache();
    return null;
  }
  
  return {
    data: JSON.parse(cachedData),
    timestamp: new Date(parseInt(cacheTimestamp))
  };
};

export const setCachedGrants = (data) => {
  const now = Date.now();
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, now.toString());
  return new Date(now);
};

export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};
```

**Continue with utils/formatters.js, utils/eligibilityFilters.js, and config/departments.js as shown in original implementation guide**

### 2.4 Git Workflow in VS Code

**Initial Commit:**
```bash
# In VS Code Terminal (Ctrl+`)
git add .
git commit -m "Initial commit: Project setup"
git push origin main
```

**Or use VS Code Source Control (Ctrl+Shift+G):**
1. Stage changes (+ icon)
2. Write commit message
3. Click ✓ to commit
4. Click "..." → Push

**Best Practice - Feature Branches:**
```bash
# Create feature branch
git checkout -b feature/add-filters

# Make changes, commit
git add .
git commit -m "Add department filters"

# Push to GitHub
git push origin feature/add-filters

# Create Pull Request on GitHub
# After review, merge to main
```

---

## Phase 3: Testing in VS Code (Week 2)

### 3.1 Run Tests

**In VS Code Terminal:**
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test eligibilityFilters.test.js
```

**VS Code Test Explorer:**
Install "Jest Runner" extension for inline test running

### 3.2 Debugging in VS Code

**Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**To Debug:**
1. Set breakpoint (click left of line number)
2. Press F5 to start debugging
3. Chrome opens with debugger attached

---

## Phase 4: Deploy to GitHub Pages

### 4.1 Manual Deployment from VS Code

**First Time Setup:**
```bash
# In VS Code Terminal (Ctrl+`)
npm run deploy
```

This will:
1. Build production bundle
2. Create/update `gh-pages` branch
3. Push to GitHub
4. Site available at: `https://[org].github.io/calaveras-grants-portal/`

**Subsequent Deployments:**
```bash
# After making changes
npm run deploy
```

### 4.2 Automated Deployment with GitHub Actions

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          REACT_APP_API_BASE_URL: ${{ secrets.REACT_APP_API_BASE_URL }}
          REACT_APP_RESOURCE_ID: ${{ secrets.REACT_APP_RESOURCE_ID }}
          REACT_APP_CACHE_DURATION: ${{ secrets.REACT_APP_CACHE_DURATION }}
          REACT_APP_COUNTY_NAME: ${{ secrets.REACT_APP_COUNTY_NAME }}
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

**Setup GitHub Secrets:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each environment variable:
   - `REACT_APP_API_BASE_URL`
   - `REACT_APP_RESOURCE_ID`
   - `REACT_APP_CACHE_DURATION`
   - `REACT_APP_COUNTY_NAME`

**Enable GitHub Pages:**
1. Go to repo Settings → Pages
2. Source: "GitHub Actions"
3. Save

**Now every push to `main` branch automatically deploys!**

### 4.3 Deployment Workflow from VS Code

**Standard Workflow:**
```bash
# 1. Make changes in VS Code
# 2. Test locally: npm start

# 3. Run tests
npm test

# 4. Build to verify
npm run build

# 5. Commit and push (triggers auto-deploy)
git add .
git commit -m "Add new feature"
git push origin main

# 6. GitHub Actions automatically deploys
# Check status: GitHub repo → Actions tab
```

**Quick Deploy (Manual):**
```bash
npm run deploy
```

---

## Phase 5: VS Code Workflow Tips

### 5.1 Useful VS Code Features

**Tasks (Ctrl+Shift+B):**

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Deploy to GitHub Pages",
      "type": "npm",
      "script": "deploy",
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": []
    }
  ]
}
```

Now use `Ctrl+Shift+B` to quickly run tasks!

### 5.2 Snippets

**Create React Component Snippet:**

1. File → Preferences → User Snippets → javascriptreact.json
2. Add:

```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "const ${1:ComponentName} = () => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:ComponentName};"
    ]
  }
}
```

Now type `rfc` + Tab to create component!

### 5.3 Recommended Extensions

**Essential:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- GitHub Pull Requests and Issues

**Helpful:**
- Auto Rename Tag
- Bracket Pair Colorizer 2
- GitLens
- Jest Runner
- Live Server
- Path Intellisense

### 5.4 Live Collaboration

**VS Code Live Share:**
1. Install "Live Share" extension
2. Click "Live Share" in status bar
3. Share link with team
4. Collaborate in real-time!

---

## Maintenance & Updates

### Daily Workflow in VS Code

```bash
# 1. Pull latest changes
git pull origin main

# 2. Start dev server
npm start

# 3. Make changes and save (auto-formats)

# 4. Test changes
npm test

# 5. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# Auto-deploys via GitHub Actions!
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all (carefully)
npm update

# Update specific package
npm update lucide-react

# After updates, test thoroughly!
npm test
npm start
```

### Monitor Deployment

**Check GitHub Actions:**
1. Go to repo on GitHub
2. Click "Actions" tab
3. See deployment status
4. View logs if issues

**View Live Site:**
- URL: `https://[org].github.io/calaveras-grants-portal/`
- Usually live 2-3 minutes after push

---

## Troubleshooting in VS Code

### Issue: Hot reload not working
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: GitHub Pages shows blank page
1. Check `package.json` has correct `homepage` URL
2. Check console for errors (F12)
3. Verify build works locally: `npm run build && npx serve -s build`

### Issue: Environment variables not working
1. Create `.env` file in root (not in `src`)
2. Prefix all variables with `REACT_APP_`
3. Restart dev server after changing `.env`
4. For GitHub Pages: Add to GitHub Secrets

### Issue: Can't push to GitHub
```bash
# Set up authentication
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# If using HTTPS, use personal access token
# GitHub → Settings → Developer settings → Personal access tokens
```

### VS Code Terminal Not Working
- Press `Ctrl+`` to toggle terminal
- Or View → Terminal
- Change shell: Terminal → Select Default Profile

---

## Quick Reference

### Development Commands
```bash
npm start          # Start dev server (localhost:3000)
npm test           # Run tests
npm run build      # Create production build
npm run deploy     # Deploy to GitHub Pages
```

### Git Commands (in VS Code terminal)
```bash
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit
git push origin main          # Push to GitHub
git pull origin main          # Get latest changes
git checkout -b feature-name  # Create branch
```

### VS Code Shortcuts
```
Ctrl+P              Quick file open
Ctrl+Shift+F        Find in files
Ctrl+Shift+P        Command palette
Ctrl+`              Toggle terminal
Ctrl+Shift+G        Source control
Ctrl+B              Toggle sidebar
F5                  Start debugging
```

---

## Success Metrics

- ✅ Code commits daily
- ✅ Tests passing (green in terminal)
- ✅ GitHub Actions successful (green checkmark)
- ✅ Live site accessible and functional
- ✅ No errors in browser console
- ✅ Performance: Page load < 3s

---

## Next Steps

1. **Today:** Set up VS Code and clone repo
2. **This Week:** Build core features
3. **Next Week:** Testing and refinement
4. **Week 3:** Deploy to GitHub Pages
5. **Week 4:** Gather feedback and iterate

---

## Support

**VS Code Help:**
- Help → Welcome → Interactive Playground
- Help → Documentation
- https://code.visualstudio.com/docs

**React Help:**
- https://react.dev/
- VS Code: Hover over components for inline docs

**GitHub Pages:**
- https://docs.github.com/pages
- Check Actions tab for deployment logs

---

**Happy Coding in VS Code! 🚀**
