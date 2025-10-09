# 🚀 Alternative Deployment Strategy - GitHub Actions + Vercel

Since the Vercel CLI authentication is having issues in the codespace environment, here's an alternative approach using GitHub Actions for automated deployment.

## Option 1: GitHub Actions Deployment (Recommended)

### Step 1: Set up Vercel Project Manually
1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Import your repository**: Click "New Project" and import `bingeboard`
3. **Configure the project**:
   - Framework Preset: Other
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy once** to get your project ID and org ID

### Step 2: Get Vercel Credentials
1. **Go to Vercel Settings** → Teams → Your Team
2. **Copy your Team ID** (this is your `VERCEL_ORG_ID`)
3. **Go to Project Settings** → General
4. **Copy your Project ID** (this is your `VERCEL_PROJECT_ID`)
5. **Go to Account Settings** → Tokens
6. **Create a new token** (this is your `VERCEL_TOKEN`)

### Step 3: Add GitHub Secrets
1. **Go to your GitHub repository** → Settings → Secrets and variables → Actions
2. **Add these repository secrets**:
   ```
   VERCEL_TOKEN=your_vercel_token_here
   VERCEL_ORG_ID=your_org_id_here
   VERCEL_PROJECT_ID=your_project_id_here
   ```

### Step 4: Trigger Deployment
The GitHub Actions workflow (`.github/workflows/deploy-backend.yml`) will automatically deploy when you push changes. You can also trigger it manually:

1. **Go to Actions tab** in your GitHub repository
2. **Select "Deploy Backend to Vercel"**
3. **Click "Run workflow"**

## Option 2: Manual Vercel Dashboard Deployment

### Step 1: Create Vercel Project
1. **Visit [vercel.com](https://vercel.com)** and connect your GitHub
2. **Import your repository** and deploy
3. **Set Framework**: Other
4. **Set Root Directory**: `./` 
5. **Set Build Command**: `npm run build`
6. **Set Output Directory**: `dist`

### Step 2: Configure Environment Variables
In your Vercel project dashboard, add these environment variables:

```bash
# Required
TMDB_API_KEY=your_tmdb_api_key_here
DATABASE_URL=postgresql://username:password@host:port/database
CORS_ORIGIN=https://bingeboardapp.com
NODE_ENV=production

# Optional (for full functionality)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Step 3: Get Your Backend URL
After deployment, Vercel will give you a URL like:
`https://bingeboard-backend-xyz.vercel.app`

## Next Steps (Both Options)

1. **Copy your Vercel backend URL**
2. **Update frontend configuration**:
   ```bash
   # Edit client/.env.production
   VITE_API_BASE_URL=https://your-actual-backend.vercel.app
   ```
3. **Commit and push** to trigger frontend redeployment
4. **Test your app** at bingeboardapp.com

## Get TMDB API Key
1. **Visit**: https://www.themoviedb.org/signup
2. **Sign up** for a free account
3. **Go to**: https://www.themoviedb.org/settings/api
4. **Request an API key** (free for personal use)
5. **Copy the key** to your Vercel environment variables

## Database Setup Options
- **Vercel Postgres**: Easiest integration
- **Supabase**: Free tier with good PostgreSQL
- **Railway**: Simple PostgreSQL deployment
- **PlanetScale**: MySQL alternative

Choose the approach that works best for you! The GitHub Actions method is more automated, while the manual method gives you more control.