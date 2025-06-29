import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth } from './firebaseConfig';
import { onIdTokenChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen only when the ID token truly changes (sign-in, sign-out, or after reload())
    const unsubscribe = onIdTokenChanged(auth, (freshUser) => {
      setUser(freshUser);
      setChecking(false);
    });
    return unsubscribe; // Clean up listener on unmount
  }, []);

  // Only reload on explicit user action (e.g. tapping “Refresh”)
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    setChecking(true);
    try {
      await auth.currentUser.reload(); // Fetch latest profile (emailVerified, etc.)
      setUser(auth.currentUser);
    } finally {
      setChecking(false);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({ user, checking, refreshUser }),
    [user, checking, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
