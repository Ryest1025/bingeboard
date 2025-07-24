#!/bin/bash

# Kill any process running on port 5000
echo "🔄 Checking for processes on port 5000..."

PID=$(lsof -ti:5000)
if [ ! -z "$PID" ]; then
  echo "⚡ Killing process $PID on port 5000"
  kill -9 $PID
  sleep 1
else
  echo "✅ Port 5000 is free"
fi
