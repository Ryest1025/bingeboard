import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function OAuthDebug() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testOAuthURL = async (provider: 'google' | 'facebook') => {
    addLog(`Testing ${provider} OAuth URL...`);
    const url = `https://uqpjzzdmhfybqjtaygwf.supabase.co/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
    
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      addLog(`${provider} OAuth URL test response status: ${response.status}`);
    } catch (error) {
      addLog(`${provider} OAuth URL test error: ${error.message}`);
    }

    // Try opening in new tab to see actual error
    addLog(`Opening ${provider} OAuth URL in new tab...`);
    window.open(url, '_blank');
  };

  const directRedirect = (provider: 'google' | 'facebook') => {
    addLog(`Direct redirect to ${provider} OAuth...`);
    const url = `https://uqpjzzdmhfybqjtaygwf.supabase.co/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">OAuth Debug Page</h1>
        
        <div className="space-y-4 mb-6">
          <Button 
            onClick={() => testOAuthURL('google')}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Test Google OAuth URL (New Tab)
          </Button>
          
          <Button 
            onClick={() => testOAuthURL('facebook')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Test Facebook OAuth URL (New Tab)
          </Button>
          
          <Button 
            onClick={() => directRedirect('google')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Direct Google OAuth Redirect
          </Button>
          
          <Button 
            onClick={() => directRedirect('facebook')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Direct Facebook OAuth Redirect
          </Button>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-2">Debug Logs</h2>
          <div className="text-sm text-gray-300 space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="font-mono">{log}</div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Expected Behavior:</h3>
          <ul className="text-yellow-200 text-sm space-y-1">
            <li>• If providers are enabled: Should redirect to OAuth consent screen</li>
            <li>• If providers are disabled: Will show 403 Forbidden error</li>
            <li>• Check new tab for actual error message from Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}