import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, getRedirectResult, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import { apiFetch } from "../utils/api-config";

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

let globalState = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: true,
};

let initialized = false;
let authCheckInProgress = false;
let initialAuthComplete = false;
const listeners = new Set<() => void>();

const updateState = (newState: Partial<typeof globalState>) => {
  globalState = { ...globalState, ...newState };
  listeners.forEach(listener => listener());
};

const initAuth = () => {
  if (initialized) return;
  initialized = true;
  
  // STEP 0: Ensure no service workers are interfering
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log(`🧹 Unregistering ${registrations.length} service workers...`);
        registrations.forEach(reg => reg.unregister());
      } else {
        console.log('✅ No service workers to clean up');
      }
    }).catch(err => console.error('❌ SW cleanup error:', err));
  }
  
  // STEP 1: Check for OAuth redirect result FIRST (handles mobile OAuth)
  const checkOAuthRedirect = async () => {
    try {
      console.log('🔍 Checking for OAuth redirect result...');
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        console.log('✅ OAuth redirect successful:', result.user.email);
        
        // Get ID token and create backend session
        const idToken = await result.user.getIdToken();
        
        const sessionRes = await apiFetch("/api/auth/firebase-session", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include',
          body: JSON.stringify({ 
            idToken,
            firebaseToken: idToken,
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL
            }
          })
        });

        if (sessionRes.ok) {
          const user: User = {
            id: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || undefined,
          };
          
          updateState({ user, isAuthenticated: true, isLoading: false });
          console.log('✅ OAuth redirect session created');
          return true; // OAuth redirect handled
        }
      } else {
        console.log('ℹ️ No OAuth redirect result');
      }
    } catch (err) {
      console.error('❌ OAuth redirect check failed:', err);
    }
    return false; // No OAuth redirect
  };
  
    // STEP 2: Check existing backend session (only if no OAuth redirect)
  const checkBackendSession = async () => {
    if (authCheckInProgress) {
      console.log('⏸️ Auth check already in progress, skipping duplicate check');
      return false;
    }
    
    authCheckInProgress = true;
    try {
      console.log('🔍 Checking backend session...');
      const response = await apiFetch('/api/auth/status', {
        credentials: 'include', // Send cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          console.log('✅ Backend session found:', data.user);
          updateState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        }
      }
      console.log('ℹ️ No backend session found');
      return false;
    } catch (error) {
      console.error('❌ Backend session check failed:', error);
      return false;
    } finally {
      authCheckInProgress = false;
    }
  };
  
  // Check OAuth redirect FIRST, then backend session
  checkOAuthRedirect().then(async (hadOAuthRedirect) => {
    if (!hadOAuthRedirect) {
      // No OAuth redirect, check backend session
      const hasSession = await checkBackendSession();
      if (!hasSession) {
        updateState({ isLoading: false });
      }
    }
    // Mark initial auth as complete to allow onAuthStateChanged to proceed
    initialAuthComplete = true;
    console.log('✅ Initial auth sequence complete');
  });
  
  // Listen to Firebase auth state changes (for new logins)
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    // Wait for initial auth to complete to avoid race conditions
    if (!initialAuthComplete) {
      console.log('⏸️ Skipping onAuthStateChanged during initial auth sequence');
      return;
    }
    
    if (firebaseUser) {
      try {
        console.log("🔑 Firebase user detected:", firebaseUser?.email);
        
        // Get Firebase ID token and sync with backend
        const idToken = await firebaseUser.getIdToken();
        
        // Create/refresh backend session with idToken field
        const sessionRes = await apiFetch("/api/auth/firebase-session", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include', // Critical for cookies
          body: JSON.stringify({ 
            idToken, // Primary field
            firebaseToken: idToken, // Fallback
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            }
          })
        });

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
          };

          updateState({ user, isAuthenticated: true, isLoading: false });
          console.log('✅ Firebase authentication and backend session synced:', user);
        } else {
          const errorText = await sessionRes.text();
          console.error('❌ Backend session creation failed:', errorText);
          updateState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (err) {
        console.error("❌ Auth sync error:", err);
        updateState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // Firebase signed out - DON'T immediately clear state
      // The user might have a valid backend session cookie
      console.log('ℹ️ Firebase signaled sign-out (this can happen on page load)');
      console.log('ℹ️ Preserving backend session if it exists');
      // Don't call checkBackendSession here - it can cause race conditions
      // The backend session will be checked on next navigation if needed
    }
  });
};

export function useAuth(): AuthState {
  const [state, setState] = useState(() => ({ ...globalState }));
  
  useEffect(() => { initAuth(); }, []);
  
  useEffect(() => {
    const update = () => setState({ ...globalState });
    listeners.add(update);
    update(); // Immediately sync with global state
    return () => {
      listeners.delete(update);
    };
  }, []);
  
  const logout = useCallback(async () => {
    try {
      updateState({ isLoading: true });
      
      // Clear backend session first
      await apiFetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include' // Critical for cookies
      });
      
      // Then sign out from Firebase
      await auth.signOut();
      
      updateState({ user: null, isAuthenticated: false, isLoading: false });
      console.log('✅ Logged out successfully');
    } catch (err) {
      console.error("❌ Logout error:", err);
      updateState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);
  
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...');
      const res = await apiFetch("/api/auth/status", { credentials: 'include' });
      const data = res.ok ? await res.json() : null;
      
      if (data?.isAuthenticated && data?.user) {
        updateState({
          user: {
            id: data.user.id || data.user.uid,
            email: data.user.email,
            displayName: data.user.displayName || data.user.name || undefined,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('✅ Session refreshed:', data.user.email);
      } else {
        updateState({ user: null, isAuthenticated: false, isLoading: false });
        console.log('ℹ️ No session found');
      }
    } catch (err) {
      console.error('❌ Session refresh failed:', err);
      updateState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  return { ...state, logout, refreshSession };
}
