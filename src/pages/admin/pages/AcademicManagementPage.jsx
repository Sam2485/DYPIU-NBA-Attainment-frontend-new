import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Edit,
  Eye,
  LogOut,
  Shield,
  Users,
  Building,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { UserModal } from '../components/UserModal';
import { UserDetailModal } from '../components/UserDetailModal';
import { SchoolModal } from '../components/SchoolModal';

export const AcademicManagementPage = () => {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers();
      const list = res?.data || res || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch academic members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Metric counts from real database records
  const counts = {
    TOTAL: users.length,
    DIRECTOR: users.filter((u) => (u.role || '').toUpperCase() === 'DIRECTOR').length,
    HOD: users.filter((u) => (u.role || '').toUpperCase() === 'HOD').length,
    PROGRAMME_COORDINATOR: users.filter((u) => (u.role || '').toUpperCase() === 'PROGRAMME_COORDINATOR').length,
    FACULTY: users.filter((u) => (u.role || '').toUpperCase() === 'FACULTY').length,
  };

  const filteredUsers = users.filter((u) => {
    const roleMatch =
      selectedRole === 'ALL' || (u.role || '').toUpperCase() === selectedRole.toUpperCase();
    if (!roleMatch) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.department || u.departmentId || '').toLowerCase().includes(q) ||
      (u.programme || u.programmeId || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setUserModalOpen(true);
  };

  const handleOpenDetail = (u) => {
    setViewingUser(u);
    setDetailModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '16px',
            }}
          >
            D
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              DYPIU NBA Attainment
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Academic Role Management Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '12px',
              }}
            >
              {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {user?.name || user?.username || 'Administrator'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {user?.role || 'ADMIN'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: '#ffffff',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
              e.currentTarget.style.borderColor = 'var(--danger-border)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1240px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Title & Add Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Academic Staff & Leadership
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Add, configure, and manage Schools, Directors, Heads of Department, Programme Coordinators, and Faculty
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSchoolModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <Building2 size={16} color="var(--primary)" />
              <span>Add School</span>
            </button>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <UserPlus size={16} />
              <span>Add Academic Member</span>
            </button>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Directors */}
          <div
            onClick={() => setSelectedRole('DIRECTOR')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ffffff',
              border: `1.5px solid ${selectedRole === 'DIRECTOR' ? 'var(--role-director)' : 'var(--border)'}`,
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Directors
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--role-director-bg)', color: 'var(--role-director)' }}>
                <Building size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {counts.DIRECTOR}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Institutional leadership
            </div>
          </div>

          {/* HODs */}
          <div
            onClick={() => setSelectedRole('HOD')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ffffff',
              border: `1.5px solid ${selectedRole === 'HOD' ? 'var(--role-hod)' : 'var(--border)'}`,
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Heads of Dept (HOD)
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--role-hod-bg)', color: 'var(--role-hod)' }}>
                <Shield size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {counts.HOD}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Departmental leadership
            </div>
          </div>

          {/* Programme Coordinators */}
          <div
            onClick={() => setSelectedRole('PROGRAMME_COORDINATOR')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ffffff',
              border: `1.5px solid ${selectedRole === 'PROGRAMME_COORDINATOR' ? 'var(--role-pc)' : 'var(--border)'}`,
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Prog. Coordinators
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--role-pc-bg)', color: 'var(--role-pc)' }}>
                <GraduationCap size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {counts.PROGRAMME_COORDINATOR}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Curriculum & PO targets
            </div>
          </div>

          {/* Faculty */}
          <div
            onClick={() => setSelectedRole('FACULTY')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ffffff',
              border: `1.5px solid ${selectedRole === 'FACULTY' ? 'var(--role-faculty)' : 'var(--border)'}`,
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Faculty / Coordinators
              </span>
              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--role-faculty-bg)', color: 'var(--role-faculty)' }}>
                <Users size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
              {counts.FACULTY}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Course evaluations & COs
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {/* Role Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { role: 'ALL', label: 'All Roles' },
              { role: 'DIRECTOR', label: 'Directors' },
              { role: 'HOD', label: 'Heads of Dept' },
              { role: 'PROGRAMME_COORDINATOR', label: 'Prog. Coordinators' },
              { role: 'FACULTY', label: 'Faculty / Course Coord.' },
            ].map((tab) => {
              const isSelected = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  onClick={() => setSelectedRole(tab.role)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px', display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '12.5px',
                backgroundColor: 'var(--bg-app)',
              }}
            />
          </div>
        </div>

        {/* Academic Members Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Loading academic members from database...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--danger)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{error}</div>
              <button
                onClick={loadUsers}
                style={{
                  marginTop: '12px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Academic Members Found
              </div>
              <p style={{ fontSize: '12.5px', margin: 0 }}>
                {searchQuery || selectedRole !== 'ALL'
                  ? 'No staff members match the selected filters.'
                  : 'Get started by adding the first Director, HOD, Programme Coordinator, or Faculty member.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Academic Staff Member
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Role
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Department / Scope
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Email Address
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => {
                    const initials = (u.name || u.username || 'A')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={u.id || idx}
                        style={{
                          borderBottom: idx === filteredUsers.length - 1 ? 'none' : '1px solid var(--border)',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Member */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-subtle)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                fontSize: '12.5px',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.name || u.username}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>@{u.username || 'user'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <RoleBadge role={u.role} />
                        </td>

                        {/* Department / Scope */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {u.department || u.departmentId || u.programme || u.programmeId || 'Institutional Full Scope'}
                          </span>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{u.email}</span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenDetail(u)}
                              title="View Details"
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                backgroundColor: '#ffffff',
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit Member"
                              style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                backgroundColor: '#ffffff',
                                color: 'var(--primary)',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Edit size={13} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={editingUser}
        onSuccess={loadUsers}
      />

      {/* Add School Modal */}
      <SchoolModal
        isOpen={schoolModalOpen}
        onClose={() => setSchoolModalOpen(false)}
        onSuccess={loadUsers}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        user={viewingUser}
        onEdit={(u) => handleOpenEdit(u)}
      />
    </div>
  );
};
