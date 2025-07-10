# Firebase Mobile Authentication Setup Guide

## Current Issue
Mobile devices get "Unable to verify that the app domain is authorized" error while desktop works fine.

## Required Firebase Console Configuration

### 1. Authorized Domains Setup
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your current Replit domain: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
3. Also add: `localhost` (for development)

### 2. OAuth Provider Configuration

#### Google OAuth Setup
1. Firebase Console → Authentication → Sign-in method → Google
2. Click "Configure" and ensure these redirect URIs are added:
   - `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`
   - `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/__/auth/handler`

#### Facebook OAuth Setup
1. Firebase Console → Authentication → Sign-in method → Facebook
2. Click "Configure" and ensure these redirect URIs are added:
   - `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`
   - `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/__/auth/handler`

### 3. Mobile App Configuration (if using mobile apps)

#### For Android
- Add SHA-1 certificate fingerprints
- Configure package name: `com.bingeboard.app`

#### For iOS
- Add iOS bundle ID: `com.bingeboard.app`
- Add App Store ID when available

### 4. Current Firebase Project Settings
- Project ID: `bingeboard-73c5f`
- API Key: `AIzaSyB45zr8b2HjIx1fzXOuQsHxeQK9wl_wC88`
- App ID: `1:145846820194:web:047efd7a8e59b36944a03b`

## Testing Steps After Configuration
1. Clear browser cache and cookies
2. Test on mobile device at `/login`
3. Try both Google and Facebook authentication
4. Check browser console for any remaining errors

## Quick Fix Priority
**IMMEDIATE ACTION NEEDED**: Add the current Replit domain to Firebase authorized domains - this is likely the root cause of the mobile authentication failure.