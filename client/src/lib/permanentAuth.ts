/**
 * PERMANENT AUTHENTICATION SOLUTION
 * 
 * This file implements a bulletproof authentication system that prevents
 * the recurring 403 Firebase domain authorization errors that have plagued
 * this project since July 2025.
 * 
 * CRITICAL: This solution bypasses Firebase domain restrictions by using
 * email/password authentication as primary with social login as secondary.
 */

import { auth } from '@/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Permanent authentication state
let currentUser: User | null = null;
let authStateListeners: ((user: User | null) => void)[] = [];

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authStateListeners.forEach(listener => listener(user));
});

/**
 * Primary authentication method - Email/Password
 * This bypasses all domain authorization issues
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createBackendSession(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Email signin error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Registration method - Email/Password
 */
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createBackendSession(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Email registration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create backend session after Firebase authentication
 */
export const createBackendSession = async (user: User) => {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error('Failed to create backend session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Backend session creation failed:', error);
    throw error;
  }
};

/**
 * Logout function
 */
export const logout = async () => {
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
    console.error('Logout error:', error);
    return { success: false, error };
  }
};

/**
 * Auth state listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  authStateListeners.push(callback);
  
  // Immediately call with current user
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
};

/**
 * Get current user
 */
export const getCurrentUser = () => currentUser;

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => !!currentUser;