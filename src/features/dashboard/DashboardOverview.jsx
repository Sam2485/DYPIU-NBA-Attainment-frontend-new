import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Target, BarChart2, FileText, ArrowRight,
  ChevronRight, Check, Clock, AlertCircle, Upload,
  Map, ClipboardList, TrendingUp, Award, ShieldCheck,
  PlayCircle,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

// ── Style tokens ──────────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

// ── Workflow steps mirroring WORKFLOW_STEPS in AttainmentProgressTracker ─────
const WORKFLOW_STEPS = [
  { step: 1, label: 'Add COs',             desc: 'Define Course Outcomes',              path: '/outcomes',       icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, label: 'CO Target Setting',   desc: 'Set CO attainment targets',           path: '/co-targets',     icon: Target,       color: '#0284c7', bg: '#f0f9ff' },
  { step: 3, label: 'CO–PO/PSO Mapping',   desc: 'Map COs to programme outcomes',       path: '/co-mapping',     icon: Map,          color: '#7c3aed', bg: '#f5f3ff' },
  { step: 4, label: 'Direct Assessment',   desc: 'Upload end-sem marks',                path: '/marks-upload',   icon: Upload,       color: '#0369a1', bg: '#e0f2fe' },
  { step: 5, label: 'Indirect Assessment', desc: 'Upload course-end survey',            path: '/survey-upload',  icon: ClipboardList, color: '#059669', bg: '#f0fdf4' },
  { step: 6, label: 'CO Attainment',       desc: 'Compute & view CO attainment',        path: '/co-attainment',  icon: BarChart2,    color: '#d97706', bg: '#fffbeb' },
  { step: 7, label: 'Course ATR',          desc: 'Fill action-taken report',            path: '/course-atr',     icon: FileText,     color: '#dc2626', bg: '#fef2f2' },
];

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const {
    selectedCourse,
    selectedProgramme,
    availableCourses = [],
    academicYear,
    activePOs        = [],
    attainmentConfigs = {},
    workflowProgressStore = {},
  } = useAcademic();

  const course         = selectedCourse || availableCourses[0];
  const courseCode     = course?.code || '—';
  const courseName     = course?.name || 'No course selected';
  const progName       = selectedProgramme?.name || course?.programme || 'Programme';
  const progCode       = selectedProgramme?.code || '';
  const courseCOs      = course?.courseOutcomes || [];
  const config         = course?.id ? (attainmentConfigs[course.id] || {}) : {};
  const courseProgress = workflowProgressStore[course?.id || 'crs-1'] || {};

  const stepStatus = WORKFLOW_STEPS.map((s, i) => {
    if (courseProgress[s.path]) return true;
    if (i === 0) return courseCOs.length > 0;
    if (i === 1) return courseCOs.some((c) => c.target);
    if (i === 2) return courseCOs.some((c) => c.mappings);
    if (i === 3) return !!config.directUploaded;
    if (i === 4) return !!config.indirectUploaded;
    if (i === 5) return !!config.attainmentRun;
    if (i === 6) return !!config.atrSubmitted;
    return false;
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct    = Math.round((completedCount / WORKFLOW_STEPS.length) * 100);
  const nextStep       = WORKFLOW_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum  = nextStep ? nextStep.step : 1;

  // Quick action cards
  const quickActions = [
    {
      id: 'outcomes',
      title: 'Outcome Management',
      desc: 'Add, edit, and view Course Outcomes (COs).',
      path: '/outcomes',
      icon: BookOpen,
      iconColor: '#4f46e5',
      iconBg: '#eef2ff',
    },
    {
      id: 'attainment',
      title: 'Attainment Summary',
      desc: 'View direct, indirect & overall CO attainment.',
      path: '/co-attainment',
      icon: BarChart2,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
    },
    {
      id: 'atr',
      title: 'ATR Reports',
      desc: 'View and download Course ATR and reports.',
      path: '/atr-reports',
      icon: FileText,
      iconColor: '#dc2626',
      iconBg: '#fef2f2',
    },
    {
      id: 'mapping',
      title: 'CO–PO Mapping',
      desc: 'Map course outcomes to programme outcomes.',
      path: '/co-mapping',
      icon: Map,
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
    },
    {
      id: 'marks',
      title: 'Direct Assessment',
      desc: 'Upload end-semester marks data.',
      path: '/marks-upload',
      icon: Upload,
      iconColor: '#0369a1',
      iconBg: '#e0f2fe',
    },
    {
      id: 'survey',
      title: 'Indirect Assessment',
      desc: 'Upload course-end survey results.',
      path: '/survey-upload',
      icon: ClipboardList,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
    },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div style={{
        ...surface,
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Course Coordinator Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'Course Coordinator'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {courseCode !== '—' ? <><strong style={{ color: ink }}>{courseCode}</strong> — {courseName} &nbsp;·&nbsp;</> : null}
            {progCode ? <span>{progCode}</span> : progName}
            {academicYear ? <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {academicYear}</span> : null}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => navigate(`/course-coordinator/workflow?step=${targetStepNum}`)}
            style={{
              height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '800',
              background: accent, color: '#fff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            <PlayCircle size={15} />
            Start / Continue Attainment
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Course */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Active Course</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <BookOpen size={15} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: ink, lineHeight: 1 }}>{courseCode}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{courseName}</div>
        </div>

        {/* COs added */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Course Outcomes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Target size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{courseCOs.length}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>COs defined</div>
        </div>

        {/* POs mapped */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programme Outcomes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'grid', placeItems: 'center', color: '#7c3aed' }}>
              <Award size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{activePOs.length || 12}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>POs in programme</div>
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
                {nextStep.desc}. Complete this to move your course attainment forward.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/course-coordinator/workflow?step=${targetStepNum}`)}
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#d97706', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', flexShrink: 0 }}
          >
            Go to Step {nextStep.step} <ChevronRight size={14} />
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
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink, marginBottom: '2px' }}>{action.title}</div>
                  <p style={{ margin: 0, fontSize: '12px', color: muted, lineHeight: 1.4 }}>{action.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7-STEP WORKFLOW PROGRESS ────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Course Attainment Workflow</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {WORKFLOW_STEPS.length} steps completed &nbsp;·&nbsp; Follow the guided 7-step process below.
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
          {WORKFLOW_STEPS.map((s, idx) => {
            const done    = stepStatus[idx];
            const current = !done && (idx === 0 || stepStatus[idx - 1]);
            const Icon    = s.icon;
            return (
              <div
                key={s.step}
                onClick={() => navigate(`/course-coordinator/workflow?step=${s.step}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                  background: done ? '#fafafa' : current ? '#fafafe' : '#ffffff',
                  border: `1px solid ${done ? '#e2e8f0' : current ? '#c7d2fe' : '#f1f5f9'}`,
                  transition: 'box-shadow .15s ease',
                  boxShadow: current ? '0 0 0 2px #c7d2fe33' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = current ? '0 0 0 2px #c7d2fe33' : 'none'; }}
              >
                {/* Step icon circle */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: done ? '#f0fdf4' : current ? s.bg : '#f8fafc',
                  border: `1.5px solid ${done ? '#86efac' : current ? s.color + '55' : '#e2e8f0'}`,
                  color: done ? '#16a34a' : current ? s.color : '#94a3b8',
                }}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </div>

                {/* Step info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: done ? '#16a34a' : current ? s.color : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step {s.step}
                    </span>
                    {current && (
                      <span style={{ fontSize: '10px', fontWeight: '700', background: '#eef2ff', color: accent, border: '1px solid #c7d2fe', borderRadius: '4px', padding: '1px 6px' }}>
                        UP NEXT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: done ? muted : ink, marginTop: '1px' }}>{s.label}</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '1px' }}>{s.desc}</div>
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: '11px', fontWeight: '600', borderRadius: '5px', padding: '3px 9px', flexShrink: 0,
                  background: done ? '#f0fdf4' : current ? '#eef2ff' : '#f8fafc',
                  color:      done ? '#16a34a' : current ? accent       : '#94a3b8',
                  border:     `1px solid ${done ? '#bbf7d0' : current ? '#c7d2fe' : '#e2e8f0'}`,
                }}>
                  {done ? '✓ Done' : current ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> Pending</span> : 'Locked'}
                </span>

                {/* Arrow */}
                <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Completion banner */}
        {completedCount === WORKFLOW_STEPS.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginTop: '16px' }}>
            <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>All 7 Steps Complete</div>
              <div style={{ fontSize: '12px', color: '#166534', marginTop: '1px' }}>
                Course attainment process is complete. Your submission is ready for Programme Coordinator review.
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
