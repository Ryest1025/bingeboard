import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
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
const listeners = new Set<() => void>();

const updateState = (newState: Partial<typeof globalState>) => {
  globalState = { ...globalState, ...newState };
  listeners.forEach(listener => listener());
};

const initAuth = () => {
  if (initialized) return;
  initialized = true;
  
  // CRITICAL: Check backend session FIRST before waiting for Firebase
  // This prevents the flickering isAuthenticated=false issue
  const checkBackendSession = async () => {
    try {
      console.log('🔍 Checking backend session on app load...');
      const res = await apiFetch("/api/auth/status", { credentials: 'include' });
      const data = res.ok ? await res.json() : null;
      
      if (data?.isAuthenticated && data?.user) {
        console.log('✅ Backend session found:', data.user.email);
        updateState({
          user: {
            id: data.user.id || data.user.uid,
            email: data.user.email,
            displayName: data.user.displayName || data.user.name || undefined,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return true; // Session exists
      } else {
        console.log('ℹ️ No backend session found');
        return false; // No session
      }
    } catch (err) {
      console.error('❌ Backend session check failed:', err);
      return false;
    }
  };
  
  // Check backend session immediately
  checkBackendSession().then((hasSession) => {
    // If no backend session, set loading to false after Firebase check
    if (!hasSession) {
      updateState({ isLoading: false });
    }
  });
  
  // Listen to Firebase auth state changes (for new logins)
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
      // Firebase signed out - check if backend session still exists
      console.log('ℹ️ Firebase user signed out, checking backend session...');
      const hasBackendSession = await checkBackendSession();
      if (!hasBackendSession) {
        updateState({ user: null, isAuthenticated: false, isLoading: false });
      }
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
