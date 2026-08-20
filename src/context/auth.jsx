import {
  createContext,
  useContext,
  useState,
} from 'react';

import apiClient from '../api/client';

export const AuthContext = createContext(null);

/*
 * Backend-authoritative authentication.
 *
 * IMPORTANT:
 * - No simulated accounts
 * - No email aliases
 * - No hardcoded users
 * - No localStorage
 * - No sessionStorage
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

export function AuthProvider({ children }) {
  /*
   * Authentication state exists only in React memory.
   *
   * No browser storage is used.
   */
  const [user, setUser] = useState(null);

  const [role, setRole] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);

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
      const userRole =
        backendUser.role ??
        null;

      if (!userRole) {
        return {
          success: false,
          error:
            'Authentication response does not contain a user role.',
        };
      }

      const userPayload = {
        id:
          backendUser.id,

        username:
          backendUser.username,

        name:
          backendUser.name ??
          backendUser.username ??
          null,

        email:
          backendUser.email ??
          trimmedEmail,

        role:
          userRole,

        roleLabel:
          getRoleLabel(userRole),

        /*
         * Organisational scope.
         * These remain null when the backend does not provide them.
         */
        schoolId:
          backendUser.schoolId ??
          backendUser.school_id ??
          null,

        departmentId:
          backendUser.departmentId ??
          backendUser.department_id ??
          null,

        programmeId:
          backendUser.programmeId ??
          backendUser.programme_id ??
          null,

        school:
          backendUser.school ??
          null,

        department:
          backendUser.department ??
          null,

        programme:
          backendUser.programme ??
          null,

        isActive:
          backendUser.isActive ??
          backendUser.is_active ??
          true,

        /*
         * Preserve additional backend fields rather than
         * inventing frontend values.
         */
        ...(backendUser.hodEmail !== undefined
          ? {
              hodEmail:
                backendUser.hodEmail,
            }
          : {}),

        ...(backendUser.coordinatorEmail !== undefined
          ? {
              coordinatorEmail:
                backendUser.coordinatorEmail,
            }
          : {}),
      };

      /*
       * Store authentication only in memory.
       *
       * apiClient's interceptor should use the same token
       * from the application's authentication mechanism.
       */
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
            '/director/dashboard';
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

  const logout = async () => {
    try {
      /*
       * Tell backend to invalidate/logout the current session
       * if the backend exposes this endpoint.
       */
      await apiClient.post(
        '/auth/logout'
      );
    } catch (error) {
      /*
       * Even if the server logout request fails,
       * local authentication state must be destroyed.
       */
      console.warn(
        'Backend logout request failed:',
        error
      );
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);

      /*
       * Do not remove localStorage/sessionStorage keys because
       * this implementation does not use browser storage.
       */
      window.location.href =
        '/login';
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