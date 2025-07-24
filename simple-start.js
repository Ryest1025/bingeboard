// Simple server start to test API only
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './server/routes.js';
import { initializeFirebaseAdmin } from './server/services/firebaseAdmin.js';

const app = express();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// JSON parsing
app.use(express.json());

// Initialize Firebase
await initializeFirebaseAdmin();
console.log('✅ Firebase initialized');

// Register API routes
registerRoutes(app);
console.log('✅ API routes registered');

// Simple health check
app.get('/', (req, res) => {
  res.json({ message: 'BingeBoard API is running!', time: new Date().toISOString() });
});

// Start server on port 5000 (API only)
const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log('🎯 Test AI recommendations: http://localhost:5000/api/ai-recommendations');
});
