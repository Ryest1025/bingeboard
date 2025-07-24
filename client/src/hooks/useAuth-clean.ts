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
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    let isMounted = true;

    // Mobile detection and redirect - only on first load
    const userAgent = navigator.userAgent || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(userAgent);
    const bypassMobile = window.location.search.includes('mobile=bypass');
    
    if (isMobile && !bypassMobile && window.location.pathname === '/') {
      console.log('📱 Mobile device detected - redirecting to mobile version');
      window.location.href = '/mobile-working.html';
      return;
    }

    // Auth timeout protection
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('⚠️ Auth loading timeout - setting not authenticated');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    }, 8000);

    const performAuthCheck = async () => {
      // FIRST: Check for existing local session
      try {
        console.log('🔍 Checking for existing local session...');
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const user = await response.json();
          console.log('✅ Local session found:', user.email);
          clearTimeout(loadingTimeout);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          });
          return; // Done - local session is active
        }
      } catch (error) {
        console.log('⚠️ Local session check error:', error);
      }

      // SECOND: Check Firebase authentication
      console.log('🔍 No local session, checking Firebase auth...');
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (!isMounted) return;
        
        clearTimeout(loadingTimeout);

        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
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
              console.log('✅ Firebase session created:', userData.user.email);
              
              setAuthState({
                user: userData.user,
                isLoading: false,
                isAuthenticated: true
              });
            } else {
              // Firebase-only fallback
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
            console.error('Firebase session error:', error);
            // Firebase-only fallback
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
          // No authentication found
          console.log('❌ No authentication found');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      });

      return unsubscribe;
    };

    // Start authentication check
    performAuthCheck();

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
    };
  }, []);

  return authState;
}
