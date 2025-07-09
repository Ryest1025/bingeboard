// This file has been deprecated in favor of Firebase authentication
// All Supabase references have been removed
export function useSupabaseAuth() {
  return {
    user: null,
    session: null,
    loading: false,
    signInWithGoogle: () => {},
    signInWithFacebook: () => {},
    signInWithEmail: () => {},
    signUpWithEmail: () => {},
    signOut: () => {},
    isAuthenticated: false
  }
}