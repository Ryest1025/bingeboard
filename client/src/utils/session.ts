// Memoized session fetch utility
import { apiFetch } from './api-config';

let cachedSession = null;

async function getSession() {
  if (cachedSession) return cachedSession;
  const res = await apiFetch('/api/auth/session');
  cachedSession = await res.json();
  return cachedSession;
}
