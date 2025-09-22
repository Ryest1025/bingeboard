#!/bin/bash

# BingeBoard Server Status Check
# Quick status check for both servers

echo "🔍 BingeBoard Server Status Check"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check backend (port 5000)
if lsof -i :5000 >/dev/null 2>&1; then
    if curl -s -I http://localhost:5000/api/auth/session >/dev/null 2>&1; then
        echo -e "🖥️  Backend:  ${GREEN}✅ Running & Responding${NC} (http://localhost:5000)"
    else
        echo -e "🖥️  Backend:  ${YELLOW}⚠️  Running but not responding${NC} (http://localhost:5000)"
    fi
else
    echo -e "🖥️  Backend:  ${RED}❌ Not running${NC} (port 5000)"
fi

# Check frontend (port 3000)
if lsof -i :3000 >/dev/null 2>&1; then
    if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
        echo -e "🌐 Frontend: ${GREEN}✅ Running & Responding${NC} (http://localhost:3000)"
    else
        echo -e "🌐 Frontend: ${YELLOW}⚠️  Running but not responding${NC} (http://localhost:3000)"
    fi
else
    echo -e "🌐 Frontend: ${RED}❌ Not running${NC} (port 3000)"
fi

# Show processes
echo ""
echo "📋 Related Processes:"
ps aux | grep -E "(tsx server|vite)" | grep -v grep | head -5 || echo "   No server processes found"

# Show log file sizes if they exist
echo ""
echo "📁 Log Files:"
if [ -f "/workspaces/bingeboard-local/server.log" ]; then
    SIZE=$(wc -l < /workspaces/bingeboard-local/server.log)
    echo "   server.log: $SIZE lines"
else
    echo "   server.log: Not found"
fi

if [ -f "/workspaces/bingeboard-local/vite.log" ]; then
    SIZE=$(wc -l < /workspaces/bingeboard-local/vite.log)
    echo "   vite.log: $SIZE lines"
else
    echo "   vite.log: Not found"
fi

echo ""
echo "💡 Commands:"
echo "   npm run dev:full    - Start both servers"
echo "   npm run dev:stop    - Stop both servers"
echo "   npm run dev:restart - Restart both servers"