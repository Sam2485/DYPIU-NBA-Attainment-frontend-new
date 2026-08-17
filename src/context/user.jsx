import { createContext, useContext, useState } from 'react';

export const UserContext = createContext(null);

export const MASTER_FACULTY_LIST = [
  'Dr. Raj Shaikh',
  'Prof. XYZ',
  'Prof. Ananya Roy',
  'Dr. Vikram Joshi',
  'Dr. Sameer Khan',
  'Prof. Priya Verma',
  'Dr. A. K. Sharma',
  'Dr. R. K. Deshmukh',
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Dr. R. K. Deshmukh',
    email: 'director@gmail.com',
    role: 'DIRECTOR',
    roleLabel: 'School Director',
    department: 'School of Engineering & Technology',
    designation: 'Director & Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56781',
  },
  {
    id: 'usr-2',
    name: 'Dr. Raj Shaikh',
    email: 'hod@gmail.com',
    role: 'HOD',
    roleLabel: 'Head of Department (HOD)',
    department: 'Department of Computer Science & Engineering',
    designation: 'HOD & Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56782',
  },
  {
    id: 'usr-3',
    name: 'Dr. A. K. Sharma',
    email: 'pc@gmail.com',
    role: 'PROGRAMME_COORDINATOR',
    roleLabel: 'Programme Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    designation: 'Associate Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56783',
  },
  {
    id: 'usr-4',
    name: 'Dr. Raj Shaikh',
    email: 'cc@gmail.com',
    role: 'FACULTY',
    roleLabel: 'Course Coordinator',
    department: 'Department of Computer Science & Engineering',
    programme: 'B.Tech Computer Science & Engineering',
    designation: 'Associate Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56784',
  },
  {
    id: 'usr-5',
    name: 'Prof. Ananya Roy',
    email: 'ananya.roy@dypiu.ac.in',
    role: 'FACULTY',
    roleLabel: 'Course Coordinator',
    department: 'Department of Electronics & Telecommunication',
    designation: 'Assistant Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56785',
  },
  {
    id: 'usr-6',
    name: 'Dr. Vikram Joshi',
    email: 'vikram.joshi@dypiu.ac.in',
    role: 'FACULTY',
    roleLabel: 'Course Coordinator',
    department: 'Department of Computer Science & Engineering',
    designation: 'Associate Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56786',
  },
  {
    id: 'usr-7',
    name: 'Dr. Sameer Khan',
    email: 'sameer.khan@dypiu.ac.in',
    role: 'HOD',
    roleLabel: 'Head of Department (HOD)',
    department: 'Department of Management Studies',
    designation: 'Professor',
    status: 'ACTIVE',
    phone: '+91 98234 56787',
  },
];

export function UserProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [facultyList, setFacultyList] = useState(MASTER_FACULTY_LIST);

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

  const assignRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const addUser = (newUser) => {
    const created = {
      id: `usr-${Date.now()}`,
      status: 'ACTIVE',
      ...newUser,
    };
    setUsers((prev) => [...prev, created]);
    if (newUser.name && !facultyList.includes(newUser.name)) {
      setFacultyList((prev) => [...prev, newUser.name]);
    }
  };

  const updateUser = (userId, updatedFields) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u))
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
