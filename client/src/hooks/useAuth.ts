import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/firebase/config-simple";

interface AuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false, // Start with false on mobile to prevent infinite loading
    isAuthenticated: false
  });

  useEffect(() => {
    let isMounted = true;

    // Detect mobile and use simpler flow
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile device detected - using simplified auth flow');
      // Start with not authenticated on mobile to prevent loading issues
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
      return () => {};
    }

    // Desktop flow with timeout protection
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('⚠️ Auth loading timeout - setting not authenticated');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    }, 5000); // 5 second timeout for desktop

    // Set up Firebase auth state listener for real-time updates
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!isMounted) return;
      
      clearTimeout(loadingTimeout);

      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Create/restore backend session with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const sessionResponse = await fetch('/api/auth/firebase-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            credentials: 'include',
            body: JSON.stringify({ idToken }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (sessionResponse.ok) {
            const userData = await sessionResponse.json();
            console.log('✅ Session restored/created for user:', userData.user.email);
            
            setAuthState({
              user: userData.user,
              isLoading: false,
              isAuthenticated: true
            });
          } else {
            console.log('⚠️ Failed to create backend session, using Firebase-only auth');
            // Fall back to Firebase-only authentication
            setAuthState({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                firebase: true
              },
              isLoading: false,
              isAuthenticated: true
            });
          }
        } catch (error) {
          console.error('Session creation error, using Firebase-only auth:', error);
          // Fall back to Firebase-only authentication
          setAuthState({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              firebase: true
            },
            isLoading: false,
            isAuthenticated: true
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
      clearTimeout(loadingTimeout);
    };
  }, []);

  return authState;
}
