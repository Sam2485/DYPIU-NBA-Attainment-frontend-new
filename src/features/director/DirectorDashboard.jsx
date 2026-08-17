import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Check,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  FileText,
  Settings,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// ── Director 4-Step Setup Workflow Definition ────────────────────────────────
const DIRECTOR_STEPS = [
  { step: 1, label: 'School Info',     desc: 'Configure metadata & Dean allocation',      path: '/director/school-structure',     icon: Building2,     color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, label: 'Departments',     desc: 'Department hierarchy & HOD assignments',  path: '/director/department-management', icon: Users,         color: '#0284c7', bg: '#f0f9ff' },
  { step: 3, label: 'Programmes',      desc: 'Map degree programmes & durations',        path: '/director/programme-overview',    icon: GraduationCap, color: '#7c3aed', bg: '#f5f3ff' },
  { step: 4, label: 'Review & Verify', desc: 'Audit structure & complete setup',        path: '/director/reports',              icon: CheckCircle2,  color: '#059669', bg: '#f0fdf4' },
];

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    departments = [],
    selectedSchool = { name: 'School of Engineering & Technology', code: 'SET', dean: 'Dr. R. K. Deshmukh' },
    masterProgrammes = [],
    directorApprovals = [],
    directorWorkflowProgress = {},
  } = useAcademic();

  const totalDepts = departments.length || 4;
  const assignedHODs = departments.filter((d) => d.hod && d.hod !== 'Unassigned').length || 3;
  const pendingHODs = totalDepts - assignedHODs;
  const totalProgrammes = masterProgrammes.length || 8;
  const pendingApprovalsCount = directorApprovals.filter((a) => a.status === 'PENDING').length || 0;

  // ── Per-step completion tracking ───────────────────────────────────────────
  const stepStatus = DIRECTOR_STEPS.map((s) => {
    return !!directorWorkflowProgress[s.step];
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct = Math.round((completedCount / DIRECTOR_STEPS.length) * 100);
  const nextStep = DIRECTOR_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum = nextStep ? nextStep.step : 1;

  const quickActions = [
    {
      id: 'structure',
      title: 'School Structure & Hierarchy',
      desc: 'Inspect school metadata, departments, and programmes tree.',
      path: '/director/school-structure',
      icon: Layers,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
    },
    {
      id: 'departments',
      title: 'Department Management & HODs',
      desc: 'Add departments and assign Heads of Departments.',
      path: '/director/department-management',
      icon: Users,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
      badge: pendingHODs > 0 ? `${pendingHODs} HOD pending` : null,
      badgeWarn: pendingHODs > 0,
    },
    {
      id: 'programmes',
      title: 'Programme Overview',
      desc: 'View degree programmes, coordinators, and setup status.',
      path: '/director/programme-overview',
      icon: GraduationCap,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
    },
    {
      id: 'approvals',
      title: 'Director Verification Panel',
      desc: 'Review and approve departmental PO-PSO frameworks & ATRs.',
      path: '/director/reports',
      icon: ShieldCheck,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : null,
      badgeWarn: pendingApprovalsCount > 0,
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
            Director Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'School Director'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            <strong style={{ color: ink }}>{selectedSchool.name}</strong> &nbsp;·&nbsp; {selectedSchool.code}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => navigate(`/director/setup-workflow?step=${targetStepNum}`)}
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
              ? 'Start School Setup Workflow (Step 1)'
              : completedCount === DIRECTOR_STEPS.length
              ? 'Manage School Structure'
              : `Continue Workflow (Step ${targetStepNum}: ${nextStep?.label || ''})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Departments */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Departments</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <Building2 size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalDepts}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>In {selectedSchool.code}</div>
        </div>

        {/* HODs */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>HODs Assigned</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Users size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>
            {assignedHODs}<span style={{ fontSize: '14px', fontWeight: '600', color: muted }}>/{totalDepts}</span>
          </div>
          <div style={{ fontSize: '11.5px', marginTop: '5px', fontWeight: '600', color: pendingHODs > 0 ? '#d97706' : '#16a34a' }}>
            {pendingHODs > 0 ? `${pendingHODs} pending` : 'All assigned'}
          </div>
        </div>

        {/* Programmes */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programmes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <GraduationCap size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalProgrammes}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>Degree programmes</div>
        </div>

        {/* Workflow progress */}
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
                {nextStep.desc}. Complete this to move your school governance forward.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/director/setup-workflow?step=${targetStepNum}`)}
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#d97706', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', flexShrink: 0 }}
          >
            Continue Step {targetStepNum} ({nextStep.label}) <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── QUICK ACTIONS ───────────────────────────────────────────────────── */}
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

      {/* ── 4-STEP WORKFLOW PROGRESS ────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>School Structure Setup Workflow</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {DIRECTOR_STEPS.length} steps completed &nbsp;·&nbsp; Follow the guided 4-step governance process below.
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
          {DIRECTOR_STEPS.map((s, idx) => {
            const done    = stepStatus[idx];
            const current = !done && (idx === 0 || stepStatus[idx - 1]);
            const Icon    = s.icon;
            return (
              <div
                key={s.step}
                onClick={() => navigate(`/director/setup-workflow?step=${s.step}`)}
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
