# Facebook App Configuration Troubleshooting

## Current Configuration
- App ID: 1407155243762479
- App Secret: [Configured]
- Your Replit Domain: 80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev

## EXACT Facebook App Settings Required

### 1. Basic Settings
Go to: https://developers.facebook.com/apps/1407155243762479/settings/basic/

**App Domains** (add exactly these):
```
riker.replit.dev
```

### 2. Facebook Login Product Settings
Go to: https://developers.facebook.com/apps/1407155243762479/fb-login/settings/

**Valid OAuth Redirect URIs** (add exactly this URL):
```
https://80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev/api/auth/facebook/callback
```

### 3. App Status
- Go to App Review → Status
- Make sure your app is in **Development Mode** 
- Do NOT put it in Live mode for testing

### 3. App Review & Development Mode
- Make sure your app is in **Development Mode**
- Add test users if needed (Settings → Roles → Test Users)

### 4. Products Configuration
- Ensure **Facebook Login** is added as a product
- Check that required permissions are configured

## Common Error Solutions

### "Invalid App ID" Error
1. Verify the App ID is exactly: `23936242416065865`
2. Check that your app is not restricted by country
3. Ensure the app is not in restricted mode
4. Verify the domain configuration matches your Replit URL

### "Redirect URI Mismatch" Error
1. The callback URL must match exactly in Facebook settings
2. Protocol must be HTTPS (not HTTP)
3. No trailing slashes in the URL

### "App Not Available" Error
1. App might be in review mode instead of development mode
2. Check if the app has been restricted or disabled