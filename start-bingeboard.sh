#!/bin/bash

# Start the BingeBoard application (both client and server)
echo "🚀 Starting BingeBoard application..."

# Kill any existing Node processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node" || true
sleep 1

# Start the server
echo "🖥️  Starting backend server..."
cd /workspaces/bingeboard
npx tsx server/index.ts > backend-server.log 2>&1 &
SERVER_PID=$!
echo "✅ Server started with PID $SERVER_PID"

# Wait for server to initialize
echo "⏳ Waiting for server to initialize (5 seconds)..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running properly"
else
    echo "❌ Server failed to start. Check backend-server.log for errors"
    exit 1
fi

# Start the client
echo "🌐 Starting client development server..."
cd /workspaces/bingeboard/client
npx vite --host 0.0.0.0 --port 3001 > ../client-server.log 2>&1 &
CLIENT_PID=$!
echo "✅ Client started with PID $CLIENT_PID"

# Wait for client to initialize
echo "⏳ Waiting for client to initialize (5 seconds)..."
sleep 5

# Check if client is running
if ps -p $CLIENT_PID > /dev/null; then
    echo "✅ Client is running properly"
else
    echo "❌ Client failed to start. Check client-server.log for errors"
    exit 1
fi

echo "🎉 BingeBoard is running!"
echo "📱 Frontend: http://localhost:3001"
echo "🔌 Backend: http://localhost:3000"
echo ""
echo "📊 View server logs: tail -f backend-server.log"
echo "📊 View client logs: tail -f client-server.log"
echo ""
echo "Press Ctrl+C to stop watching logs"

# Display logs
tail -f backend-server.log client-server.log
