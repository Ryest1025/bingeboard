#!/bin/bash

# BingeBoard Development Server Startup Script
# This script ensures both backend and frontend servers start reliably

set -e  # Exit on any error

echo "🚀 Starting BingeBoard Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Checking port $port...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}⚡ Killing existing process on port $port${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # Double check
        if check_port $port; then
            echo -e "${RED}❌ Failed to free port $port${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Port $port is now free${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $name server on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✅ $name server is ready on port $port${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - waiting for $name server...${NC}"
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $name server failed to start on port $port after $max_attempts attempts${NC}"
    return 1
}

# Step 1: Clean up any existing processes
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
kill_port 5000  # Backend
kill_port 3000  # Frontend

# Step 2: Start Backend Server
echo -e "${BLUE}🖥️  Starting Backend Server (Express)...${NC}"
cd /workspaces/bingeboard-local

# Kill any existing backend processes
pkill -f "tsx server/index.ts" || true
pkill -f "npm run dev" || true
sleep 2

# Start backend in background
nohup npm run dev > server.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}🖥️  Backend server started with PID: $BACKEND_PID${NC}"

# Wait for backend to be ready
if ! wait_for_server 5000 "Backend"; then
    echo -e "${RED}❌ Backend server failed to start${NC}"
    exit 1
fi

# Step 3: Start Frontend Server
echo -e "${BLUE}🌐 Starting Frontend Server (Vite)...${NC}"

# Kill any existing vite processes
pkill -f "vite" || true
sleep 2

# Start frontend with specific host and port settings
NODE_ENV=development nohup npx vite --host 0.0.0.0 --port 3000 --strictPort > vite.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}🌐 Frontend server started with PID: $FRONTEND_PID${NC}"

# Wait for frontend to be ready
if ! wait_for_server 3000 "Frontend"; then
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    echo -e "${YELLOW}📋 Vite log output:${NC}"
    tail -20 vite.log || echo "No vite.log found"
    exit 1
fi

# Step 4: Final verification
echo -e "${BLUE}🔍 Final verification...${NC}"
sleep 2

# Test backend
if curl -s -I http://localhost:5000/api/auth/session >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API test failed (might be auth-related, but server is running)${NC}"
fi

# Test frontend
if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend test failed${NC}"
    exit 1
fi

# Success message
echo -e "${GREEN}"
echo "🎉 SUCCESS! Both servers are running:"
echo "   🖥️  Backend:  http://localhost:5000"
echo "   🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 Server PIDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📁 Log files:"
echo "   Backend:  server.log"
echo "   Frontend: vite.log"
echo ""
echo "🛑 To stop servers: pkill -f 'tsx server' && pkill -f 'vite'"
echo -e "${NC}"

# Optional: Open browser
if command -v xdg-open >/dev/null 2>&1; then
    echo -e "${BLUE}🌐 Opening browser...${NC}"
    xdg-open http://localhost:3000 2>/dev/null || true
fi