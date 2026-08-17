import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ShieldCheck, FileText, ArrowRight,
  ChevronRight, Check, Clock, Target, BarChart2, AlertCircle, ChevronDown, Layers,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProgrammeCoordinatorSummary,
  getProgrammes,
  getCourses,
  getProgrammePOs,
  getProgrammePSOs,
  getProgrammeTargets,
  getProgrammeCoordinatorSetupProgress,
} from '../../api/academic';

// ── Style tokens (identical to HodDashboard) ─────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

export default function ProgrammeCoordinatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    masterProgrammes = [],
    programmeId      = '',
    courses          = [],
    selectedBatch    = { name: 'Batch 2025-29' },
    activePOs        = [],
    activePSOs       = [],
    courseVerificationStore = {},
  } = useAcademic();

  const [summaryData, setSummaryData] = useState(null);
  const [programmesList, setProgrammesList] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [setupProgress, setSetupProgress] = useState(null);
  const [progDetails, setProgDetails] = useState({
    coursesCount: 0,
    posCount: 0,
    psosCount: 0,
  });

  // 1. Fetch available programmes for coordinator
  useEffect(() => {
    let isMounted = true;
    const fetchProgrammes = async () => {
      try {
        const progRes = await getProgrammes('', '', user?.email);
        const rawProgs = progRes?.data?.programmes || progRes?.programmes || progRes?.data?.data || progRes?.data || [];
        if (isMounted && Array.isArray(rawProgs) && rawProgs.length > 0) {
          setProgrammesList(rawProgs);
        }
      } catch (err) {
        console.warn('Failed to load programmes list:', err);
      }
    };
    fetchProgrammes();
    return () => { isMounted = false; };
  }, [user?.email]);

  // 2. Fetch summary & detail counts when selected programme changes
  useEffect(() => {
    let isMounted = true;
    const targetProgId = selectedProgId || summaryData?.programmeId || programmeId;

    const fetchSummaryAndDetails = async () => {
      try {
        const [sumRes, crsRes, poRes, psoRes, progStateRes] = await Promise.allSettled([
          getProgrammeCoordinatorSummary(user?.email, targetProgId || ''),
          targetProgId ? getCourses(targetProgId) : Promise.resolve(null),
          targetProgId ? getProgrammePOs(targetProgId) : Promise.resolve(null),
          targetProgId ? getProgrammePSOs(targetProgId) : Promise.resolve(null),
          targetProgId ? getProgrammeCoordinatorSetupProgress(user?.email || '', targetProgId) : Promise.resolve(null),
        ]);

        if (isMounted) {
          if (sumRes.status === 'fulfilled') {
            const data = sumRes.value?.data?.data || sumRes.value?.data || sumRes.value;
            if (data) {
              setSummaryData(data);
              const assignedProgs = data.assignedProgrammes || (data.programme ? [data.programme] : []);
              if (Array.isArray(assignedProgs) && assignedProgs.length > 0) {
                setProgrammesList(assignedProgs);
              }
              if (!selectedProgId && (data.programmeId || data.programme?.id)) {
                setSelectedProgId(data.programmeId || data.programme?.id);
              }
            }
          }

          if (progStateRes.status === 'fulfilled' && progStateRes.value) {
            const pData = progStateRes.value?.data?.data || progStateRes.value?.data || progStateRes.value;
            if (pData) setSetupProgress(pData);
          }

          const crsList = crsRes.status === 'fulfilled' && crsRes.value ? (crsRes.value?.data?.courses || crsRes.value?.courses || crsRes.value?.data?.data || crsRes.value?.data || []) : [];
          const poList = poRes.status === 'fulfilled' && poRes.value ? (poRes.value?.data?.pos || poRes.value?.pos || poRes.value?.data?.data || poRes.value?.data || []) : [];
          const psoList = psoRes.status === 'fulfilled' && psoRes.value ? (psoRes.value?.data?.psos || psoRes.value?.psos || psoRes.value?.data?.data || psoRes.value?.data || []) : [];

          setProgDetails({
            coursesCount: Array.isArray(crsList) ? crsList.length : 0,
            posCount: Array.isArray(poList) ? poList.length : 0,
            psosCount: Array.isArray(psoList) ? psoList.length : 0,
          });
        }
      } catch (err) {
        console.warn('Failed to load Programme Coordinator summary/details:', err);
      }
    };
    fetchSummaryAndDetails();
    return () => { isMounted = false; };
  }, [user?.email, selectedProgId]);

  const availableProgrammes = (summaryData?.assignedProgrammes && summaryData.assignedProgrammes.length > 0)
    ? summaryData.assignedProgrammes
    : (programmesList.length > 0 ? programmesList : masterProgrammes);

  const pcName = summaryData?.coordinatorName || user?.name || 'Programme Coordinator';
  const pcEmail = summaryData?.coordinatorEmail || user?.email || '';

  const selectedProgramme =
    summaryData?.programmeName
      ? { name: summaryData.programmeName, code: summaryData.programmeCode || '—' }
      : availableProgrammes.find((p) => p.id === (selectedProgId || programmeId)) ||
        availableProgrammes[0] ||
        masterProgrammes[0] ||
        { name: 'No Programme Assigned Yet', code: '—' };

  const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === (selectedProgId || summaryData?.programmeId || programmeId));

  const totalProgrammes = availableProgrammes.length;
  const totalCourses = summaryData?.courseCount ?? progDetails.coursesCount ?? progCourses.length;
  const totalPOs = summaryData?.activePOsCount ?? progDetails.posCount ?? activePOs.length;
  const totalPSOs = summaryData?.activePSOsCount ?? progDetails.psosCount ?? activePSOs.length;

  const pendingVerifications = summaryData?.pendingVerificationsCount ?? Object.values(courseVerificationStore).filter((rec) => {
    return (
      rec.configStatus === 'SUBMITTED' ||
      rec.coStatus === 'PENDING_APPROVAL' ||
      rec.coStatus === 'SUBMITTED' ||
      rec.atrStatus === 'SUBMITTED' ||
      rec.programmeAtrStatus === 'SUBMITTED'
    );
  }).length;

  const activeBatchLabel = selectedBatch?.name?.split(' ')[1] || '2025–29';

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    {
      id:    'setup',
      title: 'Programme Setup',
      desc:  'Add courses, assign coordinators, and view PO/PSO/PEO outcomes.',
      path:  '/programme-coordinator/setup-workflow',
      icon:  BookOpen,
    },
    {
      id:   'targets',
      title: 'Target Settings',
      desc:  'Set PO and PSO benchmark target levels (1.0 – 3.0 scale).',
      path:  '/programme-coordinator/target-settings',
      icon:  Target,
    },
    {
      id:    'programme-atr',
      title: 'Programme ATR',
      desc:  'Prepare and submit Programme Action Taken Report for HOD review.',
      path:  '/programme-atr',
      icon:  FileText,
    },
    {
      id:    'verification',
      title: 'Approvals',
      desc:  'Review CO mapping, attainment, and Course ATR from coordinators.',
      path:  '/coordinator-review',
      icon:  ShieldCheck,
      badge: pendingVerifications > 0 ? `${pendingVerifications} pending` : null,
      badgeWarn: pendingVerifications > 0,
    },
    {
      id:   'reports',
      title: 'Reports & Downloads',
      desc:  'Access consolidated Course & Programme Attainment and ATR Reports.',
      path:  '/reports',
      icon:  FileText,
    },
  ];

  // ── Setup checklist ───────────────────────────────────────────────────────
  const rawCompleted = (summaryData?.setupProgress?.completedSteps || []).map((s) => s.toLowerCase().trim());
  const currentStep = summaryData?.setupProgress?.currentStep || 1;
  const overallStatus = summaryData?.setupProgress?.overallStatus || 'IN_PROGRESS';

  const setupSteps = [
    {
      title: 'Programme Setup',
      done:  rawCompleted.includes('programme setup') || rawCompleted.includes('courses') || totalCourses > 0 || currentStep > 1,
      desc:  totalCourses > 0 ? `${totalCourses} course(s) configured under programme` : 'No courses added yet',
    },
    {
      title: 'PO / PSO Target',
      done:  rawCompleted.includes('po/pso target') || rawCompleted.includes('targets') || (totalPOs > 0 && totalPSOs > 0) || currentStep > 2,
      desc:  (totalPOs > 0 || totalPSOs > 0) ? `${totalPOs} POs, ${totalPSOs} PSOs target levels benchmarked` : 'Targets pending configuration',
    },
    {
      title: 'Programme ATR',
      done:  rawCompleted.includes('programme atr') || rawCompleted.includes('atr'),
      desc:  'Prepare and submit Programme ATR for HOD approval',
    },
    {
      title: 'Verify & Finish',
      done:  rawCompleted.includes('verify&finish') || rawCompleted.includes('review') || overallStatus === 'COMPLETED' || currentStep >= 4,
      desc:  (rawCompleted.includes('verify&finish') || overallStatus === 'COMPLETED' || currentStep >= 4) ? 'Programme setup review completed' : 'Complete setup steps to verify',
    },
  ];

  const completedCount = setupSteps.filter((s) => s.done).length;
  const progressPct    = Math.round((completedCount / setupSteps.length) * 100);

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {pcName}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {selectedProgramme.name} &nbsp;·&nbsp; {selectedProgramme.code} {pcEmail ? `(${pcEmail})` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProgId || ''}
              onChange={(e) => setSelectedProgId(e.target.value)}
              disabled={availableProgrammes.length === 0}
              style={{
                height: '40px',
                paddingLeft: '12px',
                paddingRight: '32px',
                fontSize: '13px',
                fontWeight: '700',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                color: ink,
                cursor: availableProgrammes.length === 0 ? 'not-allowed' : 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
                appearance: 'none',
                minWidth: '220px',
              }}
            >
              {availableProgrammes.length === 0 ? (
                <option value="">No programmes assigned yet</option>
              ) : (
                availableProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))
              )}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          <button
            onClick={() => navigate('/programme-coordinator/setup-workflow')}
            style={{ height: '40px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
          >
            Start / Continue Process <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* Total Programmes */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programmes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'grid', placeItems: 'center', color: accent }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{programmesList.length}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>Assigned to coordinator</div>
        </div>

        {/* Total Courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0284c7' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalCourses}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>Under programme</div>
        </div>

        {/* PO/PSO Targets */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>PO / PSO</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{totalPOs} / {totalPSOs}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>POs &amp; PSOs configured</div>
        </div>

        {/* Pending Verifications */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Verifications</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: pendingVerifications > 0 ? '#fffbeb' : '#f0fdf4', display: 'grid', placeItems: 'center', color: pendingVerifications > 0 ? '#d97706' : '#16a34a' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: pendingVerifications > 0 ? '#d97706' : '#16a34a', lineHeight: 1 }}>{pendingVerifications}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '6px' }}>
            {pendingVerifications > 0 ? 'Pending review' : 'All clear'}
          </div>
        </div>

      </div>

      {/* ── PENDING ALERT ─────────────────────────────────────────────────────── */}
      {pendingVerifications > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: '#b45309', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#78350f' }}>
                {pendingVerifications} course submission{pendingVerifications > 1 ? 's' : ''} awaiting your verification
              </div>
              <div style={{ fontSize: '12px', color: '#78350f', marginTop: '1px', fontWeight: '600' }}>
                CO mapping, attainment data, and Course ATRs submitted by Course Coordinators.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/coordinator-review')}
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#b45309', color: '#ffffff', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
          >
            Go to Verification <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────────────── */}
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

      {/* ── SETUP PROGRESS ────────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Programme Progress</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>Programme setup &amp; OBE readiness checklist</div>
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
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: step.done ? '#fafafa' : '#ffffff', border: `1px solid ${step.done ? '#e2e8f0' : '#cbd5e1'}` }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: step.done ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${step.done ? '#4ade80' : '#cbd5e1'}`, color: step.done ? '#15803d' : '#475569' }}>
                {step.done ? <Check size={12} /> : <Clock size={11} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: step.done ? ink : '#334155' }}>{step.title}</div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '1px' }}>{step.desc}</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', borderRadius: '5px', padding: '2px 8px', flexShrink: 0, background: step.done ? '#f0fdf4' : '#f8fafc', color: step.done ? '#15803d' : '#475569', border: `1px solid ${step.done ? '#86efac' : '#cbd5e1'}` }}>
                {step.done ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
