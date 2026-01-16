# SMS Recovery - Production Setup Quick Guide

**Version:** v16.13  
**Date:** January 16, 2026  
**Status:** ⚠️ Needs Production Configuration

## 🚨 Current Status

✅ **Code**: Fully implemented and deployed  
⚠️ **Production**: Requires 3 additional steps to work with real phones

---

## 🎯 What Works Now

- ✅ Complete UI (Email/SMS toggle, code entry, password reset)
- ✅ Backend endpoints (`/forgot-password`, `/verify-sms-reset`)
- ✅ Code generation (6-digit codes)
- ✅ Security (expiration, rate limiting, validation)
- ✅ Email recovery (fully functional)

## ⚠️ What Needs Setup

- ❌ Users need phone numbers in Firebase
- ❌ SMS provider not configured (codes only logged to console)
- ❌ In-memory storage (won't work across serverless instances)

---

## 🚀 3-Step Production Setup

### Step 1: Add Phone Numbers to Users (Required)

**Option A: Manual (Testing)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Authentication → Users
3. Click user → "Add phone number"
4. Enter: `+1234567890` (must include country code)

**Option B: Update Registration (Recommended)**

Add phone collection during signup in `login-simple.tsx`:

```typescript
// In registration form, add:
const [formData, setFormData] = useState({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: ""  // NEW
});

// In form JSX, add:
<Input
  type="tel"
  name="phoneNumber"
  placeholder="Phone (e.g., +1234567890)"
  value={formData.phoneNumber}
  onChange={handleInputChange}
  className="..."
/>

// After Firebase user created, update profile:
await updateProfile(user, {
  phoneNumber: formData.phoneNumber
});
```

---

### Step 2: Configure SMS Provider (Required)

**Recommended: Twilio** (Easy, reliable, pay-as-you-go)

#### 2a. Sign Up for Twilio

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (free trial includes $15 credit)
3. Get phone number (free with trial)
4. Get credentials from dashboard:
   - Account SID: `ACxxxxx...`
   - Auth Token: `xxxxx...`
   - Phone Number: `+1234567890`

#### 2b. Add to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add these 3 variables (for all environments):

```
TWILIO_ACCOUNT_SID = ACxxxxx...
TWILIO_AUTH_TOKEN = xxxxx...
TWILIO_PHONE_NUMBER = +1234567890
```

#### 2c. Install Twilio SDK

```bash
cd /workspaces/bingeboard-local
npm install twilio
```

#### 2d. Update Backend Code

In `api/index.js`, find this section (around line 60):

```javascript
// TODO: Integrate with SMS provider
// Example with Twilio:
// const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
// await twilio.messages.create({
//   body: `Your BingeBoard verification code is: ${verificationCode}`,
//   to: cleanPhone,
//   from: process.env.TWILIO_PHONE
// });
```

Replace with:

```javascript
// Send SMS via Twilio
import twilio from 'twilio';
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await twilioClient.messages.create({
  body: `Your BingeBoard verification code is: ${verificationCode}. Valid for 10 minutes.`,
  to: cleanPhone,
  from: process.env.TWILIO_PHONE_NUMBER
});

console.log(`📱 SMS sent to ${cleanPhone}`);
```

#### 2e. Remove Development Code

Remove this line (around line 68):

```javascript
// Remove in production:
...(process.env.NODE_ENV !== 'production' && { verificationCode })
```

---

### Step 3: Use Redis for Code Storage (Recommended)

**Why:** Vercel serverless functions don't share memory. Codes stored in one instance won't be available in another.

#### 3a. Create Redis Instance

**Option A: Upstash (Recommended - Free tier, Vercel integration)**

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create database:
   - Name: `bingeboard-sms-codes`
   - Region: Choose closest to your users
   - Type: Regional (free)
4. Copy Redis URL from dashboard

**Option B: Redis Cloud**

1. Go to [redis.com/try-free](https://redis.com/try-free)
2. Create free database
3. Copy connection string

#### 3b. Add to Vercel

```
REDIS_URL = redis://default:xxxxx@region.upstash.io:6379
```

#### 3c. Install Redis Client

```bash
npm install ioredis
```

#### 3d. Update Backend Code

In `api/index.js`, replace the Map with Redis:

```javascript
// At the top:
import Redis from 'ioredis';
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Replace Map storage:
// OLD: smsVerificationCodes.set(cleanPhone, {...});
// NEW:
if (redis) {
  await redis.setex(
    `sms:${cleanPhone}`,
    600, // 10 minutes
    JSON.stringify({
      code: verificationCode,
      uid: userRecord.uid,
      attempts: 0
    })
  );
} else {
  // Fallback to Map (development only)
  smsVerificationCodes.set(cleanPhone, {...});
}

// Replace Map retrieval:
// OLD: const storedData = smsVerificationCodes.get(cleanPhone);
// NEW:
let storedData;
if (redis) {
  const data = await redis.get(`sms:${cleanPhone}`);
  storedData = data ? JSON.parse(data) : null;
} else {
  storedData = smsVerificationCodes.get(cleanPhone);
}

// Replace Map deletion:
// OLD: smsVerificationCodes.delete(cleanPhone);
// NEW:
if (redis) {
  await redis.del(`sms:${cleanPhone}`);
} else {
  smsVerificationCodes.delete(cleanPhone);
}
```

---

## 🧪 Testing After Setup

### Test 1: Request SMS Code

1. Go to `bingeboardapp.com/login`
2. Click "Forgot password?"
3. Click "SMS" button
4. Enter phone: `+1234567890` (your phone)
5. Click "Send Code"
6. **Check your phone** for SMS

**Expected:** SMS arrives within 30 seconds with 6-digit code

### Test 2: Verify Code

1. Enter the 6-digit code
2. Enter new password (min 6 chars)
3. Confirm password
4. Click "Reset Password"

**Expected:** "Password reset successful" → Can log in with new password

### Test 3: Wrong Code

1. Request new code
2. Enter wrong code: `000000`
3. Try 3 times

**Expected:** 
- Attempt 1-2: "Invalid code, X attempts remaining"
- Attempt 3: "Too many attempts, request new code"

### Test 4: Expired Code

1. Request code
2. Wait 11 minutes
3. Try to use it

**Expected:** "Code expired, request new code"

---

## 💰 Cost Estimate

### Twilio Pricing

- **SMS (US/Canada)**: $0.0079 per message
- **SMS (International)**: $0.05-0.15 per message
- **Free Trial**: $15 credit (~1,900 US SMS)

### Monthly Cost Example

- 100 password resets/month = $0.79/month
- 1,000 password resets/month = $7.90/month

### Redis Pricing (Upstash)

- **Free Tier**: 10,000 commands/day (plenty for SMS codes)
- **Paid**: $0.20 per 100K commands

---

## 🔧 Troubleshooting

### "SMS not received"

**Check:**
1. Phone number has country code (`+1...`)
2. Phone is registered in Firebase
3. Twilio credentials in Vercel
4. Twilio account has credit
5. Check spam/blocked messages

**Debug:**
```bash
# Check Vercel logs
vercel logs

# Check Twilio logs
# Go to Twilio Console → Monitor → Logs → Messaging
```

### "Code doesn't work"

**Check:**
1. Code not expired (10 min limit)
2. Phone number matches exactly
3. Haven't exceeded 3 attempts
4. Redis is working (if configured)

### "Server error"

**Check:**
1. Firebase Admin initialized
2. Twilio credentials valid
3. Redis URL correct (if using)
4. Check Vercel logs for details

---

## 📊 Monitoring

### Key Metrics

Track in your analytics:
- SMS codes sent per day
- Success rate (code sent → password reset)
- Average time to complete
- Failed attempts rate
- Cost per recovery

### Logging

Add to your backend:
```javascript
console.log(`📊 SMS Recovery: {
  timestamp: new Date().toISOString(),
  event: 'code_sent|code_verified|code_failed',
  phone: cleanPhone.slice(-4), // Last 4 digits only
  success: true|false
}`);
```

---

## ✅ Final Checklist

Before going live:

- [ ] Users have phone numbers in Firebase
- [ ] Twilio account created and funded
- [ ] Twilio credentials in Vercel
- [ ] Twilio SDK installed (`npm install twilio`)
- [ ] Backend updated to send real SMS
- [ ] Redis configured (or accept limitation)
- [ ] Tested with real phone number
- [ ] Development code removed
- [ ] Monitoring/logging set up
- [ ] User documentation updated

---

## 🆘 Need Help?

**Quick Start (Skip Redis for now):**
1. Add phone to one test user in Firebase
2. Sign up for Twilio ($15 free credit)
3. Add 3 Twilio env vars to Vercel
4. `npm install twilio`
5. Update SMS sending code
6. Test with your phone

**Full Production:**
- Follow all 3 steps above
- Redis adds ~1 hour setup time
- Worth it for multi-instance reliability

---

**Current Status:** v16.13 deployed, needs production config  
**Time to Production:** ~2 hours (with Twilio + Redis)  
**Quick Test:** ~30 minutes (Twilio only)
