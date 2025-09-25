# BingeBoard - TV Show Tracking Social Platform

<!-- CI / Quality Status Badges -->
<p align="left">
   <a href="https://github.com/Ryest1025/bingeboard/actions/workflows/pages.yml">
      <img alt="Pages Deploy" src="https://github.com/Ryest1025/bingeboard/actions/workflows/pages.yml/badge.svg" />
   </a>
   <a href="https://github.com/Ryest1025/bingeboard/actions/workflows/analyze-unused.yml">
      <img alt="Analyze Unused Code" src="https://github.com/Ryest1025/bingeboard/actions/workflows/analyze-unused.yml/badge.svg" />
   </a>
</p>

A cutting-edge social TV show tracking platform with robust multi-provider authentication and seamless user experience.

## 🚀 Features

- **Social TV Tracking**: Track shows, create watchlists, and share with friends
- **AI-Powered Recommendations**: Personalized suggestions based on viewing history
- **Multi-Platform Authentication**: Google, Facebook, and email/password login
- **Mobile & Web Ready**: Responsive design with iOS app deployment
- **Streaming Integration**: Real-time streaming platform availability
- **Sports Tracking**: Professional sports games and schedules
- **Premium Features**: Ad-supported trailers, subscription tiers, affiliate marketing

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth + Custom OAuth
- **APIs**: TMDB, TheSportsDB, Watchmode
- **Deployment**: Replit + iOS App Store
- **State Management**: TanStack Query (React Query)

## 🏗️ Architecture

### Frontend
- React 18 with TypeScript
- Wouter for client-side routing
- Tailwind CSS with shadcn/ui components
- TanStack Query for server state management
- Responsive mobile-first design

### Backend
- Node.js with Express.js
- PostgreSQL with Drizzle ORM
- Multi-provider authentication
- RESTful API design
- Session management with PostgreSQL storage

### External Services
- **TMDB API**: Movie and TV show metadata
- **TheSportsDB API**: Professional sports data
- **Watchmode API**: Streaming platform availability
- **Firebase**: Authentication and push notifications
- **Neon**: Serverless PostgreSQL hosting

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   # Database
   DATABASE_URL=your_neon_database_url
   
   # Authentication
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   
   # APIs
   TMDB_API_KEY=your_tmdb_api_key
   WATCHMODE_API_KEY=your_watchmode_api_key
   
   # Firebase
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5000`

## 🌐 GitHub Codespaces

BingeBoard supports development using GitHub Codespaces:

1. **Open in Codespaces**
   - Go to your GitHub repository
   - Click the "Code" button
   - Select the "Codespaces" tab
   - Click "Create codespace on main"

2. **Development in Codespaces**
   - The environment will automatically install dependencies
   - Forward ports 3000 (frontend) and 5000 (backend) are pre-configured
   - Access your app through the "Ports" tab or click the browser icon next to the forwarded port

3. **Testing Mobile Access**
   - When using Codespaces, your app is accessible via a public URL
   - Use the Codespaces URL from the "Ports" tab to access from mobile devices
   - No SSL certificate or local network issues to worry about

## 📱 Mobile Deployment

BingeBoard supports iOS deployment using Capacitor:

```bash
# Build for iOS
npm run build:ios

# Open in Xcode
npx cap open ios
```

See [iOS Deployment Guide](docs/deployment/IOS_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Authentication

Multiple authentication methods supported:

- **Email/Password**: Traditional authentication
- **Google OAuth**: Google account integration
- **Facebook OAuth**: Facebook account integration
- **Replit Auth**: Replit platform integration

See [Authentication Guide](docs/auth/AUTHENTICATION_FINAL_SOLUTION.md) for setup instructions.

## 📚 Documentation

- **[Complete Documentation](docs/README.md)** - All project documentation
- **[Authentication Setup](docs/auth/AUTHENTICATION_FINAL_SOLUTION.md)** - OAuth configuration
- **[Brand Guidelines](docs/features/BINGEBOARD_BRAND_GUIDE.md)** - Design standards
- **[Mobile Deployment](docs/deployment/MOBILE_DEPLOYMENT.md)** - iOS deployment guide
- **[Custom Domain Setup](docs/deployment/CUSTOM_DOMAIN_SETUP.md)** - Domain configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live App**: [www.joinbingeboard.com](https://www.joinbingeboard.com)
- **Documentation**: [docs/README.md](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/bingeboard/issues)

## 🎯 Project Status

✅ **Authentication System**: Multi-provider OAuth functional  
✅ **Mobile Authentication**: Fixed popup blocking issues  
✅ **Responsive Design**: Mobile and desktop optimized  
✅ **AI Recommendations**: OpenAI-powered content suggestions  
✅ **Streaming Integration**: Real-time platform availability  
✅ **iOS Deployment**: App Store ready  
🚧 **Testing Suite**: Unit and integration tests  
🚧 **Performance Optimization**: Caching and optimization  

---

Built with ❤️ by the BingeBoard team
 
## 🔎 Unused Code Analysis

This repo runs an "Analyze Unused Code" workflow in CI (Node 20) to track unused exports and dependencies.

- How it works:
   - Uses ts-prune for unused exports by default.
   - If ts-prune crashes on dynamic imports, it automatically falls back to Knip to keep the analysis going.
   - Uses depcheck for unused dependencies.
   - Results are summarized and compared against baselines.

- Run locally (same logic as CI):
  
   ```bash
   bash scripts/analyze-unused.sh
   ```

- Update baselines intentionally (resets to current results):
  
   ```bash
   bash scripts/analyze-unused.sh --update-baseline
   ```

Artifacts and baselines live in `analysis/` and are uploaded as CI artifacts. If you see noisy items, add patterns (one per line) to `analysis/unused-ignore.txt`.

- Optional: To disable the Knip fallback (for A/B testing), set this env var before running:
  
   ```bash
   UNUSED_DISABLE_KNIP_FALLBACK=1 bash scripts/analyze-unused.sh
   ```
  
   You can also put `UNUSED_DISABLE_KNIP_FALLBACK=1` in your `.env`.

See also: `docs/knip-baseline.md` for baseline maintenance.

For preserving work from GitHub Codespaces without touching `main`, see: `docs/codespace-recovery.md`.