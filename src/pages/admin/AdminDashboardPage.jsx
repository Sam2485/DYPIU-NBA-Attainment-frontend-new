import { useEffect, useState, useMemo } from 'react';
import {
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  Plus,
  Edit2,
  Building2,
  Check,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/user';
import { useAcademic } from '../../context/AcademicContext';

const ROLE_OPTIONS = [
  { value: 'IQAC', label: 'IQAC' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'HOD', label: 'HOD' },
  { value: 'PROGRAMME_COORDINATOR', label: 'Programme Coordinator' },
  { value: 'FACULTY', label: 'Faculty' },
];

const surface = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
};

const fieldStyle = {
  width: '100%',
  height: 39,
  border: '1px solid #cbd5e1',
  borderRadius: 7,
  padding: '0 10px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: 13,
  color: '#0f172a',
};

const normalizeRole = (role) => (role === 'COURSE_COORDINATOR' ? 'FACULTY' : role);

const userRoles = (member) => {
  const list = [];
  if (member?.role) list.push(member.role);
  if (Array.isArray(member?.roles)) list.push(...member.roles);
  if (Array.isArray(member?.assignments)) {
    member.assignments.forEach((a) => {
      if (a?.role) list.push(a.role);
    });
  }
  return [...new Set(list.filter(Boolean).map(normalizeRole))];
};

function Modal({ title, onClose, maxWidth = 560, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15,23,42,.45)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          ...surface,
          boxShadow: '0 24px 60px rgba(15,23,42,.22)',
        }}
      >
        <header
          style={{
            padding: '17px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            background: '#fff',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px',
          }}
        >
          <strong style={{ color: '#0f172a', fontSize: 16 }}>{title}</strong>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </header>
        <div style={{ overflowY: 'auto', padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const {
    users = [],
    refreshUsers = () => Promise.resolve([]),
    addUser = () => Promise.resolve(null),
    updateUser = () => Promise.resolve(null),
    deleteUser = () => Promise.resolve(null),
    getUserAssignments = () => Promise.resolve([]),
    addAssignment = () => Promise.resolve(null),
    updateAssignment = () => Promise.resolve(null),
    removeAssignment = () => Promise.resolve(null),
  } = useUser();

  const {
    schools = [],
    loadSchools = () => Promise.resolve([]),
  } = useAcademic();

  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Edit Access Modal state
  const [showEditAccessModal, setShowEditAccessModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    role: 'FACULTY',
    schoolId: '',
    departmentId: null,
    masterProgrammeId: null,
  });
  const [editAccessStagedRows, setEditAccessStagedRows] = useState([]);
  const [editAccessCurrent, setEditAccessCurrent] = useState({
    schoolId: '',
    roles: ['FACULTY'],
  });

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [addAssignmentRows, setAddAssignmentRows] = useState([]);
  const [currentAddAssignment, setCurrentAddAssignment] = useState({
    schoolId: '',
    roles: ['FACULTY'],
  });
  const [existingUserFound, setExistingUserFound] = useState(null);

  useEffect(() => {
    Promise.all([refreshUsers(), loadSchools()]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schoolName = (schoolId) =>
    schools.find((school) => (school.id ?? school.schoolId) === schoolId)?.name || '—';

  // ---------------------------------------------------------------------------
  // Dynamic department and programme loaders for assignment forms
  // ---------------------------------------------------------------------------
  const handleAssignmentSchoolChange = (targetSchoolId) => {
    setAssignmentForm((prev) => ({
      ...prev,
      schoolId: targetSchoolId,
      departmentId: null,
      masterProgrammeId: null,
    }));
  };

  // ---------------------------------------------------------------------------
  // Edit Access Workflow
  // ---------------------------------------------------------------------------
  const openEditAccess = async (target) => {
    setEditingUser(target);
    setIsAddingAssignment(false);
    setEditingAssignment(null);
    setEditAccessStagedRows([]);
    setEditAccessCurrent({
      schoolId: '',
      roles: ['FACULTY'],
    });
    setError('');
    setShowEditAccessModal(true);

    const targetUserId = target?.id ?? target?.userId;
    if (targetUserId) {
      try {
        const fresh = await getUserAssignments(targetUserId);
        if (Array.isArray(fresh)) {
          setEditingUser((prev) => {
            if (!prev) return prev;
            const prevId = prev.id ?? prev.userId;
            if (String(prevId) === String(targetUserId)) {
              return { ...prev, assignments: fresh };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to load user assignments on open:', err);
      }
    }
  };

  const startAddAssignment = () => {
    setEditingAssignment(null);
    setEditAccessStagedRows([]);
    setEditAccessCurrent({
      schoolId: '',
      roles: ['FACULTY'],
    });
    setAssignmentForm({
      role: 'FACULTY',
      schoolId: schools[0]?.id ?? schools[0]?.schoolId ?? '',
      departmentId: null,
      masterProgrammeId: null,
    });
    setFormDepartments([]);
    setFormProgrammes([]);
    setIsAddingAssignment(true);
    setError('');
  };

  const toggleEditAccessRole = (roleValue) => {
    setEditAccessCurrent((prev) => {
      const current = prev.roles || [];
      const next = current.includes(roleValue)
        ? current.filter((r) => r !== roleValue)
        : [...current, roleValue];
      return { ...prev, roles: next };
    });
  };

  const addStagedEditAccessRows = () => {
    const selectedSchoolId = editAccessCurrent.schoolId;
    const selectedRoles = editAccessCurrent.roles || [];

    if (!selectedRoles || selectedRoles.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    const isInstitutionOnly = selectedSchoolId === 'INSTITUTION' || (selectedRoles.length === 1 && selectedRoles[0] === 'IQAC');

    if (!selectedSchoolId && !isInstitutionOnly) {
      setError('Please select a school for the chosen role(s).');
      return;
    }

    if (selectedSchoolId === 'INSTITUTION' && selectedRoles.some((r) => r !== 'IQAC')) {
      setError('Institution-wide scope is only valid for IQAC. For other roles, please select a school or "All Schools".');
      return;
    }

    const newItems = [];
    const existingUserAssignments = editingUser?.assignments || [];

    const pushUnique = (role, sId, sName) => {
      const alreadyInUser = existingUserAssignments.some(
        (a) => a.role === role && (sId ? String(a.schoolId) === String(sId) : (a.schoolId === null || a.schoolId === ''))
      );
      const alreadyInStaged = editAccessStagedRows.some(
        (r) => r.role === role && (sId ? String(r.schoolId) === String(sId) : (r.schoolId === null || r.schoolId === ''))
      );
      const alreadyInNew = newItems.some(
        (r) => r.role === role && (sId ? String(r.schoolId) === String(sId) : (r.schoolId === null || r.schoolId === ''))
      );

      if (alreadyInUser) return;
      if (!alreadyInStaged && !alreadyInNew) {
        newItems.push({
          role,
          schoolId: sId,
          schoolName: sName,
          departmentId: null,
          masterProgrammeId: null,
        });
      }
    };

    if (selectedSchoolId === 'ALL_SCHOOLS') {
      if (schools.length === 0) {
        setError('No schools available.');
        return;
      }
      for (const s of schools) {
        const sId = s.id ?? s.schoolId;
        for (const role of selectedRoles) {
          if (role === 'IQAC') {
            pushUnique('IQAC', null, 'Institution-wide');
          } else {
            pushUnique(role, sId, schoolName(sId));
          }
        }
      }
    } else if (selectedSchoolId === 'INSTITUTION') {
      for (const role of selectedRoles) {
        if (role === 'IQAC') {
          pushUnique('IQAC', null, 'Institution-wide');
        }
      }
    } else {
      for (const role of selectedRoles) {
        if (role === 'IQAC') {
          pushUnique('IQAC', null, 'Institution-wide');
        } else {
          pushUnique(role, selectedSchoolId, schoolName(selectedSchoolId));
        }
      }
    }

    if (newItems.length === 0) {
      setError('The selected role(s) and school are already assigned to this user or in the list.');
      return;
    }

    setEditAccessStagedRows((prev) => [...prev, ...newItems]);
    setEditAccessCurrent((prev) => ({ ...prev, roles: [] }));
    setError('');
  };

  const removeStagedEditAccessRow = (index) => {
    setEditAccessStagedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditAssignment = (assignment) => {
    setIsAddingAssignment(false);
    setEditingAssignment(assignment);
    const initialRole = assignment.role || 'FACULTY';
    setAssignmentForm({
      role: initialRole,
      schoolId: assignment.schoolId || (schools[0]?.id ?? schools[0]?.schoolId ?? ''),
      departmentId: null,
      masterProgrammeId: null,
    });
    setFormDepartments([]);
    setFormProgrammes([]);
  };

  const saveAssignmentAction = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const targetUserId = editingUser.id ?? editingUser.userId;
    if (!targetUserId) return;

    if (editingAssignment) {
      if (assignmentForm.role !== 'IQAC' && !assignmentForm.schoolId) {
        setError('School is required for this role assignment.');
        return;
      }

      setSaving(true);
      setError('');
      try {
        const targetSchoolName = assignmentForm.role === 'IQAC' ? 'Institution-wide' : schoolName(assignmentForm.schoolId);
        const payload = {
          role: assignmentForm.role,
          schoolId: assignmentForm.role === 'IQAC' ? null : (assignmentForm.schoolId || null),
          schoolName: targetSchoolName,
          departmentId: null,
          masterProgrammeId: null,
        };

        await updateAssignment(targetUserId, editingAssignment.id, payload);
        const freshAssignments = await getUserAssignments(targetUserId);
        if (Array.isArray(freshAssignments)) {
          setEditingUser((prev) => (prev ? { ...prev, assignments: freshAssignments } : prev));
        }
        const refreshed = await refreshUsers();
        const updatedUser = refreshed?.find?.((u) => String(u.id ?? u.userId) === String(targetUserId));
        if (updatedUser) {
          setEditingUser((prev) => ({
            ...updatedUser,
            assignments: Array.isArray(freshAssignments) && freshAssignments.length > 0 ? freshAssignments : (updatedUser.assignments || []),
          }));
        }
        setIsAddingAssignment(false);
        setEditingAssignment(null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to update assignment.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Adding multiple organizational access assignments
    let itemsToSave = [...editAccessStagedRows];

    if (itemsToSave.length === 0) {
      const selectedSchoolId = editAccessCurrent.schoolId;
      const selectedRoles = editAccessCurrent.roles || [];

      if (!selectedRoles || selectedRoles.length === 0) {
        setError('Please configure and add at least one role & school assignment.');
        return;
      }

      const isInstitutionOnly = selectedSchoolId === 'INSTITUTION' || (selectedRoles.length === 1 && selectedRoles[0] === 'IQAC');
      if (!selectedSchoolId && !isInstitutionOnly) {
        setError('Please select a school for the chosen role(s).');
        return;
      }

      if (selectedSchoolId === 'INSTITUTION' && selectedRoles.some((r) => r !== 'IQAC')) {
        setError('Institution-wide scope is only valid for IQAC. For other roles, please select a school or "All Schools".');
        return;
      }

      if (selectedSchoolId === 'ALL_SCHOOLS') {
        for (const s of schools) {
          const sId = s.id ?? s.schoolId;
          for (const role of selectedRoles) {
            itemsToSave.push({
              role: role === 'IQAC' ? 'IQAC' : role,
              schoolId: role === 'IQAC' ? null : sId,
              schoolName: role === 'IQAC' ? 'Institution-wide' : schoolName(sId),
              departmentId: null,
              masterProgrammeId: null,
            });
          }
        }
      } else if (selectedSchoolId === 'INSTITUTION') {
        for (const role of selectedRoles) {
          if (role === 'IQAC') {
            itemsToSave.push({
              role: 'IQAC',
              schoolId: null,
              schoolName: 'Institution-wide',
              departmentId: null,
              masterProgrammeId: null,
            });
          }
        }
      } else {
        for (const role of selectedRoles) {
          itemsToSave.push({
            role: role === 'IQAC' ? 'IQAC' : role,
            schoolId: role === 'IQAC' ? null : selectedSchoolId,
            schoolName: role === 'IQAC' ? 'Institution-wide' : schoolName(selectedSchoolId),
            departmentId: null,
            masterProgrammeId: null,
          });
        }
      }
    }

    if (itemsToSave.length === 0) {
      setError('Please configure at least one role and school assignment.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      for (const item of itemsToSave) {
        await addAssignment(targetUserId, {
          role: item.role,
          schoolId: item.schoolId,
          schoolName: item.schoolName,
          departmentId: null,
          masterProgrammeId: null,
        });
      }

      const freshAssignments = await getUserAssignments(targetUserId);
      if (Array.isArray(freshAssignments)) {
        setEditingUser((prev) => (prev ? { ...prev, assignments: freshAssignments } : prev));
      }

      const refreshed = await refreshUsers();
      const updatedUser = refreshed?.find?.((u) => String(u.id ?? u.userId) === String(targetUserId));
      if (updatedUser) {
        setEditingUser((prev) => ({
          ...updatedUser,
          assignments: Array.isArray(freshAssignments) && freshAssignments.length > 0 ? freshAssignments : (updatedUser.assignments || []),
        }));
      }
      setIsAddingAssignment(false);
      setEditingAssignment(null);
      setEditAccessStagedRows([]);
      setEditAccessCurrent({
        schoolId: '',
        roles: ['FACULTY'],
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save organizational access assignment(s).');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignmentAction = async (assignment) => {
    if (!editingUser || !assignment?.id) return;
    const targetUserId = editingUser.id ?? editingUser.userId;
    if (!window.confirm('Remove this organizational assignment? The user identity will remain active.')) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await removeAssignment(targetUserId, assignment.id);
      const freshAssignments = await getUserAssignments(targetUserId);
      if (Array.isArray(freshAssignments)) {
        setEditingUser((prev) => (prev ? { ...prev, assignments: freshAssignments } : prev));
      }
      const refreshed = await refreshUsers();
      const updatedUser = refreshed?.find?.((u) => String(u.id ?? u.userId) === String(targetUserId));
      if (updatedUser) {
        setEditingUser((prev) => ({
          ...updatedUser,
          assignments: Array.isArray(freshAssignments) ? freshAssignments : (updatedUser.assignments || []),
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to remove assignment.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Add User Workflow (with Existing User Detection & Multi-School Support)
  // ---------------------------------------------------------------------------
  const openAddUser = () => {
    setAddUserForm({ name: '', email: '', password: '' });
    setAddAssignmentRows([]);
    setCurrentAddAssignment({
      schoolId: '',
      roles: ['FACULTY'],
    });
    setExistingUserFound(null);
    setError('');
    setShowAddUserModal(true);
  };

  const handleEmailChange = (newEmail) => {
    setAddUserForm((prev) => ({ ...prev, email: newEmail }));
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setExistingUserFound(null);
      return;
    }
    const matched = users.find((u) => u.email?.trim().toLowerCase() === trimmed);
    setExistingUserFound(matched || null);
  };

  const toggleRoleSelect = (roleValue) => {
    setCurrentAddAssignment((prev) => {
      const current = prev.roles || [];
      const next = current.includes(roleValue)
        ? current.filter((r) => r !== roleValue)
        : [...current, roleValue];
      return { ...prev, roles: next };
    });
  };

  const addAssignmentToNewUser = () => {
    const selectedSchoolId = currentAddAssignment.schoolId;
    const selectedRoles = currentAddAssignment.roles || [];

    if (!selectedRoles || selectedRoles.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    const isInstitutionOnly = selectedSchoolId === 'INSTITUTION' || (selectedRoles.length === 1 && selectedRoles[0] === 'IQAC');

    if (!selectedSchoolId && !isInstitutionOnly) {
      setError('Please select a school for the chosen role(s).');
      return;
    }

    const newItems = [];

    const pushUniqueAssignment = (role, sId, sName) => {
      const alreadyInList = addAssignmentRows.some(
        (r) => r.role === role && (sId ? String(r.schoolId) === String(sId) : (r.schoolId === null || r.schoolId === ''))
      );
      const alreadyInNew = newItems.some(
        (r) => r.role === role && (sId ? String(r.schoolId) === String(sId) : (r.schoolId === null || r.schoolId === ''))
      );
      if (!alreadyInList && !alreadyInNew) {
        newItems.push({
          role,
          schoolId: sId,
          schoolName: sName,
          departmentId: null,
          masterProgrammeId: null,
        });
      }
    };

    if (selectedSchoolId === 'ALL_SCHOOLS') {
      if (schools.length === 0) {
        setError('No schools available.');
        return;
      }
      for (const s of schools) {
        const sId = s.id ?? s.schoolId;
        for (const role of selectedRoles) {
          if (role === 'IQAC') {
            pushUniqueAssignment('IQAC', null, 'Institution-wide');
          } else {
            pushUniqueAssignment(role, sId, schoolName(sId));
          }
        }
      }
    } else if (selectedSchoolId === 'INSTITUTION') {
      for (const role of selectedRoles) {
        pushUniqueAssignment(role, null, 'Institution-wide');
      }
    } else {
      for (const role of selectedRoles) {
        if (role === 'IQAC') {
          pushUniqueAssignment('IQAC', null, 'Institution-wide');
        } else {
          pushUniqueAssignment(role, selectedSchoolId, schoolName(selectedSchoolId));
        }
      }
    }

    if (newItems.length === 0) {
      setError('The selected role and school assignment(s) are already in the list.');
      return;
    }

    setAddAssignmentRows((prev) => [...prev, ...newItems]);
    setCurrentAddAssignment((prev) => ({ ...prev, roles: [] }));
    setError('');
  };

  const removeAssignmentFromNewUser = (index) => {
    setAddAssignmentRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAddUser = async (e) => {
    e.preventDefault();
    setError('');

    // If existing user was found, extend organizational access
    if (existingUserFound) {
      if (addAssignmentRows.length === 0) {
        setError('Please configure and add at least one role & school assignment to extend access.');
        return;
      }
      setSaving(true);
      try {
        const targetUserId = existingUserFound.id ?? existingUserFound.userId;
        for (const row of addAssignmentRows) {
          await addAssignment(targetUserId, {
            role: row.role,
            schoolId: row.schoolId,
            schoolName: row.schoolName || schoolName(row.schoolId),
            departmentId: null,
            masterProgrammeId: null,
          });
        }
        await refreshUsers();
        setShowAddUserModal(false);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to extend user access.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Creating a brand new user
    if (!addUserForm.name.trim() || !addUserForm.email.trim() || !addUserForm.password.trim()) {
      setError('Name, email, and password are required for a new user.');
      return;
    }
    if (addAssignmentRows.length === 0) {
      setError('Please add at least one role and school assignment for the new user.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: addUserForm.name.trim(),
        username: addUserForm.email.trim(),
        email: addUserForm.email.trim(),
        password: addUserForm.password.trim(),
        assignments: addAssignmentRows.map((r) => ({
          role: r.role,
          schoolId: r.schoolId,
          schoolName: r.schoolName || schoolName(r.schoolId),
          departmentId: null,
          masterProgrammeId: null,
        })),
        roles: [...new Set(addAssignmentRows.map((r) => r.role))],
        schools: [...new Set(addAssignmentRows.map((r) => r.schoolId).filter(Boolean))],
        schoolIds: [...new Set(addAssignmentRows.map((r) => r.schoolId).filter(Boolean))],
        role: addAssignmentRows[0]?.role || 'FACULTY',
        schoolId: addAssignmentRows[0]?.schoolId || null,
        departmentId: null,
        masterProgrammeId: null,
      };

      await addUser(payload);
      await refreshUsers();
      setShowAddUserModal(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // User Deletion (Identity Level)
  // ---------------------------------------------------------------------------
  const handleDeleteUser = async (targetUser) => {
    const targetUserId = targetUser?.id ?? targetUser?.userId;
    if (!targetUserId) return;
    const targetName = targetUser.name || targetUser.username || targetUser.email || 'this user';
    if (!window.confirm(`Permanently delete ${targetName}? This action cannot be undone.`)) return;

    setDeletingUserId(targetUserId);
    setError('');
    try {
      await deleteUser(targetUserId);
      await refreshUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getUserId = (member) => member?.id ?? member?.userId ?? null;
  const isDeletingUser = (member) => {
    const memberId = getUserId(member);
    return deletingUserId != null && memberId != null && String(deletingUserId) === String(memberId);
  };

  // ---------------------------------------------------------------------------
  // Statistics and Filters
  // ---------------------------------------------------------------------------
  const roleMatches = (member, role) => role === 'ALL' || userRoles(member).includes(role);

  const activeUsers = useMemo(
    () => users.filter((m) => m.isActive !== false && m.status !== 'INACTIVE'),
    [users]
  );

  const roleTabs = [
    { id: 'ALL', label: 'All Users', count: activeUsers.length },
    { id: 'IQAC', label: 'IQAC', count: activeUsers.filter((m) => userRoles(m).includes('IQAC')).length },
    { id: 'DIRECTOR', label: 'Directors', count: activeUsers.filter((m) => userRoles(m).includes('DIRECTOR')).length },
    { id: 'HOD', label: 'HODs', count: activeUsers.filter((m) => userRoles(m).includes('HOD')).length },
    {
      id: 'PROGRAMME_COORDINATOR',
      label: 'Programme Coordinators',
      count: activeUsers.filter((m) => userRoles(m).includes('PROGRAMME_COORDINATOR')).length,
    },
    { id: 'FACULTY', label: 'Faculty', count: activeUsers.filter((m) => userRoles(m).includes('FACULTY')).length },
  ];

  const filteredUsers = activeUsers.filter((member) => {
    if (!roleMatches(member, selectedRole)) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const searchableValues = [
      member.name,
      member.username,
      member.email,
      ...userRoles(member),
      schoolName(member.schoolId),
    ];

    if (Array.isArray(member.assignments)) {
      member.assignments.forEach((a) => {
        if (a.role) searchableValues.push(a.role, normalizeRole(a.role));
        if (a.schoolName) searchableValues.push(a.schoolName);
        if (a.schoolId) searchableValues.push(schoolName(a.schoolId));
        if (a.departmentName) searchableValues.push(a.departmentName);
        if (a.masterProgrammeName) searchableValues.push(a.masterProgrammeName);
      });
    }

    return searchableValues.some((value) => String(value ?? '').toLowerCase().includes(query));
  });

  // Grouped assignments for Edit Access Modal
  const groupedAssignments = useMemo(() => {
    const groups = {};
    const list = editingUser?.assignments || [];
    list.forEach((a) => {
      const sId = a.schoolId || '__institution__';
      const sName = a.schoolName || (a.schoolId ? schoolName(a.schoolId) : 'Institution-wide');
      if (!groups[sId]) groups[sId] = { schoolId: a.schoolId, schoolName: sName, items: [] };
      groups[sId].items.push(a);
    });
    return Object.values(groups);
  }, [editingUser?.assignments, schools]);

  // ---------------------------------------------------------------------------
  // Render Compact School Summary in Table (Requirement 3 & 14)
  // ---------------------------------------------------------------------------
  const renderSchoolSummary = (member) => {
    const assignedSchools = [];

    if (Array.isArray(member?.assignments) && member.assignments.length > 0) {
      member.assignments.forEach((a) => {
        const sName = a.schoolName || schoolName(a.schoolId);
        if (sName && sName !== '—' && !assignedSchools.includes(sName)) {
          assignedSchools.push(sName);
        }
      });
    } else if (member?.schoolId) {
      const sName = schoolName(member.schoolId);
      if (sName && sName !== '—') {
        assignedSchools.push(sName);
      }
    }

    if (assignedSchools.length === 0) {
      return <span style={{ color: '#64748b' }}>—</span>;
    }

    if (assignedSchools.length === 1) {
      return <span style={{ color: '#334155', fontWeight: 600 }}>{assignedSchools[0]}</span>;
    }

    const firstTwo = assignedSchools.slice(0, 2);
    const remaining = assignedSchools.length - 2;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {firstTwo.map((name) => (
          <span key={name} style={{ color: '#334155', fontSize: 13, lineHeight: '18px', fontWeight: 600 }}>
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span style={{ color: '#4f46e5', fontSize: 11.5, fontWeight: 800 }}>+{remaining} more</span>
        )}
      </div>
    );
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '32px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            ...surface,
            padding: '22px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ color: '#4f46e5', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              System Administration
            </div>
            <h1 style={{ margin: '5px 0 0', color: '#0f172a', fontSize: 24, fontWeight: 800 }}>User Management</h1>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>
              Manage institutional users, credentials, and their multi-school organizational assignments.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              height: 38,
              padding: '0 13px',
              background: '#fff',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </header>

        {error && (
          <div
            style={{
              marginTop: 16,
              color: '#b91c1c',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Section: Institutional Users */}
        <section style={{ ...surface, marginTop: 20, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 750 }}>
                <Users size={17} style={{ color: '#4f46e5' }} /> Institutional Users
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Add users with single or multi-school assignments, or manage their organizational access.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={openAddUser}
                style={{
                  height: 38,
                  padding: '0 14px',
                  background: '#4f46e5',
                  border: 0,
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={14} /> Add User
              </button>
            </div>
          </div>

          {/* Role Statistic Cards (Requirement 4) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 8,
              marginTop: 18,
            }}
          >
            {roleTabs.map((tab) => {
              const active = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id)}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 9,
                    border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
                    background: active ? '#eef2ff' : '#fff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all .15s ease',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: active ? '#4f46e5' : '#64748b',
                    }}
                  >
                    {tab.label}
                  </span>
                  <strong style={{ display: 'block', marginTop: 3, fontSize: 22, fontWeight: 800 }}>
                    {tab.count}
                  </strong>
                </button>
              );
            })}
          </div>

          {/* Search bar (Requirement 5) */}
          <div style={{ position: 'relative', marginTop: 14 }}>
            <Search size={16} style={{ position: 'absolute', left: 11, top: 11, color: '#64748b' }} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, email, username, role, or school"
              style={{ ...fieldStyle, paddingLeft: 36 }}
            />
          </div>

          {/* Table (Requirement 3: Name, Email, Roles, School, Action) */}
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Name</th>
                  <th style={{ width: '25%' }}>Email</th>
                  <th style={{ width: '22%' }}>Roles</th>
                  <th style={{ width: '20%' }}>School</th>
                  <th style={{ textAlign: 'right', width: '11%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                      No users match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((member) => (
                    <tr key={getUserId(member) ?? member.email}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {member.name || member.username || '—'}
                      </td>
                      <td style={{ color: '#475569' }}>{member.email || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {userRoles(member).map((memberRole) => (
                            <span
                              key={memberRole}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                color: '#4338ca',
                                background: '#eef2ff',
                                borderRadius: 5,
                                padding: '3px 6px',
                              }}
                            >
                              {ROLE_OPTIONS.find((option) => option.value === memberRole)?.label || memberRole}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{renderSchoolSummary(member)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => openEditAccess(member)}
                            style={{
                              color: '#2563eb',
                              background: '#fff',
                              border: '1px solid #93c5fd',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Edit access
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(member)}
                            disabled={isDeletingUser(member)}
                            style={{
                              color: '#b91c1c',
                              background: '#fff',
                              border: '1px solid #fecaca',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              cursor: isDeletingUser(member) ? 'wait' : 'pointer',
                              opacity: isDeletingUser(member) ? 0.65 : 1,
                              fontSize: 12,
                            }}
                          >
                            <Trash2 size={13} />
                            {isDeletingUser(member) ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* EDIT ACCESS MODAL (Requirements 6, 7, 11, 12, 13)                      */}
      {/* ---------------------------------------------------------------------- */}
      {showEditAccessModal && editingUser && (
        <Modal
          title={`Edit access — ${editingUser.name || editingUser.email}`}
          onClose={() => {
            setShowEditAccessModal(false);
            setEditingAssignment(null);
            setEditAccessStagedRows([]);
            setError('');
          }}
          maxWidth={620}
        >
          <form onSubmit={saveAssignmentAction} style={{ display: 'grid', gap: 14 }}>
            {error && (
              <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 12.5 }}>
                {error}
              </div>
            )}

            {/* User identity */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '.04em' }}>
                User Identity
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                {editingUser.name || editingUser.username}
              </div>
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 1 }}>{editingUser.email}</div>
            </div>

            {/* Current Active Organizational Access */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#0f172a', fontSize: 13.5 }}>Current Organizational Access</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                  Assignments grouped by school. Each assignment has independent scope.
                </p>
              </div>

              {groupedAssignments.length === 0 ? (
                <div style={{ padding: 18, textAlign: 'center', background: '#f8fafc', borderRadius: 9, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: 12.5 }}>
                  No active organizational assignments for this user.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {groupedAssignments.map((group) => (
                    <div
                      key={group.schoolName}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                    >
                      <div
                        style={{
                          padding: '9px 13px',
                          background: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                        }}
                      >
                        <Building2 size={14} style={{ color: '#4f46e5' }} />
                        {group.schoolName}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {group.items.map((assignment) => (
                          <div
                            key={assignment.id}
                            style={{
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottom: '1px solid #f1f5f9',
                              gap: 12,
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 800,
                                    color: '#3730a3',
                                    background: '#e0e7ff',
                                    borderRadius: 4,
                                    padding: '2px 6px',
                                  }}
                                >
                                  {ROLE_OPTIONS.find((o) => o.value === assignment.role)?.label || assignment.role}
                                </span>
                                {assignment.departmentName && (
                                  <span style={{ fontSize: 12.5, fontWeight: 650, color: '#334155' }}>
                                    — {assignment.departmentName}
                                  </span>
                                )}
                                {assignment.masterProgrammeName && (
                                  <span style={{ fontSize: 12, color: '#64748b' }}>
                                    ({assignment.masterProgrammeName})
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => startEditAssignment(assignment)}
                                style={{
                                  height: 28,
                                  padding: '0 8px',
                                  background: '#fff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: 6,
                                  fontWeight: 750,
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAssignmentAction(assignment)}
                                disabled={saving}
                                style={{
                                  height: 28,
                                  padding: '0 8px',
                                  background: '#fff',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  borderRadius: 6,
                                  fontWeight: 750,
                                  fontSize: 11.5,
                                  cursor: 'pointer',
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Single Assignment Form (if editing an existing item) */}
            {editingAssignment && (
              <div
                style={{
                  border: '1.5px solid #818cf8',
                  borderRadius: 9,
                  padding: 14,
                  background: '#f8fafc',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1e293b' }}>
                    Edit Assignment
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAssignment(null)}
                    style={{ border: 0, background: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                  >
                    Cancel
                  </button>
                </div>

                {assignmentForm.role !== 'IQAC' ? (
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                    School *
                    <select
                      value={assignmentForm.schoolId}
                      onChange={(e) => handleAssignmentSchoolChange(e.target.value)}
                      style={{ ...fieldStyle, height: 36, marginTop: 3 }}
                    >
                      <option value="">Select School</option>
                      {schools.map((s) => (
                        <option key={s.id ?? s.schoolId} value={s.id ?? s.schoolId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, color: '#1e40af' }}>
                    IQAC role operates institution-wide across all schools.
                  </div>
                )}

                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  Role *
                  <select
                    value={assignmentForm.role}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, role: e.target.value })}
                    style={{ ...fieldStyle, height: 36, marginTop: 3 }}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* Organizational Assignments to Add (Exact same UI as Add User modal!) */}
            {!editingAssignment && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  Organizational Assignments to Add
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>
                  Configure role and organizational scope. Multi-school or multiple roles are supported.
                </p>

                {editAccessStagedRows.length > 0 && (
                  <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                    {editAccessStagedRows.map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 11px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 7,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, color: '#4338ca', background: '#eef2ff', padding: '2px 7px', borderRadius: 4 }}>
                            {ROLE_OPTIONS.find((o) => o.value === row.role)?.label || row.role}
                          </span>
                          <strong style={{ color: '#0f172a' }}>{row.schoolName}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStagedEditAccessRow(idx)}
                          style={{ border: 0, background: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assignment Form Section: SCHOOL SELECTOR FIRST, THEN ROLE MULTIPLE SELECTOR */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 9, padding: 12, display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 750, color: '#1e293b' }}>
                    + Configure School & Role(s)
                  </div>

                  {/* 1. School Selector First */}
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                    School *
                    <select
                      value={editAccessCurrent.schoolId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setEditAccessCurrent((prev) => ({
                          ...prev,
                          schoolId: sId,
                          roles: sId === 'INSTITUTION' ? ['IQAC'] : (prev.roles && prev.roles.length > 0 ? prev.roles : ['FACULTY']),
                        }));
                      }}
                      style={{ ...fieldStyle, height: 36, marginTop: 3 }}
                    >
                      <option value="">-- Select a School --</option>
                      <option value="ALL_SCHOOLS">All Schools (Apply across all schools)</option>
                      <option value="INSTITUTION">Institution-wide (IQAC)</option>
                      {schools.map((s) => {
                        const sId = s.id ?? s.schoolId;
                        return (
                          <option key={sId} value={sId}>
                            {s.name} {s.code ? `(${s.code})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  {/* 2. Role Multiple Selector Second */}
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Role(s) * (Select one or more)</span>
                      {editAccessCurrent.roles && editAccessCurrent.roles.length > 0 && (
                        <span style={{ fontSize: 11, color: '#4338ca', fontWeight: 700 }}>
                          {editAccessCurrent.roles.length} selected
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 6 }}>
                      {ROLE_OPTIONS.map((opt) => {
                        const isInstitution = editAccessCurrent.schoolId === 'INSTITUTION';
                        const disabled = isInstitution && opt.value !== 'IQAC';
                        const checked = (editAccessCurrent.roles || []).includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '6px 9px',
                              border: `1px solid ${checked ? '#6366f1' : '#cbd5e1'}`,
                              background: disabled ? '#f1f5f9' : (checked ? '#eef2ff' : '#fff'),
                              borderRadius: 6,
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                              color: disabled ? '#94a3b8' : (checked ? '#3730a3' : '#334155'),
                              fontWeight: 650,
                              opacity: disabled ? 0.6 : 1,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={checked}
                              onChange={() => toggleEditAccessRole(opt.value)}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addStagedEditAccessRows}
                    style={{
                      height: 33,
                      background: '#eef2ff',
                      color: '#4338ca',
                      border: '1px solid #c7d2fe',
                      borderRadius: 6,
                      fontWeight: 750,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      marginTop: 4,
                    }}
                  >
                    <Plus size={13} /> Add to Assignment List
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={saving}
              style={{
                height: 40,
                border: 0,
                borderRadius: 8,
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 800,
                cursor: saving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 6,
              }}
            >
              <Save size={14} />
              {saving
                ? 'Saving…'
                : editingAssignment
                ? 'Update Assignment'
                : editAccessStagedRows.length > 0
                ? `Save & Apply Access (${editAccessStagedRows.length})`
                : 'Save & Apply Access'}
            </button>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ADD USER MODAL (Requirements 8, 9, 10, 11)                             */}
      {/* ---------------------------------------------------------------------- */}
      {showAddUserModal && (
        <Modal title="Add User" onClose={() => setShowAddUserModal(false)} maxWidth={580}>
          <form onSubmit={handleSaveAddUser} style={{ display: 'grid', gap: 14 }}>
            {error && (
              <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 12.5 }}>
                {error}
              </div>
            )}

            {/* Email Field with Instant Existing User Detection (Requirement 10) */}
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
              Email Address *
              <input
                type="email"
                required
                value={addUserForm.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@dypiu.ac.in"
                style={{ ...fieldStyle, marginTop: 4 }}
              />
            </label>

            {/* Existing User Found Banner (Requirement 10) */}
            {existingUserFound ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 9,
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Check size={16} /> Existing User Found
                </div>
                <div style={{ fontSize: 14, fontWeight: 750, color: '#1e293b' }}>
                  {existingUserFound.name || existingUserFound.username}
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8 }}>{existingUserFound.email}</div>

                <div style={{ fontSize: 12, fontWeight: 750, color: '#334155', marginBottom: 4 }}>Current access:</div>
                {existingUserFound.assignments && existingUserFound.assignments.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#1e293b' }}>
                    {existingUserFound.assignments.map((a) => (
                      <li key={a.id}>
                        <strong>{a.schoolName || schoolName(a.schoolId) || 'Institution-wide'}</strong> →{' '}
                        {ROLE_OPTIONS.find((o) => o.value === a.role)?.label || a.role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {existingUserFound.schoolId ? `${schoolName(existingUserFound.schoolId)} → ` : ''}
                    {userRoles(existingUserFound).join(', ') || 'No organizational assignments'}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: '#15803d', marginTop: 8, fontWeight: 650 }}>
                  Add assignments below to extend this existing user's organizational access.
                </div>
              </div>
            ) : (
              <>
                {/* Full Name & Password for new user */}
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  Full Name *
                  <input
                    required
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                    placeholder="Prof. Raj Sharma"
                    style={{ ...fieldStyle, marginTop: 4 }}
                  />
                </label>

                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  Password *
                  <input
                    type="password"
                    required
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ ...fieldStyle, marginTop: 4 }}
                  />
                </label>
              </>
            )}

            {/* Configured Assignments List */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Organizational Assignments to Add
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>
                Configure role and organizational scope. Multi-school or multiple roles are supported.
              </p>

              {addAssignmentRows.length > 0 && (
                <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                  {addAssignmentRows.map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 11px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 7,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: '#4338ca', background: '#eef2ff', padding: '2px 7px', borderRadius: 4 }}>
                          {ROLE_OPTIONS.find((o) => o.value === row.role)?.label || row.role}
                        </span>
                        <strong style={{ color: '#0f172a' }}>{row.schoolName}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAssignmentFromNewUser(idx)}
                        style={{ border: 0, background: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Assignment Form Section: SCHOOL SELECTOR FIRST, THEN ROLE MULTIPLE SELECTOR */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 9, padding: 12, display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 750, color: '#1e293b' }}>
                  + Configure School & Role(s)
                </div>

                {/* 1. School Selector First */}
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  School *
                  <select
                    value={currentAddAssignment.schoolId}
                    onChange={(e) =>
                      setCurrentAddAssignment({
                        ...currentAddAssignment,
                        schoolId: e.target.value,
                      })
                    }
                    style={{ ...fieldStyle, height: 36, marginTop: 3 }}
                  >
                    <option value="">-- Select a School --</option>
                    <option value="ALL_SCHOOLS">All Schools (Apply across all schools)</option>
                    <option value="INSTITUTION">Institution-wide (IQAC)</option>
                    {schools.map((s) => {
                      const sId = s.id ?? s.schoolId;
                      return (
                        <option key={sId} value={sId}>
                          {s.name} {s.code ? `(${s.code})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {/* 2. Role Multiple Selector Second */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Role(s) * (Select one or more)</span>
                    {currentAddAssignment.roles && currentAddAssignment.roles.length > 0 && (
                      <span style={{ fontSize: 11, color: '#4338ca', fontWeight: 700 }}>
                        {currentAddAssignment.roles.length} selected
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 6 }}>
                    {ROLE_OPTIONS.map((opt) => {
                      const checked = (currentAddAssignment.roles || []).includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            padding: '6px 9px',
                            border: `1px solid ${checked ? '#6366f1' : '#cbd5e1'}`,
                            background: checked ? '#eef2ff' : '#fff',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: checked ? '#3730a3' : '#334155',
                            fontWeight: 650,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRoleSelect(opt.value)}
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </div>


                <button
                  type="button"
                  onClick={addAssignmentToNewUser}
                  style={{
                    height: 33,
                    background: '#eef2ff',
                    color: '#4338ca',
                    border: '1px solid #c7d2fe',
                    borderRadius: 6,
                    fontWeight: 750,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    marginTop: 4,
                  }}
                >
                  <Plus size={13} /> Add to Assignment List
                </button>
              </div>
            </div>

            <button
              disabled={saving}
              style={{
                height: 40,
                border: 0,
                borderRadius: 8,
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 800,
                cursor: saving ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 6,
              }}
            >
              <Save size={14} /> {saving ? 'Saving…' : existingUserFound ? 'Save & Extend Access' : 'Create User'}
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}
