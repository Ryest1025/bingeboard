# Custom Domain DNS Setup for Replit

## Current Status
- **Domain**: `joinbingeboard.com` (registered with Wix)
- **Target**: `www.joinbingeboard.com` 
- **Current Replit Domain**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

## DNS Configuration Required

### In Wix DNS Settings:
1. **Go to Wix DNS Settings:**
   - Login to Wix account
   - Navigate to Domain Management → DNS Settings

2. **Add CNAME Record:**
   ```
   Type: CNAME
   Host: www
   Value: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
   TTL: 300 (5 minutes)
   ```

3. **Root Domain Redirect (Optional):**
   ```
   Type: A
   Host: @
   Value: 192.30.252.153
   TTL: 300
   ```

### In Replit Project Settings:
1. **Set Custom Domain:**
   - Go to Replit project settings
   - Navigate to "Domains" section
   - Add custom domain: `www.joinbingeboard.com`

2. **Update Environment Variable:**
   ```
   REPLIT_DOMAINS=www.joinbingeboard.com
   ```

## Verification Steps

1. **Check DNS Propagation:**
   ```bash
   nslookup www.joinbingeboard.com
   ```

2. **Test Domain Access:**
   - Visit: `https://www.joinbingeboard.com`
   - Should load BingeBoard application

3. **Test OAuth Flow:**
   - Try Google/Facebook login
   - Should use callback: `https://www.joinbingeboard.com/auth/callback`

## Current OAuth Setup Status

**Google Cloud Console:**
- Client ID: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`
- Callback URL: `https://www.joinbingeboard.com/auth/callback`

**Facebook Developer Console:**
- App ID: `1407155243762479`
- Callback URL: `https://www.joinbingeboard.com/auth/callback`

## Benefits of Custom Domain

- **Permanent OAuth URLs**: Never need to update provider consoles again
- **Professional Branding**: Custom domain instead of Replit URLs
- **SSL Certificate**: Automatic HTTPS with custom domain
- **Mobile Compatible**: Works identically on all devices
- **SEO Benefits**: Custom domain for better search rankings

## Troubleshooting

- **DNS Not Propagating**: Wait 5-30 minutes for DNS changes
- **SSL Certificate**: May take 15-30 minutes to generate
- **Replit Domain Routing**: Ensure custom domain is added in Replit settings
- **OAuth 403 Errors**: Verify callback URLs in provider consoles match exactly