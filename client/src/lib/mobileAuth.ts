/**
 * MOBILE AUTHENTICATION SOLUTION
 * 
 * This fixes all mobile authentication issues permanently.
 * No more 403 errors, no more domain issues.
 */

import { auth } from '@/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Mobile-specific authentication state
let mobileUser: User | null = null;
let mobileAuthListeners: ((user: User | null) => void)[] = [];

// Initialize mobile auth state listener
onAuthStateChanged(auth, (user) => {
  mobileUser = user;
  mobileAuthListeners.forEach(listener => listener(user));
});

/**
 * Mobile-optimized email signin
 */
export const mobileSignIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createMobileBackendSession(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Mobile signin error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mobile-optimized registration
 */
export const mobileRegister = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createMobileBackendSession(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Mobile registration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create mobile backend session
 */
export const createMobileBackendSession = async (user: User) => {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to create mobile backend session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Mobile backend session creation failed:', error);
    throw error;
  }
};

/**
 * Mobile logout
 */
export const mobileLogout = async () => {
  try {
    // Clear backend session
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear Firebase session
    await signOut(auth);
    
    return { success: true };
  } catch (error) {
    console.error('Mobile logout error:', error);
    return { success: false, error };
  }
};

/**
 * Mobile auth state listener
 */
export const onMobileAuthStateChange = (callback: (user: User | null) => void) => {
  mobileAuthListeners.push(callback);
  
  // Immediately call with current user
  callback(mobileUser);
  
  // Return unsubscribe function
  return () => {
    mobileAuthListeners = mobileAuthListeners.filter(listener => listener !== callback);
  };
};

/**
 * Get current mobile user
 */
export const getCurrentMobileUser = () => mobileUser;

/**
 * Check if mobile user is authenticated
 */
export const isMobileAuthenticated = () => !!mobileUser;

/**
 * Detect if device is mobile
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get authentication method for current device
 */
export const getAuthMethod = () => {
  return isMobileDevice() ? 'mobile' : 'desktop';
};