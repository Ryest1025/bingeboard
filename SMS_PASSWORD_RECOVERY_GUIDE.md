# SMS Password Recovery Implementation Guide

**Version:** v16.13  
**Date:** January 16, 2026  
**Status:** ✅ Implemented and Ready for Testing

## 📱 Overview

BingeBoard now supports SMS-based password recovery in addition to email recovery. Users can choose between email or SMS when resetting their password. The SMS system sends a 6-digit verification code that expires after 10 minutes.

---

## 🎯 Features

### ✅ Implemented Features

1. **Dual Recovery Method Support**
   - Email recovery (using Firebase Admin)
   - SMS recovery (using verification codes)
   - User chooses method via toggle buttons

2. **SMS Verification System**
   - 6-digit verification codes
   - 10-minute expiration
   - Rate limiting (3 attempts max)
   - In-memory code storage
   - Brute-force protection

3. **Complete UI Flow**
   - Method selection (Email/SMS)
   - Phone number input with validation
   - Verification code entry
   - New password creation
   - Password confirmation
   - Clear error messaging

4. **Security Features**
   - Codes expire after 10 minutes
   - Maximum 3 verification attempts
   - Doesn't reveal if phone number exists
   - International phone format validation
   - Password strength validation (min 6 chars)

---

## 🔧 Technical Implementation

### Backend Components

#### 1. In-Memory Code Storage (`api/index.js`)

```javascript
// Store verification codes with expiration
const smsVerificationCodes = new Map();

// Structure:
{
  phoneNumber: {
    code: "123456",
    expiresAt: 1705456789000,
    uid: "firebase-user-id",
    attempts: 0
  }
}
```

#### 2. Code Generation

```javascript
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

#### 3. Expired Code Cleanup

```javascript
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [key, data] of smsVerificationCodes.entries()) {
    if (now > data.expiresAt) {
      smsVerificationCodes.delete(key);
    }
  }
}
```

### API Endpoints

#### POST `/api/auth/forgot-password`

**Purpose:** Send verification code or reset link

**Request Body (SMS):**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your phone",
  "verificationCode": "123456"  // Only in development
}
```

**Error Responses:**
```json
// Invalid phone format
{
  "success": false,
  "message": "Invalid phone number format. Use international format (e.g., +1234567890)"
}

// User not found (security - same response)
{
  "success": true,
  "message": "If an account exists with that phone number, a verification code has been sent."
}
```

#### POST `/api/auth/verify-sms-reset`

**Purpose:** Verify code and reset password

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "code": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Error Responses:**
```json
// Missing fields
{
  "success": false,
  "message": "Phone number, code, and new password are required"
}

// Expired/not found
{
  "success": false,
  "message": "Verification code expired or not found. Please request a new code."
}

// Invalid code
{
  "success": false,
  "message": "Invalid verification code",
  "attemptsRemaining": 2
}

// Too many attempts
{
  "success": false,
  "message": "Too many failed attempts. Please request a new code."
}
```

### Frontend Components

#### State Management (`login-simple.tsx`)

```typescript
const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'sms'>('email');
const [phoneNumber, setPhoneNumber] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [showVerificationStep, setShowVerificationStep] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmNewPassword, setConfirmNewPassword] = useState('');
```

#### Key Functions

1. **handleForgotPassword()** - Initiates recovery (email or SMS)
2. **handleVerifySmsCode()** - Verifies code and resets password

---

## 🧪 Testing Guide

### Test Scenario 1: SMS Recovery Happy Path

**Prerequisites:**
- User must have phone number linked to Firebase account
- Use Firebase Console to add phone number to test user

**Steps:**
1. Go to `bingeboardapp.com/login`
2. Click "Forgot password?"
3. Click "SMS" tab
4. Enter phone number: `+1234567890`
5. Click "Send Code"
6. **Check server logs** for verification code (in development)
7. Enter the 6-digit code
8. Enter new password (min 6 chars)
9. Confirm password
10. Click "Reset Password"
11. Log in with new password

**Expected Result:**
- ✅ "Verification code sent" toast appears
- ✅ Code entry screen shows
- ✅ "Password reset successful" toast on completion
- ✅ Can log in with new password

### Test Scenario 2: Invalid Phone Number

**Steps:**
1. Click "Forgot password?" → "SMS"
2. Enter: `12345` (invalid format)
3. Click "Send Code"

**Expected Result:**
- ❌ Error: "Invalid phone number format. Use international format"

### Test Scenario 3: Wrong Verification Code

**Steps:**
1. Request SMS code
2. Enter wrong code: `999999`
3. Click "Reset Password"

**Expected Result:**
- ❌ "Invalid verification code"
- Shows attempts remaining: 2
- After 3 wrong attempts: "Too many failed attempts"

### Test Scenario 4: Expired Code

**Steps:**
1. Request SMS code
2. Wait 11 minutes (codes expire after 10)
3. Enter the code

**Expected Result:**
- ❌ "Verification code expired or not found. Please request a new code."

### Test Scenario 5: Password Mismatch

**Steps:**
1. Request and enter valid code
2. Enter password: `password123`
3. Confirm password: `password456`
4. Click "Reset Password"

**Expected Result:**
- ❌ "Passwords don't match"

### Test Scenario 6: Weak Password

**Steps:**
1. Request and enter valid code
2. Enter password: `12345` (too short)
3. Click "Reset Password"

**Expected Result:**
- ❌ "Password too short. Password must be at least 6 characters."

### Test Scenario 7: Resend Code

**Steps:**
1. Request SMS code
2. Click "Resend code" link
3. Check for new code

**Expected Result:**
- ✅ New code sent
- Previous code invalidated

---

## 🔒 Security Considerations

### Current Protections

1. **Rate Limiting**: 3 attempts per code
2. **Expiration**: Codes valid for 10 minutes
3. **User Privacy**: Doesn't reveal if phone exists
4. **Code Invalidation**: Used codes are immediately deleted
5. **Phone Validation**: International format required
6. **Password Validation**: Minimum 6 characters

### Known Limitations

1. **In-Memory Storage**: Codes stored in memory, lost on server restart
   - **Production Fix**: Use Redis or similar for persistence
   
2. **No SMS Provider**: Currently logs codes to console
   - **Production Fix**: Integrate Twilio, AWS SNS, or Firebase Extensions
   
3. **No Phone Verification**: Users must have phone in Firebase
   - **Production Fix**: Add phone verification during registration

4. **Single Server**: In-memory storage doesn't work across serverless instances
   - **Production Fix**: Use Redis or database storage

---

## 🚀 Production Setup

### Step 1: Add Phone Numbers to User Accounts

Users need phone numbers linked to Firebase accounts:

**Option A: Firebase Console (Manual)**
1. Go to Firebase Console → Authentication → Users
2. Click user → Add phone number
3. Verify phone number

**Option B: During Registration (Recommended)**
```typescript
// Add to registration flow
import { updatePhoneNumber, PhoneAuthProvider } from 'firebase/auth';

async function addPhoneToUser(user, phoneNumber, verificationCode) {
  const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  await updatePhoneNumber(user, credential);
}
```

### Step 2: Enable SMS Provider

**Option A: Twilio Integration**

1. Sign up for Twilio account
2. Get Account SID and Auth Token
3. Add to Vercel environment variables:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

5. Update `api/index.js`:
   ```javascript
   import twilio from 'twilio';
   const twilioClient = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   // Replace console.log with:
   await twilioClient.messages.create({
     body: `Your BingeBoard verification code is: ${verificationCode}`,
     to: cleanPhone,
     from: process.env.TWILIO_PHONE_NUMBER
   });
   ```

**Option B: Firebase Extensions**

1. Install "Trigger Email" extension
2. Configure for SMS (if supported)
3. Update code to use extension

**Option C: AWS SNS**

1. Set up AWS account with SNS enabled
2. Add AWS credentials to Vercel
3. Use AWS SDK to send SMS

### Step 3: Use Redis for Code Storage

**Why:** Vercel serverless functions don't share memory

1. Create Redis instance (Upstash, Redis Cloud, etc.)
2. Add to Vercel:
   ```
   REDIS_URL=redis://...
   ```

3. Install Redis client:
   ```bash
   npm install ioredis
   ```

4. Update `api/index.js`:
   ```javascript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);
   
   // Replace Map with Redis
   async function storeCode(phone, data) {
     await redis.setex(
       `sms:${phone}`,
       600, // 10 minutes
       JSON.stringify(data)
     );
   }
   
   async function getCode(phone) {
     const data = await redis.get(`sms:${phone}`);
     return data ? JSON.parse(data) : null;
   }
   ```

### Step 4: Remove Development Features

```javascript
// Remove in production:
...(process.env.NODE_ENV !== 'production' && { verificationCode })
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **SMS Recovery Usage**
   - Number of SMS vs Email recovery requests
   - Success rate (codes sent → password reset)
   - Average time to complete

2. **Error Rates**
   - Invalid phone numbers
   - Wrong codes entered
   - Expired codes
   - Failed password resets

3. **Cost Tracking**
   - SMS costs per recovery (Twilio charges per SMS)
   - Compare with email costs (free)

### Logging Examples

```javascript
// Add to endpoints
console.log(`📊 SMS Recovery Stats: {
  method: 'sms',
  phone: cleanPhone.slice(-4), // Last 4 digits only
  timestamp: new Date().toISOString(),
  success: true
}`);
```

---

## 🐛 Troubleshooting

### Issue: "Verification code expired"

**Cause:** Code expired after 10 minutes  
**Solution:** Request new code

### Issue: "Too many failed attempts"

**Cause:** 3 wrong codes entered  
**Solution:** Request new code (old one invalidated)

### Issue: "Invalid phone number format"

**Cause:** Phone not in international format  
**Solution:** Use format: `+[country code][number]` (e.g., `+12065551234`)

### Issue: "User not found"

**Cause:** Phone number not linked to Firebase account  
**Solution:** Add phone to user via Firebase Console or registration flow

### Issue: Code not received

**Cause:** SMS provider not configured  
**Solution:** Check server logs for code (development) or configure SMS provider (production)

### Issue: "Server configuration error"

**Cause:** Firebase Admin not initialized  
**Solution:** Verify `FIREBASE_ADMIN_KEY` in Vercel environment variables

---

## 🔄 Migration from v16.12 to v16.13

### What Changed

1. **Backend (`api/index.js`)**
   - Added in-memory code storage
   - Added `/api/auth/verify-sms-reset` endpoint
   - Updated `/api/auth/forgot-password` to send SMS codes
   - Added code generation and cleanup functions

2. **Frontend (`login-simple.tsx`)**
   - Added SMS recovery state variables
   - Added `handleVerifySmsCode()` function
   - Updated `handleForgotPassword()` to support SMS
   - Added SMS recovery UI with verification step

3. **Version**
   - Bumped to v16.13
   - Updated BUILD_ID

### Breaking Changes

**None** - Fully backward compatible. Email recovery still works exactly the same.

---

## 📝 Code Examples

### Example 1: Testing SMS Code Manually

```javascript
// In browser console on login page
const response = await fetch('https://bingeboard-two.vercel.app/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+1234567890' })
});
const data = await response.json();
console.log('Code:', data.verificationCode); // Development only
```

### Example 2: Verifying Code Manually

```javascript
const response = await fetch('https://bingeboard-two.vercel.app/api/auth/verify-sms-reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    code: '123456',
    newPassword: 'newPassword123'
  })
});
const data = await response.json();
console.log('Result:', data);
```

---

## 🎓 Best Practices

### For Users

1. **Use international format**: Always include country code
2. **Check spam**: SMS might be filtered
3. **Act quickly**: Codes expire in 10 minutes
4. **Strong passwords**: Use at least 6 characters
5. **Keep phone updated**: Update phone in profile settings

### For Developers

1. **Validate input**: Check phone format before sending
2. **Log errors**: Track SMS failures for debugging
3. **Monitor costs**: SMS providers charge per message
4. **Test thoroughly**: Verify all error paths
5. **Rate limit**: Prevent SMS spam/abuse
6. **Use Redis**: Don't rely on in-memory storage in production

---

## 📚 Related Documentation

- **PASSWORD_RECOVERY_TESTING.md** - Email recovery testing
- **AUTH_STATE_SYNC_GUARANTEE.md** - Authentication flow
- **FIREBASE_BACKEND_FIX_URGENT.md** - Firebase Admin setup

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Phone numbers added to user accounts
- [ ] SMS provider configured (Twilio/AWS SNS)
- [ ] Redis or similar for code storage
- [ ] Remove development-only code features
- [ ] Test all error scenarios
- [ ] Monitor SMS costs
- [ ] Set up logging/analytics
- [ ] Update user documentation
- [ ] Add rate limiting per user
- [ ] Configure backup recovery method
- [ ] Test on mobile devices
- [ ] Verify international phone support

---

## 🆘 Support

**Current Status**: SMS recovery is **fully implemented** but requires:
1. Users to have phone numbers in Firebase
2. SMS provider configuration for production

**For Testing**: Codes are logged to server console in development mode.

**For Production**: Follow "Production Setup" section to configure SMS provider and Redis storage.

---

**Last Updated:** January 16, 2026  
**Version:** v16.13  
**Author:** BingeBoard Development Team
