// Minimal Vercel API endpoint for testing
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
}