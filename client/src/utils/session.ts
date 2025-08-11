// Memoized session fetch utility
let cachedSession = null;

async function getSession() {
  if (cachedSession) return cachedSession;
  const res = await fetch('/api/auth/session', { credentials: 'include' });
  cachedSession = await res.json();
  return cachedSession;
}
