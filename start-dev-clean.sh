#!/bin/bash
# start-dev-clean.sh - Cleanly start BingeBoard dev environment

# --- Ports to check ---
FRONTEND_PORT=3001
BACKEND_PORT=5000

echo "🔄 Checking and killing ports $FRONTEND_PORT and $BACKEND_PORT..."
for port in $FRONTEND_PORT $BACKEND_PORT; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "⚡ Killing process on port $port..."
    lsof -t -i :$port | xargs kill -9 2>/dev/null
  else
    echo "✅ Port $port is free"
  fi
done

# --- Clear Vite cache ---
echo ""
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf client/node_modules/.vite
rm -rf client/node_modules/.cache
echo "✅ Vite cache cleared"

# --- Start backend ---
echo ""
echo "🖥️  Starting backend on port $BACKEND_PORT..."

# Run backend from root directory using npm run dev
npm run dev &
BACKEND_PID=$!
echo "⏳ Waiting 5s for backend to initialize..."
sleep 5

if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running successfully!"
else
    echo "⚠️  Backend may still be starting up..."
fi

# --- Start frontend ---
echo ""
echo "🎨 Starting frontend on port $FRONTEND_PORT..."
cd client || { echo "❌ Client directory not found"; exit 1; }

echo "🔗 API requests will proxy to backend automatically"
npx vite --host 0.0.0.0 --port $FRONTEND_PORT --force &

FRONTEND_PID=$!
echo "📍 Frontend starting at: http://localhost:$FRONTEND_PORT"
echo "📍 Backend running at: http://localhost:$BACKEND_PORT"

# --- Cleanup on exit ---
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep script running
echo ""
echo "🚀 Both servers are starting up..."
echo "💡 Press Ctrl+C to stop all servers"
echo ""

wait