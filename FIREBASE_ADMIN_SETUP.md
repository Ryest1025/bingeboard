# Firebase Admin Setup - CRITICAL FOR LOGIN

## ⚠️ IMPORTANT: Required for Authentication

The Firebase Admin SDK is **essential** for user authentication. Without it, login will fail.

## Current Status: ✅ CONFIGURED

Firebase Admin credentials are properly configured in:
- ✅ Local `.env` file (for development)
- ✅ Vercel environment variables (for production)

## Environment Variable

**Variable Name:** `FIREBASE_ADMIN_KEY`

**Location in Vercel:**
- Project: `bingeboard` 
- URL: https://vercel.com/ryest1025s-projects/bingeboard/settings/environment-variables
- Environment: Production, Preview, Development

**Value:** JSON object containing Firebase service account credentials (stored in local `.env`)

## What This Does

The Firebase Admin SDK allows the backend to:
1. Verify Firebase authentication tokens
2. Create server-side session cookies
3. Validate user sessions across requests
4. Enable secure cross-domain authentication

Without it, users see:
```
⚠️ No Firebase Admin credentials found. Session creation will not work.
warning: 'Session created on client only - server authentication unavailable'
```

## Verification

### Check if properly configured:

**In Vercel Logs:**
- ✅ Good: `✅ Firebase Admin initialized successfully`
- ❌ Bad: `⚠️ No Firebase Admin credentials found`

**In Browser Console:**
- ✅ Good: `📦 Session creation response: {success: true}`
- ❌ Bad: `📦 Session creation response: {success: true, warning: 'Session created on client only...'}`

## If Login Stops Working

### Symptoms:
- Login page reloads infinitely
- Console shows "Session created on client only" warning
- User can't reach dashboard after entering credentials

### Solution:

1. **Check Vercel has the environment variable:**
   ```bash
   # Go to: https://vercel.com/ryest1025s-projects/bingeboard/settings/environment-variables
   # Verify FIREBASE_ADMIN_KEY exists and is set to "Production"
   ```

2. **If missing, add it:**
   - Get value from local `.env` file: `FIREBASE_ADMIN_KEY=...`
   - Or use the helper file: `FIREBASE_KEY_FOR_VERCEL.txt` (not in git)
   - Add to Vercel with name: `FIREBASE_ADMIN_KEY`
   - Set for: Production, Preview, Development

3. **Trigger a redeploy:**
   ```bash
   git commit --allow-empty -m "chore: Trigger redeploy for env var"
   git push origin main
   ```

4. **Wait 2-3 minutes** for deployment to complete

5. **Test:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Try logging in
   - Check console for success message

## Backend Code Location

The Firebase Admin initialization is in:
- `api/index.js` (lines 27-54)

It checks for these environment variables (in order):
1. `FIREBASE_ADMIN_KEY` - Full JSON object (preferred)
2. `FIREBASE_SERVICE_ACCOUNT_BASE64` - Base64 encoded JSON (alternative)

## DO NOT:

- ❌ Remove `FIREBASE_ADMIN_KEY` from Vercel
- ❌ Delete this file - it documents critical setup
- ❌ Commit `FIREBASE_KEY_FOR_VERCEL.txt` to git (already in .gitignore)
- ❌ Change the backend initialization code without testing

## Last Updated

**Date:** January 16, 2026
**Status:** Working ✅
**Deployment:** https://bingeboardapp.com
**Backend:** https://bingeboard-two.vercel.app
