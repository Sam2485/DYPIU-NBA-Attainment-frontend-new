import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const authData = response?.data || response;
      const jwtToken = authData?.token || authData?.accessToken;
      const userData = authData?.user || { email, role: 'ADMIN', name: email.split('@')[0] };

      if (!jwtToken) {
        throw new Error('Authentication failed: No token received from server.');
      }

      sessionStorage.setItem('authToken', jwtToken);
      sessionStorage.setItem('admin_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      const isNba = typeof window !== 'undefined' && window.location.pathname.startsWith('/nba');
      window.location.href = isNba ? '/nba/login' : '/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
