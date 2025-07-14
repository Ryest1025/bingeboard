@echo off
echo 🔄 Restarting BingeBoard Development Server...
echo.

echo 🛑 Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ⚠️ No Node.js processes found or already stopped
)

echo.
echo 🔍 Step 2: Checking for processes using ports 3000, 5000, and 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a using port 3000...
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a using port 5000...
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing process %%a using port 5001...
    taskkill /F /PID %%a 2>nul
)

echo.
echo ⏳ Step 3: Waiting 3 seconds for cleanup...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Step 4: Starting development server on port 3000...
npm run dev

echo.
echo 📋 If the server starts successfully:
echo   - Main app: http://localhost:3000
echo   - Mobile app: http://localhost:3000/mobile-app
echo   - Debug tool: http://localhost:3000/mobile-social-debug-updated.html
echo.
pause
