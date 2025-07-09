# Wix Domain Setup for joinbingeboard.com

## Step 1: Access Wix Domain Management
1. Login to your Wix account at wix.com
2. Go to your Wix Dashboard
3. Click on "Domains" in the left sidebar
4. Find "joinbingeboard.com" in your domain list
5. Click "Manage" or "DNS Settings"

## Step 2: Add DNS Record
In the DNS management section:

### Option A: Try These Names (One Should Work)
1. Look for "DNS Records" or "Advanced DNS"
2. Click "Add Record" or "+ Add"
3. Select "CNAME" record type
4. For **Name/Host**, try in this order:
   - `joinbingeboard.com` (full domain name)
   - Leave blank/empty
   - `*` (wildcard)
   - `www` (if others don't work)
5. **Value**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
6. Click "Save"

### Option B: Use A Record Instead
If CNAME doesn't work, try A record:
1. Select "A" record type
2. **Name**: @ or leave blank
3. **Value**: We need to get the IP address first

## Alternative: If CNAME for Root Not Allowed
Some providers don't allow CNAME for root domain. If you get an error:

1. Add CNAME for "www" subdomain:
   - **Name**: www
   - **Value**: `80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev`
2. Add URL redirect:
   - **From**: joinbingeboard.com 
   - **To**: www.joinbingeboard.com

## Step 3: Configure Replit
1. In your Replit project, click Settings (gear icon)
2. Find "Domains" section
3. Add: `joinbingeboard.com`
4. Save settings

## Step 3b: Alternative Replit Configuration
If you don't see a "Domains" section in settings:
1. Go to the "Secrets" tab (environment variables)
2. Update REPLIT_DOMAINS to: `joinbingeboard.com`
3. This tells your app to accept requests from the custom domain

## Step 4: Update Environment Variable
In Replit Secrets tab:
```
REPLIT_DOMAINS=joinbingeboard.com
```
Or if using www:
```
REPLIT_DOMAINS=www.joinbingeboard.com
```

## Step 5: Wait and Test
1. Wait 10-15 minutes for DNS propagation
2. Test: Visit `https://joinbingeboard.com`
3. Should load your BingeBoard application

## Step 6: Update OAuth URLs
Once domain works, update provider consoles:

**Google Cloud Console**:
`https://joinbingeboard.com/api/auth/google/callback`

**Facebook Developer Console**:
`https://joinbingeboard.com/api/auth/facebook/callback`

## Wix-Specific Notes
- Wix sometimes requires domain verification
- Look for verification instructions in DNS settings
- May need to remove any existing A records pointing elsewhere
- Wix domains can take 15-30 minutes to propagate

## If You Need Help
If you can't find the DNS settings in Wix:
1. Look for "Domain Settings" or "Advanced"
2. Try "Connect Domain" if it's not connected yet
3. Contact Wix support if DNS options are missing

This will permanently fix your OAuth authentication issues!