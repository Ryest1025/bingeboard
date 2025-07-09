import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

export function useSimpleAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Test connectivity first, then check authentication
    const testAndCheckAuth = async () => {
      console.log('Testing API connectivity...');
      
      try {
        // Direct authentication check (401 is expected for unauthenticated users)
        console.log('Starting fetch to /api/auth/user');
        const authResponse = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-cache',
        });
        
        console.log('Auth response received:', authResponse);
        console.log('Auth response status:', authResponse.status);
        
        if (authResponse.ok) {
          const userData = await authResponse.json();
          console.log('User data:', userData);
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false
          });
        } else if (authResponse.status === 401) {
          // 401 is expected for unauthenticated users
          console.log('User not authenticated (expected for logout state)');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        } else {
          console.error('Unexpected auth response:', authResponse.status);
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } catch (err) {
        console.error('Network error during auth check:', err);
        // For now, default to unauthenticated state
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    // Small delay to ensure server is ready
    setTimeout(testAndCheckAuth, 1000);
  }, []);

  return authState;
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}