#!/bin/bash
# start-dev.sh - Start BingeBoard dev environment cleanly

# --- Kill conflicting ports ---
echo "🔄 Checking and killing ports 3000, 3001, 5000..."
for port in 3000 3001 5000; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "⚡ Killing process on port $port..."
    lsof -t -i :$port | xargs kill -9 2>/dev/null
  else
    echo "✅ Port $port is free"
  fi
done

echo ""
echo "🚀 Starting BingeBoard Development Environment..."
echo ""

# --- Start backend ---
echo "🖥️  Starting backend on port 5000..."
echo "📍 Backend will be available at: http://localhost:5000"
echo ""

# Start backend in background and capture PID
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running successfully!"
else
    echo "⚠️  Backend may still be starting up..."
fi

echo ""

# --- Start frontend ---
echo "🎨 Starting frontend on port 3001..."
echo "📍 Frontend will be available at: http://localhost:3001"
echo ""
echo "🔗 API requests will proxy to backend automatically"
echo ""

# Change to client directory and start Vite
cd ./client && npx vite --host 0.0.0.0 --port 3001

# This script will keep running until you press Ctrl+C
# When you stop it, it will also stop the backend
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM