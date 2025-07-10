# Supabase OAuth Setup Guide - July 7, 2025

## Current Issue
OAuth providers returning 405 errors despite being "enabled" in dashboard.

## Facebook OAuth Setup (Based on Official Supabase Docs)

### Step 1: Facebook App Configuration
1. Go to [Facebook Developers Console](https://developers.facebook.com/)
2. Select your app with ID: `1407155243762479`
3. Add "Facebook Login" product (if not already added)
4. Go to **Facebook Login > Settings**
5. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://uqpjzzdmhfybqjtaygwf.supabase.co/auth/v1/callback
   ```
6. Click **Save Changes**
7. Under **Build Your App > Use Cases**, ensure `public_profile` and `email` permissions are **Ready for testing**

### Step 2: Get Facebook Credentials
1. Go to **Settings > Basic** in Facebook Console
2. Copy:
   - **App ID**: `1407155243762479` (already have)
   - **App Secret**: (click "Show" to reveal and copy)

### Step 3: Configure in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/uqpjzzdmhfybqjtaygwf/auth/providers
2. Find "Facebook" provider
3. **Toggle "Enable Facebook provider" to ON**
4. Enter:
   - **App ID**: `1407155243762479`
   - **App Secret**: (from Facebook Console)
5. **Save changes**

## Google OAuth Setup

### Step 1: Google Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project with Client ID: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr`
3. Go to APIs & Services > Credentials
4. Edit OAuth 2.0 Client
5. Add to Authorized redirect URIs:
   ```
   https://uqpjzzdmhfybqjtaygwf.supabase.co/auth/v1/callback
   ```

### Step 2: Get Google Credentials
1. Copy:
   - **Client ID**: `874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com`
   - **Client Secret**: (from Google Console)

### Step 3: Configure in Supabase Dashboard
1. Find "Google" provider
2. **Toggle "Enable Google provider" to ON**
3. Enter credentials and **Save**

## Critical Requirements
- Provider toggles must be **physically turned ON**
- OAuth secrets (Client Secret, App Secret) are **mandatory**
- Redirect URIs must match exactly
- Changes may take a few minutes to propagate

## Testing
After configuration, OAuth URLs should return 302 (redirect) instead of 405 (method not allowed).