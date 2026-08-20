import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const UserContext = createContext(null);

export const MASTER_FACULTY_LIST = [
  'School Director',
  'Head of Department (HOD)',
  'Programme Coordinator',
  'Course Coordinator',
];

export const INITIAL_USERS = [
  {
    id: '1',
    name: 'School Director',
    email: 'director@dypiu.ac.in',
    username: 'director',
    role: 'DIRECTOR',
    roleLabel: 'School Director',
    department: 'School of Engineering & Technology',
    designation: 'School Director',
    status: 'ACTIVE',
    phone: '',
  },
  {
    id: '2',
    name: 'Head of Department (HOD)',
    email: 'hod@dypiu.ac.in',
    username: 'hod',
    role: 'HOD',
    roleLabel: 'Head of Department (HOD)',
    department: 'Department of Computer Science & Engineering',
    programme: 'CSE Department',
    designation: 'Head of Department (HOD)',
    status: 'ACTIVE',
    phone: '',
  },
  {
    id: '3',
    name: 'Programme Coordinator',
    email: 'pc@dypiu.ac.in',
    username: 'pc',
    role: 'PROGRAMME_COORDINATOR',
    roleLabel: 'Programme Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    designation: 'Programme Coordinator',
    status: 'ACTIVE',
    phone: '',
  },
  {
    id: '4',
    name: 'Course Coordinator',
    email: 'cc@dypiu.ac.in',
    username: 'cc',
    role: 'FACULTY',
    roleLabel: 'Course Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    designation: 'Course Coordinator',
    status: 'ACTIVE',
    phone: '',
  },
];

export function UserProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [facultyList, setFacultyList] = useState(MASTER_FACULTY_LIST);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        const res = await apiClient.get('/users');
        const list = res?.data || res;
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const mapped = list.map((u) => ({
            id: String(u.id),
            name: u.name || u.username,
            email: u.email,
            role: u.role,
            roleLabel: u.role,
            department: u.department || 'Department of Computer Science & Engineering',
            programme: u.programme || 'B.Tech Computer Science & Engineering',
            designation: u.designation || 'Faculty Member',
            status: u.isActive !== false ? 'ACTIVE' : 'INACTIVE',
            phone: u.phone || '+91 98234 00000',
          }));
          setUsers(mapped);
          const faculties = [...new Set(mapped.map((u) => u.name).filter(Boolean))];
          if (faculties.length > 0) setFacultyList(faculties);
        }
      } catch (err) {
        console.warn('Backend load users warning:', err);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, []);

  const getUser = (idOrEmail) => {
    return users.find((u) => u.id === idOrEmail || u.email.toLowerCase() === (idOrEmail || '').toLowerCase()) || null;
  };

  const getUserByRole = (roleName) => {
    return users.filter((u) => u.role === roleName);
  };

  const getFacultyList = () => {
    return facultyList;
  };

  const getCoordinators = () => {
    return users.filter((u) => u.role === 'PROGRAMME_COORDINATOR' || u.role === 'FACULTY');
  };

  const getHods = () => {
    return users.filter((u) => u.role === 'HOD');
  };

  const getDirectors = () => {
    return users.filter((u) => u.role === 'DIRECTOR');
  };

  const assignRole = async (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    try {
      await apiClient.put(`/users/${userId}`, { role: newRole });
    } catch (err) {
      console.warn('Backend update user role warning:', err);
    }
  };

  const addUser = async (newUser) => {
    const created = {
      id: `usr-${Date.now()}`,
      status: 'ACTIVE',
      ...newUser,
    };
    setUsers((prev) => [...prev, created]);
    if (newUser.name && !facultyList.includes(newUser.name)) {
      setFacultyList((prev) => [...prev, newUser.name]);
    }
    try {
      await apiClient.post('/users', {
        username: newUser.email ? newUser.email.split('@')[0] : `user_${Date.now()}`,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role || 'FACULTY',
        password: 'password123',
      });
    } catch (err) {
      console.warn('Backend add user warning:', err);
    }
  };

  const updateUser = async (userId, updatedFields) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u))
    );
    try {
      await apiClient.put(`/users/${userId}`, updatedFields);
    } catch (err) {
      console.warn('Backend update user warning:', err);
    }
  };

  const deleteUser = async (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (err) {
      console.warn('Backend delete user warning:', err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        facultyList,
        masterFacultyList: facultyList,
        getUser,
        getUserByRole,
        getFacultyList,
        getCoordinators,
        getHods,
        getDirectors,
        assignRole,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
