import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, GraduationCap, CheckCircle2, ArrowRight, Layers, Check, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getDirectorSchoolSummary,
  getDirectorSetupProgress,
  getDepartmentSummary,
  getSchools,
  getDepartments,
  getProgrammes,
  updateDirectorSetupProgress,
} from '../../api/academic';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schoolsList, setSchoolsList] = useState([]);
  const [deptSummaryList, setDeptSummaryList] = useState([]);
  const [progList, setProgList] = useState([]);
  const [setupProgress, setSetupProgress] = useState(null);
  const [schoolSummary, setSchoolSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const directorEmail = user?.email || '';
    setIsLoading(true);

    const loadDirectorDashboardData = async () => {
      try {
        console.log('[DirectorDashboard] Loading all metrics for director:', directorEmail);
        const [sumRes, schRes, deptRes, progRes, progStateRes] = await Promise.allSettled([
          getDirectorSchoolSummary(directorEmail),
          getSchools(directorEmail),
          getDepartments(),
          getProgrammes(),
          getDirectorSetupProgress('', directorEmail),
        ]);

        if (!isMounted) return;

        let summaryData = null;
        if (sumRes.status === 'fulfilled') {
          summaryData = sumRes.value?.data?.data || sumRes.value?.data || sumRes.value;
          if (summaryData && (summaryData.schoolName || summaryData.schoolId)) {
            setSchoolSummary(summaryData);
          }
        }

        if (schRes.status === 'fulfilled') {
          const schs = schRes.value?.data?.schools || schRes.value?.schools || schRes.value?.data?.data || schRes.value?.data || schRes.value;
          if (Array.isArray(schs) && schs.length > 0) {
            setSchoolsList(schs);
          }
        }

        if (deptRes.status === 'fulfilled') {
          const depts = deptRes.value?.data?.departments || deptRes.value?.departments || deptRes.value?.data?.data || deptRes.value?.data || deptRes.value;
          if (Array.isArray(depts)) {
            setDeptSummaryList(depts);
          }
        }

        if (progRes.status === 'fulfilled') {
          const progs = progRes.value?.data?.programmes || progRes.value?.programmes || progRes.value?.data?.data || progRes.value?.data || progRes.value;
          if (Array.isArray(progs)) {
            setProgList(progs);
          }
        }

        if (progStateRes.status === 'fulfilled') {
          const pData = progStateRes.value?.data?.data || progStateRes.value?.data || progStateRes.value;
          if (pData) setSetupProgress(pData);
        }
      } catch (err) {
        console.warn('[DirectorDashboard] Error loading dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDirectorDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const primarySchool = (schoolsList.length > 0 ? schoolsList[0] : null) || (schoolSummary ? {
    id: schoolSummary.schoolId,
    name: schoolSummary.schoolName,
    code: schoolSummary.schoolCode,
    director: schoolSummary.directorName,
    directorEmail: schoolSummary.directorEmail,
  } : null);

  const hasSchoolInDb = Boolean(primarySchool?.name || schoolSummary?.schoolName);
  const displaySchoolName = primarySchool?.name || schoolSummary?.schoolName || 'School Not Added Yet';
  const displaySchoolCode = primarySchool?.code || schoolSummary?.schoolCode || '—';
  const displayDirectorName = primarySchool?.director || primarySchool?.directorName || schoolSummary?.directorName || user?.name || 'School Director';

  const totalDepts = schoolSummary?.totalDepartments ?? deptSummaryList.length;
  const assignedHODs = schoolSummary?.assignedHODsCount ?? deptSummaryList.filter((d) => {
    const rawHod = d.hod || d.deptHodName;
    return rawHod && rawHod !== 'Unassigned' && rawHod !== 'No HOD Added Yet';
  }).length;
  const pendingHODs = schoolSummary?.unassignedHODsCount ?? Math.max(0, totalDepts - assignedHODs);
  const totalProgrammes = schoolSummary?.totalProgrammes ?? progList.length;

  const targetSchoolId = primarySchool?.id || schoolSummary?.schoolId || '';
  const isLocalStorageCompleted = Boolean(localStorage.getItem(`director_setup_completed_${targetSchoolId}`)) ||
                                  Boolean(localStorage.getItem(`director_setup_completed_${user?.email}`));

  const backendCompletedSteps = setupProgress?.completedSteps || [];
  const isSetupMarkedCompleted = setupProgress?.overallStatus === 'COMPLETED' ||
                                backendCompletedSteps.includes('review') ||
                                isLocalStorageCompleted ||
                                (totalDepts > 0 && totalProgrammes > 0 && hasSchoolInDb);

  const isSchoolDone = isSetupMarkedCompleted || backendCompletedSteps.includes('school') || hasSchoolInDb;
  const isDeptDone = isSetupMarkedCompleted || backendCompletedSteps.includes('department') || (totalDepts > 0);
  const isHodDone = isSetupMarkedCompleted || backendCompletedSteps.includes('department') || backendCompletedSteps.includes('hod') || (assignedHODs > 0) || (totalDepts > 0);
  const isProgDone = isSetupMarkedCompleted || backendCompletedSteps.includes('programme') || (totalProgrammes > 0);

  const isCompleted = isSetupMarkedCompleted || (isSchoolDone && isDeptDone && isHodDone && isProgDone);
  const currentStepNum = setupProgress?.currentStep || (isCompleted ? 4 : (isProgDone ? 4 : (isDeptDone ? 3 : (isSchoolDone ? 2 : 1))));
  const isNotStarted = !hasSchoolInDb;

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
    const targetSchoolId = primarySchool?.id || schoolSummary?.schoolId || '';
    if (isCompleted) {
      try {
        await updateDirectorSetupProgress(targetSchoolId, currentStepNum, user?.email || '');
      } catch (err) {
        console.warn('Failed to reset progress for manage setup:', err);
      }
    }
    navigate('/director/setup-workflow');
  };

  // Setup steps completion state strictly based on backend response & database presence
  const setupSteps = [
    { title: 'School Information', done: isSchoolDone, desc: isSchoolDone ? `${displaySchoolName} (${displaySchoolCode})` : 'Not added yet' },
    { title: 'Department Hierarchy', done: isDeptDone, desc: `${totalDepts} department${totalDepts !== 1 ? 's' : ''} established` },
    { title: 'HOD Assignments', done: isHodDone, desc: `${assignedHODs} of ${totalDepts} HODs assigned` },
    { title: 'Programme Allocation', done: isProgDone, desc: `${totalProgrammes} programme${totalProgrammes !== 1 ? 's' : ''} mapped` },
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
              `${schoolSummary?.schoolName} · ${schoolSummary?.schoolCode || ''} ${schoolSummary?.directorName ? `· Director: ${schoolSummary.directorName}` : ''}`
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
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>In {schoolSummary?.schoolCode || '—'}</div>
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
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{schoolSummary?.schoolName || '—'}</div>
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
