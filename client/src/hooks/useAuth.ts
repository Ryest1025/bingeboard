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
  
  // Check for demo mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'true';
  
  if (isDemoMode) {
    console.log('🎭 Demo mode activated');
    const demoUser: User = {
      id: 'demo-user-123',
      email: 'demo@bingeboardapp.com',
      displayName: 'Demo User',
    };
    updateState({ user: demoUser, isAuthenticated: true, isLoading: false });
    return;
  }
  
  // Listen to Firebase auth state changes
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    updateState({ isLoading: true }); // mark loading at start
    if (firebaseUser) {
      try {
        console.log("🔑 FirebaseUser detected:", firebaseUser?.email);
        // Get Firebase ID token
      try {
        // TEMPORARY BYPASS - Skip backend authentication for UI testing
        console.log('🔄 TEMPORARY BYPASS: Skipping backend for UI demo');
        
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
        };

        updateState({ user, isAuthenticated: true, isLoading: false });
        console.log('✅ Frontend-only authentication successful for UI demo:', user);
      } catch (error) {
        console.error('Auth sync error:', error);
        updateState({ user: null, isAuthenticated: false, isLoading: false });
      }
      } catch (err) {
        console.error("Auth sync error:", err);
        updateState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // No Firebase user - check backend session
      try {
        const res = await apiFetch("/api/auth/status");
        const data = res.ok ? await res.json() : null;
        updateState({
          user: data?.user || null,
          isAuthenticated: !!data?.user,
          isLoading: false,
        });
      } catch (err) {
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
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear backend session
      await apiFetch("/api/auth/logout", { method: "POST" });
      
      updateState({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err) {
      console.error("Logout error:", err);
      updateState({ isLoading: false });
    }
  }, []);
  
  const refreshSession = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/status");
      const data = res.ok ? await res.json() : null;
      updateState({
        user: data?.user || null,
        isAuthenticated: !!data?.user,
        isLoading: false,
      });
    } catch (err) {
      updateState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  return { ...state, logout, refreshSession };
}
