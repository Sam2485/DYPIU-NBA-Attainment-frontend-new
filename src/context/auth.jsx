import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import apiClient, {
  clearApiAuthToken,
  setApiAuthToken,
  setApiTokenRefreshHandler,
} from '../api/client';

export const AuthContext = createContext(null);

/*
 * Backend-authoritative authentication.
 *
 * IMPORTANT:
 * - No simulated accounts
 * - No email aliases
 * - No hardcoded users
 * - No hardcoded department/programme values
 * - No role switching
 *
 * The backend is the source of truth for:
 *   user
 *   role
 *   department
 *   programme
 *   school
 *   permissions
 */

const getRoleLabel = (role) => {
  switch (role) {
    case 'DIRECTOR':
      return 'School Director';

    case 'HOD':
      return 'Head of Department (HOD)';

    case 'PROGRAMME_COORDINATOR':
      return 'Programme Coordinator';

    case 'FACULTY':
    case 'COURSE_COORDINATOR':
      return 'Course Coordinator';

    case 'MODULE_COORDINATOR':
      return 'Module Coordinator';

    case 'ADMIN':
      return 'System Administrator';

    default:
      return role || 'User';
  }
};

const AUTH_SESSION_KEY = 'nba_auth_session';

const toAuthenticatedUser = (backendUser, fallbackEmail = null) => {
  if (!backendUser?.role) {
    return null;
  }

  const role = backendUser.role;

  return {
    id: backendUser.id,
    username: backendUser.username,
    name: backendUser.name ?? backendUser.username ?? null,
    email: backendUser.email ?? fallbackEmail,
    role,
    roleLabel: getRoleLabel(role),
    schoolId: backendUser.schoolId ?? backendUser.school_id ?? null,
    schoolName: backendUser.schoolName ?? backendUser.school_name ?? backendUser.school?.name ?? null,
    departmentId: backendUser.departmentId ?? backendUser.department_id ?? null,
    masterProgrammeId:
      backendUser.masterProgrammeId ??
      backendUser.programmeId ??
      backendUser.programme_id ??
      null,
    school: backendUser.school ?? null,
    department: backendUser.department ?? null,
    programme: backendUser.programme ?? null,
    isActive: backendUser.isActive ?? backendUser.is_active ?? true,
    ...(backendUser.hodEmail !== undefined ? { hodEmail: backendUser.hodEmail } : {}),
    ...(backendUser.coordinatorEmail !== undefined
      ? { coordinatorEmail: backendUser.coordinatorEmail }
      : {}),
  };
};

const readStoredSession = () => {
  try {
    const rawSession = sessionStorage.getItem(AUTH_SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

const persistSession = (accessToken, refreshToken, user) => {
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({ accessToken, refreshToken, user })
  );
};

const clearStoredSession = () => {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [role, setRole] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isRestoringSession, setIsRestoringSession] = useState(true);

  /* -------------------------------------------------------------------- */
  /* Restore session after a browser refresh                              */
  /* -------------------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    const restoreSession = () => {
      const storedSession = readStoredSession();
      const accessToken = storedSession?.accessToken;
      const restoredUser = toAuthenticatedUser(storedSession?.user);

      if (!accessToken || !restoredUser) {
        clearApiAuthToken();
        clearStoredSession();
        if (active) setIsRestoringSession(false);
        return;
      }

      setApiAuthToken(accessToken);

      if (active) {
        setToken(accessToken);
        setUser(restoredUser);
        setRole(restoredUser.role);
        setIsRestoringSession(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  /* -------------------------------------------------------------------- */
  /* Refresh an expired access token without interrupting the session     */
  /* -------------------------------------------------------------------- */

  useEffect(() => {
    const refreshAccessToken = async () => {
      const storedSession = readStoredSession();
      const refreshToken = storedSession?.refreshToken;
      const storedUser = toAuthenticatedUser(storedSession?.user);

      if (!refreshToken || !storedUser) return null;

      // Mark this request so the response interceptor does not recursively
      // attempt to refresh if the refresh token itself is invalid or expired.
      const response = await apiClient.post('/auth/refresh', { refreshToken }, { __skipAuthRefresh: true });
      const authData = response?.data ?? response;
      const nextAccessToken = authData?.accessToken ?? authData?.token ?? null;
      const nextRefreshToken = authData?.refreshToken ?? refreshToken;
      const refreshedUser = toAuthenticatedUser(authData?.user) ?? storedUser;

      if (!nextAccessToken) return null;

      setApiAuthToken(nextAccessToken);
      persistSession(nextAccessToken, nextRefreshToken, refreshedUser);
      setToken(nextAccessToken);
      setUser(refreshedUser);
      setRole(refreshedUser.role);
      return nextAccessToken;
    };

    setApiTokenRefreshHandler(refreshAccessToken);
    return () => setApiTokenRefreshHandler(null);
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearApiAuthToken();
      clearStoredSession();
      setToken(null);
      setUser(null);
      setRole(null);
    };

    window.addEventListener('nba-auth-expired', handleExpiredSession);
    return () => window.removeEventListener('nba-auth-expired', handleExpiredSession);
  }, []);

  /* -------------------------------------------------------------------- */
  /* Login                                                                */
  /* -------------------------------------------------------------------- */

  const login = async (
    email,
    password
  ) => {
    const trimmedEmail =
      (email || '').trim();

    if (!trimmedEmail || !password) {
      return {
        success: false,
        error:
          'Please provide both email and password.',
      };
    }

    setLoading(true);

    try {
      /*
       * Send exactly what the backend authentication API expects.
       *
       * Do not send fake username/email aliases.
       */
      const response =
        await apiClient.post(
          '/auth/login',
          {
            email: trimmedEmail,
            password,
          }
        );

      /*
       * Support the actual backend response envelope:
       *
       * {
       *   accessToken,
       *   refreshToken,
       *   user
       * }
       *
       * or:
       *
       * {
       *   data: {
       *     accessToken,
       *     user
       *   }
       * }
       */
      const authData =
        response?.data?.data ??
        response?.data ??
        response;

      const accessToken =
        authData?.accessToken ??
        authData?.token ??
        null;

      const refreshToken =
        authData?.refreshToken ??
        null;

      const backendUser =
        authData?.user ??
        authData?.userData ??
        null;

      if (!accessToken) {
        return {
          success: false,
          error:
            'Authentication response does not contain an access token.',
        };
      }

      if (!backendUser) {
        return {
          success: false,
          error:
            'Authentication response does not contain user information.',
        };
      }

      /*
       * NEVER manufacture organisational information.
       *
       * These values must come from the backend.
       */
      const userPayload = toAuthenticatedUser(backendUser, trimmedEmail);

      if (!userPayload) {
        return {
          success: false,
          error:
            'Authentication response does not contain a user role.',
        };
      }
      const userRole = userPayload.role;

      /*
       * Keep the bearer token synchronized with the API client and retain the
       * authenticated backend user for this browser tab across refreshes.
       */
      setApiAuthToken(accessToken);
      persistSession(accessToken, refreshToken, userPayload);
      setToken(accessToken);

      setUser(userPayload);

      setRole(userRole);

      /*
       * Determine destination strictly from the authenticated
       * backend role.
       */
      let targetPath;

      switch (userRole) {
        case 'DIRECTOR':
          targetPath =
            '/director/dashboard';
          break;

        case 'HOD':
          targetPath =
            '/hod/dashboard';
          break;

        case 'PROGRAMME_COORDINATOR':
          targetPath =
            '/programme-coordinator/dashboard';
          break;

        case 'FACULTY':
        case 'COURSE_COORDINATOR':
          targetPath =
            '/course-coordinator/dashboard';
          break;

        case 'ADMIN':
          targetPath =
            '/admin/dashboard';
          break;

        default:
          targetPath =
            '/dashboard';
      }

      return {
        success: true,

        user:
          userPayload,

        role:
          userRole,

        accessToken,

        refreshToken,

        targetPath,
      };
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      const errorMessage =
        error?.customMessage ??
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        'Authentication failed. Please check your credentials.';

      /*
       * Do not create a user or role when authentication fails.
       */
      setUser(null);
      setRole(null);
      setToken(null);
      clearApiAuthToken();
      clearStoredSession();

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------- */
  /* Logout                                                               */
  /* -------------------------------------------------------------------- */

  const logout = () => {
    // Start server-side invalidation while the bearer token is still attached,
    // but never let a slow/unavailable backend keep the user signed in here.
    try {
      void apiClient.post('/auth/logout').catch((error) => {
        console.warn('Backend logout request failed:', error);
      });
    } catch (error) {
      console.warn('Backend logout request could not be started:', error);
    } finally {
      // Clear the persisted session before navigating. Without this, a full
      // page reload at /login restores the previous user and appears to make
      // logout do nothing.
      clearApiAuthToken();
      clearStoredSession();
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('admin_user');
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setRole(null);

      const isNba = typeof window !== 'undefined' && window.location.pathname.startsWith('/nba');
      window.location.replace(isNba ? '/nba/login' : '/login');
    }
  };

  /* -------------------------------------------------------------------- */
  /* Authentication State                                                 */
  /* -------------------------------------------------------------------- */

  const isAuthenticated =
    Boolean(
      user &&
      role &&
      token
    );

  /* -------------------------------------------------------------------- */
  /* Provider                                                              */
  /* -------------------------------------------------------------------- */

  return (
    <AuthContext.Provider
      value={{
        user,

        role,

        token,

        loading,

        isRestoringSession,

        login,

        logout,

        isAuthenticated,

        getRoleLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------------------------------------------------- */
/* Hook                                                                   */
/* ---------------------------------------------------------------------- */

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}
