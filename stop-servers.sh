#!/bin/bash

# BingeBoard Development Server Stop Script
# This script cleanly shuts down both servers

echo "🛑 Stopping BingeBoard Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill processes on port
kill_port() {
    local port=$1
    local name=$2
    
    echo -e "${YELLOW}🔄 Stopping $name server on port $port...${NC}"
    
    if lsof -i :$port >/dev/null 2>&1; then
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if lsof -i :$port >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to stop $name server on port $port${NC}"
        else
            echo -e "${GREEN}✅ $name server stopped${NC}"
        fi
    else
        echo -e "${GREEN}✅ $name server was not running${NC}"
    fi
}

# Stop specific processes
echo -e "${YELLOW}🔄 Stopping specific processes...${NC}"
pkill -f "tsx server/index.ts" 2>/dev/null && echo -e "${GREEN}✅ Backend process stopped${NC}" || echo -e "${YELLOW}⚠️  No backend process found${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✅ Vite process stopped${NC}" || echo -e "${YELLOW}⚠️  No Vite process found${NC}"
pkill -f "npm run dev" 2>/dev/null && echo -e "${GREEN}✅ NPM dev process stopped${NC}" || echo -e "${YELLOW}⚠️  No NPM dev process found${NC}"

# Stop by port
kill_port 5000 "Backend"
kill_port 3000 "Frontend"

# Clean up log files
echo -e "${YELLOW}🧹 Cleaning up log files...${NC}"
rm -f /workspaces/bingeboard-local/server.log
rm -f /workspaces/bingeboard-local/vite.log

echo -e "${GREEN}🎉 All servers stopped successfully!${NC}"