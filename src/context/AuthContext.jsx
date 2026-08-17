import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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

// Aliases for quick typing
const EMAIL_ALIASES = {
  'hod@gmail': 'hod@gmail.com',
  'director@gmail': 'director@gmail.com',
  'pc@gmail': 'pc@gmail.com',
  'cc@gmail': 'cc@gmail.com',
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

  useEffect(() => {
    if (user && role) {
      sessionStorage.setItem('nba_user', JSON.stringify({ ...user, role }));
      sessionStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('nba_user');
      sessionStorage.removeItem('role');
    }
  }, [user, role]);

  const login = (rawEmail, password) => {
    const trimmedEmail = (rawEmail || '').trim().toLowerCase();
    const resolvedEmail = EMAIL_ALIASES[trimmedEmail] || trimmedEmail;

    if (!resolvedEmail || !password) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (password !== '123456') {
      return { success: false, error: 'Invalid password. Simulation password is 123456.' };
    }

    const matchedAccount = SIMULATED_ACCOUNTS[resolvedEmail];
    if (!matchedAccount) {
      return {
        success: false,
        error: 'Unrecognized user account. Use director@gmail.com, hod@gmail.com, pc@gmail.com, or cc@gmail.com.',
      };
    }

    setUser(matchedAccount);
    setRole(matchedAccount.role);

    // Determine target dashboard
    let targetPath = '/dashboard';
    if (matchedAccount.role === 'DIRECTOR') targetPath = '/director/dashboard';
    else if (matchedAccount.role === 'HOD') targetPath = '/hod/dashboard';
    else if (matchedAccount.role === 'PROGRAMME_COORDINATOR') targetPath = '/programme-coordinator/dashboard';
    else targetPath = '/dashboard';

    return {
      success: true,
      user: matchedAccount,
      role: matchedAccount.role,
      targetPath,
    };
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    if (user) {
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    sessionStorage.removeItem('nba_user');
    sessionStorage.removeItem('role');
    window.location.href = '/login';
  };

  const isAuthenticated = Boolean(user && role);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        switchRole,
        logout,
        SIMULATED_ACCOUNTS,
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
