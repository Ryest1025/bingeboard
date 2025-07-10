# OAuth URL Testing Script

## Quick Test Commands

Test if OAuth URLs are working properly:

```bash
# Test Google OAuth URL
curl -I "https://accounts.google.com/o/oauth2/v2/auth?client_id=874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com&redirect_uri=https%3A%2F%2F80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev%2Fauth%2Fcallback&response_type=code&scope=email%20profile&state=google"

# Test Facebook OAuth URL
curl -I "https://www.facebook.com/v18.0/dialog/oauth?client_id=1407155243762479&redirect_uri=https%3A%2F%2F80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev%2Fauth%2Fcallback&response_type=code&scope=email&state=facebook"
```

## Expected Responses

**Success (200):** OAuth provider accepts the request
**Redirect (302):** OAuth provider redirects to authentication page
**Error (400/403):** Callback URL not configured in provider console

## Manual Test URLs

**Google OAuth:**
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=874663258237-lem9602ckq4b1a6fsnqnaek96vgu7vfr.apps.googleusercontent.com&redirect_uri=https%3A%2F%2F80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev%2Fauth%2Fcallback&response_type=code&scope=email%20profile&state=google
```

**Facebook OAuth:**
```
https://www.facebook.com/v18.0/dialog/oauth?client_id=1407155243762479&redirect_uri=https%3A%2F%2F80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev%2Fauth%2Fcallback&response_type=code&scope=email&state=facebook
```

You can paste these URLs directly in your browser to test the OAuth flow.