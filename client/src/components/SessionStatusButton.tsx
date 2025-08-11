import React, { useState } from 'react';

export default function SessionStatusButton() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkSession = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err) {
      setStatus('Error fetching session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '16px 0' }}>
      <button onClick={checkSession} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, background: '#14B8A6', color: 'white', fontWeight: 600 }}>
        {loading ? 'Checking...' : 'Check Session Status'}
      </button>
      {status && (
        <pre style={{ marginTop: 12, background: '#222', color: '#fff', padding: 12, borderRadius: 6, fontSize: 13 }}>{status}</pre>
      )}
    </div>
  );
}
