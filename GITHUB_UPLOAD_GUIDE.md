# Files to Upload to GitHub

## Required Files (Upload these first)

### Root Directory Files:
- package.json
- .gitignore
- .env.example (NOT .env - that has local settings)
- README.md
- START_HERE.md
- QUICK_START_VSCODE.md
- IMPLEMENTATION_GUIDE_VSCODE.md
- DEPLOYMENT_CHECKLIST.md
- VSCODE_SETUP.md
- BUILD_COMPLETE.md
- PROJECT_STATUS.md
- START_HERE_FIRST.md

### Folders to Upload:
- .github/ (with workflows/deploy.yml inside)
- public/ (all files: index.html, manifest.json, robots.txt)
- src/ (entire folder with all subfolders)

## DO NOT Upload:
- ❌ .env (contains local settings)
- ❌ node_modules/ (if it exists)
- ❌ build/ (if it exists)
- ❌ mnt/ (duplicate files)
- ❌ calaveras-grants-dashboard.jsx (root level - it's duplicated in src/components/)

## After Upload:
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push any change to trigger deployment
4. Your site will be live at: https://[your-username].github.io/calaveras-grants-portal/
