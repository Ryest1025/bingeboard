#!/bin/bash

echo "🔧 DevContainer Health Check"
echo "============================"

# Check Node.js
echo "📦 Node.js version:"
node --version
npm --version

# Check GitHub CLI
echo ""
echo "🐙 GitHub CLI:"
if command -v gh &> /dev/null; then
    gh --version | head -n 1
    echo "✅ GitHub CLI is installed"
    
    if gh auth status &>/dev/null; then
        echo "✅ GitHub CLI is authenticated"
        gh auth status
    else
        echo "⚠️ GitHub CLI not authenticated (run 'gh auth login')"
    fi
else
    echo "❌ GitHub CLI not found"
fi

# Check Copilot extensions
echo ""
echo "🤖 VS Code Extensions:"
code --list-extensions | grep -E "(copilot|eslint|prettier)" || echo "Extensions will be installed when VS Code starts"

# Check project dependencies
echo ""
echo "📋 Project Status:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules exists"
    else
        echo "⚠️ node_modules not found (run 'npm install')"
    fi
else
    echo "❌ package.json not found"
fi

echo ""
echo "🎯 Quick Start Commands:"
echo "  npm install     - Install dependencies"
echo "  npm run dev     - Start development server"
echo "  gh auth login   - Authenticate GitHub CLI"
echo "  gh auth status  - Check GitHub authentication"