#!/bin/bash
# Add Firebase Admin credentials to Vercel environment variables
# Run this script to fix the backend session issue

echo "🔧 Adding Firebase Admin credentials to Vercel..."

# Get the Firebase Admin key from .env
FIREBASE_KEY=$(grep "FIREBASE_ADMIN_KEY=" .env | cut -d'=' -f2-)

if [ -z "$FIREBASE_KEY" ]; then
  echo "❌ Error: FIREBASE_ADMIN_KEY not found in .env file"
  exit 1
fi

echo "✅ Found Firebase Admin key in .env"
echo ""
echo "📋 To add this to Vercel:"
echo ""
echo "1. Go to: https://vercel.com/ryest1025s-projects/bingeboard-two/settings/environment-variables"
echo ""
echo "2. Click 'Add New' and enter:"
echo "   Name: FIREBASE_ADMIN_KEY"
echo "   Value: (copy the value below)"
echo "   Environment: Production, Preview, Development (select all 3)"
echo ""
echo "3. Copy this value:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$FIREBASE_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4. Click 'Save'"
echo ""
echo "5. Redeploy the API:"
echo "   cd /workspaces/bingeboard-local"
echo "   git commit --allow-empty -m 'Trigger Vercel redeployment'"
echo "   git push origin main"
echo ""
echo "⏱️  Wait 2 minutes for deployment, then test login"
