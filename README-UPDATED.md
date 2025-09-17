# BingeBoard App

## Overview
BingeBoard is a streaming recommendation platform with AI-enhanced and behavioral intelligence recommendations.

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. PostgreSQL Setup
Run the setup script to configure the user, password, and database:
```bash
chmod +x scripts/setup_postgres.sh
./scripts/setup_postgres.sh
```

Or use npm script:
```bash
npm run postgres:setup
```

### 4. Run the development server
```bash
npm run dev
```

The app runs at http://localhost:5173 (frontend) and http://localhost:5000 (backend).

## 📚 API Endpoints

- `POST /api/enhanced-recommendations` – AI & heuristic recommendations
- `POST /api/enhanced-recommendations/filtered` – Legacy filtered recommendations  
- `GET /api/enhanced-recommendations/filter-options` – Available filters
- `POST /api/test-enhanced-recommendations` – Testing endpoint (no auth)
- `POST /api/recommendations/unified` – Unified recommendation system

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (with SQLite fallback for development)
- **Authentication**: Firebase Auth
- **APIs**: TMDB API for content metadata
- **AI**: Optional OpenAI GPT integration for recommendations

## 🔧 PostgreSQL Setup Scripts

### Interactive Setup (Development)
```bash
./scripts/setup_postgres.sh
```

### CI/CD Setup (Non-interactive)
```bash
./scripts/setup-postgres-ci.sh
```

### Connection Testing
```bash
./scripts/verify-postgres.sh
```

### Manual Password Setup (One-liner)
```bash
sudo -i -u postgres bash -c "psql -c \"ALTER USER postgres PASSWORD 'Binge1025';\""
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run postgres:setup     # Setup PostgreSQL (interactive)
npm run postgres:setup-ci  # Setup PostgreSQL (CI/CD)
npm run postgres:verify    # Test PostgreSQL connection
npm run postgres:connect   # Connect to PostgreSQL

# Development Tools
npm run analyze:unused     # Find unused code
npm run analyze:deps       # Check dependencies
npm test                  # Run tests
```

## 🔑 Environment Configuration

Key environment variables (see `.env.example` for full list):

```bash
# Backend
PORT=5000
DATABASE_URL=postgresql://postgres:Binge1025@localhost:5432/bingeboard

# Frontend  
VITE_PORT=5173
BACKEND_URL=http://localhost:5000

# APIs
TMDB_API_KEY=your-tmdb-api-key
OPENAI_API_KEY=your-openai-api-key

# Firebase
VITE_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_KEY=your-service-account-json
```

## 🚀 Deployment

The application is designed to work in various environments:

- **Development**: Local PostgreSQL + Vite dev server
- **Production**: PostgreSQL + built static files  
- **CI/CD**: Automated setup with non-interactive scripts
- **Docker**: Container-ready with proper environment handling

## 🔒 Security Features

- Firebase Authentication with session management
- Rate limiting on API endpoints
- CORS configuration for cross-origin requests
- Environment-based configuration
- Secure cookie handling

## 📱 Mobile Support

BingeBoard includes Capacitor integration for mobile app deployment:

```bash
npm run mobile:init       # Initialize Capacitor
npm run mobile:add:ios    # Add iOS platform
npm run mobile:add:android # Add Android platform
npm run mobile:build:ios  # Build iOS app
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:strict   # Run tests with strict logging
```

## 📖 Documentation

- [PostgreSQL Setup Guide](./scripts/README-POSTGRES.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.