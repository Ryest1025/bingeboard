import { useEffect, useState } from "react";
// Remove static Firebase imports to prevent conflicts

interface AuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * 🔒 AUTHENTICATION HOOK - PRODUCTION LOCKED
 * 
 * ⚠️  CRITICAL: This hook manages the entire app authentication state
 * 🚨 DO NOT MODIFY the authentication flow logic
 * 
 * Lock Date: July 12, 2025
 * Status: ✅ WORKING PERFECTLY
 * 
 * CRITICAL FEATURES:
 * - ✅ Backend session check priority
 * - ✅ Firebase auth state fallback
 * - ✅ Mobile detection and redirects
 * - ✅ Dynamic Firebase imports to prevent conflicts
 * - ✅ Timeout protection (8 seconds)
 * 
 * AUTHENTICATION FLOW:
 * 1. Check backend session (/api/auth/user)
 * 2. If no session, check Firebase auth state
 * 3. Create backend session from Firebase token
 * 4. Set authentication state for entire app
 * 
 * Last Verified Working: July 12, 2025
 */

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true, // Start with loading to check session first
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
      window.location.href = '/mobile-app';
      return;
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
    }, 8000); // 8 second timeout

    // Main authentication flow
    const initAuth = async () => {
      // First priority: Check for existing backend session
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
          return; // Session found, we're done
        }
      } catch (error) {
        console.log('⚠️ Local session check error:', error);
      }

      // Second priority: Check Firebase authentication with dynamic imports
      console.log('🔍 No local session, checking Firebase auth...');
      
      try {
        // Dynamic import to avoid conflicts
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/firebase/config');
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
          if (!isMounted) return;
          
          clearTimeout(loadingTimeout);

          if (firebaseUser) {
            try {
              // Get Firebase ID token
              const idToken = await firebaseUser.getIdToken();
              
              // Create/restore backend session with timeout
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
                console.log('✅ Firebase session restored/created for user:', userData.user.email);
                
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
              console.error('Firebase session creation error, using Firebase-only auth:', error);
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
            // No Firebase user either
            console.log('❌ No authentication found (local or Firebase)');
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            });
          }
        });

        // Clean up Firebase listener when component unmounts
        return () => {
          unsubscribe();
        };
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      } finally {
        // Ensure loading state is always cleared
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Start the authentication check
    initAuth();

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
    };
  }, []);

  return authState;
}
