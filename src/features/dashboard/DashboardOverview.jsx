import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Target, BarChart2, FileText, ArrowRight,
  ChevronRight, Check, Clock, Upload,
  Map, ClipboardList, TrendingUp, Award, ShieldCheck,
  PlayCircle, Settings, LockKeyhole,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenLoadingState, ScreenErrorState } from '../../components/common/ScreenState';

// ── Style tokens ──────────────────────────────────────────────────────────────
const surface = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink     = '#0f172a';
const muted   = '#64748b';
const accent  = '#4f46e5';

// ── Workflow steps mirroring WORKFLOW_STEPS in AttainmentProgressTracker ─────
const WORKFLOW_STEPS = [
  { step: 1, label: 'Add COs',             desc: 'Define Course Outcomes & Targets',    path: '/outcomes',       icon: BookOpen,     color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, label: 'CO–PO/PSO Mapping',   desc: 'Map COs to programme outcomes',       path: '/co-mapping',     icon: Map,          color: '#7c3aed', bg: '#f5f3ff' },
  { step: 3, label: 'Direct Assessment',   desc: 'Upload end-sem marks',                path: '/marks-upload',   icon: Upload,       color: '#0369a1', bg: '#e0f2fe' },
  { step: 4, label: 'Indirect Assessment', desc: 'Upload course-end survey',            path: '/survey-upload',  icon: ClipboardList, color: '#059669', bg: '#f0fdf4' },
  { step: 5, label: 'CO Attainment',       desc: 'Compute & view CO attainment',        path: '/co-attainment',  icon: BarChart2,    color: '#d97706', bg: '#fffbeb' },
  { step: 6, label: 'Course ATR',          desc: 'Fill course action-taken report',     path: '/course-atr',     icon: FileText,     color: '#dc2626', bg: '#fef2f2' },
];

export default function DashboardOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role }  = useAuth();
  const {
    selectedCourseOffering = null,
    selectedProgramme = null,
    courseOfferings = [],
    academicYear = null,
    activePOs        = [],
    attainmentConfigs = {},
    workflowProgressStore = {},
    courseVerificationStore = {},
    ccWorkflowProgress = null,
    courseCoordinatorDashboard = null,
    loadCourseCoordinatorDashboard,
    batchId = null,
    courseOfferingId = null,
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
  } = useAcademic();

  const [screenLoading, setScreenLoading] = useState(false);
  const [screenError, setScreenError] = useState(null);

  const dashboardData  = courseCoordinatorDashboard ?? {};
  const course         = selectedCourseOffering || courseOfferings[0] || null;
  const courseId       = dashboardData.courseOfferingId || dashboardData.programmeBatchCourseId || course?.id || null;
  const courseCode     = dashboardData.courseCode || course?.courseCode || '—';
  const courseName     = dashboardData.courseName || course?.courseName || 'No course selected';
  const progName       = dashboardData.programmeName || selectedProgramme?.name || course?.programme || 'Programme';
  const progCode       = selectedProgramme?.code || '';
  const courseCOs      = course?.courseOutcomes || [];
  const courseProgress = dashboardData.setupProgress || (courseOfferingId && workflowProgressStore[courseOfferingId]) || (courseId && workflowProgressStore[courseId]) || ccWorkflowProgress || {};
  const courseOutcomesCount = dashboardData.courseOutcomesCount ?? courseCOs.length;
  const poCount = dashboardData.poCount ?? activePOs?.length ?? 0;
  const psoCount = dashboardData.psoCount ?? 0;
  const assignedCourseCount = dashboardData.assignedCourseCount ?? 0;
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const allocationLocked = isCourseCoordinator
    && (new URLSearchParams(location.search).get('courseAllocation') === 'locked'
      || (!screenLoading && !course && courseOfferings.length === 0));

  const fetchCCData = async (targetOfferingId = courseOfferingId) => {
    setScreenLoading(true);
    setScreenError(null);
    try {
      await loadCourseCoordinatorDashboard?.(targetOfferingId, user?.email);
    } catch (err) {
      console.warn('DashboardOverview fetch failed:', err);
      setScreenError(err?.customMessage || err?.message || 'Failed to load Course Coordinator dashboard.');
    } finally {
      setScreenLoading(false);
    }
  };

  useEffect(() => {
    const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
    if (!isCourseCoordinator || !user?.email || !batchId) return;
    let isCurrent = true;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      if (!isCurrent) return;
      const selected = (offerings ?? []).find(
        (offering) => String(offering.id) === String(courseOfferingId)
      ) ?? offerings?.[0];
      if (selected && String(selected.id) !== String(courseOfferingId)) {
        selectCourseOffering(selected);
        return;
      }
      fetchCCData(selected?.id ?? courseOfferingId);
    }).catch((err) => {
      if (!isCurrent) return;
      setScreenError(err?.customMessage || err?.message || 'Failed to load assigned courses.');
    });
    return () => { isCurrent = false; };
  }, [batchId, courseOfferingId, loadAssignedCourseOfferings, loadCourseCoordinatorDashboard, role, selectCourseOffering, user]);

  // ── Verification status & revision requests ──────────────────────────────
  const verificationRecord = (courseOfferingId && courseVerificationStore[courseOfferingId]) || (courseId && courseVerificationStore[courseId]) || {};
  const isConfigRevision = verificationRecord.configStatus === 'REVISION_REQUESTED' || verificationRecord.configStatus === 'NEEDS_REVISION';
  const isCoRevision = verificationRecord.coStatus === 'REVISION_REQUESTED' || verificationRecord.coStatus === 'NEEDS_REVISION';
  const isAtrRevision = verificationRecord.atrStatus === 'REVISION_REQUESTED' || verificationRecord.atrStatus === 'NEEDS_REVISION';

  const hasAnyRevision = isConfigRevision || isCoRevision || isAtrRevision;

  const configRemarks = verificationRecord.configRemarks || verificationRecord.remarks || 'Please re-adjust Direct/Indirect weightages and benchmark thresholds.';
  const coRemarks = verificationRecord.coRemarks || verificationRecord.remarks || 'Please review and refine Course Outcome (CO) statements and Bloom taxonomy levels.';
  const atrRemarks = verificationRecord.atrRemarks || verificationRecord.remarks || 'Please update corrective action items and observations for unmet outcomes.';
  const verifierName = verificationRecord.verifiedBy || 'Programme Coordinator';

  // ── One-time card dismissal state ─────────────────────────────────────────
  const [dismissedRevisions, setDismissedRevisions] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`dypiu_dismissed_rev_${courseId || 'default'}`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`dypiu_dismissed_rev_${courseId || 'default'}`);
      setDismissedRevisions(saved ? JSON.parse(saved) : false);
    } catch {
      setDismissedRevisions(false);
    }
  }, [courseId]);

  const handleAcknowledgeRevision = () => {
    setDismissedRevisions(true);
    try {
      sessionStorage.setItem(`dypiu_dismissed_rev_${courseId || 'default'}`, JSON.stringify(true));
    } catch {}
  };

  const stepStatus = WORKFLOW_STEPS.map((s, idx) => {
    if (Array.isArray(courseProgress?.stepStatus)) {
      return !!courseProgress.stepStatus[idx];
    }
    if (Array.isArray(courseProgress?.completedSteps)) {
      return courseProgress.completedSteps.some((step) => Number(step) === s.step);
    }
    return !!courseProgress?.[s.path] || !!courseProgress?.[s.step];
  });

  const completedCount = stepStatus.filter(Boolean).length;
  const progressPct    = Math.round((completedCount / WORKFLOW_STEPS.length) * 100);
  const nextStep       = WORKFLOW_STEPS.find((_, i) => !stepStatus[i]) || null;
  const targetStepNum  = nextStep ? nextStep.step : 1;

  // Quick action cards
  const quickActions = [
    {
      id: 'attainment-config',
      title: 'Attainment Settings',
      desc: 'Configure Direct/Indirect weightages and CO thresholds.',
      path: '/attainment-config',
      icon: Settings,
      iconColor: '#6366f1',
      iconBg: '#eef2ff',
    },
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
      id: 'course-atr',
      title: 'Course ATR',
      desc: 'Fill target gap analysis & corrective Action Taken Report.',
      path: '/course-atr',
      icon: FileText,
      iconColor: '#dc2626',
      iconBg: '#fef2f2',
    },
    {
      id: 'reports',
      title: 'Reports & Downloads',
      desc: 'View and export Course Attainment and ATR reports.',
      path: '/reports',
      icon: FileText,
      iconColor: '#059669',
      iconBg: '#f0fdf4',
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

  const getActionRevisionInfo = (actionId) => {
    if (actionId === 'attainment-config' && isConfigRevision) {
      return { hasRevision: true, label: 'Attainment Settings Revision Requested', remarks: configRemarks };
    }
    if (actionId === 'outcomes' && isCoRevision) {
      return { hasRevision: true, label: 'CO Outcomes Revision Requested', remarks: coRemarks };
    }
    if (actionId === 'course-atr' && isAtrRevision) {
      return { hasRevision: true, label: 'Course ATR Revision Requested', remarks: atrRemarks };
    }
    return { hasRevision: false };
  };

  if (screenLoading && !course && courseOfferings.length === 0) {
    return <ScreenLoadingState message="Loading Course Coordinator Dashboard..." />;
  }

  if (screenError && !course && courseOfferings.length === 0) {
    return <ScreenErrorState title="Failed to load Dashboard" message={screenError} onRetry={fetchCCData} />;
  }

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
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
            Course Coordinator Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            Welcome, {user?.name || 'Course Coordinator'}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            {courseCode !== '—' ? <><strong style={{ color: ink }}>{courseCode}</strong> — {courseName} &nbsp;·&nbsp;</> : null}
            {progCode ? <span>{progCode}</span> : progName}
            {dashboardData.batchName ? <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {dashboardData.batchName}</span> : null}
            {academicYear ? <span style={{ color: '#94a3b8' }}> &nbsp;·&nbsp; {academicYear}</span> : null}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => !allocationLocked && navigate(`/course-coordinator/workflow?step=${targetStepNum}`)}
            disabled={allocationLocked}
            style={{
              height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '800',
              background: allocationLocked ? '#94a3b8' : accent, color: '#fff', border: 'none', borderRadius: '8px',
              cursor: allocationLocked ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontFamily: 'inherit', flexShrink: 0,
              boxShadow: allocationLocked ? 'none' : '0 4px 14px rgba(79,70,229,0.28)',
            }}
          >
            <PlayCircle size={15} />
            {targetStepNum === 1
              ? 'Start Course Attainment Workflow (Step 1)'
              : `Continue Workflow (Step ${targetStepNum}: ${nextStep?.label || ''})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {allocationLocked && (
        <div style={{ marginBottom: '20px', padding: '15px 18px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <LockKeyhole size={18} style={{ color: '#b45309', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <div style={{ color: '#92400e', fontSize: '13px', fontWeight: '800' }}>Course allocation awaiting HOD approval</div>
            <div style={{ color: '#92400e', fontSize: '12.5px', lineHeight: 1.45, marginTop: '3px' }}>No approved course allocation is available in the selected batch. COs, mappings, assessments, attainment, reports, and Course ATR will unlock after the HOD approves the Programme Coordinator’s allocation.</div>
          </div>
        </div>
      )}

      {/* ── ONE-TIME REVISION REQUEST STATUS CARD ──────────────────────────── */}
      {hasAnyRevision && !dismissedRevisions && (
        <div style={{
          background: '#fef2f2',
          border: '2px solid #f87171',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#fee2e2',
                border: '1.5px solid #fca5a5',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}>
                <img src="/exclaimation.png" alt="Revision Needed" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#991b1b' }}>
                    Revision Requested by {verifierName}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', padding: '2px 8px' }}>
                    Action Required
                  </span>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7f1d1d', lineHeight: 1.4 }}>
                  The {verifierName} has requested changes to the following sections for <strong>{courseCode} — {courseName}</strong>. Please review the remarks below, update the requested sections, and return them for review:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isConfigRevision && (
                    <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
                        <Settings size={14} style={{ color: '#dc2626' }} />
                        1. Attainment Settings / Configuration
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px', paddingLeft: '20px', fontStyle: 'italic' }}>
                        "{configRemarks}"
                      </div>
                    </div>
                  )}

                  {isCoRevision && (
                    <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
                        <BookOpen size={14} style={{ color: '#dc2626' }} />
                        2. Course Outcomes (COs)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px', paddingLeft: '20px', fontStyle: 'italic' }}>
                        "{coRemarks}"
                      </div>
                    </div>
                  )}

                  {isAtrRevision && (
                    <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
                        <FileText size={14} style={{ color: '#dc2626' }} />
                        3. Course Action Taken Report (ATR)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px', paddingLeft: '20px', fontStyle: 'italic' }}>
                        "{atrRemarks}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* OK Button */}
            <div style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
              <button
                onClick={handleAcknowledgeRevision}
                style={{
                  height: '38px',
                  padding: '0 24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                  fontFamily: 'inherit',
                }}
              >
                <Check size={16} /> OK
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{courseOutcomesCount}</div>
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
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{poCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>POs in programme</div>
        </div>

        {/* PSOs */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Programme Specific Outcomes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fdf4ff', display: 'grid', placeItems: 'center', color: '#c026d3' }}>
              <Target size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{psoCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>PSOs in programme</div>
        </div>

        {/* Assigned courses */}
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: muted }}>Assigned Courses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'grid', placeItems: 'center', color: '#0369a1' }}>
              <BookOpen size={15} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: ink, lineHeight: 1 }}>{assignedCourseCount}</div>
          <div style={{ fontSize: '11.5px', color: muted, marginTop: '5px' }}>{dashboardData.departmentName || 'Course coordinator scope'}</div>
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

      {/* ── QUICK ACTIONS ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            const revInfo = getActionRevisionInfo(action.id);
            const hasRev = revInfo.hasRevision;

            return (
              <div
                key={action.id}
                onClick={() => navigate(action.path)}
                style={{
                  ...surface,
                  position: 'relative',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  transition: 'box-shadow .15s ease, border-color .15s ease',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#c7d2fe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {hasRev && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <img
                      src="/exclaimation.png"
                      alt="Revision Needed"
                      style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  background: action.iconBg,
                  color: action.iconColor,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: hasRev ? '42px' : '0' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: ink, marginBottom: '2px' }}>
                    {action.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: muted, lineHeight: 1.4 }}>
                    {hasRev ? revInfo.label : action.desc}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6-STEP WORKFLOW PROGRESS ────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: ink }}>Course Attainment Workflow</div>
            <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
              {completedCount} of {WORKFLOW_STEPS.length} steps completed &nbsp;·&nbsp; Follow the guided 6-step process below.
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
            const isStepRev = (s.step === 1 && isCoRevision) || (s.step === 6 && isAtrRevision);

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
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = current ? '0 0 0 2px #c7d2fe33' : 'none'; }}
              >
                {/* Step icon circle */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: isStepRev ? '#ffffff' : done ? '#f0fdf4' : current ? s.bg : '#f8fafc',
                  border: `1.5px solid ${isStepRev ? '#e2e8f0' : done ? '#86efac' : current ? s.color + '55' : '#e2e8f0'}`,
                  color: done ? '#16a34a' : current ? s.color : '#94a3b8',
                }}>
                  {isStepRev ? (
                    <img src="/exclaimation.png" alt="Revision Needed" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  ) : done ? (
                    <Check size={15} />
                  ) : (
                    <Icon size={15} />
                  )}
                </div>

                {/* Step info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: done ? '#16a34a' : current ? s.color : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Step {s.step}
                    </span>
                    {isStepRev && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <img src="/exclaimation.png" alt="" style={{ width: '10px', height: '10px' }} /> Revision Needed
                      </span>
                    )}
                    {current && !isStepRev && (
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
                  background: isStepRev ? '#fee2e2' : done ? '#f0fdf4' : current ? '#eef2ff' : '#f8fafc',
                  color:      isStepRev ? '#dc2626' : done ? '#16a34a' : current ? accent       : '#94a3b8',
                  border:     `1px solid ${isStepRev ? '#fca5a5' : done ? '#bbf7d0' : current ? '#c7d2fe' : '#e2e8f0'}`,
                }}>
                  {isStepRev ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <img src="/exclaimation.png" alt="" style={{ width: '11px', height: '11px' }} /> Revision Needed
                    </span>
                  ) : done ? (
                    '✓ Done'
                  ) : current ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> Pending</span>
                  ) : (
                    'Locked'
                  )}
                </span>

                {/* Arrow */}
                <ChevronRight size={14} style={{ color: isStepRev ? '#f87171' : '#cbd5e1', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Completion banner */}
        {completedCount === WORKFLOW_STEPS.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginTop: '16px' }}>
            <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#15803d' }}>All Steps Complete</div>
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
