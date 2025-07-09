// Temporarily disabled Firebase imports to resolve dependency issues
// import { 
//   signInWithPopup, 
//   signInWithRedirect, 
//   getRedirectResult, 
//   GoogleAuthProvider, 
//   FacebookAuthProvider, 
//   AuthProvider, 
//   linkWithCredential, 
//   signInWithCredential, 
//   fetchSignInMethodsForEmail,
//   signOut,
//   onAuthStateChanged,
//   updateProfile,
//   sendEmailVerification,
//   EmailAuthProvider,
//   updatePassword,
//   reauthenticateWithCredential,
//   type UserCredential
// } from "firebase/auth";

// Mock Firebase auth functions for now
const GoogleAuthProvider = class { constructor() {} };
const FacebookAuthProvider = class { constructor() {} };
const signInWithRedirect = () => Promise.resolve();
const signInWithPopup = () => Promise.resolve({ user: { getIdToken: () => Promise.resolve("mock-token") } });
const getRedirectResult = () => Promise.resolve(null);
type User = { uid: string; email: string; displayName: string };
type UserCredential = { user: User };
import { auth } from "@/firebase/config";

// Mobile detection function
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Provider instances
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Unified login function that handles both providers
const loginWithProvider = async (provider: any): Promise<{ success: boolean; user?: any; error?: string; isRedirect?: boolean }> => {
  try {
    const isUserOnMobile = isMobile();
    console.log("🔍 Device detection:", isUserOnMobile ? "Mobile" : "Desktop");
    console.log("🔍 User agent:", navigator.userAgent);
    
    if (isUserOnMobile) {
      // Mobile: Use redirect
      console.log("📱 Using redirect authentication for mobile");
      await signInWithRedirect(auth, provider);
      console.log("📱 Redirect initiated successfully");
      return { success: true, isRedirect: true };
    } else {
      // Desktop: Use popup
      console.log("🖥️ Using popup authentication for desktop");
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Popup login successful", result.user);
      
      // Send Firebase user to backend
      const idToken = await result.user.getIdToken();
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data.user };
      } else {
        return { success: false, error: 'Authentication failed' };
      }
    }
  } catch (error: any) {
    console.error("❌ Login failed:", error);
    console.error("❌ Error details:", error.code, error.message);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: 'Domain not authorized. Please add this domain to Firebase authorized domains.' 
      };
    }
    
    return { success: false, error: error.message || 'Failed to sign in' };
  }
};

// Google login wrapper
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: any; error?: string; isRedirect?: boolean }> => {
  return loginWithProvider(googleProvider);
};

// Facebook login wrapper
export const signInWithFacebook = async (): Promise<{ success: boolean; user?: any; error?: string; isRedirect?: boolean }> => {
  return loginWithProvider(facebookProvider);
};

// Handle redirect result for both Google and Facebook
export const handleRedirectResult = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    console.log("🔍 Checking for redirect result...");
    const result = await getRedirectResult(auth);
    
    console.log("🔍 Redirect result:", result);
    
    if (result?.user) {
      console.log("✅ Redirect login successful", result.user);
      console.log("🔍 User email:", result.user.email);
      console.log("🔍 Provider:", result.providerId);
      
      // Send Firebase user to backend
      const idToken = await result.user.getIdToken();
      console.log("🔍 Got ID token, sending to backend...");
      
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });
      
      console.log("🔍 Backend response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend authentication successful:", data);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.text();
        console.error("❌ Backend authentication failed:", errorData);
        return { success: false, error: 'Authentication failed' };
      }
    }
    
    console.log("🔍 No redirect result found");
    return { success: false, error: 'No redirect result' };
  } catch (error: any) {
    console.error("❌ Redirect result error:", error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: 'Domain not authorized. Please add this domain to Firebase authorized domains.' 
      };
    }
    
    if (error.code === 'auth/network-request-failed') {
      return { 
        success: false, 
        error: 'Network error. Please check your internet connection and try again.' 
      };
    }
    
    return { success: false, error: error.message || 'Failed to process authentication' };
  }
};

export const signInWithFacebookOld = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Send Firebase user to backend
    const idToken = await result.user.getIdToken();
    
    const response = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: include cookies for session
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user };
    } else {
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error: any) {
    console.error("Facebook login error:", error);
    
    // Handle popup closed by user
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: "Sign-in was cancelled. Please try again." };
    }
    
    // Handle account exists with different credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email || 'this email';
      return { 
        success: false, 
        error: `Account already exists! ${email} is already linked to a Google account. Please use "Continue with Google" to sign in instead.`,
        code: error.code,
        showGooglePrompt: true
      };
    }
    
    return { success: false, error: error.message || 'Failed to sign in with Facebook' };
  }
};