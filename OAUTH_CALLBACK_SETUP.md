# OAuth Callback URL Configuration

## Required Action: Update Supabase Dashboard

The OAuth authentication is working but needs the correct callback URL configured in the Supabase Dashboard.

### Current Issue
- OAuth providers are enabled ✅
- Credentials are configured ✅  
- **Callback URL points to localhost** ❌

### Fix Required

**Go to Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/project/uqpjzzdmhfybqjtaygwf/auth/providers
2. Find the **"Site URL"** configuration
3. Change from: `http://localhost:3000`
4. Change to: `https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

### Alternative: Use Environment Variable
If the dashboard allows environment variables, set:
- Site URL: `{{ VITE_APP_URL }}`
- Add environment variable: `VITE_APP_URL=https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

### Verification
After updating the Site URL:
1. Clear browser cache/cookies
2. Try Google/Facebook login from `/login`
3. Should redirect properly to your app instead of localhost

### OAuth Provider Status
- **Google**: Configured (Client ID: 874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com)
- **Facebook**: Configured (App ID: 1407155243762479)
- **Callback URL**: `https://uqpjzzdmhfybqjtaygwf.supabase.co/auth/v1/callback` (automatic)

The OAuth flow will work perfectly once the Site URL is updated in the Supabase Dashboard.