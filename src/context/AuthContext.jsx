import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Dr. Raj Shaikh',
  email: 'raj.shaikh@dypiu.ac.in',
  role: 'FACULTY',
  department: 'Computer Science & Engineering',
  programme: 'B.Tech CSE',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('nba_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [role, setRole] = useState(() => user?.role || sessionStorage.getItem('role') || 'FACULTY');

  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, role };
      sessionStorage.setItem('nba_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('role', role);
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
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('accessToken', token);
    }

    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
    }

    sessionStorage.setItem('nba_user', JSON.stringify(updatedUser));
    sessionStorage.setItem('role', updatedUser.role);

    setUser(updatedUser);
    setRole(updatedUser.role);
    return updatedUser;
  };

  const getAccessToken = () => {
    return sessionStorage.getItem('accessToken') || sessionStorage.getItem('authToken') || sessionStorage.getItem('token') || '';
  };

  const getRefreshToken = () => {
    return sessionStorage.getItem('refreshToken') || '';
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('nba_user');
    sessionStorage.removeItem('role');
    sessionStorage.clear();
    setUser(null);
    const loginUrl = window.location.pathname.startsWith('/obe') ? '/obe/login' : '/login';
    window.location.href = loginUrl;
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
