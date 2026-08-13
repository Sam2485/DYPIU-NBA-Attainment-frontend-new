import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, ShieldCheck, Layers, Check, Clock, ChevronRight, Settings } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getDirectorSchoolSummary, getDirectorSetupProgress, getDepartmentSummary, updateDirectorSetupProgress } from '../../api/academic';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    departments = [],
    selectedSchool = null,
    masterProgrammes = [],
    directorApprovals = [],
  } = useAcademic();

  const [schoolSummary, setSchoolSummary] = useState(null);
  const [setupProgress, setSetupProgress] = useState(null);
  const [deptSummaryList, setDeptSummaryList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const targetSchoolId = selectedSchool?.id || 'sch-1';
    console.log('[DirectorDashboard] Mounting & fetching backend summary APIs for school:', targetSchoolId);

    // 1. Fetch School Summary on Dashboard load right after login for current Director
    getDirectorSchoolSummary(selectedSchool?.id || '', user?.email || '', user?.name || '')
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        console.log('[DirectorDashboard] getDirectorSchoolSummary loaded:', data);
        if (data && isMounted) setSchoolSummary(data);
      })
      .catch((err) => console.warn('[DirectorDashboard] Could not fetch director school summary:', err));

    // 2. Fetch Setup Progress from backend
    getDirectorSetupProgress(targetSchoolId)
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        console.log('[DirectorDashboard] getDirectorSetupProgress loaded:', data);
        if (data && isMounted) setSetupProgress(data);
      })
      .catch((err) => console.warn('[DirectorDashboard] Could not fetch director setup progress:', err));

    // 3. Fetch Department Summary
    getDepartmentSummary(targetSchoolId)
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        console.log('[DirectorDashboard] getDepartmentSummary loaded:', data);
        if (Array.isArray(data) && isMounted) setDeptSummaryList(data);
      })
      .catch((err) => console.warn('[DirectorDashboard] Could not fetch department summary:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const hasSchoolInDb = Boolean(schoolSummary?.schoolName || selectedSchool?.name);

  const totalDepts = schoolSummary?.totalDepartments ?? departments.length ?? 0;
  const assignedHODs = schoolSummary?.assignedHODsCount ?? departments.filter((d) => d.hod && d.hod !== 'Unassigned').length ?? 0;
  const pendingHODs = schoolSummary?.unassignedHODsCount ?? (totalDepts - assignedHODs);
  const totalProgrammes = schoolSummary?.totalProgrammes ?? masterProgrammes.length ?? 0;
  const pendingApprovalsCount = directorApprovals.filter((a) => a.status === 'PENDING').length || 0;

  const currentStepNum = setupProgress?.currentStep || 1;
  const overallStatus = setupProgress?.overallStatus || 'NOT_STARTED';
  const backendCompletedSteps = setupProgress?.completedSteps || [];

  const isCompleted = overallStatus === 'COMPLETED' || currentStepNum === 4;
  const isNotStarted = !hasSchoolInDb || overallStatus === 'NOT_STARTED' || (currentStepNum === 1 && backendCompletedSteps.length === 0);

  // Determine button text based on current step and completion status
  let buttonText = 'Continue Setup';
  if (isCompleted) {
    buttonText = 'Manage Setup';
  } else if (isNotStarted) {
    buttonText = 'Start Setup';
  } else {
    buttonText = `Continue Setup (Step ${currentStepNum})`;
  }

  const handleSetupButtonClick = async () => {
    const targetSchoolId = selectedSchool?.id || 'sch-1';
    if (isCompleted) {
      // If all steps finished, manage setup starts from Step 1
      try {
        await updateDirectorSetupProgress(targetSchoolId, 1);
      } catch (err) {
        console.warn('Failed to reset progress for manage setup:', err);
      }
    }
    navigate('/director/setup-workflow');
  };

  // Setup steps completion state strictly based on backend response completedSteps
  const setupSteps = [
    { title: 'School Information', done: backendCompletedSteps.includes('school'), desc: hasSchoolInDb ? 'Metadata & Dean allocation saved' : 'Not added yet' },
    { title: 'Department Hierarchy', done: backendCompletedSteps.includes('department'), desc: `${totalDepts} departments established` },
    { title: 'HOD Assignments', done: backendCompletedSteps.includes('department') && pendingHODs === 0, desc: `${assignedHODs} of ${totalDepts} HODs assigned` },
    { title: 'Programme Allocation', done: backendCompletedSteps.includes('programme') || isCompleted, desc: `${totalProgrammes} programmes mapped` },
  ];

  const completedCount = setupSteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / setupSteps.length) * 100);

  const quickActions = [
    {
      id: 'structure',
      title: 'School Structure & Hierarchy',
      desc: 'Inspect school metadata, departments, and programmes tree.',
      path: '/director/school-structure',
      icon: Layers,
    },
    {
      id: 'departments',
      title: 'Department Management & HODs',
      desc: 'Add departments and assign Heads of Departments.',
      path: '/director/department-management',
      icon: Users,
      badge: pendingHODs > 0 ? `${pendingHODs} HOD pending` : null,
      badgeWarn: pendingHODs > 0,
    },
    {
      id: 'programmes',
      title: 'Programme Overview',
      desc: 'View degree programmes, coordinators, and setup status.',
      path: '/director/programme-overview',
      icon: GraduationCap,
    },
  ];

  // ─── Style tokens ─────────────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';


  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Director Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            {hasSchoolInDb ? `Welcome, ${user?.name || 'School Director'}` : 'School Not Added Yet'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {hasSchoolInDb ? (
              `${schoolSummary?.schoolName || selectedSchool?.name} · ${schoolSummary?.schoolCode || selectedSchool?.code} ${schoolSummary?.directorName ? `· Director: ${schoolSummary.directorName}` : ''}`
            ) : (
              'No school metadata found in database. Please click Start Setup to configure your school.'
            )}
          </p>
        </div>
        <button
          onClick={handleSetupButtonClick}
          style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
        >
          {buttonText} <ArrowRight size={14} />
        </button>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Departments */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Departments</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalDepts}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>In {selectedSchool.code}</div>
        </div>

        {/* HODs */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>HODs Assigned</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>
            {assignedHODs}<span style={{ fontSize: '14px', fontWeight: '600', color: muted }}>/{totalDepts}</span>
          </div>
          <div style={{ fontSize: '11.5px', marginTop: '6px', fontWeight: '600', color: pendingHODs > 0 ? '#d97706' : '#16a34a' }}>
            {pendingHODs > 0 ? `${pendingHODs} pending` : 'All assigned'}
          </div>
        </div>

        {/* Programmes */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programmes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalProgrammes}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>Degree programmes</div>
        </div>
      </div>


      {/* ── QUICK ACTIONS ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => navigate(action.path)}
                style={{ ...surface, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'box-shadow .15s ease, border-color .15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#eef2ff', color: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: ink }}>{action.title}</span>
                    {action.badge && (
                      <span style={{
                        fontSize: '10.5px', fontWeight: '700', borderRadius: '5px', padding: '1px 7px',
                        background: action.badgeWarn ? '#fffbeb' : '#f0fdf4',
                        color: action.badgeWarn ? '#b45309' : '#16a34a',
                        border: `1px solid ${action.badgeWarn ? '#fde68a' : '#bbf7d0'}`,
                      }}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: muted, lineHeight: 1.4 }}>{action.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SETUP PROGRESS ──────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Setup Progress</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{selectedSchool.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: accent }}>{progressPct}%</span>
            <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: accent, borderRadius: '3px', transition: 'width .3s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {setupSteps.map((step, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: step.done ? '#fafafa' : '#ffffff', border: `1px solid ${step.done ? '#e2e8f0' : '#f1f5f9'}` }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: step.done ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${step.done ? '#86efac' : '#e2e8f0'}`, color: step.done ? '#16a34a' : '#94a3b8' }}>
                {step.done ? <Check size={12} /> : <Clock size={11} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: step.done ? ink : muted }}>{step.title}</div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '1px' }}>{step.desc}</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', borderRadius: '5px', padding: '2px 8px', flexShrink: 0, background: step.done ? '#f0fdf4' : '#f8fafc', color: step.done ? '#16a34a' : '#94a3b8', border: `1px solid ${step.done ? '#bbf7d0' : '#e2e8f0'}` }}>
                {step.done ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
