# OAuth Callback URL Configuration

## CRITICAL: Provider Console Setup Required

The OAuth authentication endpoints are working but need callback URLs configured in the provider consoles.

### Current Issue
- OAuth strategies are configured ✅
- Credentials are set ✅  
- **Provider consoles need callback URLs** ❌

### Root Cause
Both Google and Facebook callbacks are not receiving authorization codes because the callback URLs aren't registered in the provider consoles.

### Fix Required

**Google Cloud Console:**
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`
3. Add to "Authorized redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/google/callback
   ```

**Facebook Developer Console:**
1. Visit: https://developers.facebook.com/apps/1407155243762479/fb-login/settings/
2. Add to "Valid OAuth Redirect URIs":
   ```
   https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
   ```

### Current Domain
**Active Domain:** `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

### Verification
After updating provider consoles:
1. Clear browser cache/cookies
2. Try Google/Facebook login from `/login`
3. Should complete OAuth flow successfully

### OAuth Provider Status
- **Google**: Client ID configured, callback URL needs registration
- **Facebook**: App ID configured, callback URL needs registration
- **Server endpoints**: Both `/api/auth/google` and `/api/auth/facebook` working (302 redirects)

The OAuth flow will work perfectly once the callback URLs are added to the provider consoles.