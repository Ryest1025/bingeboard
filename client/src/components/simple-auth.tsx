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
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-cache',
        });
        
        if (!isMounted) return;
        
        if (authResponse.ok) {
          const userData = await authResponse.json();
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return authState;
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}