#!/bin/bash

# Server monitoring and auto-restart script
# This helps prevent the servers from dying unexpectedly

echo "🔍 Starting server monitoring..."

# Function to check if a port is in use
check_port() {
    local port=$1
    netstat -tulpn 2>/dev/null | grep ":$port " > /dev/null
    return $?
}

# Function to restart backend
restart_backend() {
    echo "🔄 Restarting backend server..."
    pkill -f "tsx.*server/index.ts" 2>/dev/null
    pkill -f "node.*5000" 2>/dev/null
    sleep 2
    cd /workspaces/bingeboard-local
    nohup npm run dev > server.log 2>&1 &
    echo "✅ Backend restart initiated"
}

# Function to restart frontend
restart_frontend() {
    echo "🔄 Restarting frontend server..."
    pkill -f "vite.*3000" 2>/dev/null
    sleep 2
    cd /workspaces/bingeboard-local/client
    nohup npm run dev > ../vite.log 2>&1 &
    echo "✅ Frontend restart initiated"
}

# Main monitoring loop
while true; do
    # Check backend (port 5000)
    if ! check_port 5000; then
        echo "⚠️  Backend server down, restarting..."
        restart_backend
    fi
    
    # Check frontend (port 3000)
    if ! check_port 3000; then
        echo "⚠️  Frontend server down, restarting..."
        restart_frontend
    fi
    
    # Wait 30 seconds before next check
    sleep 30
done