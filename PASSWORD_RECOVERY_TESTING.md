# Password Recovery Testing Guide

**Version:** v16.12  
**Date:** January 16, 2026  
**Status:** ✅ Email Reset Implemented | ⏳ SMS Reset Pending

---

## Overview

Password recovery is implemented with **email-based reset** using Firebase Authentication. SMS-based reset is planned for future implementation.

---

## Email Password Reset

### How It Works

1. User clicks **"Forgot password?"** on login page
2. Enters their email address
3. Backend generates secure reset link via Firebase Admin
4. Firebase automatically sends email with reset link
5. User clicks link in email
6. Firebase redirects to password reset page
7. User creates new password

### Testing Steps

#### Test 1: Email Password Reset (Happy Path)

**Prerequisites:**
- User must have an account with email/password authentication
- Example: `rachel.gubin@gmail.com`

**Steps:**
1. Go to https://bingeboardapp.com/login
2. Click **"Forgot password?"**
3. Enter email: `rachel.gubin@gmail.com`
4. Click **"Send Reset Link"**
5. **Expected:** Toast message "Password reset email sent"
6. Check email inbox
7. **Expected:** Email from Firebase with reset link
8. Click reset link in email
9. **Expected:** Redirected to Firebase password reset page
10. Enter new password (min 6 characters)
11. Click **"Save"**
12. **Expected:** Redirected back to login page
13. Try logging in with new password
14. **Expected:** Successfully logged in

**Console Logs to Watch:**
```
📧 Password reset link generated for: rachel.gubin@gmail.com
✅ Password reset email sent successfully
```

---

#### Test 2: Invalid Email (Security)

**Steps:**
1. Go to login page
2. Click "Forgot password?"
3. Enter email: `nonexistent@example.com`
4. Click "Send Reset Link"
5. **Expected:** Success message (doesn't reveal if user exists)
6. Check Vercel logs for security
7. **Expected:** Log shows "auth/user-not-found" but user sees success

**Why:** For security, we don't reveal whether an email exists in the system.

---

#### Test 3: Empty Email

**Steps:**
1. Click "Forgot password?"
2. Leave email field empty
3. Click "Send Reset Link"
4. **Expected:** Toast error "Email required"

---

#### Test 4: Invalid Email Format

**Steps:**
1. Enter: `notanemail`
2. Click "Send Reset Link"
3. **Expected:** Browser validation error (HTML5 email validation)

---

## SMS Password Reset (Not Implemented)

### Current Status: ⏳ Pending Implementation

**What Needs to Be Done:**

1. **Enable Firebase Phone Authentication**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Phone" provider
   - Configure reCAPTCHA settings

2. **Add Phone Number to User Profile**
   - Update user schema to include phone number
   - Add phone verification flow during registration
   - Store verified phone numbers

3. **Implement SMS Reset Backend**
   - Replace placeholder in `/api/auth/forgot-password`
   - Use Firebase Admin to send verification code via SMS
   - Verify code and allow password reset

4. **Update Frontend**
   - Add phone number option to forgot password modal
   - Add SMS code verification flow
   - Handle SMS-specific errors

**Current Behavior:**
If phone number is submitted, returns:
```json
{
  "success": false,
  "message": "SMS password reset is not yet implemented. Please use email reset."
}
```

---

## Backend Implementation Details

### Endpoint: `POST /api/auth/forgot-password`

**Location:** `/api/index.js` (lines 181-254)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**OR (future SMS support):**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Error Responses:**

**400 Bad Request** (missing credentials):
```json
{
  "success": false,
  "message": "Email or phone number is required"
}
```

**503 Service Unavailable** (Firebase Admin not configured):
```json
{
  "success": false,
  "message": "Password reset service is temporarily unavailable"
}
```

**501 Not Implemented** (SMS not ready):
```json
{
  "success": false,
  "message": "SMS password reset is not yet implemented"
}
```

---

## Security Features

### 1. **User Enumeration Prevention**
Even if email doesn't exist, returns success message:
```
"If an account exists with that email, a password reset link has been sent."
```

### 2. **Firebase Security**
- Reset links expire after 1 hour
- One-time use only (link invalidated after password change)
- Secure token generation by Firebase

### 3. **HTTPS Only**
- All password reset traffic over HTTPS
- Secure cookies with `httpOnly` and `secure` flags

### 4. **Rate Limiting** (via Vercel)
- Automatic rate limiting on serverless functions
- Prevents brute force attempts

---

## Email Configuration

### Firebase Email Templates

Firebase automatically sends password reset emails with:
- **Subject:** "Reset your password for BingeBoard"
- **From:** noreply@bingeboard-73c5f.firebaseapp.com
- **Template:** Customizable in Firebase Console

**To Customize Email Template:**
1. Go to Firebase Console → Authentication → Templates
2. Select "Password reset"
3. Customize subject, body, and branding
4. Add your logo and brand colors

---

## Troubleshooting

### Issue: "Password reset service is temporarily unavailable"

**Cause:** Firebase Admin SDK not initialized on Vercel

**Fix:**
1. Check Vercel environment variable: `FIREBASE_ADMIN_KEY`
2. Verify it's set for Production, Preview, and Development
3. Trigger redeployment

### Issue: Email not received

**Check:**
1. Spam/junk folder
2. Firebase email quota (10,000/day free tier)
3. Email provider blocking Firebase emails
4. Firebase Console → Authentication → Templates → verify email sender

**Test with Firebase Debug:**
In development, the API returns the reset link:
```json
{
  "success": true,
  "resetLink": "https://bingeboard-73c5f.firebaseapp.com/__/auth/action?..."
}
```

### Issue: Reset link expired

**Solution:** 
- Links expire after 1 hour
- Request new reset link
- Consider increasing timeout in Firebase Console

### Issue: User sees "Invalid action code"

**Causes:**
- Link already used
- Link expired
- Link malformed (email client modified URL)

**Solution:** Request new reset link

---

## Testing Checklist

Before deploying to production:

- [ ] Email reset works with valid email
- [ ] Invalid email shows generic success message (security)
- [ ] Empty email shows validation error
- [ ] Reset email is received within 1 minute
- [ ] Reset link works and redirects properly
- [ ] Password can be changed successfully
- [ ] New password works for login
- [ ] Old password no longer works
- [ ] Reset link can't be reused
- [ ] Expired link shows appropriate error
- [ ] Works in all major email clients (Gmail, Outlook, etc.)
- [ ] Mobile email clients work correctly
- [ ] Console logs don't reveal sensitive information

---

## Future Enhancements

### 1. Custom Email Templates
- Brand emails with BingeBoard logo
- Match website design
- Add support links

### 2. SMS Reset
- Enable phone authentication
- Add phone verification during signup
- Implement SMS code verification

### 3. Security Questions
- Optional backup recovery method
- Configurable in user settings

### 4. Account Recovery
- Multi-factor recovery options
- Trusted device verification
- Account freeze/unfreeze

### 5. Password Strength Requirements
- Enforce minimum complexity
- Check against common passwords
- Show strength indicator

---

## API Examples

### cURL Test

```bash
# Test email password reset
curl -X POST https://bingeboard-two.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"rachel.gubin@gmail.com"}'

# Expected response:
# {"success":true,"message":"Password reset email sent successfully"}
```

### JavaScript Test

```javascript
// Test from browser console
const response = await fetch('https://bingeboard-two.vercel.app/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'rachel.gubin@gmail.com' })
});
const data = await response.json();
console.log(data);
```

---

## Monitoring

### Key Metrics to Track

1. **Reset Request Rate**
   - Normal: 1-5% of daily active users
   - Spike: May indicate attack or UX issue

2. **Completion Rate**
   - Track: Requests → Email opens → Link clicks → Password changes
   - Target: >80% completion

3. **Time to Reset**
   - Measure: Request to new login
   - Target: <5 minutes

4. **Error Rate**
   - Track failed reset attempts
   - Investigate patterns

---

## Support

**If password reset isn't working:**

1. Try email reset first (SMS not yet supported)
2. Check spam/junk folder for reset email
3. Wait 2-3 minutes for Vercel deployment
4. Clear browser cache
5. Try incognito/private browsing
6. Check Vercel logs for errors

**Still not working?**
- Check Firebase Console for authentication logs
- Verify Firebase Admin credentials in Vercel
- Review Vercel function logs for errors

---

**Last Updated:** January 16, 2026  
**Version:** v16.12  
**Status:** ✅ Email Password Reset Production Ready
