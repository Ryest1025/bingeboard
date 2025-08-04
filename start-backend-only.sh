#!/bin/bash
export PORT=5000
export NODE_ENV=development
export API_ONLY=true
echo "🚀 Starting backend API server on port 5000..."
tsx server/index.ts
