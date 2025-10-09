# BingeBoard DevContainer Setup

This DevContainer provides a complete development environment for BingeBoard with:

## 🚀 Features
- Node.js 20 with npm
- GitHub CLI with authentication support
- ESLint, Prettier, GitHub Copilot extensions
- Automatic dependency installation
- Health check utilities

## 🔧 Quick Setup

1. **Rebuild Container**: 
   - Press `F1` → `Dev Containers: Rebuild Container`
   - Or `Ctrl+Shift+P` → `Remote-Containers: Rebuild and Reopen in Container`

2. **GitHub Authentication** (Optional):
   - Set `GITHUB_TOKEN` environment variable on your host
   - Or run `gh auth login` inside the container

3. **Start Development**:
   ```bash
   npm run dev              # Start development server
   .devcontainer/health-check.sh  # Check setup status
   ```

## 📁 Files
- `devcontainer.json` - Container configuration
- `Dockerfile` - Container image with GitHub CLI
- `setup.sh` - Post-creation setup script
- `health-check.sh` - Verify installation

## 🔑 GitHub CLI Commands
```bash
gh --version      # Check installation
gh auth login     # Authenticate (if not using token)
gh auth status    # Check authentication status
gh repo view      # View current repository
```

## 🐛 Troubleshooting
- If GitHub CLI not found: Rebuild the container
- If authentication fails: Check `GITHUB_TOKEN` or run `gh auth login`
- If npm issues: Check node_modules volume mount