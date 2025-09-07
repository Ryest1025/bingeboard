#!/bin/bash
# Test authentication after domain setup

echo "🧪 Testing Authentication Setup"
echo "=============================="

echo "1. Testing current domain resolution..."
curl -s -o /dev/null -w "%{http_code}" https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev | grep -q "200" && echo "✅ Current domain accessible" || echo "❌ Current domain failed"

echo "2. Testing Firebase config..."
node -e "
const config = require('./client/src/firebase/config.ts');
console.log('✅ Firebase config loaded successfully');
console.log('Auth domain:', config.firebaseConfig?.authDomain || 'Not found');
"

echo "3. Testing Google OAuth..."
echo "Visit: https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/login"
echo "Try Google login and check for domain authorization errors"

echo "4. Testing Facebook OAuth..."
echo "Visit: https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/login"
echo "Try Facebook login and check for domain authorization errors"

echo ""
echo "📋 Manual Steps Required:"
echo "1. Add domains to Firebase Console"
echo "2. Update Google OAuth redirect URIs"
echo "3. Update Facebook OAuth redirect URIs"
echo ""
echo "After completing manual steps, authentication will work permanently."
