import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ArrowRight, ShieldCheck, Layers, FileText, Calendar, Users, ChevronRight, Check, Clock } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export default function HodDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    batches = [],
    selectedBatch,
    masterProgrammes = [],
    courses = [],
    hodApprovals = [],
  } = useAcademic();

  const totalProgrammes = masterProgrammes.length || 3;
  const totalCourses = courses.length || 6;
  const pendingApprovalsCount = hodApprovals.filter((a) => a.status === 'PENDING').length || 2;
  const activeBatch = selectedBatch?.name?.split(' ')[1] || '2025–29';

  const quickActions = [
    {
      id: 'batches',
      title: 'Batch Management',
      desc: 'Initialize 4-year batch cycles and manage active batches.',
      path: '/hod/batch-management',
      icon: Calendar,
    },
    {
      id: 'outcomes',
      title: 'Programme Outcomes',
      desc: 'Define and review POs, PSOs, and PEOs.',
      path: '/hod/programme-outcomes',
      icon: Layers,
    },
    {
      id: 'programme-coordinators',
      title: 'Programme Coordinators',
      desc: 'Assign and manage Programme Coordinators for degree programmes.',
      path: '/hod/programme-coordinators',
      icon: Users,
    },
    {
      id: 'approvals',
      title: 'Approvals & Verification',
      desc: 'Review Programme Coordinator submissions.',
      path: '/hod/approvals',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : null,
      badgeWarn: pendingApprovalsCount > 0,
    },
    {
      id: 'reports',
      title: 'Reports Hub',
      desc: 'Access consolidated Attainment and ATR reports.',
      path: '/hod/reports',
      icon: FileText,
    },
  ];

  const setupSteps = [
    { title: 'Batch Initialized', done: batches.length > 0, desc: batches.length > 0 ? `${batches.length} batch(es) active` : 'No batch created yet' },
    { title: 'PO, PSO & PEO Defined', done: totalProgrammes > 0, desc: `${totalProgrammes} programme(s) configured` },
    { title: 'Programme Coordinators Assigned', done: totalProgrammes > 0, desc: 'Coordinator allocation complete' },
    { title: 'Approvals Cleared', done: pendingApprovalsCount === 0, desc: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} item(s) pending` : 'All submissions reviewed' },
  ];

  const completedCount = setupSteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / setupSteps.length) * 100);

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
            HOD Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'Head of Department'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Department of Computer Science &amp; Engineering
          </p>
        </div>
        <button
          onClick={() => navigate('/hod/setup-workflow')}
          style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
        >
          Start / Continue Setup <ArrowRight size={14} />
        </button>
      </div>


      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Active Batch */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Active Batch</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: ink, lineHeight: 1 }}>{activeBatch}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#16a34a', fontWeight: '600', marginTop: '6px' }}>
            <Check size={11} /> Active cycle
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

        {/* Courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalCourses}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>Under department</div>
        </div>

        {/* Approvals */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Approvals</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: pendingApprovalsCount > 0 ? '#fffbeb' : '#f0fdf4', display: 'grid', placeItems: 'center', color: pendingApprovalsCount > 0 ? '#d97706' : '#16a34a' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: pendingApprovalsCount > 0 ? '#d97706' : '#16a34a', lineHeight: 1 }}>{pendingApprovalsCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>
            {pendingApprovalsCount > 0 ? 'Pending review' : 'All clear'}
          </div>
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
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Department &amp; programme readiness checklist</div>
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
