import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Custom authentication check that never throws errors
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Use full URL to prevent CORS issues
        const fullUrl = window.location.origin + '/api/auth/user';
        const response = await fetch(fullUrl, {
          credentials: 'include'
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const user = await response.json();
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          // 401 or other error - user not authenticated
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        // Network error or other issue - treat as not authenticated
        if (isMounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return authState;
}
