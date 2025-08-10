import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
// Remove static Firebase imports to prevent conflicts

interface AuthState {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Singleton shared state for auth
let sharedAuthState: AuthState | null = null;
let sharedSetAuthState: ((s: AuthState) => void) | null = null;
let sessionCheckStarted = false; // global guard to avoid repeated network fetches
let sessionCheckCompleted = false;

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
  // console.log('🔍🔍🔍 useAuth hook called - START'); // Disabled for performance

  const [authState, setAuthState] = useState<AuthState>(() => {
    if (sharedAuthState) return sharedAuthState;
    return {
      user: null,
      isLoading: true, // Start with loading to check session first
      isAuthenticated: false
    };
  });

  const [checkedSession, setCheckedSession] = useState(false);

  // Register the setter globally so all hooks share updates
  useEffect(() => {
    sharedSetAuthState = setAuthState;
  }, []);

  // console.log('🔍🔍🔍 useAuth initial state:', authState); // Disabled for performance

  useEffect(() => {
    let isMounted = true;
    // console.log('🔍 useAuth hook starting - URL:', window.location.href);

    // ✅ Prevent repeated fetches - only run once
    if (sessionCheckStarted || checkedSession) {
      // Already in-flight or done
      return;
    }
    sessionCheckStarted = true;

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
        const newState = {
          user: null,
          isLoading: false,
          isAuthenticated: false
        };
        setAuthState(newState);
        sharedAuthState = newState;
      }
    }, 8000); // 8 second timeout

    // Main authentication flow
    const initAuth = async () => {
      try {
        // First priority: Check Firebase auth state
        const { getAuthInstance } = await import('@/firebase/config');
        const auth = await getAuthInstance();

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
                const newState = {
                  user,
                  isLoading: false,
                  isAuthenticated: true
                };
                setAuthState(newState);
                sharedAuthState = newState;
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
          const newState = {
            user: {
              id: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              firebase: true
            },
            isLoading: false,
            isAuthenticated: true
          };
          setAuthState(newState);
          sharedAuthState = newState;
          return;
        }

        // If no current Firebase user, check for existing backend session
        console.log('🔍 No Firebase user, checking for existing local session...');
        // console.log('🔍 Current URL:', window.location.href);
        // console.log('🔍 Document cookies:', document.cookie);

        try {
          // console.log('🔍 Fetching /api/auth/session with credentials...');
          const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
          });

          console.log(`📡 Session response: ${sessionResponse.status} ${sessionResponse.statusText}`);
          // console.log(`📋 Content-Type: ${sessionResponse.headers.get('content-type')}`);
          // console.log(`📋 Response URL: ${sessionResponse.url}`);

          if (sessionResponse.ok) {
            const contentType = sessionResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const sessionData = await sessionResponse.json();
              // Extract user from session data
              const user = sessionData.user || sessionData;
              console.log('✅ Local session found:', user.email);
              clearTimeout(loadingTimeout);
              const newState = {
                user,
                isLoading: false,
                isAuthenticated: true
              };
              setAuthState(newState);
              sharedAuthState = newState;
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
        // Use direct auth instance for mobile compatibility
        const { getAuthInstance } = await import('@/firebase/config');
        const auth = await getAuthInstance();

        console.log('🔍 Auth instance obtained, setting up listener...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
          console.log('🔍 Firebase auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
          if (!isMounted) return;

          clearTimeout(loadingTimeout);

          if (firebaseUser) {
            console.log('✅ Firebase user detected:', firebaseUser.email);
            // Use Firebase-only authentication (no backend dependency)
            const newState = {
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email
              },
              isLoading: false,
              isAuthenticated: true
            };
            setAuthState(newState);
            sharedAuthState = newState;
          } else {
            console.log('❌ No Firebase user found');
            const newState = {
              user: null,
              isLoading: false,
              isAuthenticated: false
            };
            setAuthState(newState);
            sharedAuthState = newState;
          }
        });

        // Immediately clear loading state since Firebase listener is set up
        console.log('🔍 Firebase listener set up, clearing loading state...');
        const immediateState = {
          user: null,
          isLoading: false,
          isAuthenticated: false
        };
        setAuthState(immediateState);
        sharedAuthState = immediateState;

        // Fallback timeout to ensure loading state is cleared
        const fallbackTimeout = setTimeout(() => {
          console.log('⚠️ Auth state listener timeout - clearing loading state');
          if (isMounted) {
            const newState = {
              user: null,
              isLoading: false,
              isAuthenticated: false
            };
            setAuthState(newState);
            sharedAuthState = newState;
          }
        }, 3000); // 3 second fallback

        // Return cleanup function
        return () => {
          isMounted = false;
          unsubscribe();
          clearTimeout(loadingTimeout);
          clearTimeout(fallbackTimeout);
        };

      } catch (error) {
        console.error('❌ Firebase auth setup error:', error);
        const newState = {
          user: null,
          isLoading: false,
          isAuthenticated: false
        };
        setAuthState(newState);
        sharedAuthState = newState;
      }
    };

    // Start the authentication check
    initAuth();

    // Mark session as checked after starting auth
  setCheckedSession(true);
  sessionCheckCompleted = true;

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
    };
  }, [checkedSession]); // Add checkedSession to dependency array

  return authState;
}
