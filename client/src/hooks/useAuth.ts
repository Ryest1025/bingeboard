import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";

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
  
  // Listen to Firebase auth state changes
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Get Firebase ID token
        const idToken = await firebaseUser.getIdToken();
        
        // Send to backend for session creation
        const res = await fetch("/api/auth/firebase-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken })
        });
        
        if (res.ok) {
          const data = await res.json();
          updateState({
            user: data.user || {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || undefined
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Firebase session sync failed - clear auth
          console.error("Failed to sync Firebase session with backend");
          updateState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (err) {
        console.error("Error syncing Firebase auth:", err);
        updateState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // No Firebase user - check backend session
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
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
  const [state, setState] = useState(globalState);
  
  useEffect(() => { initAuth(); }, []);
  
  useEffect(() => {
    const update = () => setState({ ...globalState });
    listeners.add(update);
    update();
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
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      
      updateState({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err) {
      console.error("Logout error:", err);
      updateState({ isLoading: false });
    }
  }, []);
  
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status", { credentials: "include" });
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
