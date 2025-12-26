# Helper Scripts

This directory contains Python and PowerShell scripts to help with development and deployment.

## Python Scripts

### build_validator.py
Validates your React project before uploading to GitHub.
```bash
python scripts/build_validator.py
```

### upload_to_github.py
Uploads files to GitHub without Git CLI.
```bash
pip install PyGithub
python scripts/upload_to_github.py
```

### check_workflows.py
Checks GitHub Actions workflow status.
```bash
python scripts/check_workflows.py
```

## PowerShell Scripts

### check-system.ps1
Checks if required software is installed.
```powershell
.\scripts\check-system.ps1
```

## Documentation

See [PYTHON_SCRIPTS_GUIDE.md](../docs/PYTHON_SCRIPTS_GUIDE.md) for detailed usage instructions.
