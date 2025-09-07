// MINIMAL AUTH UTILITIES FOR FIREBASE-ONLY AUTHENTICATION
// DO NOT ADD OTHER AUTHENTICATION SYSTEMS HERE

export function isUnauthorizedError(error: any): boolean {
  return error?.message?.includes('401') || 
         error?.message?.includes('Unauthorized') ||
         error?.status === 401;
}

// Legacy function - use useAuth hook instead
export function getAuthenticatedUser() {
  console.warn('getAuthenticatedUser is deprecated - use useAuth hook instead');
  return null;
}