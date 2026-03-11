import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { attachToken } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      attachToken(token);
    } else {
      localStorage.removeItem('token');
      attachToken(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: (authToken, authUser) => {
        setToken(authToken);
        setUser(authUser);
      },
      logout: () => {
        setToken(null);
        setUser(null);
      },
      updateProfile: (updatedUser) => {
        setUser(updatedUser);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
