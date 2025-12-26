# VS Code Setup for Calaveras County Grants Portal

This document helps you set up Visual Studio Code for this project.

---

## Required Extensions

Install these extensions in VS Code (Ctrl+Shift+X):

### Essential Extensions
```
1. ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
2. Prettier - Code formatter (esbenp.prettier-vscode)
3. ESLint (dbaeumer.vscode-eslint)
4. GitHub Pull Requests and Issues (github.vscode-pull-request-github)
```

### Recommended Extensions
```
5. GitLens (eamodio.gitlens)
6. Auto Rename Tag (formulahendry.auto-rename-tag)
7. Path Intellisense (christian-kohler.path-intellisense)
8. Jest Runner (firsttris.vscode-jest-runner)
9. Live Share (ms-vsliveshare.vsliveshare)
```

**Quick Install:**
Open VS Code terminal (Ctrl+`) and run:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension github.vscode-pull-request-github
code --install-extension eamodio.gitlens
```

---

## Workspace Settings

Create or update `.vscode/settings.json` in project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "onFocusChange",
  "files.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/package-lock.json": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "emmet.triggerExpansionOnTab": true,
  "javascript.updateImportsOnFileMove.enabled": "always",
  "git.autofetch": true,
  "git.confirmSync": false,
  "terminal.integrated.defaultProfile.windows": "Git Bash",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Keyboard Shortcuts

Create `.vscode/keybindings.json` (optional custom shortcuts):

```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.new"
  },
  {
    "key": "ctrl+shift+d",
    "command": "editor.action.duplicateSelection"
  }
]
```

---

## Tasks Configuration

Create `.vscode/tasks.json` for quick access to npm scripts:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "npm",
      "script": "start",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Run Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      }
    },
    {
      "label": "Build Production",
      "type": "npm",
      "script": "build",
      "problemMatcher": []
    },
    {
      "label": "Deploy to GitHub Pages",
      "type": "npm",
      "script": "deploy",
      "problemMatcher": [],
      "dependsOn": "Build Production"
    },
    {
      "label": "Lint Code",
      "type": "npm",
      "script": "lint",
      "problemMatcher": ["$eslint-stylish"]
    }
  ]
}
```

**Usage:** Press `Ctrl+Shift+B` to run default task (Start Dev Server)

---

## Debug Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Usage:** Press `F5` to start debugging

---

## Code Snippets

Create `.vscode/react.code-snippets` for custom React snippets:

```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "const ${1:${TM_FILENAME_BASE}} = () => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:${TM_FILENAME_BASE}};"
    ],
    "description": "Create React Functional Component"
  },
  "React Component with State": {
    "prefix": "rfcs",
    "body": [
      "import React, { useState } from 'react';",
      "",
      "const ${1:${TM_FILENAME_BASE}} = () => {",
      "  const [${2:state}, set${2/(.*)/${1:/capitalize}/}] = useState(${3:initialState});",
      "",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};",
      "",
      "export default ${1:${TM_FILENAME_BASE}};"
    ],
    "description": "React Component with useState"
  },
  "Console Log": {
    "prefix": "clg",
    "body": ["console.log('$1:', $1);$0"],
    "description": "Console log with label"
  }
}
```

**Usage:** Type `rfc` + Tab to create component

---

## Recommended Settings

### User Settings (Optional)

File → Preferences → Settings (Ctrl+,)

```json
{
  "workbench.colorTheme": "Default Dark+",
  "editor.fontSize": 14,
  "editor.fontFamily": "Consolas, 'Courier New', monospace",
  "editor.minimap.enabled": true,
  "editor.renderWhitespace": "boundary",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.wordWrap": "on",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "explorer.confirmDelete": false,
  "git.enableSmartCommit": true,
  "terminal.integrated.fontSize": 13
}
```

---

## Git Configuration

### In VS Code Terminal:

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@co.calaveras.ca.us"

# Set default branch name
git config --global init.defaultBranch main

# Enable credential helper
git config --global credential.helper store

# Set VS Code as default editor for Git
git config --global core.editor "code --wait"

# Better Git diffs
git config --global diff.tool vscode
git config --global difftool.vscode.cmd "code --wait --diff $LOCAL $REMOTE"
```

---

## Workspace Folders

Recommended folder structure in VS Code:

```
📁 calaveras-grants-portal/
├── 📁 .vscode/          (settings, tasks, launch configs)
├── 📁 .github/          (GitHub Actions workflows)
├── 📁 public/           (static assets)
├── 📁 src/
│   ├── 📁 components/   (React components)
│   ├── 📁 services/     (API, cache services)
│   ├── 📁 utils/        (helper functions)
│   ├── 📁 config/       (configuration)
│   └── 📄 App.jsx
├── 📄 .env
├── 📄 .gitignore
├── 📄 package.json
└── 📄 README.md
```

---

## Common VS Code Commands

Access with `Ctrl+Shift+P`:

```
> Git: Clone
> Git: Commit
> Git: Push
> Git: Pull
> Format Document
> Format Document With...
> Organize Imports
> Toggle Terminal
> Developer: Reload Window
```

---

## Terminal Setup

### Windows Users:
Install Git Bash and set as default terminal:
1. Download: https://git-scm.com/download/win
2. VS Code → Terminal → Select Default Profile → Git Bash

### Mac/Linux Users:
Use default terminal (bash or zsh)

---

## Useful Terminal Commands in VS Code

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check for issues
npm run lint

# Format code
npm run format

# Git operations
git status
git add .
git commit -m "message"
git push origin main
```

---

## Quick Start Checklist

- [ ] VS Code installed
- [ ] Node.js installed (v18+)
- [ ] Git installed and configured
- [ ] Required extensions installed
- [ ] .vscode/settings.json created
- [ ] .vscode/tasks.json created (optional)
- [ ] Git identity configured
- [ ] Project cloned/created
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm start`)

---

## Troubleshooting

### Extensions not working
```
Ctrl+Shift+P → Developer: Reload Window
```

### Prettier not formatting
1. Check .prettierrc exists
2. Verify Prettier is default formatter
3. Check "Format on Save" is enabled

### ESLint errors everywhere
```bash
npm install
# Restart VS Code
```

### Terminal not opening
```
View → Terminal (Ctrl+`)
```

### Git authentication issues
```bash
# Use personal access token instead of password
# GitHub → Settings → Developer settings → Personal access tokens
```

---

## Next Steps

1. Install all extensions
2. Copy .vscode folder to your project
3. Configure Git
4. Start coding!

For detailed implementation guide, see: **IMPLEMENTATION_GUIDE_VSCODE.md**

---

**Happy Coding in VS Code! 🚀**
