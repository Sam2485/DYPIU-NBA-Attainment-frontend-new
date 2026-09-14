import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  Mail,
  UserCheck,
  Edit2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import { useAcademic } from '../../context/AcademicContext';
import { useUser } from '../../context/user';
import { useAuth } from '../../context/AuthContext';

const surface = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
};

const fieldStyle = {
  width: '100%',
  height: '39px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0 11px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
};

function SchoolModal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          ...surface,
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Building2 size={16} />
            </div>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>{title}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export default function IqacSchoolsPage() {
  const { logout } = useAuth();
  const {
    schools = [],
    departments = [],
    masterProgrammes = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    createSchool = () => Promise.resolve(null),
    updateSchool = () => Promise.resolve(null),
  } = useAcademic();

  const { users = [], refreshUsers = () => Promise.resolve([]) } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    estYear: new Date().getFullYear().toString(),
    directorId: '',
    directorName: '',
    directorEmail: '',
  });

  useEffect(() => {
    Promise.allSettled([
      loadSchools(true),
      loadDepartments(null, true),
      loadMasterProgrammes(null, null, true),
      refreshUsers(),
    ]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const directorUsers = useMemo(() => {
    return users.filter((u) => {
      const roles = Array.isArray(u.roles) && u.roles.length ? u.roles : [u.role];
      return roles.includes('DIRECTOR');
    });
  }, [users]);

  const openAddModal = () => {
    setEditingSchool(null);
    setForm({
      name: '',
      code: '',
      estYear: new Date().getFullYear().toString(),
      directorId: '',
      directorName: '',
      directorEmail: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (school) => {
    setEditingSchool(school);
    const schoolDirId = school.directorId ? String(school.directorId) : '';
    const dirUser = directorUsers.find(
      (d) =>
        (schoolDirId && String(d.id ?? d.userId) === schoolDirId) ||
        (school.directorEmail && d.email?.toLowerCase() === school.directorEmail.toLowerCase())
    );

    setForm({
      name: school.name || '',
      code: school.code || '',
      estYear: school.estYear || '',
      directorId: dirUser ? String(dirUser.id ?? dirUser.userId) : schoolDirId,
      directorName: school.director || school.directorName || school.dean || dirUser?.name || '',
      directorEmail: school.directorEmail || school.deanEmail || school.email || dirUser?.email || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleDirectorSelect = (dirId) => {
    if (!dirId) {
      setForm((prev) => ({
        ...prev,
        directorId: '',
        directorName: '',
        directorEmail: '',
      }));
      return;
    }
    const dirUser = directorUsers.find((d) => String(d.id ?? d.userId) === String(dirId));
    if (dirUser) {
      setForm((prev) => ({
        ...prev,
        directorId: String(dirUser.id ?? dirUser.userId),
        directorName: dirUser.name || dirUser.username || '',
        directorEmail: dirUser.email || '',
      }));
    }
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError('School name and code are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        estYear: form.estYear ? form.estYear.trim() : '',
        directorId: form.directorId ? Number(form.directorId) : null,
        directorName: form.directorName ? form.directorName.trim() : null,
        directorEmail: form.directorEmail ? form.directorEmail.trim() : null,
      };

      if (editingSchool) {
        const targetId = editingSchool.id ?? editingSchool.schoolId;
        await updateSchool(targetId, payload);
        setSuccessMessage(`Successfully updated school: ${form.name.trim()}`);
      } else {
        await createSchool(payload);
        setSuccessMessage(`Successfully registered school: ${form.name.trim()}`);
      }

      await loadSchools(true);
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to save school details.');
    } finally {
      setSaving(false);
    }
  };

  // Compute department and programme counts per school
  const schoolStats = useMemo(() => {
    const map = new Map();
    schools.forEach((school) => {
      const sId = school.id ?? school.schoolId;
      const depts = departments.filter((d) => d.schoolId === sId);
      const deptIds = new Set(depts.map((d) => d.id));
      const progs = masterProgrammes.filter(
        (p) => (p.schoolId && p.schoolId === sId) || (p.departmentId && deptIds.has(p.departmentId))
      );
      map.set(sId, {
        departments: depts,
        deptCount: depts.length,
        programmes: progs,
        progCount: progs.length,
      });
    });
    return map;
  }, [schools, departments, masterProgrammes]);

  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((school) => {
      const dirName = school.director || school.directorName || school.dean || '';
      const dirEmail = school.directorEmail || school.deanEmail || '';
      const stats = schoolStats.get(school.id ?? school.schoolId);
      const deptNames = stats?.departments?.map((d) => d.name + ' ' + d.code).join(' ') || '';

      return (
        school.name?.toLowerCase().includes(q) ||
        school.code?.toLowerCase().includes(q) ||
        dirName.toLowerCase().includes(q) ||
        dirEmail.toLowerCase().includes(q) ||
        String(school.estYear || '').includes(q) ||
        deptNames.toLowerCase().includes(q)
      );
    });
  }, [schools, searchQuery, schoolStats]);

  const totalDeptsAll = departments.length;
  const totalProgsAll = masterProgrammes.length;
  const assignedDirectorsCount = schools.filter(
    (s) => (s.director || s.directorName || s.dean || s.directorEmail) && (s.director !== 'Unassigned')
  ).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div style={{ padding: '32px', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* ── Page Header ─────────────────────────────────────────────── */}
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
                <div
                  style={{
                    color: '#4f46e5',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  System Administration
                </div>
                <h1 style={{ margin: '5px 0 0', color: '#0f172a', fontSize: '24px', fontWeight: 800 }}>
                  Manage Schools
                </h1>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '13px' }}>
                  Institutional overview of all academic schools, assigned directors, departments, and programmes.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={openAddModal}
                  style={{
                    height: '38px',
                    padding: '0 14px',
                    background: '#4f46e5',
                    border: 0,
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <Plus size={16} /> Add School
                </button>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    height: '38px',
                    padding: '0 13px',
                    background: '#ffffff',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </div>
            </header>

            {/* ── Status Alerts ───────────────────────────────────────────── */}
            {successMessage && (
              <div
                style={{
                  marginTop: '16px',
                  color: '#15803d',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> {successMessage}
              </div>
            )}

            {/* ── KPI Summary Cards ───────────────────────────────────────── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginTop: '20px',
              }}
            >
              <div style={{ ...surface, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Schools
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 850, color: '#0f172a', marginTop: '2px' }}>
                    {schools.length}
                  </div>
                </div>
              </div>

              <div style={{ ...surface, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Assigned Directors
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 850, color: '#0f172a', marginTop: '2px' }}>
                    {assignedDirectorsCount} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>/ {schools.length}</span>
                  </div>
                </div>
              </div>

              <div style={{ ...surface, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#fdf2f8',
                    color: '#db2777',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Departments
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 850, color: '#0f172a', marginTop: '2px' }}>
                    {totalDeptsAll}
                  </div>
                </div>
              </div>

              <div style={{ ...surface, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#f0f9ff',
                    color: '#0284c7',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Programmes
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 850, color: '#0f172a', marginTop: '2px' }}>
                    {totalProgsAll}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search Bar ─────────────────────────────────────────────── */}
            <div style={{ position: 'relative', marginTop: '20px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by school name, code, director, establishment year, or departments..."
                style={{ ...fieldStyle, height: '42px', paddingLeft: '38px', fontSize: '13px' }}
              />
            </div>

            {/* ── Schools Cards Grid ──────────────────────────────────────── */}
            <section style={{ marginTop: '20px' }}>
              {filteredSchools.length === 0 ? (
                <div
                  style={{
                    ...surface,
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
                    No Schools Found
                  </strong>
                  <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
                    {searchQuery ? 'No schools matched your search criteria.' : 'No institutional schools are registered.'}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '18px',
                  }}
                >
                  {filteredSchools.map((school) => {
                    const sId = school.id ?? school.schoolId;
                    const stats = schoolStats.get(sId) || { deptCount: 0, progCount: 0, departments: [] };
                    const directorDisplayName =
                      school.director || school.directorName || school.dean || 'Unassigned';
                    const hasDirector = directorDisplayName && directorDisplayName !== 'Unassigned';
                    const directorEmailDisplay = school.directorEmail || school.deanEmail || school.email;

                    return (
                      <div
                        key={sId}
                        style={{
                          ...surface,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {/* Card Header */}
                        <div
                          style={{
                            padding: '16px 18px',
                            borderBottom: '1px solid #f1f5f9',
                            background: '#fafafa',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '9px',
                                background: '#eef2ff',
                                color: '#4f46e5',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              <Building2 size={18} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: '15px',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  lineHeight: 1.25,
                                }}
                              >
                                {school.name}
                              </h3>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginTop: '4px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: '#4338ca',
                                    background: '#eef2ff',
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    border: '1px solid #c7d2fe',
                                  }}
                                >
                                  {school.code}
                                </span>
                                {school.estYear && (
                                  <span
                                    style={{
                                      fontSize: '11.5px',
                                      color: '#64748b',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <Calendar size={12} /> Est. {school.estYear}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditModal(school)}
                            title="Edit School Details"
                            style={{
                              height: '32px',
                              padding: '0 10px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                            }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {/* Director Detail Row */}
                          <div
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #edf2f7',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  color: '#64748b',
                                  textTransform: 'uppercase',
                                  letterSpacing: '.04em',
                                }}
                              >
                                School Director
                              </div>
                              <div
                                style={{
                                  fontSize: '13.5px',
                                  fontWeight: 800,
                                  color: hasDirector ? '#0f172a' : '#dc2626',
                                  marginTop: '2px',
                                }}
                              >
                                {directorDisplayName}
                              </div>
                              {directorEmailDisplay && (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    marginTop: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <Mail size={11} /> {directorEmailDisplay}
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: hasDirector ? '#15803d' : '#b91c1c',
                                background: hasDirector ? '#dcfce7' : '#fee2e2',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {hasDirector ? 'Assigned' : 'Vacant'}
                            </span>
                          </div>

                          {/* Statistics Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '9px',
                                padding: '10px 12px',
                                background: '#ffffff',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Layers size={13} style={{ color: '#4f46e5' }} /> Departments
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 850, color: '#0f172a', marginTop: '3px' }}>
                                {stats.deptCount}
                              </div>
                            </div>

                            <div
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '9px',
                                padding: '10px 12px',
                                background: '#ffffff',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <GraduationCap size={13} style={{ color: '#0284c7' }} /> Programmes
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 850, color: '#0f172a', marginTop: '3px' }}>
                                {stats.progCount}
                              </div>
                            </div>
                          </div>

                          {/* Departments breakdown */}
                          {stats.departments.length > 0 && (
                            <div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#64748b',
                                  marginBottom: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '.04em',
                                }}
                              >
                                Departments ({stats.departments.length})
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {stats.departments.map((dept) => (
                                  <span
                                    key={dept.id}
                                    title={`${dept.name} (HOD: ${dept.hod || 'Unassigned'})`}
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: '#334155',
                                      background: '#f1f5f9',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '6px',
                                      padding: '3px 8px',
                                    }}
                                  >
                                    {dept.code || dept.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ── Add / Edit School Modal ────────────────────────────────────── */}
        {showModal && (
          <SchoolModal
            title={editingSchool ? `Edit School — ${editingSchool.name}` : 'Add New Academic School'}
            onClose={() => setShowModal(false)}
          >
            <form onSubmit={handleSaveSchool} style={{ padding: '20px', display: 'grid', gap: '14px' }}>
              {error && (
                <div
                  style={{
                    color: '#b91c1c',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <label style={{ display: 'grid', gap: '5px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                School Name *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. School of Engineering and Technology"
                  style={fieldStyle}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  School Code *
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SOET"
                    style={fieldStyle}
                  />
                </label>

                <label style={{ display: 'grid', gap: '5px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Establishment Year
                  <input
                    value={form.estYear}
                    onChange={(e) => setForm({ ...form, estYear: e.target.value })}
                    placeholder="e.g. 2020"
                    style={fieldStyle}
                  />
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Assign Director (Dean)
                  <select
                    value={form.directorId}
                    onChange={(e) => handleDirectorSelect(e.target.value)}
                    style={{ ...fieldStyle, cursor: 'pointer' }}
                  >
                    <option value="">— Select from Registered Directors (Optional) —</option>
                    {directorUsers.map((dir) => {
                      const dirId = String(dir.id ?? dir.userId);
                      return (
                        <option key={dirId} value={dirId}>
                          {dir.name || dir.username} ({dir.email})
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                  Director Name
                  <input
                    value={form.directorName}
                    onChange={(e) => setForm({ ...form, directorName: e.target.value })}
                    placeholder="Director / Dean Name"
                    style={fieldStyle}
                  />
                </label>

                <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                  Director Email
                  <input
                    type="email"
                    value={form.directorEmail}
                    onChange={(e) => setForm({ ...form, directorEmail: e.target.value })}
                    placeholder="director@dypiu.ac.in"
                    style={fieldStyle}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    height: '38px',
                    padding: '0 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    background: '#4f46e5',
                    border: 0,
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: saving ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <Save size={14} /> {saving ? 'Saving…' : editingSchool ? 'Update School' : 'Create School'}
                </button>
              </div>
            </form>
          </SchoolModal>
        )}
      </main>
    </div>
  );
}
