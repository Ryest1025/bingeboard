# BingeBoard iOS Deployment Guide

## Overview
This guide walks through deploying BingeBoard to the Apple App Store using Capacitor's single codebase approach. The app is configured as a hybrid web/native application.

## Prerequisites

### 1. Apple Developer Account
- Active Apple Developer Program membership ($99/year)
- Developer certificates and provisioning profiles
- App Store Connect access

### 2. Development Environment
- macOS with Xcode 14+ installed
- Node.js 18+ and npm
- Capacitor CLI installed globally: `npm install -g @capacitor/cli`

## App Configuration

### Current Setup
- **App ID**: `com.bingeboard.app`
- **App Name**: BingeBoard
- **Bundle Version**: 1.0.0
- **Deployment Target**: iOS 13.0+
- **Orientation**: Portrait (primary)
- **Categories**: Entertainment, Lifestyle, Social

### Key Features Configured
- Dark theme optimized for iOS
- Native status bar integration
- Splash screen with brand colors
- PWA capabilities with offline support
- Deep linking support for show details

## Deployment Steps

### Step 1: Prepare the Build
```bash
# Build the web application
npm run build

# Add iOS platform (first time only)
npx cap add ios

# Sync web assets to iOS
npx cap sync ios
```

### Step 2: Configure iOS Project
```bash
# Open Xcode project
npx cap open ios
```

In Xcode:
1. Set your Team in Signing & Capabilities
2. Update Bundle Identifier to match your Apple Developer account
3. Configure App Store icons (provided in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)
4. Set deployment target to iOS 13.0+
5. Configure capabilities:
   - Background Modes (if needed for notifications)
   - Push Notifications (if implementing)

### Step 3: App Icons
The following icon sizes are required for iOS:
- 20x20 (notification)
- 29x29 (settings)
- 40x40 (spotlight)
- 58x58 (settings @2x)
- 60x60 (app icon)
- 80x80 (spotlight @2x)
- 87x87 (settings @3x)
- 120x120 (app icon @2x)
- 180x180 (app icon @3x)
- 1024x1024 (App Store)

### Step 4: Build and Archive
1. In Xcode, select "Any iOS Device" as the destination
2. Product → Archive
3. When archiving completes, click "Distribute App"
4. Choose "App Store Connect"
5. Follow the upload process

### Step 5: App Store Connect
1. Log into App Store Connect
2. Create new app with:
   - App Name: "BingeBoard"
   - Primary Language: English
   - SKU: com.bingeboard.app
   - Bundle ID: com.bingeboard.app
3. Complete App Information:
   - Subtitle: "TV Show Tracker"
   - Category: Entertainment
   - Content Rights: Yes (original content)
4. Add screenshots (provided)
5. App Review Information:
   - Notes: "Social TV show tracking app with friend connections"
   - Contact Information: Your details
6. Submit for Review

## App Store Assets Required

### Screenshots (Generated)
- iPhone 6.7" Display (1290x2796): 3-5 screenshots
- iPhone 6.5" Display (1242x2688): 3-5 screenshots  
- iPhone 5.5" Display (1242x2208): 3-5 screenshots
- iPad Pro (12.9") Display (2048x2732): 3-5 screenshots
- iPad Pro (12.9") Display (2732x2048): 3-5 screenshots

### App Store Description
```
Discover, track, and share your favorite TV shows with BingeBoard - the ultimate entertainment companion.

KEY FEATURES:
• Track your watching progress across all shows
• Get personalized recommendations based on your taste
• Connect with friends and see what they're watching
• Never miss new episodes with smart notifications
• Discover trending shows and hidden gems
• Support for all major streaming platforms

SOCIAL FEATURES:
• Add friends and share your watchlist
• See what your network is currently watching
• Get recommendations from friends with similar tastes
• Activity feed of friend actions and ratings

SMART TRACKING:
• Mark episodes as watched with progress tracking
• Set reminders for upcoming releases
• Import viewing history from streaming platforms
• Intelligent recommendations using AI

Whether you're a casual viewer or a binge-watching enthusiast, BingeBoard helps you organize your entertainment life and discover your next favorite show.

Download now and never miss another great series!
```

### Keywords
entertainment, tv shows, movies, tracking, watchlist, recommendations, social, streaming, netflix, hulu, friends, discover, binge

## Technical Configuration

### Info.plist Requirements
```xml
<key>NSCameraUsageDescription</key>
<string>Take photos for your profile</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Select photos for your profile</string>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.bingeboard.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>bingeboard</string>
    </array>
  </dict>
</array>
```

### Privacy Policy
Required for App Store approval - privacy policy is accessible at `/privacy-policy` route.

### Content Rating
- 12+ (Infrequent/Mild Mature/Suggestive Themes)
- No inappropriate content
- Social features with user-generated content

## Post-Submission

### Review Process
- Typically 1-7 days for initial review
- Common rejection reasons:
  - Missing privacy policy
  - Incomplete app information
  - Crashes during testing
  - Violating App Store guidelines

### Updates
For future updates:
1. Increment version number in `package.json` and `capacitor.config.ts`
2. Build and sync: `npm run build && npx cap sync ios`
3. Archive and upload new build
4. Update version in App Store Connect
5. Submit for review

## Troubleshooting

### Common Issues
1. **Build Failures**: Check iOS deployment target compatibility
2. **Certificate Issues**: Ensure valid developer certificates in Xcode
3. **Icon Issues**: Verify all required icon sizes are included
4. **Upload Failures**: Check bundle identifier matches App Store Connect

### Support Resources
- Apple Developer Documentation
- Capacitor iOS Documentation
- App Store Connect Help

## Success Checklist
- ✅ App builds successfully in Xcode
- ✅ All required icons generated and configured
- ✅ Privacy policy accessible
- ✅ App Store Connect configured
- ✅ Screenshots and description prepared
- ✅ App archived and uploaded
- ✅ Submitted for App Store review

The app is now ready for Apple App Store deployment using the hybrid approach with a single codebase!