#!/bin/bash

# 🔄 BingeBoard Quick Recovery Script
# Use this if UI/UX breaks to restore working state

echo "🔄 BingeBoard Recovery - Restoring Working UI/UX State..."
echo

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Switch to working backup branch
echo "🔄 Switching to working backup branch..."
git stash push -m "Emergency stash before recovery"
git checkout working-ui-backup
echo

# Start server
echo "🚀 Starting server in working configuration..."
echo "🌐 URL: https://fuzzy-xylophone-5g97jqp4vq9wf4jjr-3000.app.github.dev"
echo

NODE_ENV=development npm run dev
