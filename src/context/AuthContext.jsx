import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Dr. Raj Shaikh',
  email: 'raj.shaikh@dypiu.ac.in',
  role: 'FACULTY', // Options: 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY'
  department: 'Computer Science & Engineering',
  programme: 'B.Tech CSE',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('nba_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [role, setRole] = useState(() => user?.role || 'FACULTY');

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('nba_user', JSON.stringify({ ...user, role }));
      sessionStorage.setItem('role', role);
    }
  }, [user, role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    if (user) {
      setUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const loginUser = (profileData, token = 'mock-jwt-token') => {
    const updatedUser = {
      id: profileData.id || Date.now(),
      name: profileData.name || profileData.username || 'User',
      email: profileData.email || profileData.username,
      username: profileData.username || profileData.email,
      role: profileData.role || 'FACULTY',
      department: profileData.department || 'Computer Science & Engineering',
      programme: profileData.programme || 'B.Tech CSE',
    };
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('nba_user', JSON.stringify(updatedUser));
    sessionStorage.setItem('role', updatedUser.role);
    setUser(updatedUser);
    setRole(updatedUser.role);
    return updatedUser;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    const loginUrl = window.location.pathname.startsWith('/obe') ? '/obe/login' : '/login';
    window.location.href = loginUrl;
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, loginUser, logout }}>
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
