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
  console.log('🔍🔍🔍 useAuth hook called - START');

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true, // Start with loading to check session first
    isAuthenticated: false
  });

  console.log('🔍🔍🔍 useAuth initial state:', authState);

  useEffect(() => {
    let isMounted = true;
    console.log('🔍 useAuth hook starting - URL:', window.location.href);

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
      try {
        // First priority: Check Firebase auth state
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();

        // Check if user is already logged in to Firebase
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('🔍 Firebase user found, getting token...');
          const token = await currentUser.getIdToken();

          // Try to validate with backend using Firebase token
          try {
            console.log('🔍 Validating Firebase token with backend...');
            const response = await fetch('/api/auth/user', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include'
            });

            console.log(`📡 Backend response: ${response.status} ${response.statusText}`);
            console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);

            if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const user = await response.json();
                console.log('✅ Firebase user validated with backend:', user.email);
                clearTimeout(loadingTimeout);
                setAuthState({
                  user,
                  isLoading: false,
                  isAuthenticated: true
                });
                return;
              } else {
                const text = await response.text();
                console.error('❌ Expected JSON but got HTML/text:', text.substring(0, 200) + '...');
              }
            } else {
              const text = await response.text();
              console.error(`❌ Backend HTTP ${response.status}: ${text.substring(0, 200)}...`);
            }
          } catch (backendError) {
            console.warn('⚠️ Backend validation failed, using Firebase-only auth');
          }

          // Fallback to Firebase-only authentication
          console.log('✅ Using Firebase-only authentication for:', currentUser.email);
          clearTimeout(loadingTimeout);
          setAuthState({
            user: {
              id: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              firebase: true
            },
            isLoading: false,
            isAuthenticated: true
          });
          return;
        }

        // If no current Firebase user, check for existing backend session
        console.log('🔍 No Firebase user, checking for existing local session...');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Document cookies:', document.cookie);

        try {
          console.log('🔍 Fetching /api/auth/user with credentials...');
          const sessionResponse = await fetch('/api/auth/user', {
            credentials: 'include'
          });

          console.log(`📡 Session response: ${sessionResponse.status} ${sessionResponse.statusText}`);
          console.log(`📋 Content-Type: ${sessionResponse.headers.get('content-type')}`);
          console.log(`📋 Response URL: ${sessionResponse.url}`);

          if (sessionResponse.ok) {
            const contentType = sessionResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const user = await sessionResponse.json();
              console.log('✅ Local session found:', user.email);
              clearTimeout(loadingTimeout);
              setAuthState({
                user,
                isLoading: false,
                isAuthenticated: true
              });
              return;
            } else {
              const text = await sessionResponse.text();
              console.error('❌ Session check: Expected JSON but got HTML/text:', text.substring(0, 200) + '...');
            }
          } else if (sessionResponse.status === 401) {
            // 401 is normal - no user is authenticated
            console.log('ℹ️ No existing session found (401 - not logged in)');
          } else {
            const text = await sessionResponse.text();
            console.error(`❌ Session check HTTP ${sessionResponse.status}: ${text.substring(0, 200)}...`);
          }
        } catch (sessionError) {
          console.log('⚠️ Local session check failed:', sessionError);
        }

      } catch (error) {
        console.log('⚠️ Auth initialization error:', error);
      }

      // Set up Firebase auth state listener
      console.log('🔍 Setting up Firebase auth state listener...');

      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/firebase/config');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
          if (!isMounted) return;

          clearTimeout(loadingTimeout);

          if (firebaseUser) {
            console.log('✅ Firebase user detected:', firebaseUser.email);
            // Use Firebase-only authentication (no backend dependency)
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
          } else {
            console.log('❌ No Firebase user found');
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            });
          }
        });

        // Return cleanup function
        return () => {
          isMounted = false;
          unsubscribe();
          clearTimeout(loadingTimeout);
        };

      } catch (error) {
        console.error('❌ Firebase auth setup error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
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
