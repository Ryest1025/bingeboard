# Firebase Authorized Domain Fix for Mobile Authentication

## CRITICAL ISSUE IDENTIFIED

The mobile authentication is failing because the current Replit domain is not authorized in Firebase Console:

**Current Domain:** `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

**Error:** "Unable to verify that the app domain is authorized"

## PERMANENT FIX REQUIRED

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `bingeboard-73c5f`
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Add the custom domain (this is the permanent solution):
   ```
   www.joinbingeboard.com
   ```
5. Also add the current Replit domain as temporary fallback:
   ```
   80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
   ```

## Current Authorized Domains Should Include:
- `localhost` (for development)
- `bingeboard-73c5f.firebaseapp.com` (Firebase default)
- `joinbingeboard.com` (custom domain)
- `www.joinbingeboard.com` (www subdomain)
- `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev` (current Replit domain)

## WHY THIS HAPPENS

Replit domains change periodically, and Firebase requires each domain to be explicitly authorized for authentication. The OAuth redirect URLs we configured earlier work for the providers, but Firebase also needs the originating domain authorized.

## VERIFICATION STEPS

After adding the domain:
1. Wait 2-3 minutes for Firebase to propagate the changes
2. Test mobile authentication again
3. Google login should work without "domain not authorized" error
4. Facebook login should also work properly

## LONG-TERM SOLUTION

Once the custom domain `joinbingeboard.com` is fully configured, this issue will be resolved permanently as the domain won't change.