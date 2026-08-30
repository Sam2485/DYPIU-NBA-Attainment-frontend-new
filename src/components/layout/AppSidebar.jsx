import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import UserProfileModal from '../profile/UserProfileModal';

// ── SVG icon map with centered SVG display ─────────────────────────────────────
function Icon({ name, active = false, size = 16 }) {
  const col = active ? '#f8fafc' : '#cbd5e1';
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: col, strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block' },
    'aria-hidden': 'true',
  };
  if (name === 'dashboard')  return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === 'users')      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M19 8v5"/><path d="M21.5 10.5h-5"/></svg>;
  if (name === 'config')     return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>;
  if (name === 'academic')   return <svg {...p}><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg>;
  if (name === 'outcomes')   return <svg {...p}><path d="M12 2 3 7l9 4 9-4-9-4Z"/><path d="M5 10v5c2 2 12 2 14 0v-5"/><path d="M12 11v8"/></svg>;
  if (name === 'mapping')    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>;
  if (name === 'marks')      return <svg {...p}><path d="M9 11 11 13 15 9"/><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v4h4"/></svg>;
  if (name === 'survey')     return <svg {...p}><path d="M7 3h7l3 3v15H7V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>;
  if (name === 'coa')        return <svg {...p}><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>;
  if (name === 'poa')        return <svg {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
  if (name === 'atr')        return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  if (name === 'reports')    return <svg {...p}><path d="M4 19.5V5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-1.5Z"/><path d="M13 3h5a2 2 0 0 1 2 2v14.5A2 2 0 0 0 18 18h-5V3Z"/></svg>;
  if (name === 'chevron')    return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>;
  if (name === 'profile')    return <svg {...p}><path d="M19 21a7 7 0 0 0-14 0"/><circle cx="12" cy="8" r="4"/></svg>;
  if (name === 'shield')     return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === 'mail')       return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
  if (name === 'logout')     return <svg {...{ ...p, stroke: '#f87171' }}><path d="M10 17 15 12 10 7"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></svg>;
  if (name === 'nav')        return <svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M5 10v5c2 2 12 2 14 0v-5"/><path d="M12 11v8"/></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="9"/></svg>;
}

// ── Director Nav Items ─────────────────────────────────────────────────────────
const DIRECTOR_NAV = [
  { id: 'dashboard',             path: '/director/dashboard',             icon: 'dashboard', label: 'Dashboard' },
  { id: 'school-structure',      path: '/director/school-structure',      icon: 'academic',  label: 'School Structure' },
  { id: 'department-management', path: '/director/department-management', icon: 'users',     label: 'Departments & HODs' },
  { id: 'programme-overview',    path: '/director/programme-overview',    icon: 'outcomes',  label: 'Programmes' },
  { id: 'reports',               path: '/director/reports',               icon: 'reports',   label: 'Reports' },
];

// ── HOD Nav Items ──────────────────────────────────────────────────────────────
const HOD_NAV = [
  { id: 'dashboard',              path: '/hod/dashboard',              icon: 'dashboard', label: 'Dashboard' },
  { id: 'batch-management',       path: '/hod/batch-management',       icon: 'academic',  label: 'Batch Management' },
  { id: 'programme-outcomes',     path: '/hod/programme-outcomes',     icon: 'outcomes',  label: 'Programme Outcomes' },
  { id: 'programme-coordinators', path: '/hod/programme-coordinators', icon: 'users',     label: 'Programme Coordinators' },
  { id: 'approvals',              path: '/hod/approvals',              icon: 'config',    label: 'Approvals' },
  { id: 'reports',                path: '/hod/reports',                icon: 'reports',   label: 'Reports' },
];

// ── Programme Coordinator Nav Items ───────────────────────────────────────────────
const PROGRAMME_COORDINATOR_NAV = [
  { id: 'dashboard',          path: '/programme-coordinator/dashboard',          icon: 'dashboard', label: 'Dashboard' },
  { id: 'manage-courses',     path: '/programme-coordinator/manage-courses',     icon: 'academic',  label: 'Manage Courses' },
  { id: 'target-settings',    path: '/programme-coordinator/target-settings',    icon: 'config',    label: 'Target Settings' },
  { id: 'programme-atr',      path: '/programme-atr',                            icon: 'atr',       label: 'Programme ATR' },
  { id: 'verification-panel', path: '/coordinator-review',                       icon: 'poa',       label: 'Approvals' },
  { id: 'reports',            path: '/reports',                                  icon: 'reports',   label: 'Reports' },
];

// ── Dropdown 1: Programme Setup & Management ───────────────────────────────────
const PROGRAMME_SETUP_NAV = [
  { id: 'dashboard',     path: '/programme-coordinator/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'manage-courses', path: '/programme-coordinator/manage-courses', icon: 'academic', label: 'Manage Courses' },
  { id: 'outcomes',      path: '/programme-coordinator/target-settings', icon: 'outcomes',  label: 'Target Settings' },
  { id: 'programme-atr', path: '/programme-atr', icon: 'atr',       label: 'Programme ATR' },
  { id: 'reports',       path: '/reports',       icon: 'reports',   label: 'Reports' },
];

// ── Dropdown 2: Course Submissions Review ──────────────────────────────────────
const COURSE_REVIEWS_NAV = [
  { id: 'review-config',        path: '/coordinator-review?tab=config',        icon: 'config',   label: 'Attainment Config' },
  { id: 'review-cos',           path: '/coordinator-review?tab=cos',           icon: 'outcomes', label: 'CO Verification' },
  { id: 'review-atr',           path: '/coordinator-review?tab=atr',           icon: 'survey',   label: 'Course ATR Review' },
];

// ── Course Coordinator Nav Items ───────────────────────────────────────────────
const FACULTY_NAV = [
  { id: 'dashboard',           path: '/dashboard',                icon: 'dashboard', label: 'Dashboard' },
  { id: 'outcomes',            path: '/outcomes?mode=standalone', icon: 'outcomes',  label: 'Outcomes' },
  { id: 'configurations',      path: '/configurations',           icon: 'config',    label: 'Attainment Settings' },
  { id: 'course-atr',          path: '/course-atr?mode=standalone', icon: 'atr',     label: 'Course ATR' },
  { id: 'reports',             path: '/reports',                  icon: 'reports',   label: 'Reports' },
];

export default function AppSidebar() {
  const { user, role, logout } = useAuth();
  const courseCoordinatorBatchScopeRef = useRef(null);
  const coordinatorMasterProgrammeScopeRef = useRef(null);
  const hodDepartmentsLoadedRef = useRef(false);
  const {
    academicYear = '2025-26',
    setAcademicYear = () => {},
    batches = [],
    batchId,
    setBatchId = () => {},
    selectedBatch,
    selectedCourseOffering,
    courseOfferings = [],
    programmeId,
    setProgrammeId = () => {},
    masterProgrammes = [],
    hodDashboard = null,
    departments = [],
    selectedDepartmentId,
    setSelectedDepartmentId = () => {},
    loadDepartments = () => Promise.resolve([]),
    loadCoordinatorMasterProgrammes = () => Promise.resolve([]),
    loadCourseCoordinatorProgrammeBatches = () => Promise.resolve([]),
  } = useAcademic();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to extract clean 4-digit span e.g. "2025-2029" from batch object
  const getBatchYearSpan = (b) => {
    if (!b) return '';
    // The batch contract returns numeric startYear/endYear values.
    const startYear = String(b.startYear ?? '');
    const endYear = String(b.endYear ?? '');
    const startMatch = startYear.match(/^(\d{4})/);
    const startY = startMatch ? parseInt(startMatch[1], 10) : null;

    let endY = null;
    if (endYear) {
      const endMatch = endYear.match(/(\d{2,4})$/);
      if (endMatch) {
        const val = endMatch[1];
        if (val.length === 2) {
          endY = parseInt(endYear.slice(0, 2) + val, 10);
        } else if (val.length === 4) {
          endY = parseInt(val, 10);
        }
      }
    }

    if (!endY && startY && b.durationYears) {
      endY = startY + b.durationYears;
    }
    if (!endY && startY) {
      endY = startY + 4;
    }

    if (startY && endY) {
      return `${startY}-${endY}`;
    }

    const nameMatch = (b.name || '').match(/20(\d{2})-(\d{2})/);
    if (nameMatch) {
      return `20${nameMatch[1]}-20${nameMatch[2]}`;
    }

    return b.name || b.id;
  };

  // ── Compute deduplicated unique year batches across all programme batches ─────
  const rawBatches = batches.length > 0 ? batches : [];
  const uniqueBatches = [];
  const seenSpans = new Set();

  rawBatches.forEach((b) => {
    const span = getBatchYearSpan(b);
    if (span && !seenSpans.has(span)) {
      seenSpans.add(span);
      uniqueBatches.push({
        span,
        startYear: b.startYear || '2025-26',
        endYear: b.endYear || '2028-29',
        status: b.status || 'ACTIVE',
        sampleBatchId: b.id,
        durationYears: b.durationYears || 4,
        label: `Batch ${span}`,
      });
    }
  });

  // Sort unique batches in descending order by start year (e.g. 2026-2030, 2025-2029, 2024-2028...)
  uniqueBatches.sort((a, b) => {
    const aStart = parseInt(a.span.split('-')[0], 10) || 0;
    const bStart = parseInt(b.span.split('-')[0], 10) || 0;
    return bStart - aStart;
  });

  // Determine active span
  const isHod = role === 'HOD';

  useEffect(() => {
    if (role === 'HOD' && !hodDepartmentsLoadedRef.current) {
      hodDepartmentsLoadedRef.current = true;
      loadDepartments();
    }
  }, [loadDepartments, role]);

  useEffect(() => {
    // Set an initial scope once only. A persisted user choice is never
    // replaced just because the screen reloads or a department list refreshes.
    if (role !== 'HOD' || selectedDepartmentId || departments.length === 0) return;
    setSelectedDepartmentId(user?.departmentId ?? departments[0]?.id ?? null);
  }, [departments, role, selectedDepartmentId, setSelectedDepartmentId, user?.departmentId]);

  useEffect(() => {
    if (role !== 'PROGRAMME_COORDINATOR' || !user?.email) return;
    const requestScope = user.email.toLowerCase();
    if (coordinatorMasterProgrammeScopeRef.current === requestScope) return;
    coordinatorMasterProgrammeScopeRef.current = requestScope;

    loadCoordinatorMasterProgrammes(user?.email).then((programmes) => {
      const storedProgrammeId = typeof window === 'undefined'
        ? null
        : sessionStorage.getItem(`nba_pc_selected_master_programme:${user.email}`);
      const preferredProgrammeId = programmeId ?? storedProgrammeId;
      const selectedProgrammeExists = programmes.some(
        (programme) => String(programme.id) === String(preferredProgrammeId)
      );
      if (!selectedProgrammeExists) {
        setProgrammeId(programmes[0]?.id ?? null);
      }
    }).catch(() => {});
  }, [loadCoordinatorMasterProgrammes, programmeId, role, setProgrammeId, user?.email]);

  useEffect(() => {
    if (role !== 'FACULTY' || !user?.email) return;
    if (courseCoordinatorBatchScopeRef.current === user.email) return;
    courseCoordinatorBatchScopeRef.current = user.email;
    let isCurrent = true;
    loadCourseCoordinatorProgrammeBatches(user.email).then((loadedBatches) => {
      if (!isCurrent || loadedBatches.length === 0) return;
      const hasSelectedBatch = loadedBatches.some((batch) => batch.id === batchId);
      if (!hasSelectedBatch) {
        const initialBatch = loadedBatches.find((batch) => batch.status === 'ACTIVE') || loadedBatches[0];
        setBatchId(initialBatch?.id ?? null);
      }
    }).catch(() => {});
    return () => { isCurrent = false; };
  }, [batchId, loadCourseCoordinatorProgrammeBatches, role, setBatchId, user?.email]);
  const currentSpan = isHod
    ? (hodDashboard?.activeBatch ?? '—')
    : selectedBatch
    ? getBatchYearSpan(selectedBatch)
    : (uniqueBatches.find((ub) => ub.startYear === academicYear)?.span || uniqueBatches[0]?.span || '—');

  const currentUniqueBatch = isHod
    ? { status: hodDashboard?.activeBatch ? 'ACTIVE' : null }
    : uniqueBatches.find((ub) => ub.span === currentSpan) || uniqueBatches[0];
  const isBatchActive = isHod
    ? Boolean(hodDashboard?.activeBatch)
    : currentUniqueBatch?.status === 'ACTIVE' || currentUniqueBatch?.status === 'INITIALIZED';

  const handleBatchChange = (targetSpan) => {
    const matchingUnique = uniqueBatches.find((ub) => ub.span === targetSpan);
    if (matchingUnique) {
      const progBatch = rawBatches.find((b) => {
        const bSpan = getBatchYearSpan(b);
        return bSpan === targetSpan && (!programmeId || b.programmeId === programmeId);
      }) || rawBatches.find((b) => getBatchYearSpan(b) === targetSpan) || rawBatches[0];

      if (progBatch) {
        setBatchId(progBatch.id);
        if (progBatch.startYear) {
          setAcademicYear(progBatch.startYear);
        }
      }
    }
  };

  const handleHodDepartmentChange = (departmentId) => {
    // The selected Master Programme belongs to the old Department and must
    // never remain available after the HOD changes the sidebar Department.
    setProgrammeId(null);
    setSelectedDepartmentId(departmentId);
  };

  // Dropdown States
  const [navOpenDirector, setNavOpenDirector] = useState(false);
  const [navOpenHod, setNavOpenHod] = useState(false);
  const [navOpenPc, setNavOpenPc] = useState(false);
  const [navOpenSetup, setNavOpenSetup] = useState(false);
  const [navOpenReview, setNavOpenReview] = useState(false);
  const [navOpenFaculty, setNavOpenFaculty] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isCoordinatorRole = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  const fullPath = location.pathname + location.search;

  const activeSetupItem = PROGRAMME_SETUP_NAV.find((item) => item.path === location.pathname);

  const currentReviewTab = location.pathname === '/coordinator-review'
    ? (new URLSearchParams(location.search).get('tab') || 'config')
    : null;

  const activeReviewItem = currentReviewTab
    ? (COURSE_REVIEWS_NAV.find((item) => item.path.includes(`tab=${currentReviewTab}`)) || COURSE_REVIEWS_NAV[0])
    : null;

  const activeFacultyItem = FACULTY_NAV.find((item) => {
    if (item.path === fullPath) return true;
    return item.path.split('?')[0] === location.pathname;
  });

  const roleText = {
    IQAC: 'IQAC Admin',
    DIRECTOR: 'School Director',
    HOD: 'Head of Department (HOD)',
    PROGRAMME_COORDINATOR: 'Programme Coordinator',
    FACULTY: 'Course Coordinator',
  }[role] || role;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : 'DY';

  return (
    <aside
      className="nba-sidebar-nav"
      style={{
        width: 280,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#111827',
        borderRight: '1px solid rgba(148,163,184,0.14)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px 14px 14px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Brand Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 4px 4px', flexShrink: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            flexShrink: 0,
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            boxShadow: '0 8px 22px rgba(37,99,235,0.35)',
            color: '#fff',
            fontWeight: 900,
            fontSize: 13,
            display: 'grid',
            placeItems: 'center',
            letterSpacing: '0.04em',
          }}
        >
          OBE
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <strong style={{ color: '#fff', fontSize: 13.5, fontWeight: 800, lineHeight: 1.2 }}>
            OBE Attainment System
          </strong>
          <span style={{ color: '#8292ad', fontSize: 10.5, lineHeight: 1.2 }}>
            D. Y. Patil International University
          </span>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.18)', width: '100%', flexShrink: 0 }} />

      {/* Governance roles use scoped access context instead of the global batch selector. */}
      {(role === 'DIRECTOR' || role === 'HOD' || role === 'PROGRAMME_COORDINATOR') ? (
        <>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.28), rgba(30,41,59,0.72))',
              border: '1px solid rgba(165,180,252,0.30)',
              borderRadius: 14,
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9.5, color: '#c7d2fe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {role === 'DIRECTOR'
                  ? 'Director Access'
                  : role === 'HOD'
                  ? 'HOD Access'
                  : 'Programme Coordinator Access'}
              </span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.16)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)' }}>
                ACTIVE
              </span>
            </div>
            {role !== 'HOD' && role !== 'PROGRAMME_COORDINATOR' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, padding: '0 8px', borderRadius: 8, border: '1px solid rgba(165,180,252,0.20)', background: 'rgba(15,23,42,0.40)' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', background: 'rgba(129,140,248,0.18)', color: '#c7d2fe', flexShrink: 0 }}>
                  <Icon name="shield" active size={13} />
                </span>
                <span style={{ color: '#f8fafc', fontSize: 11.5, fontWeight: 800, lineHeight: 1.2 }}>
                  {role === 'DIRECTOR' ? 'School-level governance' : 'Programme-level governance'}
                </span>
              </div>
            )}
            {role === 'HOD' && (
              <div>
                <select
                  id="hod-universal-department"
                  value={selectedDepartmentId ?? ''}
                  onChange={(event) => handleHodDepartmentChange(event.target.value)}
                  disabled={departments.length === 0}
                  style={{ width: '100%', height: 32, borderRadius: 8, border: '1px solid rgba(165,180,252,0.30)', background: '#1e293b', color: '#f8fafc', fontSize: 11.5, fontWeight: 700, padding: '0 8px', fontFamily: 'inherit', cursor: departments.length ? 'pointer' : 'not-allowed', outline: 'none' }}
                >
                  {departments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : departments.map((department) => (
                    <option key={department.id} value={department.id} style={{ color: '#0f172a', background: '#ffffff' }}>
                      {department.name || department.code || department.id}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {role === 'PROGRAMME_COORDINATOR' && (
              <select
                aria-label="Master programme"
                value={programmeId ?? ''}
                onChange={(event) => setProgrammeId(event.target.value)}
                disabled={masterProgrammes.length === 0}
                style={{ width: '100%', height: 32, borderRadius: 8, border: '1px solid rgba(165,180,252,0.30)', background: '#1e293b', color: '#f8fafc', fontSize: 11.5, fontWeight: 700, padding: '0 8px', fontFamily: 'inherit', cursor: masterProgrammes.length ? 'pointer' : 'not-allowed', outline: 'none' }}
              >
                {masterProgrammes.length === 0 ? <option value="">No assigned master programmes</option> : masterProgrammes.map((programme) => (
                  <option key={programme.id} value={programme.id} style={{ color: '#0f172a', background: '#ffffff' }}>
                    {programme.code || programme.id} — {programme.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.18)', width: '100%', flexShrink: 0 }} />
        </>
      ) : role === 'FACULTY' ? (
        <>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8,145,178,0.25), rgba(30,41,59,0.72))',
              border: '1px solid rgba(103,232,249,0.28)',
              borderRadius: 14,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 9.5, color: '#a5f3fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Course-Level Access
              </span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.16)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)' }}>
                ASSIGNED
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 34, padding: '0 8px', borderRadius: 8, border: '1px solid rgba(103,232,249,0.18)', background: 'rgba(15,23,42,0.42)' }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, display: 'grid', placeItems: 'center', background: 'rgba(6,182,212,0.16)' }}>
                <Icon name="outcomes" active size={13} />
              </span>
              <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
                <span style={{ color: '#f8fafc', fontSize: 11.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCourseOffering?.courseCode || 'Select an assigned course'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCourseOffering ? `${selectedCourseOffering.courseName || 'Programme Batch Course'} · Sem ${selectedCourseOffering.semester ?? '—'}` : `${courseOfferings.length} assigned programme-batch course(s)`}
                </span>
              </div>
            </div>
            <select
              value={batchId ?? ''}
              onChange={(event) => setBatchId(event.target.value || null)}
              disabled={batches.length === 0}
              aria-label="Programme batch"
              style={{ width: '100%', height: 32, borderRadius: 8, border: '1px solid rgba(103,232,249,0.28)', background: 'rgba(15,23,42,0.55)', color: '#f8fafc', padding: '0 8px', fontSize: 11.5, fontWeight: 700, outline: 'none', cursor: batches.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {batches.length === 0 ? (
                <option value="">No assigned programme batches</option>
              ) : (
                batches.map((batch) => (
                  <option key={batch.id} value={batch.id} style={{ color: '#0f172a', background: '#ffffff' }}>
                    {batch.name || batch.programmeBatchId}
                  </option>
                ))
              )}
            </select>
          </div>
          <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.18)', width: '100%', flexShrink: 0 }} />
        </>
      ) : <>
      {/* ── Academic Batch Selector with Status Tags ────────────────── */}
      <div
        style={{
          background: 'rgba(51, 65, 85, 0.45)',
          border: '1px solid rgba(148,163,184,0.16)',
          borderRadius: 14,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9.5, color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Academic Batch
          </span>
          <span
            style={{
              fontSize: '9px',
              fontWeight: '800',
              padding: '1px 6px',
              borderRadius: '4px',
              background: isBatchActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: isBatchActive ? '#4ade80' : '#f87171',
              border: `1px solid ${isBatchActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {currentUniqueBatch?.status === 'GRADUATED'
              ? 'GRADUATED'
              : currentUniqueBatch?.status === 'INITIALIZED'
              ? 'UPCOMING'
              : isBatchActive
              ? 'ACTIVE'
              : 'CLOSED'}
          </span>
        </div>
        <select
          value={currentSpan}
          onChange={(e) => handleBatchChange(e.target.value)}
          disabled={isHod}
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: '800',
            padding: '0 8px',
            cursor: isHod ? 'default' : 'pointer',
            outline: 'none',
          }}
        >
          {isHod ? (
            <option value={currentSpan}>{currentSpan}</option>
          ) : uniqueBatches.map((ub) => {
            const isCurrent = ub.span === '2025-2029' || ub.startYear === '2025-26';
            const statusLabel = isCurrent
              ? '(Active — Current)'
              : ub.status === 'ACTIVE'
              ? '(Active)'
              : ub.status === 'GRADUATED'
              ? '(Graduated / Alumni)'
              : ub.status === 'INITIALIZED'
              ? '(Upcoming)'
              : '(Closed)';

            return (
              <option key={ub.span} value={ub.span} style={{ color: '#0f172a', background: '#ffffff' }}>
                Batch {ub.span} {statusLabel}
              </option>
            );
          })}
        </select>
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.18)', width: '100%', flexShrink: 0 }} />
      </>}

      {/* ── MAIN NAVIGATION AREA ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 2 }}>
        {role === 'DIRECTOR' ? (
          <nav style={{ position: 'relative' }}>
            {(() => {
              const activeDirectorItem = DIRECTOR_NAV.find((item) => location.pathname === item.path);
              return (
                <>
                  <button
                    type="button"
                    aria-expanded={navOpenDirector}
                    onClick={() => setNavOpenDirector((prev) => !prev)}
                    style={{
                      width: '100%',
                      minHeight: 42,
                      border: navOpenDirector ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(148,163,184,0.20)',
                      borderRadius: 12,
                      background: 'rgba(30,41,59,0.72)',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(165,180,252,0.25)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name={activeDirectorItem?.icon || 'dashboard'} active size={13} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeDirectorItem ? activeDirectorItem.label : 'Director Menu'}
                    </span>
                    <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenDirector ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                      <Icon name="chevron" size={14} />
                    </span>
                  </button>

                  {navOpenDirector && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, padding: 5, background: '#1f2937', border: '1px solid rgba(148,163,184,0.22)', borderRadius: 12, boxShadow: '0 18px 34px rgba(2,6,23,0.32)', display: 'grid', gap: 2, maxHeight: '340px', overflowY: 'auto', zIndex: 50 }}>
                      {DIRECTOR_NAV.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { navigate(item.path); setNavOpenDirector(false); }}
                            style={{ minHeight: 40, border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent', borderRadius: 9, background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '6px 9px', textAlign: 'left', boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none', fontFamily: 'inherit' }}
                          >
                            <span style={{ width: 24, height: 24, borderRadius: 6, background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Icon name={item.icon} active={isActive} size={13} />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>{item.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </nav>
        ) : role === 'HOD' ? (
          <nav style={{ position: 'relative' }}>
            {(() => {
              const activeHodItem = HOD_NAV.find((item) => location.pathname === item.path);
              return (
                <>
                  <button
                    type="button"
                    aria-expanded={navOpenHod}
                    onClick={() => setNavOpenHod((prev) => !prev)}
                    style={{
                      width: '100%',
                      minHeight: 42,
                      border: navOpenHod ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(148,163,184,0.20)',
                      borderRadius: 12,
                      background: 'rgba(30,41,59,0.72)',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(165,180,252,0.25)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name={activeHodItem?.icon || 'dashboard'} active size={13} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeHodItem ? activeHodItem.label : 'HOD Menu'}
                    </span>
                    <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenHod ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                      <Icon name="chevron" size={14} />
                    </span>
                  </button>

                  {navOpenHod && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, padding: 5, background: '#1f2937', border: '1px solid rgba(148,163,184,0.22)', borderRadius: 12, boxShadow: '0 18px 34px rgba(2,6,23,0.32)', display: 'grid', gap: 2, maxHeight: '360px', overflowY: 'auto', zIndex: 50 }}>
                      {HOD_NAV.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { navigate(item.path); setNavOpenHod(false); }}
                            style={{ minHeight: 40, border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent', borderRadius: 9, background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '6px 9px', textAlign: 'left', boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none', fontFamily: 'inherit' }}
                          >
                            <span style={{ width: 24, height: 24, borderRadius: 6, background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Icon name={item.icon} active={isActive} size={13} />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>{item.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </nav>
        ) : role === 'PROGRAMME_COORDINATOR' ? (
          <nav style={{ position: 'relative' }}>
            {(() => {
              const activePcItem = PROGRAMME_COORDINATOR_NAV.find((item) => location.pathname === item.path);
              return (
                <>
                  <button
                    type="button"
                    aria-expanded={navOpenPc}
                    onClick={() => setNavOpenPc((prev) => !prev)}
                    style={{
                      width: '100%',
                      minHeight: 42,
                      border: navOpenPc ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(148,163,184,0.20)',
                      borderRadius: 12,
                      background: 'rgba(30,41,59,0.72)',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(99,102,241,0.20)', border: '1px solid rgba(165,180,252,0.25)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name={activePcItem?.icon || 'dashboard'} active size={13} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activePcItem ? activePcItem.label : 'Programme Coordinator Menu'}
                    </span>
                    <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenPc ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                      <Icon name="chevron" size={14} />
                    </span>
                  </button>

                  {navOpenPc && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, padding: 5, background: '#1f2937', border: '1px solid rgba(148,163,184,0.22)', borderRadius: 12, boxShadow: '0 18px 34px rgba(2,6,23,0.32)', display: 'grid', gap: 2, maxHeight: '360px', overflowY: 'auto', zIndex: 50 }}>
                      {PROGRAMME_COORDINATOR_NAV.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { navigate(item.path); setNavOpenPc(false); }}
                            style={{ minHeight: 40, border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent', borderRadius: 9, background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '6px 9px', textAlign: 'left', boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none', fontFamily: 'inherit' }}
                          >
                            <span style={{ width: 24, height: 24, borderRadius: 6, background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Icon name={item.icon} active={isActive} size={13} />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>{item.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </nav>
        ) : isCoordinatorRole ? (
          <>
            {/* ── DROPDOWN 1: Programme Setup & Management ────────────────────────────── */}
            <nav style={{ position: 'relative' }}>
              <button
                type="button"
                aria-expanded={navOpenSetup}
                onClick={() => {
                  setNavOpenSetup((prev) => !prev);
                  setNavOpenReview(false);
                }}
                style={{
                  width: '100%',
                  minHeight: 42,
                  border: navOpenSetup ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(148,163,184,0.20)',
                  borderRadius: 12,
                  background: 'rgba(30,41,59,0.72)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: 'rgba(99,102,241,0.20)',
                    border: '1px solid rgba(165,180,252,0.25)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={activeSetupItem?.icon || 'academic'} active size={13} />
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeSetupItem ? activeSetupItem.label : '1. Programme Setup & Management'}
                </span>
                <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenSetup ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              {navOpenSetup && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 6,
                    padding: 5,
                    background: '#1f2937',
                    border: '1px solid rgba(148,163,184,0.22)',
                    borderRadius: 12,
                    boxShadow: '0 18px 34px rgba(2,6,23,0.32)',
                    display: 'grid',
                    gap: 2,
                    maxHeight: '280px',
                    overflowY: 'auto',
                    zIndex: 50,
                  }}
                >
                  {PROGRAMME_SETUP_NAV.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setNavOpenSetup(false);
                        }}
                        className="nba-nav-item"
                        style={{
                          minHeight: 40,
                          border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent',
                          borderRadius: 9,
                          background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                          color: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '6px 9px',
                          textAlign: 'left',
                          boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none',
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={item.icon} active={isActive} size={13} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>
                            {item.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </nav>

            {/* ── DROPDOWN 2: Course Submissions Review (Reviews from Course Coordinator) ─ */}
            <nav style={{ position: 'relative' }}>
              <button
                type="button"
                aria-expanded={navOpenReview}
                onClick={() => {
                  setNavOpenReview((prev) => !prev);
                  setNavOpenSetup(false);
                }}
                style={{
                  width: '100%',
                  minHeight: 42,
                  border: navOpenReview ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(148,163,184,0.20)',
                  borderRadius: 12,
                  background: 'rgba(30,41,59,0.72)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: 'rgba(245,158,11,0.18)',
                    border: '1px solid rgba(253,230,138,0.25)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={activeReviewItem?.icon || 'nav'} active size={13} />
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 800, color: '#fef08a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeReviewItem ? activeReviewItem.label : '2. Course Submissions Review'}
                </span>
                <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenReview ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                  <Icon name="chevron" size={14} />
                </span>
              </button>

              {navOpenReview && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 6,
                    padding: 5,
                    background: '#1f2937',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 12,
                    boxShadow: '0 18px 34px rgba(2,6,23,0.32)',
                    display: 'grid',
                    gap: 2,
                    maxHeight: '280px',
                    overflowY: 'auto',
                    zIndex: 50,
                  }}
                >
                  {COURSE_REVIEWS_NAV.map((item) => {
                    const isActive = activeReviewItem?.id === item.id || fullPath === item.path;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setNavOpenReview(false);
                        }}
                        className="nba-nav-item"
                        style={{
                          minHeight: 40,
                          border: isActive ? '1px solid rgba(253,230,138,0.3)' : '1px solid transparent',
                          borderRadius: 9,
                          background: isActive ? 'rgba(245,158,11,0.16)' : 'transparent',
                          color: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '6px 9px',
                          textAlign: 'left',
                          boxShadow: isActive ? 'inset 3px 0 0 #f59e0b' : 'none',
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: isActive ? 'rgba(245,158,11,0.18)' : 'rgba(148,163,184,0.08)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={item.icon} active={isActive} size={13} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>
                            {item.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </nav>
          </>
        ) : (
          /* COURSE COORDINATOR: SINGLE DROPDOWN MENU (MATCHING ORIGINAL DESIGN EXACTLY) */
          <nav style={{ position: 'relative' }}>
            <button
              type="button"
              aria-expanded={navOpenFaculty}
              onClick={() => setNavOpenFaculty((prev) => !prev)}
              style={{
                width: '100%',
                minHeight: 44,
                border: navOpenFaculty ? '1px solid rgba(165,180,252,0.45)' : '1px solid rgba(148,163,184,0.20)',
                borderRadius: 13,
                background: 'rgba(30,41,59,0.72)',
                color: '#f8fafc',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: 'rgba(99,102,241,0.18)',
                  border: '1px solid rgba(165,180,252,0.22)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={activeFacultyItem?.icon || 'nav'} active size={14} />
              </span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeFacultyItem ? activeFacultyItem.label : 'Select Navigation Page'}
              </span>
              <span style={{ display: 'grid', placeItems: 'center', transition: 'transform 0.2s', transform: navOpenFaculty ? 'rotate(180deg)' : 'rotate(0deg)', color: '#64748b' }}>
                <Icon name="chevron" size={15} />
              </span>
            </button>

            {navOpenFaculty && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  padding: 5,
                  background: '#1f2937',
                  border: '1px solid rgba(148,163,184,0.22)',
                  borderRadius: 12,
                  boxShadow: '0 18px 34px rgba(2,6,23,0.32)',
                  display: 'grid',
                  gap: 2,
                  maxHeight: '340px',
                  overflowY: 'auto',
                  zIndex: 50,
                }}
              >
                {FACULTY_NAV.map((item) => {
                  const isActive = fullPath === item.path || item.path.split('?')[0] === location.pathname;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setNavOpenFaculty(false);
                      }}
                      className="nba-nav-item"
                      style={{
                        minHeight: 42,
                        border: isActive ? '1px solid rgba(165,180,252,0.24)' : '1px solid transparent',
                        borderRadius: 10,
                        background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        textAlign: 'left',
                        boxShadow: isActive ? 'inset 3px 0 0 #818cf8' : 'none',
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: isActive ? 'rgba(99,102,241,0.16)' : 'rgba(148,163,184,0.08)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon name={item.icon} active={isActive} size={14} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1, color: '#f8fafc' }}>
                          {item.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>
        )}
      </div>

      {/* ── Profile card ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsProfileOpen(true)}
        aria-label="Open account profile"
        style={{
          width: '100%',
          border: 0,
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(148,163,184,0.16)',
          borderRadius: 16,
          padding: 10,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#475569,#47556999)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f9fafb', fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(user?.name || roleText || 'Academic User').split(' ').slice(0, 3).join(' ')}
          </div>
          <div style={{ color: '#9ca3af', fontSize: 10.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {roleText}
          </div>
        </div>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background: 'rgba(148,163,184,0.10)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="profile" size={14} />
        </span>
      </button>

      {/* ── Need Help card ─────────────────────────────────────────── */}
      <div
        style={{
          padding: '11px 12px',
          background: 'rgba(30,41,59,0.62)',
          border: '1px solid rgba(148,163,184,0.18)',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: 'rgba(148,163,184,0.12)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="mail" size={15} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#f9fafb', fontWeight: 900, fontSize: 12, marginBottom: 3 }}>Need Help?</div>
          <a href="mailto:nba@dypiu.ac.in" style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 10.5, wordBreak: 'break-all', textDecoration: 'none' }}>
            nba@dypiu.ac.in
          </a>
        </div>
      </div>

      {/* ── Logout Button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={logout}
        style={{
          width: '100%',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          gap: 8,
          background: 'rgba(127,29,29,0.02)',
          border: '1px solid rgba(248,113,113,0.42)',
          borderRadius: 14,
          padding: '10px 13px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(127,29,29,0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(127,29,29,0.02)';
        }}
      >
        <Icon name="logout" size={17} />
        <span style={{ color: '#f87171', fontWeight: 900, fontSize: 12 }}>Logout</span>
      </button>
      <UserProfileModal
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        roleLabel={roleText}
        courseCount={courseOfferings.length}
        batchName={selectedBatch?.name}
      />
    </aside>
  );
}
