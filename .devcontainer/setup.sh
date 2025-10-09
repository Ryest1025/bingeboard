#!/bin/bash

echo "🚀 Setting up BingeBoard DevContainer..."

# Ensure we're running as the correct user
if [ "$(whoami)" != "node" ]; then
    echo "Switching to node user..."
    exec sudo -u node "$0" "$@"
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Verify GitHub CLI installation
echo "🔍 Checking GitHub CLI installation..."
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y gh
else
    echo "✅ GitHub CLI is installed: $(gh --version | head -n 1)"
fi

# Check GitHub authentication
echo "🔑 Checking GitHub authentication..."
if gh auth status &>/dev/null; then
    echo "✅ GitHub CLI is authenticated"
    gh auth status
else
    echo "⚠️ GitHub CLI not authenticated"
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "🔐 Using GITHUB_TOKEN environment variable..."
        echo "$GITHUB_TOKEN" | gh auth login --with-token
        if gh auth status &>/dev/null; then
            echo "✅ Successfully authenticated with GITHUB_TOKEN"
        else
            echo "❌ Failed to authenticate with GITHUB_TOKEN"
        fi
    else
        echo "💡 To authenticate GitHub CLI, run: gh auth login"
        echo "   Or set GITHUB_TOKEN environment variable on your host"
    fi
fi

# Verify Copilot access
echo "🤖 Checking GitHub Copilot access..."
if gh auth status &>/dev/null; then
    if gh copilot status &>/dev/null; then
        echo "✅ GitHub Copilot is accessible"
    else
        echo "⚠️ GitHub Copilot may not be accessible. Check your subscription."
    fi
fi

echo "🎉 DevContainer setup complete!"
echo ""
echo "Available commands:"
echo "  gh auth login    - Authenticate with GitHub"
echo "  gh auth status   - Check authentication status"
echo "  npm run dev      - Start development server"
echo "  npm test         - Run tests"
echo ""