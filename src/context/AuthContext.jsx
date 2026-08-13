import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const saveSessionData = (key, value) => {
  try {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  } catch (e) {}
};

const getSessionData = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
  } catch (e) {
    return null;
  }
};

const removeSessionData = (key) => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (e) {}
};

const clearSessionData = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getSessionData('accessToken') || getSessionData('authToken') || getSessionData('token');
    const savedUser = getSessionData('nba_user');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState(() => user?.role || getSessionData('role') || 'FACULTY');

  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, role };
      saveSessionData('nba_user', JSON.stringify(updatedUser));
      saveSessionData('role', role);
    }
  }, [user, role]);

  const loginUser = (profileData, token = '', refreshToken = '') => {
    const updatedUser = {
      id: profileData.id || Date.now(),
      name: profileData.name || profileData.username || 'User',
      email: profileData.email || profileData.username,
      username: profileData.username || profileData.email,
      role: profileData.role || 'FACULTY',
      department: profileData.department || 'Computer Science & Engineering',
      programme: profileData.programme || 'B.Tech CSE',
    };

    if (token) {
      saveSessionData('authToken', token);
      saveSessionData('token', token);
      saveSessionData('accessToken', token);
    }

    if (refreshToken) {
      saveSessionData('refreshToken', refreshToken);
    }

    saveSessionData('nba_user', JSON.stringify(updatedUser));
    saveSessionData('role', updatedUser.role);

    setUser(updatedUser);
    setRole(updatedUser.role);
    return updatedUser;
  };

  const getAccessToken = () => {
    return getSessionData('accessToken') || getSessionData('authToken') || getSessionData('token') || '';
  };

  const getRefreshToken = () => {
    return getSessionData('refreshToken') || '';
  };

  const logout = () => {
    clearSessionData();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, role, loginUser, logout, getAccessToken, getRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
