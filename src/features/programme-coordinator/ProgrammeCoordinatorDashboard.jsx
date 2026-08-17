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
  AlertCircle,
  PlayCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// ── Programme Coordinator 4-Step Setup Workflow Definition ───────────────────
const PC_STEPS = [
  { step: 1, label: 'Add Courses',        desc: 'Add & allocate courses under programme',      path: '/programme-coordinator/setup-workflow?step=1', icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, label: 'Set PO/PSO Targets', desc: 'Configure PO & PSO target levels (1.0 – 3.0)', path: '/programme-coordinator/setup-workflow?step=2', icon: Target,       color: '#7c3aed', bg: '#f5f3ff' },
  { step: 3, label: 'Programme ATR',     desc: 'Fill & submit Programme Action Taken Report', path: '/programme-coordinator/setup-workflow?step=3', icon: Layers,       color: '#0284c7', bg: '#f0f9ff' },
  { step: 4, label: 'Review and Confirm', desc: 'Verify setup summary & finish',               path: '/programme-coordinator/setup-workflow?step=4', icon: CheckCircle2, color: '#059669', bg: '#f0fdf4' },
];

export default function ProgrammeCoordinatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    masterProgrammes = [],
    programmeId      = 'prog-1',
    courses          = [],
    selectedBatch    = { name: 'Batch 2025-29' },
    activePOs        = [],
    activePSOs       = [],
    courseVerificationStore = {},
    pcWorkflowProgressStore = {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === selectedProgramme.id);

  const pendingVerifications = Object.values(courseVerificationStore).filter((rec) => {
    return (
      rec.configStatus === 'SUBMITTED' ||
      rec.coStatus === 'PENDING_APPROVAL' ||
      rec.coStatus === 'SUBMITTED' ||
      rec.atrStatus === 'SUBMITTED' ||
      rec.programmeAtrStatus === 'SUBMITTED'
    );
  }).length;

  const activeBatchLabel = selectedBatch?.name?.split(' ')[1] || '2025–29';

  // ── Per-step completion tracking ───────────────────────────────────────────
  const progProgress = pcWorkflowProgressStore[selectedProgramme.id || 'prog-1'] || {};
  const stepStatus = PC_STEPS.map((s) => {
    return !!progProgress[s.step];
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct = Math.round((completedCount / PC_STEPS.length) * 100);
  const nextStep = PC_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum = nextStep ? nextStep.step : 1;

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    {
      id:    'setup',
      title: 'Course Management',
      desc:  'Add courses, assign coordinators, and view course structures.',
      path:  '/academic',
      icon:  BookOpen,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
    },
    {
      id:   'targets',
      title: 'Target Settings',
      desc:  'Set PO and PSO benchmark target levels (1.0 – 3.0 scale).',
      path:  '/programme-coordinator/target-settings',
      icon:  Target,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
    },
    {
      id:    'verification',
      title: 'Approvals & Verification',
      desc:  'Review CO mapping, attainment, and Course ATR from coordinators.',
      path:  '/coordinator-review',
      icon:  ShieldCheck,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
      badge: pendingVerifications > 0 ? `${pendingVerifications} pending` : null,
      badgeWarn: pendingVerifications > 0,
    },
    {
      id:   'reports',
      title: 'Reports & Downloads',
      desc:  'Access consolidated Course & Programme Attainment and ATR Reports.',
      path:  '/reports',
      icon:  FileText,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
    },
  ];

  // ── Style tokens ─────────────────────────────────────────────────────────
  const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
  const ink     = '#0f172a';
  const muted   = '#64748b';
  const accent  = '#4f46e5';

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
            <strong style={{ color: ink }}>{selectedProgramme.name}</strong> &nbsp;·&nbsp; {selectedProgramme.code}
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
              ? 'Start Programme Workflow (Step 1)'
              : completedCount === PC_STEPS.length
              ? 'Manage Programme Workflow'
              : `Continue Workflow (Step ${targetStepNum}: ${nextStep?.label || ''})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Active Batch */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Active Batch</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <BookOpen size={15} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: ink, lineHeight: 1 }}>{activeBatchLabel}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#16a34a', fontWeight: '600', marginTop: '5px' }}>
            <Check size={11} /> Active cycle
          </div>
        </div>

        {/* Total Courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <BookOpen size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{progCourses.length}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>Under programme</div>
        </div>

        {/* PO/PSO Targets */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>PO / PSO</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Target size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{activePOs.length} / {activePSOs.length}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>POs &amp; PSOs configured</div>
        </div>

        {/* Workflow Progress */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Workflow Progress</span>
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

      {/* ── NEXT STEP ALERT ─────────────────────────────────────────────────── */}
      {nextStep && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>
                Next step: <strong>Step {nextStep.step} — {nextStep.label}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#b45309', marginTop: '1px' }}>
                {nextStep.desc}. Complete this to move your programme framework forward.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/programme-coordinator/setup-workflow?step=${targetStepNum}`)}
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#d97706', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', flexShrink: 0 }}
          >
            Continue Step {targetStepNum} ({nextStep.label}) <ChevronRight size={14} />
          </button>
        </div>
      )}

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
                        color:      action.badgeWarn ? '#b45309' : '#16a34a',
                        border:     `1px solid ${action.badgeWarn ? '#fde68a' : '#bbf7d0'}`,
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

      {/* ── 4-STEP WORKFLOW PROGRESS ────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Programme Progress</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {PC_STEPS.length} steps completed &nbsp;·&nbsp; Programme setup &amp; OBE readiness workflow below.
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
