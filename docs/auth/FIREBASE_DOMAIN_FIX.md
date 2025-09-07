# URGENT: Firebase Mobile Authentication Fix

## Current Issue
Mobile authentication fails with "Unable to verify that the app domain is authorized" error.

## Root Cause
Current Replit domain is not in Firebase Console authorized domains list.

## IMMEDIATE SOLUTION REQUIRED

### Step 1: Add Current Domain to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/bingeboard-73c5f/authentication/settings)
2. Click on "Authentication" → "Settings" → "Authorized domains"
3. Click "Add domain"
4. Add: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
5. Click "Done"

### Step 2: Add Permanent Domain (RECOMMENDED)
1. In the same authorized domains section
2. Click "Add domain"
3. Add: `www.joinbingeboard.com`
4. Click "Done"

### Step 3: Verify OAuth Providers
1. Go to "Sign-in method" tab
2. Click on "Google" provider
3. Ensure these redirect URIs are configured:
   - `https://bingeboard-73c5f.firebaseapp.com/__/auth/handler`
   - `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/__/auth/handler`
   - `https://www.joinbingeboard.com/__/auth/handler`

### Step 4: Test Mobile Authentication
1. Clear browser cache on mobile device
2. Navigate to `/login`
3. Try Google authentication
4. Should work without domain authorization error

## Technical Details
- Firebase Project ID: bingeboard-73c5f
- Current working desktop domain: Already authorized
- Mobile failing domain: Needs authorization
- Permanent domain: www.joinbingeboard.com (already configured in DNS)

## This fix will take 5 minutes and permanently resolve mobile authentication