@echo off
echo Starting DocumentAnalyzer Development Servers...
echo.

echo ========================================
echo Step 1: Starting Backend Server (API)
echo ========================================
echo.

REM Kill any existing processes on port 5000
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 5000...
    taskkill /f /pid %%a 2>nul
)

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Step 2: Starting Frontend Server (Vite)
echo ========================================
echo.

REM Kill any existing processes on port 3000
echo Checking for existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 3000...
    taskkill /f /pid %%a 2>nul
)

echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "npx vite --port 3000"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend (API): http://localhost:5000
echo Frontend (App): http://localhost:3000
echo.
echo Wait about 10-15 seconds, then open:
echo http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
