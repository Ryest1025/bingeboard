#!/bin/bash

# BingeBoard Custom Domain Setup Script
# This script helps configure joinbingeboard.com for production deployment

echo "🌐 BingeBoard Custom Domain Setup"
echo "================================="

# Check if running on Replit
if [ -n "$REPL_ID" ]; then
    echo "✓ Running on Replit environment"
    echo "Current domain: $REPLIT_DOMAINS"
else
    echo "⚠️  Not running on Replit - some features may not work"
fi

echo ""
echo "📋 Setup Checklist:"
echo "==================="

echo ""
echo "1. Domain Registration"
echo "   ✓ joinbingeboard.com is registered"

echo ""
echo "2. Replit Custom Domain Configuration"
echo "   Go to: https://replit.com/@$(whoami)/$(basename $PWD)/settings"
echo "   - Navigate to 'Domains' section"
echo "   - Add custom domain: joinbingeboard.com"
echo "   - Follow DNS configuration instructions"

echo ""
echo "3. DNS Configuration (Update at your domain registrar):"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: [your-replit-url].replit.app"
echo ""
echo "   Type: A"
echo "   Name: @"
echo "   Value: [IP from Replit instructions]"

echo ""
echo "4. Firebase Authorization Setup"
echo "   Go to: https://console.firebase.google.com/project/bingeboard-73c5f"
echo "   Navigate to: Authentication > Settings > Authorized domains"
echo "   Add these domains:"
echo "   - joinbingeboard.com"
echo "   - www.joinbingeboard.com"

echo ""
echo "5. OAuth Redirect URIs"
echo "   Google Console: https://console.developers.google.com/"
echo "   - Add: https://joinbingeboard.com/auth/google/callback"
echo "   - Add: https://www.joinbingeboard.com/auth/google/callback"
echo ""
echo "   Facebook Console: https://developers.facebook.com/"
echo "   - Add: https://joinbingeboard.com/auth/facebook/callback"
echo "   - Add: https://www.joinbingeboard.com/auth/facebook/callback"

echo ""
echo "6. Environment Variables Update"
echo "   Update these in Replit Secrets:"
echo "   - PRODUCTION_DOMAIN=joinbingeboard.com"
echo "   - PRODUCTION_URL=https://joinbingeboard.com"

echo ""
echo "🔧 After DNS Propagation (24-48 hours):"
echo "========================================"
echo "Run this command to switch to custom domain:"
echo "npm run switch-to-custom-domain"

echo ""
echo "🧪 Testing Commands:"
echo "==================="
echo "Test domain resolution: dig joinbingeboard.com"
echo "Test SSL certificate: curl -I https://joinbingeboard.com"
echo "Test authentication: Visit https://joinbingeboard.com/login"

echo ""
echo "📞 Support:"
echo "==========="
echo "If you encounter issues:"
echo "1. Check DNS propagation: https://dnschecker.org"
echo "2. Verify Replit domain settings"
echo "3. Confirm Firebase domain authorization"
echo "4. Test with Replit Auth as fallback"

echo ""
echo "✅ Setup script completed!"
echo "Follow the checklist above to configure your custom domain."