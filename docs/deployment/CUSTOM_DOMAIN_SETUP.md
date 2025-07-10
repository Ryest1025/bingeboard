# Custom Domain Setup: joinbingeboard.com

## Why This Fixes OAuth Permanently
- **Current Problem**: Replit domain changes daily, breaking OAuth callbacks
- **Solution**: Custom domain stays the same forever
- **Result**: OAuth URLs never need updating again

## Required Steps

### 1. Configure DNS (Domain Provider)
You need to point `joinbingeboard.com` to your Replit project.

**Add CNAME Record:**
```
Type: CNAME
Name: @ (or root/www)
Value: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
TTL: 300 (5 minutes)
```

**Alternative A Record:**
If CNAME for root domain not supported, use A record:
```
Type: A
Name: @
Value: [Replit's IP - need to resolve from current domain]
```

### 2. Configure Replit Project
In your Replit project settings:
1. Go to project settings
2. Find "Custom Domain" section
3. Add: `joinbingeboard.com`
4. Enable HTTPS/SSL

### 3. Update Environment Variables
```
REPLIT_DOMAINS=joinbingeboard.com
```

### 4. Update OAuth Provider Consoles (One Time Only)

#### Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials/oauthclient/874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com

**Replace current redirect URI with:**
```
https://joinbingeboard.com/api/auth/google/callback
```

#### Facebook Developer Console
**URL**: https://developers.facebook.com/apps/1407155243762479/fb-login/settings/

**Replace current redirect URI with:**
```
https://joinbingeboard.com/api/auth/facebook/callback
```

## Domain Provider Instructions

### If using Namecheap:
1. Login to Namecheap account
2. Go to Domain List → Manage
3. Advanced DNS tab
4. Add CNAME record as specified above

### If using GoDaddy:
1. Login to GoDaddy account
2. My Products → Domains → DNS
3. Add CNAME record as specified above

### If using Cloudflare:
1. Login to Cloudflare dashboard
2. Select domain
3. DNS tab
4. Add CNAME record (proxy off initially)

## Testing After Setup
1. Wait 5-15 minutes for DNS propagation
2. Visit `https://joinbingeboard.com` - should load your app
3. Test OAuth: `https://joinbingeboard.com/login`
4. Click Google/Facebook login - should work permanently

## Benefits
✅ **No More Daily Breakage**: Domain never changes  
✅ **Professional URL**: joinbingeboard.com instead of Replit subdomain  
✅ **OAuth Stability**: Callback URLs work forever  
✅ **SEO Benefits**: Better for search engines  
✅ **App Store Ready**: Clean domain for iOS/Android deployment  

## Current Status
- Domain registered: ✅ joinbingeboard.com
- DNS configuration: ⏳ Needs setup
- Replit configuration: ⏳ Needs setup
- OAuth update: ⏳ After domain active

This is the permanent solution that eliminates the daily OAuth authentication issues.