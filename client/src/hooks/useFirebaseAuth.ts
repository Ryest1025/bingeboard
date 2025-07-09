import { useState, useEffect } from 'react';
// Firebase imports disabled temporarily to fix build issues
// import { User } from 'firebase/auth';
// import { onAuthStateChange, formatAuthUser, type AuthUser } from '@/firebase/auth';

// Mock types for compatibility
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const onAuthStateChange = () => () => {};
const formatAuthUser = (user: User): AuthUser => ({ id: user.uid, email: user.email || '', name: user.displayName || '' });

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser: User | null) => {
      if (firebaseUser) {
        const formattedUser = formatAuthUser(firebaseUser);
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
};