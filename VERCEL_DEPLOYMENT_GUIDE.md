# Backend Deployment Guide - Vercel

## Overview
This guide explains how to deploy your Express.js backend to Vercel to enable real API data for your React frontend.

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally: `npm i -g vercel`
3. **Environment Variables**: Prepare your API keys and database credentials

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

## Step 2: Deploy Backend
From your project root:
```bash
# Deploy the backend (follows vercel.json configuration)
vercel

# For production deployment
vercel --prod
```

## Step 3: Configure Environment Variables
Set these environment variables in your Vercel dashboard or via CLI:

### Required Variables:
```bash
# TMDB API Key (get from https://www.themoviedb.org/settings/api)
vercel env add TMDB_API_KEY

# Database URL (PostgreSQL connection string)
vercel env add DATABASE_URL

# Firebase Admin Configuration
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY

# CORS Origin (your frontend URL)
vercel env add CORS_ORIGIN
```

### Optional Variables:
```bash
vercel env add WATCHMODE_API_KEY
vercel env add UTELLY_API_KEY
vercel env add OPENAI_API_KEY
vercel env add SESSION_SECRET
```

## Step 4: Update Frontend Configuration
After deployment, update your frontend environment:

1. Copy your Vercel backend URL (e.g., `https://your-app.vercel.app`)
2. Update `client/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-actual-backend.vercel.app
   ```
3. Redeploy your frontend to GitHub Pages to pick up the new API URL

## Step 5: Database Setup
If you don't have a PostgreSQL database:

### Option A: Vercel Postgres
```bash
# Add Vercel Postgres to your project
vercel postgres create
```

### Option B: External Provider
- **Supabase**: Free PostgreSQL with good free tier
- **Railway**: Simple PostgreSQL deployment
- **Neon**: Serverless PostgreSQL

## Step 6: Test API Connection
After deployment, test your API endpoints:
```bash
curl https://your-backend.vercel.app/api/trending/tv/day
curl https://your-backend.vercel.app/api/auth/status
```

## Vercel Configuration
Your `vercel.json` is already configured to:
- Route `/api/*` requests to `server/index.ts`
- Set 30-second timeout for API functions
- Use Node.js runtime

## Troubleshooting
1. **404 Errors**: Check that `server/index.ts` exists and exports default function
2. **Environment Variables**: Verify all required vars are set in Vercel dashboard
3. **Database Connection**: Test DATABASE_URL in Vercel function logs
4. **CORS Issues**: Ensure CORS_ORIGIN matches your frontend URL exactly

## Next Steps
1. Deploy backend: `vercel --prod`
2. Get the deployment URL
3. Update frontend .env.production
4. Redeploy frontend to GitHub Pages
5. Test full-stack functionality at bingeboardapp.com

Your app will then have:
- ✅ Frontend: GitHub Pages (bingeboardapp.com)
- ✅ Backend: Vercel (your-backend.vercel.app)
- ✅ Real API data from TMDB
- ✅ Authentication with Firebase
- ✅ Streaming platform information