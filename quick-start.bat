@echo off
echo 🔧 BingeBoard Quick Start Script
echo.

echo 📋 Step 1: Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo 📋 Step 2: Checking NPM installation...
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ NPM not found! Please install NPM first.
    pause
    exit /b 1
)

echo 📋 Step 3: Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo 📋 Step 4: Starting development server...
echo.
echo 🚀 Starting BingeBoard on port 3000...
echo   - Main app: http://localhost:3000
echo   - Mobile app: http://localhost:3000/mobile-app
echo   - Debug tool: http://localhost:3000/mobile-social-debug-updated.html
echo.

npm run dev
