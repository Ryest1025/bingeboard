@echo off
echo 🔒 Generating SSL certificates for localhost...

REM Check if OpenSSL is available
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ OpenSSL not found. Please install OpenSSL or use WSL.
    echo.
    echo Option 1: Install OpenSSL for Windows:
    echo   - Download from: https://wiki.openssl.org/index.php/Binaries
    echo   - Or use Git Bash ^(includes OpenSSL^)
    echo.
    echo Option 2: Use WSL ^(Windows Subsystem for Linux^):
    echo   - Run: wsl
    echo   - Then run: bash generate-ssl.sh
    echo.
    pause
    exit /b 1
)

echo ✅ OpenSSL found, generating certificates...

REM Generate private key
openssl genrsa -out localhost.key 2048

REM Generate certificate signing request
openssl req -new -key localhost.key -out localhost.csr -config localhost.conf

REM Generate self-signed certificate
openssl x509 -req -in localhost.csr -signkey localhost.key -out localhost.crt -days 365 -extensions v3_req -extfile localhost.conf

REM Clean up CSR file
del localhost.csr

echo ✅ SSL certificates generated successfully!
echo.
echo 📁 Files created:
echo   - localhost.key ^(private key^)
echo   - localhost.crt ^(certificate^)
echo.
echo 🚀 To use HTTPS, set HTTPS=true in .env.local and restart your dev server
echo.
pause
