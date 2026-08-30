import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Layers,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Check,
  Clock,
  TrendingUp,
  PlayCircle,
  FileText,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenLoadingState, ScreenErrorState } from '../../components/common/ScreenState';

// ── Programme Coordinator 5-Step Programme-Batch Workflow ────────────────────
const PC_STEPS = [
  { step: 1, label: 'Add Courses', desc: 'Add courses to the programme batch', path: '/programme-coordinator/setup-workflow?step=1', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, label: 'Set PO/PSO Target', desc: 'Set programme-batch PO and PSO targets', path: '/programme-coordinator/setup-workflow?step=2', icon: Target, color: '#7c3aed', bg: '#f5f3ff' },
  { step: 3, label: 'Indirect Programme-Batch Attainment', desc: 'Upload and calculate indirect attainment', path: '/programme-coordinator/setup-workflow?step=3', icon: ClipboardList, color: '#0284c7', bg: '#f0f9ff' },
  { step: 4, label: 'Programme-Batch ATR', desc: 'Prepare the programme-batch action taken report', path: '/programme-coordinator/setup-workflow?step=4', icon: Layers, color: '#0f766e', bg: '#f0fdfa' },
  { step: 5, label: 'Review and Confirm', desc: 'Verify setup summary and finish', path: '/programme-coordinator/setup-workflow?step=5', icon: CheckCircle2, color: '#059669', bg: '#f0fdf4' },
];

export default function ProgrammeCoordinatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    programmeId = null,
    masterProgrammes = [],
    batchId,
    setBatchId,
    programmeCoordinatorDashboard = null,
    pcWorkflowProgress = null,
    loadProgrammeCoordinatorDashboard,
    loadPcSetupProgress,
  } = useAcademic();

  const [screenLoading, setScreenLoading] = useState(false);
  const [screenError, setScreenError] = useState(null);
  const dashboardRequestScopeRef = useRef(null);

  const selectedSidebarProgramme = masterProgrammes.find(
    (programme) => String(programme.id) === String(programmeId)
  ) ?? null;
  const selectedProgramme = programmeCoordinatorDashboard?.programme ?? selectedSidebarProgramme;

  // The sidebar resolves the coordinator's assigned programmes first. Do not
  // call the dashboard until its selected master programme exists in that
  // authoritative list.
  const activeProgId = selectedSidebarProgramme?.id ?? null;

  const fetchPcData = async () => {
    setScreenLoading(true);
    setScreenError(null);
    try {
      if (!activeProgId) return;
      const dashboard = await loadProgrammeCoordinatorDashboard(activeProgId);
      const activeBatch =
        dashboard?.batches?.find((batch) => (
          (batch.programmeBatchId ?? batch.id) === dashboard?.setupProgress?.programmeBatchId
        )) ??
        dashboard?.batches?.find((batch) => batch.status === 'ACTIVE') ??
        dashboard?.batches?.[0];
      const activeBatchId = activeBatch?.programmeBatchId ?? activeBatch?.id;
      if (activeBatchId && !batchId) {
        setBatchId(activeBatchId);
      }
      await loadPcSetupProgress(activeProgId, activeBatchId ?? batchId, user?.email);
    } catch (err) {
      console.warn('ProgrammeCoordinatorDashboard fetch failed:', err);
      setScreenError(err?.customMessage || err?.message || 'Failed to load Programme Coordinator dashboard.');
    } finally {
      setScreenLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProgId || !user?.email) return;
    const requestScope = `${activeProgId}:${user.email.toLowerCase()}`;
    if (dashboardRequestScopeRef.current === requestScope) return;
    dashboardRequestScopeRef.current = requestScope;
    fetchPcData();
  }, [activeProgId, loadPcSetupProgress, loadProgrammeCoordinatorDashboard, setBatchId, user?.email]);

  const dashboardProgrammeId =
    programmeCoordinatorDashboard?.programme?.id ??
    programmeCoordinatorDashboard?.masterProgrammeId ??
    programmeCoordinatorDashboard?.programmeId ??
    null;
  const scopedDashboard = dashboardProgrammeId && String(dashboardProgrammeId) !== String(activeProgId)
    ? null
    : programmeCoordinatorDashboard;
  const dashboardStatistics = scopedDashboard?.statistics ?? scopedDashboard?.stats ?? {};
  const countValue = (...values) => {
    const value = values.find((candidate) => Number.isFinite(Number(candidate)));
    return value === undefined ? 0 : Number(value);
  };
  const courseCount = countValue(
    dashboardStatistics.courses,
    dashboardStatistics.coursesCount,
    dashboardStatistics.masterCourses,
    dashboardStatistics.masterCoursesCount,
    scopedDashboard?.totalCoursesCount,
    scopedDashboard?.courses?.length
  );
  const courseOfferingsCount = countValue(
    dashboardStatistics.programmeBatchCourses,
    dashboardStatistics.programmeBatchCoursesCount,
    dashboardStatistics.totalProgrammeBatchCourses,
    dashboardStatistics.courseOfferings,
    dashboardStatistics.courseOfferingsCount,
    scopedDashboard?.programmeBatchCoursesCount,
    scopedDashboard?.courseOfferingsCount,
    scopedDashboard?.programmeBatchCourses?.length
  );
  const pendingVerifications = countValue(
    dashboardStatistics.pendingVerifications,
    dashboardStatistics.pendingVerificationCount,
    scopedDashboard?.pendingVerificationsCount
  );
  const pendingCourseAtrApprovals = countValue(
    dashboardStatistics.pendingCourseAtrApprovals,
    dashboardStatistics.pendingCourseAtrApprovalCount,
    scopedDashboard?.pendingCourseAtrApprovals
  );
  const dashboardBatches = scopedDashboard?.batches ?? [];
  const activeBatchLabel =
    scopedDashboard?.activeBatch ??
    dashboardBatches.find((batch) => (
      (batch.programmeBatchId ?? batch.id) === scopedDashboard?.setupProgress?.programmeBatchId
    ))?.name ??
    dashboardBatches.find((batch) => batch.status === 'ACTIVE')?.name ??
    dashboardBatches[0]?.name ??
    '—';

  // ── Per-step completion tracking ───────────────────────────────────────────
  const safeProgress = pcWorkflowProgress ?? scopedDashboard?.setupProgress ?? {};
  const workflowProgress = scopedDashboard?.workflowProgress ?? {};
  const stepNumber = (value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const aliases = {
      courses: 1,
      course: 1,
      po_pso_target: 2,
      po_pso_targets: 2,
      targets: 2,
      indirect_attainment: 3,
      programme_atr: 4,
      review: 5,
    };
    return aliases[String(value ?? '').trim().toLowerCase()] ?? null;
  };
  const stepStatus = PC_STEPS.map((s, idx) => {
    if (Object.prototype.hasOwnProperty.call(workflowProgress, String(s.step))) {
      return Boolean(workflowProgress[String(s.step)]);
    }
    if (Array.isArray(safeProgress.stepStatus)) {
      return !!safeProgress.stepStatus[idx];
    }
    if (Array.isArray(safeProgress.completedSteps)) {
      return safeProgress.completedSteps.some((step) => stepNumber(step) === s.step);
    }
    const namedStep = PC_STEPS[idx].label.toLowerCase().replaceAll(' ', '_').replace('/', '_');
    return Boolean(
      safeProgress[s.step] ||
      safeProgress[`step-${s.step}`] ||
      safeProgress.stepStatuses?.[s.step] === 'COMPLETED' ||
      safeProgress.stepStatuses?.[PC_STEPS[idx].key] === 'COMPLETED' ||
      safeProgress[namedStep]
    );
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct = Math.round((completedCount / PC_STEPS.length) * 100);
  const nextStep = PC_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum = nextStep ? nextStep.step : 1;

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    {
      id: 'setup',
      title: 'Manage Courses',
      desc: 'Add courses, assign coordinators, and view course structures.',
      path: '/programme-coordinator/manage-courses',
      icon: BookOpen,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
    },
    {
      id: 'targets',
      title: 'Target Settings',
      desc: 'Set PO and PSO benchmark target levels (1.0 – 3.0 scale).',
      path: '/programme-coordinator/target-settings',
      icon: Target,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
    },
    {
      id: 'programme-atr',
      title: 'Programme ATR',
      desc: 'Formulate PO/PSO gap analysis, observations & Action Taken Report.',
      path: '/programme-atr',
      icon: Layers,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
    },
    {
      id: 'verification',
      title: 'Approvals & Verification',
      desc: 'Review CO mapping, attainment, and Course ATR from coordinators.',
      path: '/coordinator-review',
      icon: ShieldCheck,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
      badge: pendingVerifications > 0 ? `${pendingVerifications} pending` : null,
      badgeWarn: pendingVerifications > 0,
    },
    {
      id: 'reports',
      title: 'Reports & Downloads',
      desc: 'Access consolidated Course & Programme Attainment and ATR Reports.',
      path: '/reports',
      icon: FileText,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
    },
  ];

  // ── Style tokens ─────────────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink = '#0f172a';
  const muted = '#64748b';
  const accent = '#4f46e5';

  if (screenLoading && !programmeCoordinatorDashboard) {
    return <ScreenLoadingState message="Loading Programme Coordinator Dashboard..." />;
  }

  if (screenError && !programmeCoordinatorDashboard) {
    return <ScreenErrorState title="Failed to load Dashboard" message={screenError} onRetry={fetchPcData} />;
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
            Programme Coordinator Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'Programme Coordinator'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            <strong style={{ color: ink }}>{selectedProgramme?.name || 'Programme Overview'}</strong>
            {selectedProgramme?.code ? ` · ${selectedProgramme.code}` : ''}
            &nbsp;·&nbsp; Batch: <strong style={{ color: ink }}>{activeBatchLabel}</strong>
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => navigate(`/programme-coordinator/setup-workflow?step=${targetStepNum}`)}
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
              ? 'Start Programme Setup (Step 1)'
              : completedCount === PC_STEPS.length
              ? 'Manage Programme Setup'
              : `Continue Setup (Step ${targetStepNum}: ${nextStep?.label || ''})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programme Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <BookOpen size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{courseCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>In active curriculum</div>
        </div>

        {/* Course Offerings */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Course Offerings</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'grid', placeItems: 'center', color: '#7c3aed' }}>
              <Target size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{courseOfferingsCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>Across the selected batches</div>
        </div>

        {/* Pending Verifications */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Pending Verifications</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: pendingVerifications > 0 ? '#fffbeb' : '#f0fdf4', display: 'grid', placeItems: 'center', color: pendingVerifications > 0 ? '#d97706' : '#16a34a' }}>
              <ShieldCheck size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: pendingVerifications > 0 ? '#d97706' : ink, lineHeight: 1 }}>
            {pendingVerifications}
          </div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>
            {pendingVerifications > 0
              ? `${pendingCourseAtrApprovals} course ATR approval(s) pending`
              : 'All up to date'}
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
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Programme Setup Workflow</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {PC_STEPS.length} steps completed &nbsp;·&nbsp; {selectedProgramme?.name || 'Programme Setup'}
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
          {PC_STEPS.map((s, idx) => {
            const done    = stepStatus[idx];
            const current = !done && (idx === 0 || stepStatus[idx - 1]);
            const Icon    = s.icon;
            return (
              <div
                key={s.step}
                onClick={() => navigate(`/programme-coordinator/setup-workflow?step=${s.step}`)}
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
