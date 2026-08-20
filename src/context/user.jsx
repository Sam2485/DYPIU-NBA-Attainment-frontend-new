import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import apiClient from '../api/client';

export const UserContext =
  createContext(null);

/*
 * Backend-authoritative User Context.
 *
 * IMPORTANT:
 * - No dummy users
 * - No hardcoded faculty
 * - No fake IDs
 * - No localStorage
 * - No sessionStorage
 * - No fake department/programme values
 * - No optimistic fake persistence
 *
 * The backend is the source of truth for users.
 *
 * Course Coordinator:
 *   role = FACULTY
 *
 * Course ownership:
 *   course_offerings.course_coordinator_id
 *
 * Do NOT use facultyList as a second ownership mechanism.
 */

/* -------------------------------------------------------------------------- */
/* Role Labels                                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* User Mapper                                                                */
/* -------------------------------------------------------------------------- */

const mapBackendUser = (user) => {
  if (!user) {
    return null;
  }

  const role =
    user.role ??
    null;

  return {
    id:
      user.id != null
        ? String(user.id)
        : null,

    name:
      user.name ??
      user.username ??
      null,

    username:
      user.username ??
      null,

    email:
      user.email ??
      null,

    role,

    roleLabel:
      getRoleLabel(role),

    department:
      user.department ??
      null,

    programme:
      user.programme ??
      null,

    school:
      user.school ??
      null,

    schoolId:
      user.schoolId ??
      user.school_id ??
      null,

    departmentId:
      user.departmentId ??
      user.department_id ??
      null,

    programmeId:
      user.programmeId ??
      user.programme_id ??
      null,

    designation:
      user.designation ??
      null,

    phone:
      user.phone ??
      null,

    status:
      user.isActive === false ||
      user.is_active === false
        ? 'INACTIVE'
        : 'ACTIVE',

    isActive:
      user.isActive ??
      user.is_active ??
      true,

    /*
     * Preserve backend values when they exist.
     */
    ...(user.hodEmail !== undefined
      ? {
          hodEmail:
            user.hodEmail,
        }
      : {}),

    ...(user.coordinatorEmail !== undefined
      ? {
          coordinatorEmail:
            user.coordinatorEmail,
        }
      : {}),
  };
};

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function UserProvider({
  children,
}) {
  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Load Users                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.get(
            '/users'
          );

        const responseData =
          response?.data?.data ??
          response?.data ??
          response;

        /*
         * Backend may return:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * or:
         *
         * {
         *   data: [...]
         * }
         *
         * or:
         *
         * {
         *   users: [...]
         * }
         */

        const list =
          Array.isArray(
            responseData
          )
            ? responseData
            : Array.isArray(
                responseData?.users
              )
            ? responseData.users
            : [];

        if (!mounted) {
          return;
        }

        setUsers(
          list
            .map(mapBackendUser)
            .filter(Boolean)
        );
      } catch (err) {
        console.error(
          'Failed to load users:',
          err
        );

        if (mounted) {
          setUsers([]);

          setError(
            err?.response?.data
              ?.message ??
              err?.response?.data
                ?.error ??
              err?.message ??
              'Failed to load users.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Refresh Users                                                            */
  /* ------------------------------------------------------------------------ */

  const refreshUsers =
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await apiClient.get(
            '/users'
          );

        const responseData =
          response?.data?.data ??
          response?.data ??
          response;

        const list =
          Array.isArray(
            responseData
          )
            ? responseData
            : Array.isArray(
                responseData?.users
              )
            ? responseData.users
            : [];

        const mapped =
          list
            .map(mapBackendUser)
            .filter(Boolean);

        setUsers(mapped);

        return mapped;
      } catch (err) {
        console.error(
          'Failed to refresh users:',
          err
        );

        setError(
          err?.response?.data
            ?.message ??
            err?.response?.data
              ?.error ??
            err?.message ??
            'Failed to refresh users.'
        );

        throw err;
      } finally {
        setLoading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Get User                                                                 */
  /* ------------------------------------------------------------------------ */

  const getUser = (
    idOrEmail
  ) => {
    if (
      idOrEmail === null ||
      idOrEmail === undefined
    ) {
      return null;
    }

    const value =
      String(
        idOrEmail
      ).toLowerCase();

    return (
      users.find(
        (user) =>
          String(
            user.id
          ).toLowerCase() ===
            value ||
          String(
            user.email || ''
          ).toLowerCase() ===
            value ||
          String(
            user.username || ''
          ).toLowerCase() ===
            value
      ) ?? null
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Get Users By Role                                                        */
  /* ------------------------------------------------------------------------ */

  const getUserByRole =
    (roleName) => {
      if (!roleName) {
        return [];
      }

      /*
       * Course Coordinator is represented
       * by FACULTY in the backend.
       *
       * We accept COURSE_COORDINATOR here
       * only as a frontend semantic alias.
       */

      const normalizedRole =
        roleName ===
        'COURSE_COORDINATOR'
          ? 'FACULTY'
          : roleName;

      return users.filter(
        (user) =>
          user.role ===
          normalizedRole
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Get Course Coordinators                                                  */
  /* ------------------------------------------------------------------------ */

  const getCourseCoordinators =
    () => {
      /*
       * IMPORTANT:
       *
       * Course Coordinator = FACULTY.
       *
       * Programme Coordinator is NOT
       * automatically a Course Coordinator.
       */

      return users.filter(
        (user) =>
          user.role ===
          'FACULTY'
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Backward-compatible Faculty Getter                                      */
  /* ------------------------------------------------------------------------ */

  const getFacultyList =
    () => {
      return getCourseCoordinators();
    };

  /* ------------------------------------------------------------------------ */
  /* Coordinators                                                             */
  /* ------------------------------------------------------------------------ */

  const getCoordinators =
    () => {
      return users.filter(
        (user) =>
          user.role ===
            'PROGRAMME_COORDINATOR' ||
          user.role ===
            'FACULTY'
      );
    };

  /* ------------------------------------------------------------------------ */
  /* HODs                                                                     */
  /* ------------------------------------------------------------------------ */

  const getHods =
    () => {
      return users.filter(
        (user) =>
          user.role ===
          'HOD'
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Directors                                                                */
  /* ------------------------------------------------------------------------ */

  const getDirectors =
    () => {
      return users.filter(
        (user) =>
          user.role ===
          'DIRECTOR'
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Assign Role                                                              */
  /* ------------------------------------------------------------------------ */

  const assignRole =
    async (
      userId,
      newRole
    ) => {
      if (!userId) {
        throw new Error(
          'userId is required'
        );
      }

      if (!newRole) {
        throw new Error(
          'newRole is required'
        );
      }

      try {
        const response =
          await apiClient.put(
            `/users/${userId}`,
            {
              role: newRole,
            }
          );

        const backendUser =
          response?.data?.data ??
          response?.data ??
          response;

        /*
         * Prefer the backend response.
         */
        if (
          backendUser &&
          typeof backendUser ===
            'object' &&
          !Array.isArray(
            backendUser
          )
        ) {
          const mapped =
            mapBackendUser(
              backendUser
            );

          if (mapped) {
            setUsers(
              (prev) =>
                prev.map(
                  (user) =>
                    user.id ===
                    String(
                      userId
                    )
                      ? mapped
                      : user
                )
            );

            return mapped;
          }
        }

        /*
         * If the update endpoint doesn't
         * return the user, reload it from
         * the backend.
         */
        await refreshUsers();

        return getUser(
          userId
        );
      } catch (err) {
        console.error(
          'Failed to update user role:',
          err
        );

        throw err;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Add User                                                                 */
  /* ------------------------------------------------------------------------ */

  const addUser =
    async (
      newUser
    ) => {
      if (!newUser) {
        throw new Error(
          'User data is required'
        );
      }

      /*
       * Do not create a frontend ID.
       *
       * Backend generates the actual
       * user identifier.
       */

      const payload = {
        username:
          newUser.username ??
          (
            newUser.email
              ? newUser.email.split(
                  '@'
                )[0]
              : null
          ),

        email:
          newUser.email ??
          null,

        name:
          newUser.name ??
          null,

        role:
          newUser.role ??
          'FACULTY',

        /*
         * Password must be supplied through
         * the actual administrator/user
         * creation workflow.
         *
         * Do not silently create
         * password123.
         */
        ...(newUser.password
          ? {
              password:
                newUser.password,
            }
          : {}),

        ...(newUser.schoolId
          ? {
              schoolId:
                newUser.schoolId,
            }
          : {}),

        ...(newUser.departmentId
          ? {
              departmentId:
                newUser.departmentId,
            }
          : {}),

        ...(newUser.programmeId
          ? {
              programmeId:
                newUser.programmeId,
            }
          : {}),
      };

      try {
        const response =
          await apiClient.post(
            '/users',
            payload
          );

        const responseData =
          response?.data?.data ??
          response?.data ??
          response;

        const createdUser =
          mapBackendUser(
            responseData
          );

        if (createdUser) {
          setUsers(
            (prev) => [
              ...prev,
              createdUser,
            ]
          );

          return createdUser;
        }

        /*
         * If backend does not return
         * the created user, reload.
         */
        await refreshUsers();

        return null;
      } catch (err) {
        console.error(
          'Failed to create user:',
          err
        );

        throw err;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Update User                                                              */
  /* ------------------------------------------------------------------------ */

  const updateUser =
    async (
      userId,
      updatedFields
    ) => {
      if (!userId) {
        throw new Error(
          'userId is required'
        );
      }

      if (!updatedFields) {
        throw new Error(
          'updatedFields are required'
        );
      }

      try {
        const response =
          await apiClient.put(
            `/users/${userId}`,
            updatedFields
          );

        const responseData =
          response?.data?.data ??
          response?.data ??
          response;

        const updatedUser =
          mapBackendUser(
            responseData
          );

        if (updatedUser) {
          setUsers(
            (prev) =>
              prev.map(
                (user) =>
                  user.id ===
                  String(
                    userId
                  )
                    ? updatedUser
                    : user
              )
          );

          return updatedUser;
        }

        await refreshUsers();

        return getUser(
          userId
        );
      } catch (err) {
        console.error(
          'Failed to update user:',
          err
        );

        /*
         * IMPORTANT:
         *
         * Do NOT update frontend state
         * before the backend succeeds.
         *
         * This prevents the UI from
         * showing a successful update when
         * the backend rejected it.
         */
        throw err;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Delete User                                                              */
  /* ------------------------------------------------------------------------ */

  const deleteUser =
    async (
      userId
    ) => {
      if (!userId) {
        throw new Error(
          'userId is required'
        );
      }

      try {
        await apiClient.delete(
          `/users/${userId}`
        );

        /*
         * Only remove from React state
         * after backend deletion succeeds.
         */
        setUsers(
          (prev) =>
            prev.filter(
              (user) =>
                user.id !==
                String(
                  userId
                )
            )
        );

        return true;
      } catch (err) {
        console.error(
          'Failed to delete user:',
          err
        );

        throw err;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Provider                                                                 */
  /* ------------------------------------------------------------------------ */

  return (
    <UserContext.Provider
      value={{
        users,

        loading,

        error,

        /*
         * Backend users only.
         */
        getUser,

        getUserByRole,

        /*
         * Course Coordinator = FACULTY
         */
        getCourseCoordinators,

        /*
         * Backward compatibility for
         * screens that still call getFacultyList.
         */
        getFacultyList,

        getCoordinators,

        getHods,

        getDirectors,

        /*
         * Backend mutations
         */
        assignRole,

        addUser,

        updateUser,

        deleteUser,

        refreshUsers,

        /*
         * Role label helper
         */
        getRoleLabel,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useUser() {
  const context =
    useContext(
      UserContext
    );

  if (!context) {
    throw new Error(
      'useUser must be used within a UserProvider'
    );
  }

  return context;
}