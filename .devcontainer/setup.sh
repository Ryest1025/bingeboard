#!/bin/bash
set -e

echo "🚀 Setting up BingeBoard DevContainer..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Use Node 20 for the app
echo "🔄 Switching to Node.js 20 for app code..."
nvm use 20

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Rebuild better-sqlite3 for ARM64
if [ -d "node_modules/better-sqlite3" ]; then
    echo "🔧 Rebuilding better-sqlite3 for ARM64..."
    npm rebuild better-sqlite3 --build-from-source
fi

# Install GitHub CLI if missing (recommended: install in Dockerfile)
if ! command -v gh &>/dev/null; then
    echo "❌ Installing GitHub CLI..."
    sudo apt-get update && sudo apt-get install -y gh
else
    echo "✅ GitHub CLI is installed"
fi

# Authenticate GitHub CLI
if ! gh auth status &>/dev/null; then
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$GITHUB_TOKEN" | gh auth login --with-token
    else
        echo "💡 Run 'gh auth login' to authenticate GitHub CLI"
    fi
fi

echo "🎉 DevContainer setup complete!"