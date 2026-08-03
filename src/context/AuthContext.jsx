import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Dr. Raj Shaikh',
  email: 'raj.shaikh@dypiu.ac.in',
  role: 'SUPER_ADMIN', // Options: 'SUPER_ADMIN', 'HOD', 'FACULTY'
  department: 'Computer Science & Engineering',
  programme: 'B.Tech CSE',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('nba_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [role, setRole] = useState(() => user.role);

  useEffect(() => {
    sessionStorage.setItem('nba_user', JSON.stringify({ ...user, role }));
    sessionStorage.setItem('role', role);
  }, [user, role]);

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const logout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, logout }}>
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
