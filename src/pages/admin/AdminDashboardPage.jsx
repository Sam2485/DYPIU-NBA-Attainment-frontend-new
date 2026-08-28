import { useEffect, useState } from 'react';
import { Building2, Plus, Save, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/user';
import { useAcademic } from '../../context/AcademicContext';

const ROLES = ['ADMIN', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'COURSE_COORDINATOR', 'FACULTY'];
const surface = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px' };
const fieldStyle = { width: '100%', height: 39, border: '1px solid #cbd5e1', borderRadius: 7, padding: '0 10px', boxSizing: 'border-box', fontFamily: 'inherit' };
const emptyUser = { name: '', email: '', password: '', role: 'FACULTY', schoolId: '' };

function Modal({ title, onClose, children }) {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.45)', display: 'grid', placeItems: 'center', padding: 20 }}><div style={{ width: '100%', maxWidth: 520, ...surface, boxShadow: '0 24px 60px rgba(15,23,42,.22)' }}><header style={{ padding: '17px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{ color: '#0f172a' }}>{title}</strong><button type="button" onClick={onClose} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={18} /></button></header>{children}</div></div>;
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { users = [], refreshUsers = () => Promise.resolve([]), addUser = () => Promise.resolve(null), updateUser = () => Promise.resolve(null), deleteUser = () => Promise.resolve(null) } = useUser();
  const { schools = [], loadSchools = () => Promise.resolve([]), createSchool = () => Promise.resolve(null) } = useAcademic();
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUser, setEditingUser] = useState(null);
  const [schoolForm, setSchoolForm] = useState({ name: '', code: '', estYear: new Date().getFullYear().toString() });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([refreshUsers(), loadSchools()]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openAddUser = () => { setEditingUser(null); setUserForm(emptyUser); setError(''); setShowUserModal(true); };
  const openEditUser = (target) => { setEditingUser(target); setUserForm({ name: target.name || '', email: target.email || '', password: '', role: target.role || 'FACULTY', schoolId: target.schoolId || '' }); setError(''); setShowUserModal(true); };
  const saveUser = async (event) => {
    event.preventDefault();
    if (!userForm.email.trim() || !userForm.role || !userForm.schoolId || (!editingUser && (!userForm.name.trim() || !userForm.password))) { setError('Name, email, password (for a new user), role, and school are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editingUser) {
        const changes = { email: userForm.email.trim(), role: userForm.role, schoolId: userForm.schoolId };
        if (userForm.password) changes.password = userForm.password;
        await updateUser(editingUser.id, changes);
      } else {
        await addUser({ name: userForm.name.trim(), email: userForm.email.trim(), password: userForm.password, role: userForm.role, schoolId: userForm.schoolId });
      }
      await refreshUsers(); setShowUserModal(false);
    } catch (err) { setError(err?.response?.data?.message || err?.message || 'Unable to save user.'); } finally { setSaving(false); }
  };
  const saveSchool = async (event) => {
    event.preventDefault();
    if (!schoolForm.name.trim() || !schoolForm.code.trim()) { setError('School name and code are required.'); return; }
    setSaving(true); setError('');
    try { await createSchool({ name: schoolForm.name.trim(), code: schoolForm.code.trim(), estYear: schoolForm.estYear }); await loadSchools(); setShowSchoolModal(false); setSchoolForm({ name: '', code: '', estYear: new Date().getFullYear().toString() }); }
    catch (err) { setError(err?.response?.data?.message || err?.message || 'Unable to add school.'); } finally { setSaving(false); }
  };
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
  const schoolName = (schoolId) => schools.find((school) => (school.id ?? school.schoolId) === schoolId)?.name || '—';
  const roleMatches = (member, role) => role === 'ALL'
    || (role === 'FACULTY' && ['FACULTY', 'COURSE_COORDINATOR'].includes(member.role))
    || member.role === role;
  const roleTabs = [
    { id: 'ALL', label: 'All Users', count: users.length },
    { id: 'DIRECTOR', label: 'Directors', count: users.filter((member) => member.role === 'DIRECTOR').length },
    { id: 'HOD', label: 'HODs', count: users.filter((member) => member.role === 'HOD').length },
    { id: 'PROGRAMME_COORDINATOR', label: 'Programme Coordinators', count: users.filter((member) => member.role === 'PROGRAMME_COORDINATOR').length },
    { id: 'FACULTY', label: 'Faculty', count: users.filter((member) => ['FACULTY', 'COURSE_COORDINATOR'].includes(member.role)).length },
  ];
  const filteredUsers = users.filter((member) => {
    if (!roleMatches(member, selectedRole)) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [member.name, member.username, member.email, member.role, member.school, schoolName(member.schoolId)]
      .some((value) => String(value ?? '').toLowerCase().includes(query));
  });

  return <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}><div style={{ maxWidth: 1180, margin: '0 auto' }}>
    <header style={{ ...surface, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><div><div style={{ color: '#4f46e5', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>System Administration</div><h1 style={{ margin: '5px 0 0', color: '#0f172a', fontSize: 24 }}>User Management</h1><p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>Manage users and their school access only. Department and programme assignments are not available here.</p></div><button type="button" onClick={logout} style={{ height: 38, padding: '0 13px', background: '#fff', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, fontWeight: 700 }}>Sign out</button></header>
    {error && <div style={{ marginTop: 16, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{error}</div>}
    <section style={{ ...surface, marginTop: 20, padding: '18px 20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}><Users size={17} style={{ verticalAlign: '-3px', marginRight: 6 }} />Institutional users</h2><p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>Add users by role and school, or edit their email, password, role, and school.</p></div><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => { setError(''); setShowSchoolModal(true); }} style={{ height: 38, padding: '0 12px', background: '#fff', border: '1px solid #c7d2fe', color: '#4f46e5', borderRadius: 8, fontWeight: 700 }}><Building2 size={14} /> Add School</button><button type="button" onClick={openAddUser} style={{ height: 38, padding: '0 12px', background: '#4f46e5', border: 0, color: '#fff', borderRadius: 8, fontWeight: 700 }}><UserPlus size={14} /> Add User</button></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 18 }}>{roleTabs.map((tab) => <button key={tab.id} type="button" onClick={() => setSelectedRole(tab.id)} style={{ textAlign: 'left', padding: '12px', borderRadius: 9, border: `1.5px solid ${selectedRole === tab.id ? '#6366f1' : '#e2e8f0'}`, background: selectedRole === tab.id ? '#eef2ff' : '#fff', color: '#0f172a', cursor: 'pointer' }}><span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: selectedRole === tab.id ? '#4f46e5' : '#64748b' }}>{tab.label}</span><strong style={{ display: 'block', marginTop: 3, fontSize: 22 }}>{tab.count}</strong></button>)}</div>
      <div style={{ position: 'relative', marginTop: 14 }}><Search size={16} style={{ position: 'absolute', left: 11, top: 11, color: '#64748b' }} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search name, email, username, role, or school" style={{ ...fieldStyle, paddingLeft: 36 }} /></div>
      <div style={{ overflowX: 'auto', marginTop: 14 }}><table className="audit-data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>School</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead><tbody>{filteredUsers.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No users match this filter.</td></tr> : filteredUsers.map((member) => <tr key={getUserId(member) ?? member.email}><td style={{ fontWeight: 700 }}>{member.name || member.username || '—'}</td><td>{member.email || '—'}</td><td><span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>{member.role || '—'}</span></td><td>{schoolName(member.schoolId)}</td><td style={{ textAlign: 'right' }}><div style={{ display: 'inline-flex', gap: 8 }}><button type="button" onClick={() => openEditUser(member)} style={{ color: '#2563eb', background: '#fff', border: '1px solid #93c5fd', borderRadius: 6, padding: '6px 9px', fontWeight: 700 }}>Edit access</button><button type="button" onClick={() => handleDeleteUser(member)} disabled={isDeletingUser(member)} style={{ color: '#b91c1c', background: '#fff', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 9px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: isDeletingUser(member) ? 'wait' : 'pointer', opacity: isDeletingUser(member) ? 0.65 : 1 }}><Trash2 size={13} />{isDeletingUser(member) ? 'Deleting…' : 'Delete'}</button></div></td></tr>)}</tbody></table></div>
    </section>
  </div>
  {showUserModal && <Modal title={editingUser ? `Edit access — ${editingUser.name || editingUser.email}` : 'Add user'} onClose={() => setShowUserModal(false)}><form onSubmit={saveUser} style={{ padding: 20, display: 'grid', gap: 13 }}>{!editingUser && <label>Name<input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} style={fieldStyle} /></label>}<label>Email<input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} style={fieldStyle} /></label><label>Password {editingUser && <span style={{ color: '#64748b', fontWeight: 400 }}>(leave blank to keep unchanged)</span>}<input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} style={fieldStyle} /></label><label>Role<select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={fieldStyle}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select></label><label>School<select value={userForm.schoolId} onChange={(e) => setUserForm({ ...userForm, schoolId: e.target.value })} style={fieldStyle}><option value="">Select school</option>{schools.map((school) => <option key={school.id ?? school.schoolId} value={school.id ?? school.schoolId}>{school.name}</option>)}</select></label><button disabled={saving} style={{ height: 40, border: 0, borderRadius: 8, background: '#4f46e5', color: '#fff', fontWeight: 800 }}><Save size={14} /> {saving ? 'Saving…' : 'Save User'}</button></form></Modal>}
  {showSchoolModal && <Modal title="Add School" onClose={() => setShowSchoolModal(false)}><form onSubmit={saveSchool} style={{ padding: 20, display: 'grid', gap: 13 }}><label>School Name<input value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} style={fieldStyle} /></label><label>School Code<input value={schoolForm.code} onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })} style={fieldStyle} /></label><label>Establishment Year<input value={schoolForm.estYear} onChange={(e) => setSchoolForm({ ...schoolForm, estYear: e.target.value })} style={fieldStyle} /></label><button disabled={saving} style={{ height: 40, border: 0, borderRadius: 8, background: '#4f46e5', color: '#fff', fontWeight: 800 }}><Plus size={14} /> {saving ? 'Saving…' : 'Add School'}</button></form></Modal>}
  </main>;
}
