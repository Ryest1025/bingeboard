import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function ProcessOAuth() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState('Processing OAuth tokens...');

  useEffect(() => {
    const processOAuthTokens = async () => {
      try {
        // Get the hash from the URL (if redirected from localhost)
        const urlHash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(urlHash);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Processing OAuth tokens...');
          setStatus('Setting up your session...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setStatus('Session setup failed. Redirecting...');
            setTimeout(() => setLocation('/login?error=session_setup'), 2000);
            return;
          }
          
          if (sessionData.session) {
            console.log('Session established successfully!', sessionData.session.user);
            setStatus('Success! Welcome to BingeBoard!');
            setTimeout(() => setLocation('/'), 1500);
            return;
          }
        }
        
        setStatus('No OAuth tokens found. Redirecting...');
        setTimeout(() => setLocation('/login'), 2000);
        
      } catch (error) {
        console.error('Error processing OAuth:', error);
        setStatus('Error processing authentication. Redirecting...');
        setTimeout(() => setLocation('/login'), 2000);
      }
    };

    processOAuthTokens();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-white mb-2">OAuth Authentication</h1>
          <p className="text-gray-400">{status}</p>
        </div>
      </div>
    </div>
  );
}