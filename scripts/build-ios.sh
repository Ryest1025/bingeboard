#!/bin/bash

# BingeBoard iOS Build Script
# PURPOSE: Prepares the app for iOS deployment using Capacitor
# USAGE: ./scripts/build-ios.sh
# DESCRIPTION: Builds web app, adds iOS platform, syncs assets, and prepares for Xcode deployment

set -e

echo "🚀 Building BingeBoard for iOS deployment..."

# Check if Capacitor CLI is installed
if ! command -v cap &> /dev/null; then
    echo "❌ Capacitor CLI is not installed. Installing globally..."
    npm install -g @capacitor/cli
fi

# Build the web application
echo "📦 Building web application..."
npm run build

# Check if iOS platform exists, add if needed
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
else
    echo "📱 iOS platform already exists"
fi

# Sync web assets to iOS
echo "🔄 Syncing assets to iOS platform..."
npx cap sync ios

# Generate icons if needed
echo "🎨 Preparing app icons..."
if [ ! -f "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@1x.png" ]; then
    echo "⚠️  App icons need to be generated manually"
    echo "   Visit: http://localhost:5000/icon-generation.html"
    echo "   Save the generated icons to ios/App/App/Assets.xcassets/AppIcon.appiconset/"
fi

echo "✅ iOS build preparation complete!"
echo ""
echo "Next steps:"
echo "1. Run: npx cap open ios"
echo "2. In Xcode:"
echo "   - Set your Team in Signing & Capabilities"
echo "   - Update Bundle Identifier"
echo "   - Add app icons if not already present"
echo "   - Build and Archive for App Store"
echo ""
echo "📖 See IOS_DEPLOYMENT_GUIDE.md for detailed instructions"