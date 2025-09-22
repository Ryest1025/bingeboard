import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  user: {
    id: string;
    email: string;
    displayName?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): AuthState {  
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start loading while we check auth
  });

  const logout = async () => {
    try {
      console.log('🔐 Logout initiated');
      
      // Update auth state immediately to show logout is happening
      setAuthState(prevState => ({
        ...prevState,
        isLoading: true,
      }));
      
      // Call logout endpoint
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('🔐 Logout API response:', response.status);
      
      // Update auth state to logged out
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      console.log('🔐 Auth state updated, user logged out');
      
      // Note: Logout complete - components will handle redirect based on auth state
      
    } catch (error) {
      console.error('🔐 Logout error:', error);
      // Still update state even if API call failed
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // Refresh session function to manually update auth state
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...');
      setAuthState(prevState => ({ ...prevState, isLoading: true }));
      
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setAuthState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('🔐 Session refreshed successfully:', data.user.email);
        } else {
          // No session exists, user is not authenticated
          console.log('🔐 No session found after refresh');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        // Not authenticated
        console.log('🔐 Auth refresh failed, user not authenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('🔐 Session refresh error:', error);
      // Set unauthenticated state on error
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setAuthState({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('🔐 Existing session found:', data.user.email);
          } else {
            // No session exists, user is not authenticated
            console.log('🔐 No session found, user not authenticated');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // Not authenticated
          console.log('🔐 Auth check failed, user not authenticated');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('🔐 Auth check error:', error);
        // Set unauthenticated state on error
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  return {
    ...authState,
    logout,
    refreshSession,
  };
}
