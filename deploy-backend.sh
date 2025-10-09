#!/bin/bash

echo "🚀 BingeBoard Backend Deployment Script"
echo "======================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Pre-deployment checklist:"
echo "  ✅ vercel.json configured"
echo "  ✅ server/index.ts exports app"
echo "  ✅ CORS configured for bingeboardapp.com"

echo ""
echo "🔑 Required environment variables:"
echo "  - TMDB_API_KEY (get from https://www.themoviedb.org/settings/api)"
echo "  - DATABASE_URL (PostgreSQL connection string)"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_CLIENT_EMAIL" 
echo "  - FIREBASE_PRIVATE_KEY"
echo "  - CORS_ORIGIN=https://bingeboardapp.com"

echo ""
echo "🌐 Starting deployment..."

# Run vercel deployment
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy your Vercel backend URL"
echo "2. Update client/.env.production with: VITE_API_BASE_URL=https://your-backend.vercel.app"
echo "3. Redeploy frontend to GitHub Pages"
echo "4. Test API connectivity"

echo ""
echo "🧪 Test your API endpoints:"
echo "curl https://your-backend.vercel.app/api/trending/tv/day"
echo "curl https://your-backend.vercel.app/api/auth/status"