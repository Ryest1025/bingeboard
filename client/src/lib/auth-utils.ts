// Authentication utilities following the final Firebase pattern

import { 
  signInWithRedirect, 
  signInWithPopup, 
  getRedirectResult, 
  AuthProvider,
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "@/firebase/config";

// Mobile detection utility
export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Generic social login function following the final pattern
export async function signInWithProvider(provider: AuthProvider): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    console.log('🔧 signInWithProvider called, isMobile:', isMobile());
    
    if (isMobile()) {
      // For mobile: use redirect
      console.log('📱 Using mobile redirect flow');
      await signInWithRedirect(auth, provider);
      return {}; // Redirect result will be handled by getRedirectResult
    } else {
      // For desktop: use popup
      console.log('🖥️ Using desktop popup flow');
      const result = await signInWithPopup(auth, provider);
      console.log('🖥️ Popup result:', result);
      return { user: result.user };
    }
  } catch (error: any) {
    console.error("❌ Authentication error:", error);
    return { error: error.message };
  }
}

// Google login
export async function signInWithGoogle() {
  console.log('🔵 signInWithGoogle called');
  return signInWithProvider(googleProvider);
}

// Facebook login  
export async function signInWithFacebook() {
  console.log('🔴 signInWithFacebook called');
  return signInWithProvider(facebookProvider);
}

// Handle redirect result (should be called on app startup)
export async function handleAuthRedirect(): Promise<{ user?: FirebaseUser; error?: string }> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("✅ Redirect login successful", result.user);
      return { user: result.user };
    }
    return {};
  } catch (error: any) {
    console.error("❌ Redirect failed:", error);
    return { error: error.message };
  }
}

// Backend session creation
export async function createBackendSession(user: FirebaseUser): Promise<{ success: boolean; error?: string }> {
  try {
    const idToken = await user.getIdToken();
    
    const response = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      credentials: 'include', // Critical: include cookies in cross-origin requests
      body: JSON.stringify({ 
        idToken, // Primary: use idToken field
        firebaseToken: idToken, // Fallback compatibility
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend session failed: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend session created:', data);
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Backend session creation failed:', error);
    return { success: false, error: error.message };
  }
}