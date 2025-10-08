#!/bin/bash

# Improved server startup script with better error handling and stability

set -e

echo "🚀 Starting BingeBoard Development Servers"
echo "========================================="

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    pkill -f "tsx.*server/index.ts" 2>/dev/null || true
    pkill -f "vite.*3000" 2>/dev/null || true
    exit 0
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM

# Clear any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "tsx.*server/index.ts" 2>/dev/null || true
pkill -f "vite.*3000" 2>/dev/null || true
sleep 2

# Start backend server
echo "🖥️  Starting backend server (port 5000)..."
cd /workspaces/bingeboard-local
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/trending/tv/day > /dev/null 2>&1; then
        echo "✅ Backend server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start frontend server
echo "🌐 Starting frontend server (port 3000)..."
cd /workspaces/bingeboard-local/client
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend server is ready!"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "❌ Frontend failed to start within 20 seconds"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 All servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend process died, exiting..."
        exit 1
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend process died, exiting..."
        exit 1
    fi
    sleep 5
done