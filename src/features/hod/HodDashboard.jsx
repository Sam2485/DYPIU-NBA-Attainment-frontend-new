import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileText,
  Calendar,
  Users,
  UserCheck,
  ChevronRight,
  Check,
  Clock,
  TrendingUp,
  PlayCircle,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenLoadingState, ScreenErrorState } from '../../components/common/ScreenState';

// ── HOD Department Setup Workflow Definition ─────────────────────────────────
const HOD_STEPS = [
  { step: 2, label: 'Batch Setup',            desc: 'Create programme batches',         path: '/hod/setup-workflow?step=2', icon: Calendar,      color: '#0284c7', bg: '#f0f9ff' },
  { step: 3, label: 'Coordinator Allocation', desc: 'Assign programme coordinators',    path: '/hod/setup-workflow?step=3', icon: UserCheck,     color: '#7c3aed', bg: '#f5f3ff' },
  { step: 4, label: 'PO / PSO / PEO',         desc: 'Define the outcome framework',    path: '/hod/setup-workflow?step=4', icon: Layers,        color: '#0f766e', bg: '#f0fdfa' },
  { step: 5, label: 'Review & Confirm',       desc: 'Verify setup and finish',          path: '/hod/setup-workflow?step=5', icon: CheckCircle2,  color: '#059669', bg: '#f0fdf4' },
];

export default function HodDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hodDashboard = null,
    hodWorkflowProgress = null,
    loadHodDashboard,
    loadHodSetupProgress,
    selectedDepartmentId,
  } = useAcademic();

  const [screenLoading, setScreenLoading] = useState(false);
  const [screenError, setScreenError] = useState(null);

  const fetchHodData = useCallback(async (departmentId = selectedDepartmentId) => {
    if (!departmentId) return;

    setScreenLoading(true);
    setScreenError(null);
    try {
      await Promise.allSettled([
        loadHodDashboard ? loadHodDashboard(departmentId) : Promise.resolve(),
        loadHodSetupProgress ? loadHodSetupProgress(departmentId) : Promise.resolve(),
      ]);
    } catch (err) {
      console.warn('HodDashboard fetch failed:', err);
      setScreenError(err?.customMessage || err?.message || 'Failed to load HOD dashboard.');
    } finally {
      setScreenLoading(false);
    }
  }, [loadHodDashboard, loadHodSetupProgress, selectedDepartmentId]);

  useEffect(() => {
    fetchHodData(selectedDepartmentId);
  }, [fetchHodData, selectedDepartmentId]);

  const department = hodDashboard?.department ?? null;
  const statistics = hodDashboard?.statistics ?? {};
  const totalProgrammes = statistics.programmesCount ?? statistics.programmes ?? null;
  const totalCourses = statistics.coursesCount ?? null;
  const pendingApprovalsCount = statistics.pendingApprovalsCount ?? null;
  const activeBatches = statistics.activeBatches ?? '—';

  // ── Per-step completion tracking ───────────────────────────────────────────
  const safeProgress = hodWorkflowProgress ?? hodDashboard?.workflowProgress ?? hodDashboard?.setupProgress ?? {};
  const stepStatus = HOD_STEPS.map((s, idx) => {
    if (Array.isArray(safeProgress.stepStatus)) {
      return !!safeProgress.stepStatus[idx];
    }
    if (Array.isArray(safeProgress.completedSteps)) {
      return safeProgress.completedSteps.some((step) => Number(step) === s.step);
    }
    return !!safeProgress[s.step] || !!safeProgress[`step-${s.step}`];
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct = Math.round((completedCount / HOD_STEPS.length) * 100);
  const nextStep = HOD_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum = nextStep ? nextStep.step : 2;

  const quickActions = [
    {
      id: 'batches',
      title: 'Batch Management',
      desc: 'Initialize 4-year batch cycles and manage active batches.',
      path: '/hod/batch-management',
      icon: Calendar,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
    },
    {
      id: 'outcomes',
      title: 'Programme Outcomes',
      desc: 'Define and review POs, PSOs, and PEOs.',
      path: '/hod/programme-outcomes',
      icon: Layers,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
    },
    {
      id: 'programme-coordinators',
      title: 'Programme Coordinators',
      desc: 'Assign and manage Programme Coordinators for degree programmes.',
      path: '/hod/programme-coordinators',
      icon: Users,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
    },
    {
      id: 'approvals',
      title: 'Approvals & Verification',
      desc: 'Review Programme Coordinator submissions.',
      path: '/hod/approvals',
      icon: ShieldCheck,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : null,
      badgeWarn: pendingApprovalsCount > 0,
    },
    {
      id: 'reports',
      title: 'Reports Hub',
      desc: 'Access consolidated Attainment and ATR reports.',
      path: '/hod/reports',
      icon: FileText,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
    },
  ];

  // ── Style tokens ─────────────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink     = '#0f172a';
  const muted   = '#64748b';
  const accent  = '#4f46e5';

  if (screenLoading && !hodDashboard) {
    return <ScreenLoadingState message="Loading HOD Dashboard..." />;
  }

  if (screenError && !hodDashboard) {
    return <ScreenErrorState title="Failed to load HOD Dashboard" message={screenError} onRetry={fetchHodData} />;
  }

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Head of Department Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'Department HOD'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {department?.name ?? '—'} &nbsp;·&nbsp; Active Batches: <strong style={{ color: ink }}>{activeBatches}</strong>
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => navigate(`/hod/setup-workflow?step=${targetStepNum}`)}
            style={{
              height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '800',
              background: accent, color: '#fff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontFamily: 'inherit', flexShrink: 0,
              boxShadow: '0 4px 14px rgba(79,70,229,0.28)',
            }}
          >
            <PlayCircle size={15} />
            {targetStepNum === 1 && completedCount === 0
              ? 'Start Setup Workflow (Step 1)'
              : completedCount === HOD_STEPS.length
              ? 'Manage Department Setup'
              : `Continue Workflow (Step ${targetStepNum}: ${nextStep?.label || ''})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Programmes */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Degree Programmes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <GraduationCap size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalProgrammes ?? '—'}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>In your department</div>
        </div>

        {/* Courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Total Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <Layers size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalCourses ?? '—'}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>Across active curricula</div>
        </div>

        {/* Approvals */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Pending Approvals</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: pendingApprovalsCount > 0 ? '#fffbeb' : '#f0fdf4', display: 'grid', placeItems: 'center', color: pendingApprovalsCount > 0 ? '#d97706' : '#16a34a' }}>
              <ShieldCheck size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: pendingApprovalsCount > 0 ? '#d97706' : ink, lineHeight: 1 }}>
            {pendingApprovalsCount ?? '—'}
          </div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>
            {pendingApprovalsCount > 0 ? 'Action required' : 'All clear'}
          </div>
        </div>

        {/* Workflow Progress */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Setup Progress</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: progressPct === 100 ? '#f0fdf4' : '#fffbeb', display: 'grid', placeItems: 'center', color: progressPct === 100 ? '#16a34a' : '#d97706' }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: progressPct === 100 ? '#16a34a' : ink, lineHeight: 1 }}>{progressPct}%</div>
          <div style={{ marginTop: '8px', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: progressPct === 100 ? '#10b981' : accent, borderRadius: '3px', transition: 'width .4s ease' }} />
          </div>
        </div>

      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
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
                <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: action.iconBg, color: action.iconColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
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

      {/* ── 4-STEP WORKFLOW PROGRESS ──────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Department Setup Workflow</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {HOD_STEPS.length} steps completed &nbsp;·&nbsp; {department?.name ?? 'Department Setup'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: accent }}>{progressPct}%</span>
            <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: accent, borderRadius: '3px', transition: 'width .3s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {HOD_STEPS.map((s, idx) => {
            const done    = stepStatus[idx];
            const current = !done && (idx === 0 || stepStatus[idx - 1]);
            const Icon    = s.icon;
            return (
              <div
                key={s.step}
                onClick={() => navigate(`/hod/setup-workflow?step=${s.step}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: current ? '#f5f3ff' : done ? '#fafafa' : '#ffffff',
                  border: `1.5px solid ${current ? '#c7d2fe' : done ? '#e2e8f0' : '#f1f5f9'}`,
                  cursor: 'pointer', transition: 'all .15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Step indicator circle */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: done ? '#f0fdf4' : current ? '#eef2ff' : '#f8fafc',
                  border: `1.5px solid ${done ? '#86efac' : current ? accent : '#e2e8f0'}`,
                  color: done ? '#16a34a' : current ? accent : muted,
                }}>
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>

                {/* Step info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: current ? accent : muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Step {s.step}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: current ? ink : done ? '#334155' : muted }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                    {s.desc}
                  </div>
                </div>

                {/* Status tag */}
                <div style={{ flexShrink: 0 }}>
                  {done ? (
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={11} /> Completed
                    </span>
                  ) : current ? (
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: accent, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> In Progress
                    </span>
                  ) : (
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 10px' }}>
                      Pending
                    </span>
                  )}
                </div>

                <ChevronRight size={16} style={{ color: current ? accent : '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
