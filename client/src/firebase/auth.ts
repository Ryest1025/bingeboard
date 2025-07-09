// Firebase imports disabled temporarily to fix build issues
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithPopup,
//   signInWithRedirect,
//   getRedirectResult,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   OAuthProvider,
//   signOut,
//   onAuthStateChanged,
//   User,
//   updateProfile,
//   sendEmailVerification,
//   fetchSignInMethodsForEmail,
//   linkWithCredential,
//   linkWithPopup,
//   unlink,
//   EmailAuthProvider,
//   updatePassword,
//   reauthenticateWithCredential,
//   type UserCredential
// } from "firebase/auth";
// import { auth } from "./config";

// Mock Firebase auth for compatibility
const auth = null;

// Mock providers for compatibility
const googleProvider = null;
const facebookProvider = null;
const appleProvider = null;

// Mock configurations for compatibility
// googleProvider.addScope('profile');
// googleProvider.addScope('email');
// facebookProvider.addScope('email');
// facebookProvider.addScope('public_profile');
// appleProvider.addScope('email');
// appleProvider.addScope('name');

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
}

// Email/Password Authentication
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update the user's profile with their name
  await updateProfile(userCredential.user, {
    displayName: `${firstName} ${lastName}`
  });

  // Send email verification
  await sendEmailVerification(userCredential.user);
  
  return userCredential;
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Google Authentication
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // Use redirect instead of popup to avoid blocking issues
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

// Facebook Authentication with automatic account linking
export const signInWithFacebook = async (): Promise<void> => {
  try {
    // Use redirect instead of popup to avoid blocking issues
    await signInWithRedirect(auth, facebookProvider);
  } catch (error: any) {
    console.error("Facebook sign-in error:", error);
    throw new Error(error.message || "Failed to sign in with Facebook");
  }
};

// Apple Authentication
export const signInWithApple = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result;
  } catch (error: any) {
    console.error("Apple sign-in error:", error);
    throw new Error(error.message || "Failed to sign in with Apple");
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Convert Firebase User to our AuthUser interface
export const formatAuthUser = (user: User): AuthUser => {
  const displayName = user.displayName || "";
  const nameParts = displayName.split(" ");
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || ""
  };
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Handle redirect result for social logins
export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error("Redirect result error:", error);
    // Handle account exists with different credential error
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      throw new Error(`This email is already registered with a different sign-in method. Please use Google sign-in for ${email || 'this account'}.`);
    }
    throw new Error(error.message || "Authentication failed");
  }
};

// Get Firebase ID token for backend authentication
export const getIdToken = async (): Promise<string | null> => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Account linking functions
export const linkGoogleAccount = async (): Promise<UserCredential> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  
  try {
    const result = await linkWithPopup(user, googleProvider);
    return result;
  } catch (error: any) {
    console.error("Google account linking error:", error);
    throw new Error(error.message || "Failed to link Google account");
  }
};

export const linkFacebookAccount = async (): Promise<UserCredential> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  
  try {
    const result = await linkWithPopup(user, facebookProvider);
    return result;
  } catch (error: any) {
    console.error("Facebook account linking error:", error);
    throw new Error(error.message || "Failed to link Facebook account");
  }
};

export const addPasswordToAccount = async (password: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    throw new Error("No user is currently signed in or user has no email");
  }
  
  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credential);
  } catch (error: any) {
    console.error("Password addition error:", error);
    throw new Error(error.message || "Failed to add password to account");
  }
};

export const unlinkAccount = async (providerId: string): Promise<User> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  
  try {
    const result = await unlink(user, providerId);
    return result;
  } catch (error: any) {
    console.error("Account unlinking error:", error);
    throw new Error(error.message || "Failed to unlink account");
  }
};

export const getLinkedProviders = (): string[] => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }
  
  return user.providerData.map(provider => provider.providerId);
};

export const hasPasswordProvider = (): boolean => {
  const providers = getLinkedProviders();
  return providers.includes('password');
};