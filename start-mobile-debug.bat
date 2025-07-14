@echo off
title BingeBoard - Mobile Social Login Setup
color 0A

echo.
echo ========================================
echo 🚀 BingeBoard Mobile Social Login Setup
echo ========================================
echo.

echo 📂 Step 1: Checking project directory...
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from your project root directory
    pause
    exit /b 1
)
echo ✅ Project directory confirmed

echo.
echo 🧹 Step 2: Cleaning up any existing processes...
taskkill /F /IM node.exe /T 2>nul >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Stopped existing Node.js processes
) else (
    echo ℹ️ No existing Node.js processes found
)

echo.
echo 🔌 Step 3: Checking port availability...
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️ Port 3000 is in use, attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a 2>nul >nul
    )
    timeout /t 2 /nobreak >nul
) else (
    echo ✅ Port 3000 is available
)

echo.
echo 📦 Step 4: Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🔒 Step 5: Checking SSL certificates...
if not exist "localhost.crt" (
    echo ⚠️ SSL certificates not found
    echo.
    echo 🔧 Generating SSL certificates for HTTPS support...
    echo This is required for Facebook login to work.
    echo.
    
    REM Check if OpenSSL is available
    where openssl >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ OpenSSL not found. Using alternative method...
        echo.
        echo Facebook login will require HTTPS. Options:
        echo 1. Install Git for Windows (includes OpenSSL)
        echo 2. Use WSL: wsl bash generate-ssl.sh
        echo 3. Continue with HTTP (Google login only)
        echo.
        choice /C 123 /M "Choose option"
        if errorlevel 3 goto :skip_ssl
        if errorlevel 2 (
            echo Running WSL command...
            wsl bash generate-ssl.sh
            goto :ssl_done
        )
        if errorlevel 1 (
            echo Please install Git for Windows and run this script again
            echo Download: https://git-scm.com/download/win
            pause
            exit /b 1
        )
    ) else (
        echo ✅ OpenSSL found, generating certificates...
        
        REM Generate private key
        openssl genrsa -out localhost.key 2048 2>nul
        
        REM Generate certificate signing request
        openssl req -new -key localhost.key -out localhost.csr -config localhost.conf -batch 2>nul
        
        REM Generate self-signed certificate
        openssl x509 -req -in localhost.csr -signkey localhost.key -out localhost.crt -days 365 -extensions v3_req -extfile localhost.conf 2>nul
        
        REM Clean up CSR file
        del localhost.csr 2>nul
        
        if exist "localhost.crt" (
            echo ✅ SSL certificates generated successfully
        ) else (
            echo ❌ Failed to generate certificates
        )
    )
    :ssl_done
) else (
    echo ✅ SSL certificates found
)

:skip_ssl

echo.
echo 🔥 Step 6: Checking Firebase configuration...
findstr "your_firebase_api_key_here" .env.local >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️ Firebase configuration contains placeholder values
    echo.
    echo 📝 To fix social login:
    echo 1. Go to https://console.firebase.google.com/
    echo 2. Select your project
    echo 3. Go to Project Settings ^> General ^> Your apps
    echo 4. Copy the config values to .env.local
    echo.
    echo 🚀 For now, continuing with development server...
) else (
    echo ✅ Firebase configuration appears to be set up
)

echo.
echo 🚀 Step 7: Starting development server...
echo.
echo 📋 Server will be available at:
echo   - HTTP:  http://localhost:3000
echo   - HTTPS: https://localhost:3000 (if certificates exist)
echo.
echo 📱 Mobile app pages:
echo   - Mobile App: http://localhost:3000/mobile-app
echo   - Debug Tool: http://localhost:3000/mobile-social-debug-updated.html
echo.
echo 🔍 Debug info:
echo   - Google login: Works on HTTP and HTTPS
echo   - Facebook login: Requires HTTPS only
echo.
echo ⚡ Starting server now...
echo.

REM Start the development server
npm run dev

echo.
echo 🛑 Server stopped. Press any key to exit.
pause
