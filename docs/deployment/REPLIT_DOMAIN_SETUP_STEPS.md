# Replit Custom Domain Setup Steps

## Finding Project Settings

1. **In Replit Editor:**
   - Look at the left sidebar (file explorer area)
   - Find the "Settings" tab (gear icon) or "Tools" section
   - Click on "Domains" or "Custom Domains"

2. **Alternative Method:**
   - Click on your project name at the top
   - Look for "Settings" or "Configure" option
   - Navigate to "Domains" section

## Adding Custom Domain

1. **In Domains Section:**
   - Click "Add Domain" or "Custom Domain"
   - Enter: `www.joinbingeboard.com`
   - Click "Add" or "Save"

2. **Verification:**
   - Replit will show DNS instructions
   - May ask you to verify domain ownership

## Environment Variables

Check that `REPLIT_DOMAINS` is set to:
```
REPLIT_DOMAINS=www.joinbingeboard.com
```

## Current Status

- **Domain**: `joinbingeboard.com` (registered with Wix)
- **Target**: `www.joinbingeboard.com`
- **OAuth URLs**: Already configured to use custom domain
- **DNS**: Needs CNAME record in Wix pointing to Replit

## Next Steps After Domain Setup

1. **Verify Domain Works:**
   - Visit `https://www.joinbingeboard.com`
   - Should load BingeBoard application

2. **Test OAuth Authentication:**
   - Try Google/Facebook login
   - Should use permanent callback URL

3. **Update Provider Consoles:**
   - Google: Add `https://www.joinbingeboard.com/auth/callback`
   - Facebook: Add `https://www.joinbingeboard.com/auth/callback`

## Benefits

- **Permanent OAuth**: No more daily URL changes
- **Professional Branding**: Custom domain
- **Mobile Compatible**: Works on all devices
- **Maintenance-Free**: Set once, works forever