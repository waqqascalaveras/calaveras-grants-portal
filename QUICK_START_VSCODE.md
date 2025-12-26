# Quick Start Guide - VS Code + GitHub Pages
## Calaveras County Grants Portal

**IDE:** Visual Studio Code  
**Hosting:** GitHub Pages  
**Auto-Deploy:** GitHub Actions

---

## 🚀 Get Started in 10 Minutes

### Step 1: VS Code Setup (2 minutes)

**Install Required Extensions:**
1. Open VS Code
2. Press `Ctrl+Shift+X`
3. Install these extensions:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - GitHub Pull Requests and Issues

### Step 2: Create Project (3 minutes)

```bash
# Create React app with Vite (faster)
npm create vite@latest calaveras-grants-portal -- --template react
cd calaveras-grants-portal

# Install dependencies
npm install
npm install lucide-react gh-pages

# Open in VS Code
code .
```

### Step 3: Configure GitHub Pages (2 minutes)

**Edit `package.json` - Add these lines:**
```json
{
  "homepage": "https://[your-github-org].github.io/calaveras-grants-portal/",
  "scripts": {
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

### Step 4: Copy Dashboard Code (1 minute)

1. Copy `calaveras-grants-dashboard.jsx` content
2. Create `src/App.jsx` and paste
3. Replace existing App.jsx content

### Step 5: Test Locally (1 minute)

```bash
npm run dev
# Opens at http://localhost:5173
```

### Step 6: Deploy to GitHub (1 minute)

```bash
# First time: Create repo on GitHub, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[your-org]/calaveras-grants-portal.git
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

**Done!** Your site is live at:  
`https://[your-org].github.io/calaveras-grants-portal/`

---

## 📁 What You Have

### Core Files
- **calaveras-grants-dashboard.jsx** - Complete React application
- **IMPLEMENTATION_GUIDE_VSCODE.md** - Detailed technical guide
- **package.json** - Dependencies configuration
- **eligibilityFilters.test.js** - Test examples

### Documentation
- **README.md** - Project overview
- **DEPLOYMENT_CHECKLIST.md** - Pre-launch checklist
- **QUICK_START_VSCODE.md** - This file!

---

## 💻 Daily Workflow in VS Code

### Morning Routine
```bash
# 1. Open VS Code to your project
code .

# 2. Pull latest changes
git pull origin main

# 3. Start development server
npm run dev
```

### While Coding
- **Save** = Auto-format (if Prettier installed)
- **`Ctrl+P`** = Quick file open
- **`Ctrl+``** = Toggle terminal
- **`Ctrl+Shift+G`** = Git panel

### End of Day
```bash
# In VS Code Terminal (Ctrl+`)

# 1. Stage changes
git add .

# 2. Commit
git commit -m "Describe what you did today"

# 3. Push to GitHub (auto-deploys!)
git push origin main
```

**That's it!** GitHub Actions automatically deploys to GitHub Pages.

---

## 🎯 VS Code Keyboard Shortcuts

### Navigation
- `Ctrl+P` - Open any file quickly
- `Ctrl+Shift+F` - Search across all files
- `Ctrl+Shift+E` - Show file explorer
- `Ctrl+B` - Toggle sidebar

### Editing
- `Alt+Up/Down` - Move line up/down
- `Ctrl+D` - Select next occurrence
- `Ctrl+/` - Comment/uncomment
- `Ctrl+Shift+K` - Delete line

### Terminal & Git
- `Ctrl+`` - Toggle terminal
- `Ctrl+Shift+G` - Open source control
- `Ctrl+Shift+P` - Command palette (do anything!)

### Debugging
- `F5` - Start debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into

---

## 🔄 Deployment Options

### Option 1: Manual Deploy (Simple)
```bash
# After making changes
npm run deploy
```
- Deploys immediately
- Takes ~2 minutes
- Good for quick fixes

### Option 2: Auto Deploy (Recommended)
**Setup once, forget forever:**

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./build
      - uses: actions/deploy-pages@v3
```

2. GitHub Settings → Pages → Source: "GitHub Actions"

3. Now every `git push` auto-deploys! ✨

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test eligibilityFilters.test
```

### Test in Browser
```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Press F12 for DevTools
```

---

## 🐛 Common Issues

### Issue: "npm: command not found"
```bash
# Install Node.js from nodejs.org
# Restart VS Code after installing
```

### Issue: GitHub Pages shows blank page
**Fix `package.json`:**
```json
"homepage": "https://[your-org].github.io/calaveras-grants-portal/",
```
Must match your exact GitHub URL!

### Issue: Changes not deploying
```bash
# Clear and rebuild
rm -rf node_modules package-lock.json
npm install
npm run deploy
```

### Issue: Can't push to GitHub
```bash
# Set up Git identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Use personal access token for password
# GitHub → Settings → Developer settings → Personal access tokens
```

### Issue: Hot reload not working
- Stop dev server (`Ctrl+C`)
- Restart: `npm run dev`
- Hard refresh browser: `Ctrl+Shift+R`

---

## 📦 Project Structure

```
calaveras-grants-portal/
├── public/               # Static files
│   └── index.html
├── src/
│   ├── components/      # React components
│   │   └── CalaverrasGrantsDashboard.jsx
│   ├── services/        # API & cache
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   ├── App.jsx          # Main app
│   └── main.jsx         # Entry point
├── .github/
│   └── workflows/       # GitHub Actions
├── .env                 # Environment vars (DO NOT COMMIT)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
└── README.md           # Documentation
```

---

## 🎨 VS Code Customization

### Recommended Settings

**File → Preferences → Settings (Ctrl+,)**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "files.autoSave": "onFocusChange",
  "terminal.integrated.defaultProfile.windows": "Git Bash"
}
```

### Color Themes (Personal Preference)
- `Ctrl+K Ctrl+T` - Choose theme
- Try: "Dark+ (default)", "Monokai", "One Dark Pro"

### Useful Snippets

Type these and press Tab:

- `rfc` - React Functional Component
- `useState` - Import and use useState
- `useEffect` - Import and use useEffect
- `imp` - Import statement

---

## 🚀 Development Phases

### Week 1: Setup & Basic Features
- [ ] Set up VS Code environment
- [ ] Clone dashboard component
- [ ] Test locally
- [ ] Deploy to GitHub Pages
- [ ] Verify live site works

### Week 2: Refactor & Enhance
- [ ] Break into smaller components
- [ ] Extract services and utilities
- [ ] Add tests
- [ ] Improve styling

### Week 3: Testing & Polish
- [ ] User acceptance testing
- [ ] Fix bugs
- [ ] Performance optimization
- [ ] Documentation

### Week 4: Launch
- [ ] Final testing
- [ ] Deploy to production
- [ ] Train staff
- [ ] Monitor and support

---

## 📞 Quick Reference

### Essential Commands
```bash
npm run dev        # Start dev server
npm test           # Run tests
npm run build      # Build for production
npm run deploy     # Deploy to GitHub Pages
git push           # Push changes (auto-deploys if Actions set up)
```

### VS Code Commands (Ctrl+Shift+P)
```
>Git: Clone
>Git: Commit
>Git: Push
>Format Document
>Toggle Terminal
```

### URLs
- **Local Dev:** http://localhost:5173
- **GitHub Repo:** https://github.com/[org]/calaveras-grants-portal
- **Live Site:** https://[org].github.io/calaveras-grants-portal/

---

## ✅ Pre-Launch Checklist

Before deploying to production:

- [ ] Tests passing (`npm test`)
- [ ] No errors in browser console (F12)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive
- [ ] Performance good (< 3s load)
- [ ] All environment variables set
- [ ] GitHub Pages enabled
- [ ] Custom domain configured (if using)
- [ ] README.md updated
- [ ] Team trained on how to use

---

## 💡 Pro Tips

1. **Commit Often** - Small commits are easier to debug
2. **Use Branches** - `git checkout -b feature-name` for new features
3. **Check Actions Tab** - See deployment status on GitHub
4. **Browser Cache** - Hard refresh (`Ctrl+Shift+R`) to see changes
5. **Console Logs** - Use `console.log()` to debug, but remove before commit
6. **Format Code** - `Shift+Alt+F` to format current file
7. **Extensions** - Don't install too many, keep it lean!
8. **Git Commits** - Write clear messages: "Add filter feature" not "fix stuff"

---

## 🎓 Learning Resources

### VS Code
- Help → Interactive Playground (in VS Code)
- https://code.visualstudio.com/docs

### React
- https://react.dev/ (official docs)
- https://react.dev/learn (interactive tutorial)

### Git/GitHub
- https://docs.github.com/get-started
- VS Code Git tutorial: `Ctrl+Shift+P` → "Git: Show Tutorial"

### GitHub Pages
- https://docs.github.com/pages
- https://github.com/skills/github-pages (interactive course)

---

## 📋 Next Steps

1. **Right Now:**
   - Install VS Code extensions
   - Create React project
   - Copy dashboard code
   - Test locally

2. **Today:**
   - Push to GitHub
   - Set up GitHub Pages
   - Deploy first version

3. **This Week:**
   - Refactor code
   - Add tests
   - Improve features

4. **Next Week:**
   - User testing
   - Bug fixes
   - Polish UI

5. **Week 3-4:**
   - Final testing
   - Documentation
   - Launch! 🎉

---

## 🆘 Need Help?

### Check These First
1. VS Code Output panel (`Ctrl+Shift+U`)
2. Browser console (F12)
3. GitHub Actions logs (repo → Actions tab)
4. Terminal error messages

### Resources
- **VS Code Issues:** File → Help → Report Issue
- **React Questions:** Stack Overflow (tag: reactjs)
- **GitHub Pages:** GitHub Support

### Team Contacts
- **Project Lead:** Waqqas
- **Development Team:** [Team contact]
- **IT Support:** [IT contact]

---

**You're all set! Start coding in VS Code and push to GitHub Pages! 🚀**

*Questions? Check IMPLEMENTATION_GUIDE_VSCODE.md for detailed info*
