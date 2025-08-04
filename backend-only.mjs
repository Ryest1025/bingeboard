#!/usr/bin/env node

// Simple backend-only server for development
import express from "express";
import cors from "cors";
import { registerRoutes } from "./server/routes/index.js";

const app = express();
const port = 5000;

// Enable CORS for development
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Register API routes
registerRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend API server running on http://localhost:${port}`);
  console.log(`📡 CORS enabled for http://localhost:3000`);
});
