#!/bin/bash

echo "🔒 Generating SSL certificates for localhost..."

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL not found. Please install OpenSSL."
    echo ""
    echo "On Ubuntu/Debian: sudo apt-get install openssl"
    echo "On macOS: brew install openssl"
    echo "On Windows: Use Git Bash or install OpenSSL"
    exit 1
fi

echo "✅ OpenSSL found, generating certificates..."

# Generate private key
openssl genrsa -out localhost.key 2048

# Generate certificate signing request
openssl req -new -key localhost.key -out localhost.csr -config localhost.conf

# Generate self-signed certificate
openssl x509 -req -in localhost.csr -signkey localhost.key -out localhost.crt -days 365 -extensions v3_req -extfile localhost.conf

# Clean up CSR file
rm localhost.csr

echo "✅ SSL certificates generated successfully!"
echo ""
echo "📁 Files created:"
echo "  - localhost.key (private key)"
echo "  - localhost.crt (certificate)"
echo ""
echo "🚀 To use HTTPS, set HTTPS=true in .env.local and restart your dev server"
echo ""
