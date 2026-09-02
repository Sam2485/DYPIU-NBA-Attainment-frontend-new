import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, Clock, ShieldCheck, History, Printer, ChevronDown, AlertCircle, Lock, Send } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { useAttainment } from '../../context/attainment';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const atrSignature = (outcomes = []) => JSON.stringify(outcomes.map((item) => ({
  code: item.code,
  statement: item.statement ?? '',
  target: item.target ?? null,
  actual: item.actual ?? null,
  pct: item.pct ?? null,
  remark: item.remark ?? '',
  actions: (item.actions ?? []).filter(Boolean),
})));
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

export default function CourseATR({ hideHeader = false, showHistoryProp, readOnly = false, courseId, batchId = null, showAssignedCourseSelector = false, assignedOfferings = [], onSelectOffering = () => {}, selectorDisabled = false, suppressPendingMessage = false }) {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const {
    courses = [],
    availableCourses = [],
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    activeCOs = [],
    setCourseId = () => {},
    academicYear    = '2025-26',
    selectedBatch,
    courseAtrStore  = {},
    updateCourseAtrData          = () => {},
    courseVerificationStore      = {},
    updateCourseVerificationStatus = () => {},
    loadProgrammeBatchCourseApprovalStatus = () => Promise.resolve(null),
  } = useAcademic();
  const {
    courseATR: apiCourseAtr = null,
    loadCourseATR = () => Promise.resolve(null),
    loadPreviousYearCourseATR = () => Promise.resolve(null),
    saveCourseATR = () => Promise.resolve(null),
    submitCourseATR = () => Promise.resolve(null),
  } = useAttainment();

  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const isCoordinator  = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  const [savedSignature, setSavedSignature] = useState(null);
  const [showHistory, setShowHistory] = useState(showHistoryProp ?? false);
  const [previousYearAtr, setPreviousYearAtr] = useState(null);
  const [previousYearLoadState, setPreviousYearLoadState] = useState('idle');
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [submittedForReview, setSubmittedForReview] = useState(false);


  useEffect(() => {
    const targetBatchId = batchId ?? selectedBatch?.id;
    if (!isCourseCoordinator || !user?.email || !targetBatchId) return;
    loadAssignedCourseOfferings(user, targetBatchId).then((offerings) => {
      const selectedStillAssigned = (offerings ?? []).some(
        (offering) => String(offering.id) === String(courseOfferingId)
      );
      if (!selectedStillAssigned && offerings?.[0]) selectCourseOffering(offerings[0]);
    }).catch(() => {});
  }, [batchId, courseOfferingId, isCourseCoordinator, loadAssignedCourseOfferings, selectCourseOffering, selectedBatch?.id, user]);

  useEffect(() => {
    // Saving applies to one programme-batch course only.
    setSavedSignature(null);
    setSubmittedForReview(false);
  }, [courseOfferingId]);

  const allCourses = availableCourses.length > 0 ? availableCourses : courses;
  const currentCourse = courseId
    ? allCourses.find((c) => c.id === courseId) || selectedCourse
    : selectedCourseOffering || selectedCourse;

  // All Course ATR API operations are scoped to the selected programme-batch
  // course, never to the underlying master-course ID.
  const activeCourseId = selectedCourseOffering?.programmeBatchCourseId
    ?? courseOfferingId
    ?? courseId
    ?? currentCourse?.id
    ?? selectedCourse?.id
    ?? null;

  useEffect(() => {
    if (showHistoryProp !== undefined) setShowHistory(showHistoryProp);
  }, [showHistoryProp]);

  useEffect(() => {
    if (!showHistory || !activeCourseId) return;
    let isCurrent = true;
    setPreviousYearLoadState('loading');
    setPreviousYearAtr(null);

    loadPreviousYearCourseATR(activeCourseId)
      .then((atr) => {
        if (!isCurrent) return;
        setPreviousYearAtr(atr);
        setPreviousYearLoadState(atr ? 'loaded' : 'empty');
      })
      .catch(() => {
        if (isCurrent) setPreviousYearLoadState('error');
      });

    return () => { isCurrent = false; };
  }, [activeCourseId, loadPreviousYearCourseATR, showHistory]);
  const apiOutcomes = Array.isArray(apiCourseAtr?.outcomes) ? apiCourseAtr.outcomes : EMPTY_ARRAY;
  const courseOutcomes = apiOutcomes.length > 0
    ? apiOutcomes
    : (activeCOs.length > 0 ? activeCOs : (currentCourse?.courseOutcomes || EMPTY_ARRAY));

  // Context stores can legitimately be null before their first load. Normalize
  // them before looking up the selected programme-batch-course ID.
  const verificationStore = courseVerificationStore ?? EMPTY_OBJECT;
  const atrDraftStore = courseAtrStore ?? EMPTY_OBJECT;
  const verificationData = (activeCourseId && verificationStore[activeCourseId]) || {};
  const approvalAtrStatus = verificationData.atrStatus;
  const atrStatus = approvalAtrStatus && approvalAtrStatus !== 'DRAFT'
    ? approvalAtrStatus
    : (apiCourseAtr?.status || 'DRAFT');
  const atrRemarks = verificationData.atrRemarks || apiCourseAtr?.verificationComments || '';
  const verifiedBy = verificationData.atrReviewer || apiCourseAtr?.verifiedBy || verificationData.verifiedBy || 'Programme Coordinator';

  const isApproved = atrStatus === 'VERIFIED' || atrStatus === 'APPROVED';
  const isRevision = atrStatus === 'REJECTED' || atrStatus === 'REVISION_REQUESTED' || atrStatus === 'NEEDS_REVISION';
  const isSubmitted = submittedForReview || ['PENDING', 'SUBMITTED', 'PENDING_APPROVAL', 'SUBMITTED_FOR_VERIFICATION'].includes(atrStatus);

  // Build ATR list from COs
  const buildList = () => {
    const savedValue = (activeCourseId && atrDraftStore[activeCourseId]) || EMPTY_ARRAY;
    const saved = Array.isArray(savedValue) ? savedValue : EMPTY_ARRAY;
    const savedMap = new Map(saved.map((i) => [i.code, i]));
    if (courseOutcomes.length === 0) return saved;
    return courseOutcomes.map((co) => {
      const code = co.outcomeCode ?? co.code;
      const ex     = savedMap.get(code);
      const target = Number(ex?.target ?? co.targetLevel ?? 2.50);
      const rawActual = ex?.actual ?? co.attainmentLevel ?? co.attainment ?? null;
      const actual = rawActual == null || rawActual === '' ? null : Number(rawActual);
      const pct    = Number(ex?.pct ?? co.achievementPercentage ?? (actual !== null ? ((actual / target) * 100) : 0));
      const met    = actual !== null && actual >= target;
      return {
        code, statement: co.outcomeStatement ?? co.statement ?? '', target, actual, pct, met,
        // An achieved target records the sustaining measure as Action 1, never as a remark.
        remark: met ? '' : (ex?.remark ?? co.observation ?? ''),
        actions: ex?.actions?.length ? ex.actions : co.actions?.length ? co.actions : met ? [
          ex?.remark ?? co.observation ?? 'Maintain current teaching methodology and continuous assessment structure.',
        ] : [
          `Conduct extra tutorial sessions on ${co.statement ? co.statement.slice(0, 45) : ''}...`,
          'Provide additional practice numericals and interactive assignment problem sets.',
        ],
      };
    });
  };

  const [coList, setCoList] = useState(buildList);
  useEffect(() => { setCoList(buildList()); }, [activeCourseId, currentCourse, courseOutcomes, atrDraftStore]);

  useEffect(() => {
    if (activeCourseId) {
      loadCourseATR(activeCourseId).catch(() => {});
      loadProgrammeBatchCourseApprovalStatus(activeCourseId).catch(() => {});
    }
  }, [activeCourseId, loadCourseATR, loadProgrammeBatchCourseApprovalStatus]);

  useEffect(() => {
    if (!apiCourseAtr?.outcomes) return;
    setCoList(apiCourseAtr.outcomes.map((outcome) => {
      const target = Number(outcome.targetLevel) || 0;
      const actual = Number(outcome.attainmentLevel) || 0;
      return {
        code: outcome.outcomeCode,
        statement: outcome.outcomeStatement ?? '',
        target,
        actual,
        pct: Number(outcome.achievementPercentage) || (target ? Number(((actual / target) * 100).toFixed(2)) : 0),
        met: actual >= target,
        remark: actual >= target ? '' : (outcome.observation ?? ''),
        actions: outcome.actions?.length ? outcome.actions : actual >= target && outcome.observation ? [outcome.observation] : [],
      };
    }));
  }, [apiCourseAtr]);

  const reportStatus = atrStatus;
  const locked       = readOnly || isApproved || isSubmitted || role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';
  const currentSignature = atrSignature(coList);
  const isSaved = savedSignature !== null && savedSignature === currentSignature;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const createAtrPayload = () => ({
    reportType: 'COURSE_ATR',
    courseOffering: { id: activeCourseId },
    status: 'DRAFT',
    outcomes: coList.map((item) => ({
      outcomeCode: item.code,
      outcomeStatement: item.statement,
      targetLevel: Number(item.target),
      attainmentLevel: item.actual == null ? null : Number(item.actual),
      achievementPercentage: Number(item.pct),
      observation: item.met ? '' : item.remark,
      actions: item.actions.filter(Boolean),
    })),
  });

  const handleSaveATR = async ({ silent = false } = {}) => {
    if (!activeCourseId) return;
    try {
      await saveCourseATR(activeCourseId, createAtrPayload());
      setSavedSignature(currentSignature);
      if (!silent) alert('Course ATR saved successfully.');
      return true;
    } catch (error) {
      console.error('Failed to save Course ATR:', error);
      if (!silent) alert('Unable to save the Course ATR. Please try again.');
      return false;
    }
  };

  const handleSaveSubmit = async () => {
    if (!activeCourseId) return;
    try {
      setIsSubmittingForReview(true);
      // Submit the freshly persisted report even if it was saved earlier.
      const saved = await handleSaveATR({ silent: true });
      if (!saved) return;
      await submitCourseATR(activeCourseId);
      setSubmittedForReview(true);
      alert(`Course ATR for ${currentCourse?.courseCode || currentCourse?.code || 'this course'} has been submitted for review.`);
    } catch (error) {
      console.error('Failed to save Course ATR:', error);
      alert('Unable to save and submit the Course ATR. Please try again.');
    } finally {
      setIsSubmittingForReview(false);
    }
  };
  const handleVerify = () => updateCourseVerificationStatus(activeCourseId, 'atrStatus', 'VERIFIED');

  const handleAddAction    = (i)        => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (i, j, v)  => setCoList((p) => p.map((c, idx) => { if (idx !== i) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (i, j)     => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));

  const metCount  = coList.filter((c) => c.met).length;
  const gapCount  = coList.length - metCount;
  const formatLevel = (value) => value == null || !Number.isFinite(Number(value))
    ? '—'
    : Number(value).toFixed(2);

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      {!hideHeader && (
        <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
                Course ATR
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', marginLeft: 'auto' }}>
              {showAssignedCourseSelector && <select
                value={selectedCourseOffering?.id ?? ''}
                onChange={(event) => onSelectOffering(event.target.value)}
                disabled={selectorDisabled || assignedOfferings.length === 0}
                style={{ ...inputStyle, height: '38px', width: '220px', padding: '0 8px', fontWeight: '700', color: ink, cursor: selectorDisabled || assignedOfferings.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                {assignedOfferings.length === 0 ? <option value="">No assigned courses for this programme batch</option> : assignedOfferings.map((offering) => <option key={offering.id} value={offering.id}>{offering.courseCode ?? offering.code ?? 'Course'} — {offering.courseName ?? offering.name ?? 'Programme-Batch Course'} · Sem {offering.semester ?? '—'}</option>)}
              </select>}
              {/* Course selector */}
              {!courseId && (
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <select
                    value={activeCourseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    style={{ ...inputStyle, height: '38px', paddingRight: '28px', appearance: 'none', cursor: 'pointer', fontWeight: '700', color: accent }}
                  >
                    {allCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
                </div>
              )}

              {!locked ? (
                <>
                  <button onClick={handleSaveATR} disabled={isSaved || coList.length === 0}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: isSaved ? '#f1f5f9' : '#ffffff', color: isSaved ? '#64748b' : accent, border: `1px solid ${isSaved ? '#cbd5e1' : accent}`, borderRadius: '8px', cursor: isSaved ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Save size={14} /> {isSaved ? 'Saved' : 'Save ATR'}
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveSubmit} disabled={isSubmittingForReview}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', cursor: isSubmittingForReview ? 'not-allowed' : 'pointer', opacity: isSubmittingForReview ? 0.65 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Send size={14} /> {isSubmittingForReview ? 'Submitting…' : 'Submit ATR for Review'}
                  </button>
                </>
              ) : (
                <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> {isApproved ? 'Report Locked' : 'Submitted — Pending Review'}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons below the title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHistory((value) => !value)}
              style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <History size={13} /> {showHistory ? 'Hide Carry-Forward ATR' : 'View Carry-Forward ATR'}
            </button>
            <button onClick={() => window.print()}
              style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <Printer size={13} /> Print
            </button>
          </div>
        </div>
      )}

      {hideHeader && !locked && (
        <div style={{ ...surface, padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleSaveATR} disabled={isSaved || coList.length === 0}
            style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: isSaved ? '#f1f5f9' : '#ffffff', color: isSaved ? '#64748b' : accent, border: `1px solid ${isSaved ? '#cbd5e1' : accent}`, borderRadius: '8px', cursor: isSaved ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <Save size={14} /> {isSaved ? 'Saved' : 'Save ATR'}
          </button>
          <button className="btn btn-primary" onClick={handleSaveSubmit} disabled={isSubmittingForReview}
            style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', cursor: isSubmittingForReview ? 'not-allowed' : 'pointer', opacity: isSubmittingForReview ? 0.65 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
            <Send size={14} /> {isSubmittingForReview ? 'Submitting…' : 'Submit ATR for Review'}
          </button>
        </div>
      )}

      {/* ── APPROVAL / REVISION / SUBMISSION STATUS BANNERS ──────────────── */}
      {!hideHeader && !showHistory && isRevision && (
        <RequestRevisionCard
          title={`Course ATR Revision Requested (${currentCourse?.code || 'Course'})`}
          requestedBy={verifiedBy}
          remarks={atrRemarks || 'Please review corrective actions and revise ATR details before resubmission.'}
          actionText="Please update observation notes or action plans below and resubmit for Programme Coordinator approval."
        />
      )}

      {!hideHeader && !showHistory && isApproved && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#15803d', display: 'block' }}>
              ✓ Verified &amp; Approved by {verifiedBy}
            </span>
            <span style={{ fontSize: '12px', color: '#166534', display: 'block', marginTop: '2px' }}>
              Course Action Taken Report (ATR) for <strong>{currentCourse?.code}</strong> has been verified and approved by the Programme Coordinator.
            </span>
          </div>
        </div>
      )}

      {!showHistory && !suppressPendingMessage && isSubmitted && !isApproved && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400e', display: 'block' }}>
              Submitted — Pending Programme Coordinator Review
            </span>
            <span style={{ fontSize: '12px', color: '#b45309', display: 'block', marginTop: '2px' }}>
              Course ATR for <strong>{currentCourse?.code}</strong> has been submitted and is awaiting verification by {verifiedBy || 'Programme Coordinator'}.
            </span>
          </div>
        </div>
      )}


      {/* ── CURRENT / CARRY-FORWARD COURSE ATR ───────────────────────────── */}
      {showHistory ? (
        <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', borderColor: '#a5b4fc', borderWidth: '1.5px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Previous-Year Course ATR{previousYearAtr?.batch?.name ? ` — ${previousYearAtr.batch.name}` : ''}
          </div>
          {previousYearLoadState === 'loading' ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: muted }}>Loading the previous academic batch Course ATR…</div>
          ) : previousYearLoadState === 'error' ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: '#b91c1c' }}>Unable to load the previous academic batch Course ATR.</div>
          ) : !(previousYearAtr?.outcomes ?? []).length ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: muted }}>No previous-year Course ATR is available for this course.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="audit-data-table" style={{ margin: 0 }}>
                <thead><tr><th>CO</th><th>Outcome Statement</th><th>Target</th><th>Attainment</th><th>Achievement</th><th>Observation</th><th>Actions Taken</th></tr></thead>
                <tbody>{previousYearAtr.outcomes.map((outcome, index) => <tr key={outcome.outcomeCode ?? index} style={{ verticalAlign: 'top' }}><td style={{ fontWeight: 800, color: accent }}>{outcome.outcomeCode ?? `CO${index + 1}`}</td><td>{outcome.outcomeStatement ?? '—'}</td><td>{formatLevel(outcome.targetLevel)}</td><td>{formatLevel(outcome.attainmentLevel)}</td><td>{outcome.achievementPercentage != null ? `${Number(outcome.achievementPercentage).toFixed(1)}%` : '—'}</td><td>{outcome.observation || '—'}</td><td>{Array.isArray(outcome.actions) && outcome.actions.length ? outcome.actions.map((action, actionIndex) => <div key={actionIndex} style={{ marginBottom: 4 }}><strong>Action {actionIndex + 1}:</strong> {action}</div>) : '—'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      ) : coList.length === 0 ? (
        <div style={{ ...surface, padding: '40px', textAlign: 'center', color: muted, fontSize: '12.5px' }}>
          No Course Outcomes defined yet. Add COs first via Outcome Management.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {coList.map((co, idx) => {
            const borderCol = co.met ? '#bbf7d0' : '#fecaca';
            const bgCol     = co.met ? '#f0fdf4'  : '#fef2f2';
            return (
              <div key={co.code} style={{ border: `1px solid ${borderCol}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>

                {/* Card banner */}
                <div style={{ background: bgCol, borderBottom: `1px solid ${borderCol}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
                    <span style={{ color: accent, fontWeight: '900', marginRight: '6px' }}>{co.code}:</span>
                    {co.statement}
                  </span>
                </div>

                {/* Inner table */}
                <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ width: '70px', textAlign: 'center' }}>CO</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Attainment</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Observation</th>
                      <th>{co.met ? 'Action Taken' : 'Corrective Actions for Improvement'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: accent, verticalAlign: 'top', paddingTop: '12px' }}>{co.code}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: muted, verticalAlign: 'top', paddingTop: '12px' }}>{formatLevel(co.target)}</td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: co.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{formatLevel(co.actual)}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                        <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: co.met ? '#dcfce7' : '#fee2e2', color: co.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                          {co.pct.toFixed(1)}% Target Achieved
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                        {locked ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {co.actions.map((act, aIdx) => (
                                <div key={aIdx} style={{ fontSize: '12px', color: ink, background: '#f8fafc', padding: '8px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', lineHeight: 1.45 }}>
                                  <strong style={{ color: '#2563eb', marginRight: '6px' }}>Action {aIdx + 1}:</strong> {act}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {co.actions.map((act, aIdx) => (
                                <div key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '68px', fontSize: '12px', paddingTop: '9px' }}>Action {aIdx + 1}:</span>
                                  <textarea rows={2} value={act} disabled={locked}
                                    onChange={(e) => handleUpdateAction(idx, aIdx, e.target.value)}
                                    style={{ flex: 1, fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                                  />
                                  {!locked && co.actions.length > 1 && (
                                    <button onClick={() => handleDeleteAction(idx, aIdx)}
                                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '4px' }}>
                                      <span style={{ fontSize: '15px', lineHeight: 1 }}>×</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                              {!locked && (
                                <button onClick={() => handleAddAction(idx)}
                                  style={{ alignSelf: 'flex-start', height: '28px', padding: '0 12px', fontSize: '11.5px', fontWeight: '700', background: '#f8fafc', color: accent, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                                  + Add Action
                                </button>
                              )}
                            </div>
                          )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
