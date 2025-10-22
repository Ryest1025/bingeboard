# BingeBoard Setup Guide

## Quick Start

This guide will help you get BingeBoard running with all AI features enabled.

## Prerequisites

- Node.js 18+ installed
- GitHub account (for deployment)
- API keys (see below)

## Required API Keys

### 1. TMDB API Key (Required)

**What it does:** Powers all movie/TV show data, images, ratings, streaming availability

**How to get it:**
1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to Settings → API → Request an API Key
4. Choose "Developer" option
5. Fill out the form (use "Personal/Educational" if non-commercial)
6. Copy your API key (v3 auth)

**Cost:** FREE (1000 requests per day)

**Add to your environment:**
```bash
TMDB_API_KEY=your_key_here
```

---

### 2. OpenAI API Key (Highly Recommended)

**What it does:** Powers AI recommendations with GPT-4o and GPT-4o-mini

**How to get it:**
1. Go to https://platform.openai.com/signup
2. Create an account
3. Go to API Keys → Create new secret key
4. Copy the key (starts with `sk-proj-...` or `sk-...`)
5. Add payment method (required even for free tier)

**Cost:** 
- GPT-4o: ~$0.015 per recommendation
- GPT-4o-mini: ~$0.0015 per recommendation
- Free tier: $5 credit for first 3 months

**Estimated monthly cost:** $10-30 for moderate usage

**Add to your environment:**
```bash
OPENAI_API_KEY=sk-proj-...
```

---

### 3. Anthropic API Key (Optional - Enhanced AI)

**What it does:** Adds Claude 3.5 Sonnet for deep contextual understanding

**How to get it:**
1. Go to https://console.anthropic.com/
2. Create an account
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-...`)
5. Add payment method

**Cost:** ~$0.0075 per recommendation

**Add to your environment:**
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

### 4. Firebase Configuration (Required for Auth)

**What it does:** Handles user authentication (email/password, Google, Facebook)

**How to get it:**
1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Enable Authentication → Sign-in methods:
   - Email/Password
   - Google (recommended)
   - Facebook (optional)
4. Go to Project Settings → General
5. Scroll to "Your apps" → Web app
6. If no web app exists, click "Add app"
7. Copy the Firebase config object

**Cost:** FREE (up to 10k monthly active users)

**Add to your environment:**
```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Environment Setup

### Local Development

Create `.env` file in root directory:

```bash
# TMDB (Required)
TMDB_API_KEY=your_tmdb_key_here

# OpenAI (Recommended for AI features)
OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_MODEL=gpt-4o

# Anthropic (Optional - for Claude AI)
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Firebase (Required for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/bingeboard

# Backend URL (for production)
VITE_API_BASE_URL=https://bingeboard-two.vercel.app
```

### GitHub Secrets (For Deployment)

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

```
TMDB_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Vercel Deployment (Backend)

1. Go to https://vercel.com/
2. Import your GitHub repository
3. Go to Settings → Environment Variables
4. Add the same variables as above

---

## Installation

```bash
# Install dependencies
npm install

# Install additional AI package (if using Claude)
npm install @anthropic-ai/sdk

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Features by API Key

### With TMDB Only
✅ Browse movies/TV shows
✅ Search functionality
✅ View details, ratings, trailers
✅ Basic recommendations (trending, popular)
✅ Streaming availability
❌ AI-powered personalized recommendations
❌ Behavioral analysis
❌ A/B testing & metrics

### With TMDB + OpenAI
✅ All TMDB features
✅ AI-powered recommendations (GPT-4o-mini)
✅ Behavioral pattern analysis
✅ Personalized suggestions
✅ Explainable recommendations
✅ Real-time metrics & A/B testing
⚠️ Single AI model (good but not ensemble)

### With TMDB + OpenAI + Anthropic
✅ All features above
✅ Multi-model AI ensemble
✅ Creative AI (GPT-4o) for emotional fit
✅ Analytical AI (GPT-4o-mini) for fast matching
✅ Deep Analysis (Claude 3.5) for context
✅ Consensus voting (models agree → score boost)
✅ Maximum recommendation quality

---

## Cost Optimization

### Minimize AI Costs

1. **Use caching** (already implemented - 10min TTL):
   ```typescript
   // Results cached per user for 10 minutes
   // Saves ~60% on API costs
   ```

2. **Use GPT-4o-mini for most requests:**
   ```bash
   OPENAI_MODEL=gpt-4o-mini  # 10x cheaper than GPT-4o
   ```

3. **Disable Claude if on a budget:**
   ```bash
   # Just comment out or don't set:
   # ANTHROPIC_API_KEY=
   ```

4. **Limit recommendations per session:**
   ```typescript
   // In recommendationSources.ts
   .slice(0, 10)  // Reduce to 8 for cost savings
   ```

### Expected Monthly Costs

**Light Usage** (100 users, 500 recs/month):
- TMDB: FREE
- OpenAI (mini): ~$0.75
- Anthropic: ~$3.75
- **Total: ~$4.50/month**

**Medium Usage** (1000 users, 5000 recs/month):
- TMDB: FREE
- OpenAI (mini): ~$7.50
- Anthropic: ~$37.50
- **Total: ~$45/month**

**Heavy Usage** (10k users, 50k recs/month):
- TMDB: FREE
- OpenAI (mini): ~$75
- Anthropic: ~$375
- **Total: ~$450/month**

---

## Verifying Setup

### 1. Check Environment Variables

```bash
# In terminal
echo $TMDB_API_KEY
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY
```

### 2. Test APIs

**TMDB:**
```bash
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_KEY"
```

**OpenAI:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

**Anthropic:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

### 3. Check App Health

Once running, visit:
- http://localhost:5000/api/recommendations/unified/health
- http://localhost:5000/api/metrics/health

Should return:
```json
{
  "status": "healthy",
  "services": {
    "tmdb": "configured",
    "openai": "configured",
    "database": "connected"
  }
}
```

---

## Troubleshooting

### "OpenAI not configured"
- Check `OPENAI_API_KEY` is set
- Verify key starts with `sk-`
- Ensure you've added payment method to OpenAI account

### "TMDB API Error"
- Verify key is correct (copy/paste again)
- Check you haven't exceeded rate limit (1000/day free tier)
- Make sure key is v3 auth, not v4 bearer token

### "Firebase Authentication Failed"
- Verify all 6 Firebase environment variables are set
- Check Firebase console that Email/Password is enabled
- Ensure domain is authorized in Firebase console

### "Recommendations returning empty"
- Check browser console for API errors
- Verify backend URL is correct in `.env`
- Test TMDB API key directly
- Check OpenAI API has credits/payment method

---

## Getting Help

1. **Check logs:**
   - Browser console (F12)
   - Server logs (`npm run dev`)
   - Network tab for failed requests

2. **Test individual services:**
   - `/api/recommendations/unified/health`
   - `/api/metrics/health`

3. **Review documentation:**
   - `AI_RECOMMENDATION_SYSTEM.md` - AI features
   - `README.md` - General setup
   - `DEPLOYMENT_GUIDE.md` - Production deployment

---

## Next Steps

Once you have API keys configured:

1. ✅ Test login (Firebase auth)
2. ✅ Browse discover page (TMDB data)
3. ✅ Check AI recommendations (OpenAI/Anthropic)
4. ✅ View metrics dashboard at `/api/metrics/dashboard`
5. ✅ Monitor recommendation quality scores

Your AI-powered recommendation engine will continuously improve as users interact with the app! 🚀
