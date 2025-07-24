// Authentication service using Firebase v9 modular syntax
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure Facebook provider
facebookProvider.addScope('email');

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase User to our AuthUser interface
const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

// Google Sign In
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    console.log('Starting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);

    // Get the signed-in user info
    const user = result.user;
    console.log('Google sign-in successful:', user.email);

    return mapFirebaseUser(user);
  } catch (error: any) {
    console.error('Google sign-in error:', error);

    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by browser. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in was cancelled');
    }

    throw new Error(error.message || 'Google sign-in failed');
  }
};

// Facebook Sign In
export const signInWithFacebook = async (): Promise<AuthUser> => {
  try {
    console.log('Starting Facebook sign-in...');
    const result = await signInWithPopup(auth, facebookProvider);

    // Get the signed-in user info
    const user = result.user;
    console.log('Facebook sign-in successful:', user.email);

    return mapFirebaseUser(user);
  } catch (error: any) {
    console.error('Facebook sign-in error:', error);

    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by browser. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials.');
    }

    throw new Error(error.message || 'Facebook sign-in failed');
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('🔐 Starting email sign-in for:', email);
    console.log('🔐 Password length:', password.length);

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const result = await signInWithEmailAndPassword(auth, email, password);

    console.log('✅ Email sign-in successful:', result.user.email);
    return mapFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-in error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    // Handle specific error codes
    if (error.code === 'auth/user-not-found') {
      // Check if user exists with social login
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          const providers = methods.map(method => {
            if (method.includes('google')) return 'Google';
            if (method.includes('facebook')) return 'Facebook';
            return method;
          }).join(', ');
          throw new Error(`This email is already registered with ${providers}. Please use that sign-in method instead.`);
        }
      } catch (fetchError) {
        console.warn('Could not check existing sign-in methods:', fetchError);
      }
      throw new Error('No account found with this email address. Please sign up first.');
    } else if (error.code === 'auth/invalid-login-credentials') {
      // This is the newer error code that combines user-not-found and wrong-password
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          const providers = methods.map(method => {
            if (method.includes('google')) return 'Google';
            if (method.includes('facebook')) return 'Facebook';
            return method;
          }).join(', ');
          throw new Error(`This email is registered with ${providers}. Please use that sign-in method instead, or try the "Forgot Password" option.`);
        } else {
          throw new Error('No account found with this email address. Please sign up first or check your email/password.');
        }
      } catch (fetchError) {
        console.warn('Could not check existing sign-in methods:', fetchError);
        throw new Error('Invalid email or password. Please check your credentials or sign up first.');
      }
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Email/password sign-in is not enabled for this project');
    }

    throw new Error(error.message || 'Sign-in failed');
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> => {
  try {
    console.log('📝 Starting email sign-up for:', email);
    console.log('📝 Password length:', password.length);
    console.log('📝 Display name:', displayName);

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);

    // TODO: Update user profile with displayName if provided
    // import { updateProfile } from 'firebase/auth';
    // if (displayName) {
    //   await updateProfile(result.user, { displayName });
    // }

    console.log('✅ Email sign-up successful:', result.user.email);
    return mapFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-up error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    // Handle specific error codes
    if (error.code === 'auth/email-already-in-use') {
      // Check what sign-in methods are available for this email
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          const providers = methods.map(method => {
            if (method.includes('google')) return 'Google';
            if (method.includes('facebook')) return 'Facebook';
            if (method === 'password') return 'Email/Password';
            return method;
          }).join(', ');
          throw new Error(`This email is already registered with ${providers}. Please use that sign-in method instead.`);
        }
      } catch (fetchError) {
        console.warn('Could not check existing sign-in methods:', fetchError);
      }
      throw new Error('An account already exists with this email address. Please sign in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Email/password accounts are not enabled for this project');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    }

    throw new Error(error.message || 'Sign-up failed');
  }
};

// Sign Out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error: any) {
    console.error('Sign-out error:', error);
    throw new Error('Sign-out failed');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    console.log('📧 Sending password reset email to:', email);

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent successfully');
  } catch (error: any) {
    console.error('❌ Password reset error:', error);
    console.error('❌ Error code:', error.code);

    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    }

    throw new Error(error.message || 'Failed to send password reset email');
  }
};

// Check what sign-in methods are available for an email
export const checkSignInMethods = async (email: string): Promise<string[]> => {
  try {
    console.log('🔍 Checking sign-in methods for:', email);
    const methods = await fetchSignInMethodsForEmail(auth, email);
    console.log('🔍 Available methods:', methods);
    return methods;
  } catch (error: any) {
    console.error('❌ Error checking sign-in methods:', error);
    return [];
  }
};

// Handle account linking for social login conflicts
export const handleAccountLinking = async (email: string, password: string, socialProvider: 'google' | 'facebook'): Promise<AuthUser> => {
  try {
    console.log('🔗 Attempting to link account for:', email);

    // First, sign in with email/password
    const emailResult = await signInWithEmailAndPassword(auth, email, password);
    const user = emailResult.user;

    // Create credential for the social provider
    let credential;
    if (socialProvider === 'google') {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      credential = GoogleAuthProvider.credentialFromResult(result);
    } else {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      credential = FacebookAuthProvider.credentialFromResult(result);
    }

    if (credential) {
      // Link the credential to the current user
      await linkWithCredential(user, credential);
      console.log('✅ Account linked successfully');
    }

    return mapFirebaseUser(user);
  } catch (error: any) {
    console.error('❌ Account linking error:', error);
    throw new Error(error.message || 'Failed to link accounts');
  }
};
