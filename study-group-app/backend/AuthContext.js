import React, { createContext, useEffect, useState } from 'react';
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
          await firebaseUser.reload(); // Always reload to check latest verification
        } catch (e) {
          console.log('Error reloading user:', e);
        }
      }
      setUser(auth.currentUser); // Always use the updated currentUser
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      setChecking(true); // trigger state change for rerender
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setChecking(false); // stop checking again
    }
  };


  return (
    <AuthContext.Provider value={{ user, checking, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
