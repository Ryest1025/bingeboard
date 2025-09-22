const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Manual login endpoint
app.post('/manual-login', (req, res) => {
  const testUser = {
    id: 'manual_test_user_123',
    email: 'rachel.gubin@gmail.com',
    displayName: 'Rachel Gubin',
    authProvider: 'manual'
  };

  req.session.user = testUser;
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Failed to save session' });
    }
    console.log('✅ Manual login successful for:', testUser.email);
    res.json({ success: true, user: testUser });
  });
});

// Test endpoint
app.get('/test-session', (req, res) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User:', req.session.user);
  res.json({
    sessionID: req.sessionID,
    user: req.session.user,
    session: req.session
  });
});

app.listen(3002, () => {
  console.log('Manual login server running on http://localhost:3002');
  console.log('Use: curl -X POST http://localhost:3002/manual-login');
});