import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload(); // Ensure latest emailVerified
        } catch (e) {
          console.log('Error reloading user:', e);
        }
      }
      setUser(auth.currentUser);
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    setChecking(true);
    try {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    } finally {
      setChecking(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    checking,
    refreshUser,
  }), [user, checking, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
