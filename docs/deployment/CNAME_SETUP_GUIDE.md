# CNAME Setup Guide for joinbingeboard.com

## Current Domain Configuration

Your current Replit domain is: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`

## CNAME Records for DNS Setup

To configure your custom domain `joinbingeboard.com` with your DNS provider, add these CNAME records:

### Option 1: Root Domain (Recommended)
```
Type: CNAME
Name: @ (or leave blank for root)
Value: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
TTL: 30 minutes (1800 seconds)
```

### Option 2: WWW Subdomain
```
Type: CNAME
Name: www
Value: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev
TTL: 30 minutes (1800 seconds)
```

## DNS Provider Instructions

### For Wix Domain Management:
1. Log in to your Wix account
2. Go to Domain Management
3. Click "Manage DNS" for joinbingeboard.com
4. Add new CNAME record with the values above
5. Save changes

### For Other DNS Providers:
1. Access your DNS management panel
2. Add a new CNAME record
3. Set the name to `@` (root) or `www`
4. Set the value to the Replit domain above
5. Save and wait for propagation (5-30 minutes)

## Important Notes

- **SSL Certificate**: Replit automatically provisions SSL certificates for custom domains
- **Propagation Time**: DNS changes typically take 5-30 minutes to propagate
- **Testing**: Use `nslookup joinbingeboard.com` to verify DNS propagation
- **OAuth Configuration**: Firebase and OAuth providers are already configured for this domain

## Current Status

✅ Firebase authorized domains configured
✅ OAuth callback URLs updated
✅ Server environment configured
⏳ Awaiting DNS configuration

## Verification

Once DNS is configured, test:
1. Visit `https://joinbingeboard.com` (should load the app)
2. Test Google authentication on mobile
3. Test Facebook authentication on mobile
4. Verify SSL certificate is active

## Support

If you encounter issues:
- Check DNS propagation with online tools
- Verify CNAME record is pointing to the correct Replit domain
- Ensure TTL is set low (300 seconds) for faster updates