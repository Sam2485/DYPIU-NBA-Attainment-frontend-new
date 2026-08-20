import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext(null);

export const SIMULATED_ACCOUNTS = {
  'director@gmail.com': {
    id: 1,
    name: 'Dr. R. K. Deshmukh',
    email: 'director@gmail.com',
    role: 'DIRECTOR',
    roleLabel: 'School Director',
    department: 'School of Engineering & Technology',
    programme: 'All Programmes',
    avatar: 'RD',
  },
  'hod@gmail.com': {
    id: 2,
    name: 'Dr. Raj Shaikh',
    email: 'hod@gmail.com',
    hodEmail: 'hod@gmail.com',
    role: 'HOD',
    roleLabel: 'Head of Department (HOD)',
    department: 'Department of Computer Science & Engineering',
    programme: 'CSE Department',
    avatar: 'RS',
  },
  'pc@gmail.com': {
    id: 3,
    name: 'Dr. A. K. Sharma',
    email: 'pc@gmail.com',
    coordinatorEmail: 'pc@gmail.com',
    role: 'PROGRAMME_COORDINATOR',
    roleLabel: 'Programme Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    avatar: 'AS',
  },
  'cc@gmail.com': {
    id: 4,
    name: 'Dr. Raj Shaikh',
    email: 'cc@gmail.com',
    role: 'FACULTY',
    roleLabel: 'Course Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    avatar: 'RS',
  },
};

const EMAIL_ALIASES = {
  'hod@gmail': 'hod@gmail.com',
  'director@gmail': 'director@gmail.com',
  'pc@gmail': 'pc@gmail.com',
  'cc@gmail': 'cc@gmail.com',
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'DIRECTOR': return 'School Director';
    case 'HOD': return 'Head of Department (HOD)';
    case 'PROGRAMME_COORDINATOR': return 'Programme Coordinator';
    case 'FACULTY':
    case 'COURSE_COORDINATOR': return 'Course Coordinator';
    case 'MODULE_COORDINATOR': return 'Module Coordinator';
    case 'ADMIN': return 'System Administrator';
    default: return role || 'Faculty';
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nba_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const savedRole = sessionStorage.getItem('role');
      if (savedRole) return savedRole;
      const savedUser = sessionStorage.getItem('nba_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.role || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => sessionStorage.getItem('authToken') || null);

  useEffect(() => {
    if (user && role) {
      sessionStorage.setItem('nba_user', JSON.stringify({ ...user, role }));
      sessionStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('nba_user');
      sessionStorage.removeItem('role');
    }
  }, [user, role]);

  const login = async (rawEmail, password) => {
    const trimmedEmail = (rawEmail || '').trim();
    const resolvedEmail = EMAIL_ALIASES[trimmedEmail.toLowerCase()] || trimmedEmail;

    if (!resolvedEmail || !password) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    try {
      const res = await apiClient.post('/auth/login', {
        email: resolvedEmail,
        username: resolvedEmail,
        password: password,
      });

      const authData = res?.data || res;
      const accessToken = authData?.accessToken || authData?.token;
      const refreshToken = authData?.refreshToken;
      const backendUser = authData?.user;

      if (!accessToken || !backendUser) {
        return { success: false, error: 'Invalid response from server.' };
      }

      const userRole = backendUser.role || 'FACULTY';
      const userPayload = {
        id: backendUser.id,
        name: backendUser.name || backendUser.username,
        email: backendUser.email || resolvedEmail,
        username: backendUser.username,
        role: userRole,
        roleLabel: getRoleLabel(userRole),
        department: backendUser.department || 'Department of Computer Science & Engineering',
        programme: backendUser.programme || 'B.Tech Computer Science & Engineering',
        schoolId: backendUser.schoolId,
        departmentId: backendUser.departmentId,
        programmeId: backendUser.programmeId,
        avatar: (backendUser.name || 'User')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      };

      sessionStorage.setItem('authToken', accessToken);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('nba_user', JSON.stringify(userPayload));
      sessionStorage.setItem('role', userRole);

      setToken(accessToken);
      setUser(userPayload);
      setRole(userRole);

      let targetPath = '/dashboard';
      if (userRole === 'DIRECTOR') targetPath = '/director/dashboard';
      else if (userRole === 'HOD') targetPath = '/hod/dashboard';
      else if (userRole === 'PROGRAMME_COORDINATOR') targetPath = '/programme-coordinator/dashboard';
      else if (userRole === 'ADMIN') targetPath = '/director/dashboard';
      else targetPath = '/dashboard';

      return {
        success: true,
        user: userPayload,
        role: userRole,
        targetPath,
      };
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Authentication failed. Please check your credentials.';
      return {
        success: false,
        error: errMsg,
      };
    }
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    if (user) {
      setUser((prev) => (prev ? { ...prev, role: newRole, roleLabel: getRoleLabel(newRole) } : null));
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('nba_user');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const isAuthenticated = Boolean(user && role && (token || sessionStorage.getItem('authToken')));

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        logout,
        switchRole,
        isAuthenticated,
        simulatedAccounts: SIMULATED_ACCOUNTS,
      }}
    >
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
