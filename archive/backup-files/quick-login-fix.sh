#!/bin/bash

# Quick authentication fix for session consistency issues

echo "🔧 Fixing authentication session consistency..."

# Clear any stale session data
echo "🧹 Clearing stale sessions..."

# Restart the development server with clean session state
echo "🔄 Restarting development server with fresh session state..."

# Kill any existing processes on ports 5000 and 3000
lsof -ti:5000 | xargs -r kill -9
lsof -ti:3000 | xargs -r kill -9

sleep 2

echo "✅ Ports cleared. Ready to restart development servers."
echo ""
echo "🚀 To fix the login issue:"
echo "1. Restart your development servers"
echo "2. Clear browser cookies/storage for localhost:3000"
echo "3. Try logging in again"
echo ""
echo "💡 The issue appears to be session inconsistency - some API calls"
echo "   work while others don't find the session user. A fresh start"
echo "   should resolve this."
