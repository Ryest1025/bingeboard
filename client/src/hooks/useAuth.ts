import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface AuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    let isMounted = true;
    const auth = getAuth();

    // Set up Firebase auth state listener for real-time updates
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Create/restore backend session
          const sessionResponse = await fetch('/api/auth/firebase-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            credentials: 'include',
            body: JSON.stringify({ idToken })
          });

          if (sessionResponse.ok) {
            const userData = await sessionResponse.json();
            console.log('✅ Session restored/created for user:', userData.user.email);
            
            setAuthState({
              user: userData.user,
              isLoading: false,
              isAuthenticated: true
            });
          } else {
            console.log('⚠️ Failed to create backend session');
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            });
          }
        } catch (error) {
          console.error('Session creation error:', error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } else {
        // User not authenticated with Firebase
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    });

    // Also check for existing backend session on mount
    const checkExistingSession = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const user = await response.json();
          console.log('✅ Existing session found:', user.email);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          });
        }
      } catch (error) {
        // Session check failed - will be handled by Firebase auth state listener
        console.log('Existing session check failed, relying on Firebase auth state');
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return authState;
}
