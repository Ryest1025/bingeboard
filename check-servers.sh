#!/bin/bash

echo "🔍 Checking Bingeboard Server Status..."
echo ""

# Check if backend is running on port 5000
echo "1. Backend Server (Port 5000):"
if curl -s "http://127.0.0.1:5000/api/trending/tv/day" > /dev/null 2>&1; then
    echo "   ✅ Backend API is responding"
else
    echo "   ❌ Backend API not responding"
fi

# Check if frontend is running on port 3000
echo ""
echo "2. Frontend Server (Port 3000):"
if curl -s "http://127.0.0.1:3000" > /dev/null 2>&1; then
    echo "   ✅ Frontend is responding"
else
    echo "   ❌ Frontend not responding"
fi

# Check if proxy is working
echo ""
echo "3. Proxy Configuration:"
if curl -s "http://127.0.0.1:3000/api/trending/tv/day" > /dev/null 2>&1; then
    echo "   ✅ Proxy is working (Frontend -> Backend)"
else
    echo "   ❌ Proxy not working"
fi

# Check processes
echo ""
echo "4. Running Processes:"
echo "   Backend processes:"
ps aux | grep -E "(tsx.*server|PORT=5000)" | grep -v grep | sed 's/^/     /'
echo "   Frontend processes:"
ps aux | grep -E "(vite.*3000)" | grep -v grep | sed 's/^/     /'

echo ""
echo "🎯 Quick Start Commands:"
echo "   Backend:  cd /workspaces/bingeboard && PORT=5000 npm run dev"
echo "   Frontend: cd /workspaces/bingeboard && npm run client:dev"
echo ""
