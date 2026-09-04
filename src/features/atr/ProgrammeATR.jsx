import { useState, useEffect, useMemo } from 'react';
import {
  Save, CheckCircle2, Clock, ShieldCheck, Printer,
  Plus, Lock, Send, History,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { useAttainment } from '../../context/attainment';
import { useApproval } from '../../context/approval';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import { reportsApi } from '../../api/reports';
import { openReportPdf } from '../../utils/reportDownload';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const parseObservations = (observationsJson) => {
  if (Array.isArray(observationsJson)) return observationsJson;
  if (typeof observationsJson !== 'string' || !observationsJson.trim()) return [];
  try {
    const parsed = JSON.parse(observationsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const atrSignature = (items = []) => JSON.stringify(items.map((item) => ({
  code: item.code,
  remark: item.remark ?? '',
  actions: (item.actions ?? []).filter(Boolean),
})));

export default function ProgrammeATR({ courseId = null, programmeId: propProgrammeId = null, batchId: propBatchId = null, hideFooter = false, hideHeader = false, readOnly = false, showBatchSelector = true, showHeaderActions = true, useBatchApprovalWorkspace = false }) {
  const { user, role } = useAuth();
  const {
    selectedCourse,
    selectedBatch,
    batchId,
    setBatchId = () => {},
    batches         = [],
    loadCoordinatorProgrammeBatches = () => Promise.resolve([]),
    masterProgrammes = [],
    activePOs       = [],
    activePSOs      = [],
    poPsoTargets    = {},
    programmeId     = 'prog-1',
    programmeATR = null,
    loadProgrammeATR = () => Promise.resolve(null),
    saveProgrammeATR = () => Promise.resolve(null),
    submitProgrammeATR = () => Promise.resolve(null),
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();
  const { loadPreviousYearProgrammeATR = () => Promise.resolve(null) } = useAttainment();
  const {
    programmeCoordinatorApprovals = [],
    loadProgrammeCoordinatorApprovals = () => Promise.resolve([]),
  } = useApproval();

  const [showHistory, setShowHistory] = useState(false);
  const [previousYearAtr, setPreviousYearAtr] = useState(null);
  const [previousYearLoadState, setPreviousYearLoadState] = useState('idle');
  const [batchApprovalWorkspace, setBatchApprovalWorkspace] = useState(null);

  const activeProgId = propProgrammeId || programmeId || null;
  const targetCourseId = courseId || selectedCourse?.id || null;
  const progAtrKey = activeProgId ? `prog-atr-${activeProgId}` : '';
  const safeVerificationStore = courseVerificationStore ?? {};
  const vRecord = (progAtrKey && safeVerificationStore[progAtrKey]) || (activeProgId && safeVerificationStore[`allocation-${activeProgId}`]) || (targetCourseId && safeVerificationStore[targetCourseId]) || {};
  const storedReportStatus = programmeATR?.status ?? vRecord.programmeAtrStatus ?? 'DRAFT';
  const storedVerificationRemarks = programmeATR?.verificationComments ?? vRecord.programmeAtrRemarks ?? '';
  const storedVerifierName = programmeATR?.verifiedBy ?? vRecord.verifiedBy ?? 'Head of Department (HOD)';

  const isFaculty     = role === 'FACULTY';
  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC' || role === 'HOD';

  const batchList = batches || [];
  const programmeBatches = useMemo(() => batchList.filter((batch) => (
    String(batch.masterProgrammeId ?? batch.programmeId ?? '') === String(activeProgId ?? '')
  )), [activeProgId, batchList]);
  const [selectedBatchId, setSelectedBatchId] = useState(() => propBatchId || batchId || selectedBatch?.id || '');
  const currentBatchObj = programmeBatches.find((b) => String(b.id) === String(selectedBatchId)) || null;
  const currentProgramme = masterProgrammes.find(
    (programme) => String(programme.id) === String(activeProgId)
  ) ?? programmeATR?.programme ?? { id: activeProgId };
  const [atrSaveState, setAtrSaveState] = useState('idle');
  const [savedAtrSignature, setSavedAtrSignature] = useState(null);
  const [submittedForReview, setSubmittedForReview] = useState(false);
  const [currentAtrLoadState, setCurrentAtrLoadState] = useState(() => selectedBatchId ? 'loading' : 'idle');
  const [reportDownloadError, setReportDownloadError] = useState('');
  const workspaceProgrammeAtrApproval = useMemo(() => {
    const workspace = batchApprovalWorkspace ?? {};
    const approvals = [
      ...(workspace.approvalItems ?? workspace.approvals ?? []),
      ...(workspace.courses ?? []).flatMap((course) => course.approvalItems ?? course.approvals ?? []),
    ];
    return approvals.find((approval) => approval.type === 'PROGRAMME_ATR') ?? null;
  }, [batchApprovalWorkspace]);
  const atrApproval = workspaceProgrammeAtrApproval ?? programmeCoordinatorApprovals
    .filter((approval) => approval.type === 'PROGRAMME_ATR' && String(approval.programmeBatchId) === String(selectedBatchId))
    .sort((left, right) => new Date(right.submittedAt ?? right.approvedAt ?? 0) - new Date(left.submittedAt ?? left.approvedAt ?? 0))[0] ?? null;
  const reportStatus = atrApproval?.status ?? storedReportStatus;
  const verificationRemarks = atrApproval?.remarks ?? storedVerificationRemarks;
  const verifierName = atrApproval?.approvedBy ?? storedVerifierName;
  const isPreviousBatch = currentBatchObj?.name?.includes('Archived') || currentBatchObj?.name?.includes('Graduated');
  const isSubmittedForReview = submittedForReview || ['PENDING', 'SUBMITTED_FOR_VERIFICATION', 'SUBMITTED', 'PENDING_APPROVAL'].includes(reportStatus);
  const locked = readOnly || isPreviousBatch || isSubmittedForReview || reportStatus === 'VERIFIED' || reportStatus === 'APPROVED';

  useEffect(() => {
    // Match the Programme Coordinator workflow: fetch batches using the
    // selected Master Programme and the signed-in coordinator's email.
    if (role !== 'PROGRAMME_COORDINATOR' || !activeProgId || !user?.email) return;
    loadCoordinatorProgrammeBatches(user.email, activeProgId).catch(() => {});
  }, [activeProgId, loadCoordinatorProgrammeBatches, role, user?.email]);

  useEffect(() => {
    if (role !== 'PROGRAMME_COORDINATOR' || !activeProgId) return;
    loadProgrammeCoordinatorApprovals(activeProgId).catch(() => {});
  }, [activeProgId, loadProgrammeCoordinatorApprovals, role]);

  // ── Build PO/PSO ATR list ──────────────────────────────────────────
  const progTargets = poPsoTargets ?? { poTargets: {}, psoTargets: {} };

  const normPOs = activePOs || [];
  const normPSOs = activePSOs || [];

  const buildList = () => [
    ...normPOs.map((po) => {
      const target  = progTargets.poTargets?.[po.code] ?? 1.80;
      const actual  = po.attainment ?? null;
      const pct     = actual !== null ? Number(((actual / target) * 100).toFixed(1)) : 0;
      const met     = actual !== null && actual >= target;
      return {
        code: po.code, type: 'PO', statement: po.statement,
        target, actual, pct, met,
        remark: '',
        actions: met ? ['Maintain current teaching methodology and continuous assessment structure.'] : [
          `Conduct expert technical sessions and industry workshops for ${po.code}.`,
          'Increase hands-on practical problem sets and continuous evaluation frequency.',
        ],
      };
    }),
    ...normPSOs.map((pso) => {
      const target  = progTargets.psoTargets?.[pso.code] ?? 1.80;
      const actual  = pso.attainment ?? null;
      const pct     = actual !== null ? Number(((actual / target) * 100).toFixed(1)) : 0;
      const met     = actual !== null && actual >= target;
      return {
        code: pso.code, type: 'PSO', statement: pso.statement,
        target, actual, pct, met,
        remark: '',
        actions: met ? ['Maintain current project evaluation and hands-on lab sessions.'] : [
          `Organize real-time project workshops and industry visits for ${pso.code}.`,
          'Encourage student certifications in latest IT domain software principles.',
        ],
      };
    }),
  ];

  const [atrList, setAtrList] = useState(buildList);

  useEffect(() => {
    setAtrList(buildList());
    setSavedAtrSignature(null);
    setAtrSaveState('idle');
    setSubmittedForReview(false);
  }, [programmeId, targetCourseId, activePOs.length, activePSOs.length]);

  useEffect(() => {
    if (propBatchId || selectedBatch?.id) setSelectedBatchId(propBatchId || selectedBatch.id);
  }, [propBatchId, selectedBatch?.id]);

  useEffect(() => {
    if (!useBatchApprovalWorkspace || !selectedBatchId) {
      setBatchApprovalWorkspace(null);
      return undefined;
    }
    let isCurrent = true;
    reportsApi.getProgrammeBatchApprovalWorkspace(selectedBatchId)
      .then((response) => {
        if (!isCurrent) return;
        setBatchApprovalWorkspace(response?.data?.data ?? response?.data ?? response ?? null);
      })
      .catch(() => {
        if (isCurrent) setBatchApprovalWorkspace(null);
      });
    return () => { isCurrent = false; };
  }, [selectedBatchId, useBatchApprovalWorkspace]);

  useEffect(() => {
    // A standalone Programme ATR must only expose batches belonging to the
    // Master Programme currently selected in the application sidebar.
    if (propBatchId) return;
    const nextBatchId = programmeBatches.some((batch) => String(batch.id) === String(selectedBatchId))
      ? selectedBatchId
      : programmeBatches[0]?.id ?? '';
    if (String(nextBatchId) !== String(selectedBatchId)) setSelectedBatchId(nextBatchId);
    if (nextBatchId && String(nextBatchId) !== String(batchId)) setBatchId(nextBatchId);
  }, [batchId, programmeBatches, propBatchId, selectedBatchId, setBatchId]);

  const handleBatchChange = (nextBatchId) => {
    setSelectedBatchId(nextBatchId);
    setBatchId(nextBatchId);
    setSavedAtrSignature(null);
    setAtrSaveState('idle');
    setSubmittedForReview(false);
  };

  useEffect(() => {
    if (!showHistory || !selectedBatchId) return;
    let isCurrent = true;
    setPreviousYearLoadState('loading');
    setPreviousYearAtr(null);

    loadPreviousYearProgrammeATR(selectedBatchId)
      .then((atr) => {
        if (!isCurrent) return;
        setPreviousYearAtr(atr);
        setPreviousYearLoadState(atr ? 'loaded' : 'empty');
      })
      .catch(() => {
        if (isCurrent) setPreviousYearLoadState('error');
      });

    return () => { isCurrent = false; };
  }, [loadPreviousYearProgrammeATR, selectedBatchId, showHistory]);

  const previousYearOutcomes = [
    ...(previousYearAtr?.poOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PO' })),
    ...(previousYearAtr?.psoOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PSO' })),
  ];
  const previousYearAtrList = previousYearOutcomes.map((outcome) => {
    const target = Number(outcome.targetLevel ?? outcome.target) || 0;
    const actual = Number(outcome.attainmentLevel ?? outcome.attainment) || 0;
    return {
      code: outcome.outcomeCode,
      type: outcome.type,
      statement: outcome.outcomeStatement ?? '',
      target,
      actual,
      pct: Number(outcome.achievementPercentage) || (target ? Number(((actual / target) * 100).toFixed(1)) : 0),
      met: actual >= target,
      remark: outcome.observation ?? '',
      actions: outcome.actions ?? [],
    };
  });
  const previousYearPoList = previousYearAtrList.filter((item) => item.type === 'PO');
  const previousYearPsoList = previousYearAtrList.filter((item) => item.type === 'PSO');

  useEffect(() => {
    // The Programme Batch ATR API is scoped solely by programmeBatchId.
    // Do not wait for the master-programme store to resolve before fetching.
    if (!selectedBatchId) {
      setCurrentAtrLoadState('idle');
      return;
    }
    let isCurrent = true;
    setCurrentAtrLoadState('loading');

    loadProgrammeATR(selectedBatchId).then((atr) => {
      if (!isCurrent) return;
      if (!atr) {
        // No saved ATR exists for this batch, so expose the derived draft only
        // after the request has completed.
        setAtrList(buildList());
        setCurrentAtrLoadState('loaded');
        return;
      }
      const outcomeDefinitions = [...normPOs, ...normPSOs];
      const reportOutcomes = [
        ...(atr.poOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PO' })),
        ...(atr.psoOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PSO' })),
        ...(atr.poTargetMetRows ?? []).map((outcome) => ({
          ...outcome,
          type: 'PO',
          outcomeCode: outcome.outcomeCode ?? outcome.poCode,
          attainmentLevel: outcome.attainmentLevel ?? outcome.overallAttainment,
          status: outcome.status ?? (outcome.targetMet ? 'ATTAINED' : 'NOT_ATTAINED'),
          actionPlan: outcome.actionPlan ?? outcome.actionProposed,
        })),
        ...(atr.psoTargetMetRows ?? []).map((outcome) => ({
          ...outcome,
          type: 'PSO',
          outcomeCode: outcome.outcomeCode ?? outcome.psoCode,
          attainmentLevel: outcome.attainmentLevel ?? outcome.overallAttainment,
          status: outcome.status ?? (outcome.targetMet ? 'ATTAINED' : 'NOT_ATTAINED'),
          actionPlan: outcome.actionPlan ?? outcome.actionProposed,
        })),
      ];
      const observations = reportOutcomes.length > 0 ? reportOutcomes : parseObservations(atr.observationsJson);
      setAtrList(observations.map((observation) => {
        const code = observation.outcomeCode;
        const outcome = outcomeDefinitions.find((item) => item.code === code);
        const attained = observation.attainmentLevel >= observation.targetLevel
          || observation.status === 'ATTAINED';
        const target = Number(observation.targetLevel ?? observation.target) || 0;
        const actual = Number(observation.attainmentLevel ?? observation.attainment) || 0;
        return {
          code,
          type: observation.type ?? (code?.startsWith('PSO') ? 'PSO' : 'PO'),
          statement: observation.outcomeStatement ?? outcome?.statement ?? '',
          target,
          actual,
          pct: Number(observation.achievementPercentage)
            || (target ? Number(((actual / target) * 100).toFixed(1)) : 0),
          met: attained,
          remark: attained ? '' : (observation.observation ?? ''),
          actions: observation.actions?.length ? observation.actions : (observation.actionPlan ? [observation.actionPlan] : attained && observation.observation ? [observation.observation] : []),
        };
      }));
      setCurrentAtrLoadState('loaded');
    }).catch(() => {
      if (isCurrent) setCurrentAtrLoadState('error');
    });

    return () => { isCurrent = false; };
  }, [loadProgrammeATR, selectedBatchId, activePOs, activePSOs]);

  const buildAtrPayload = () => {
    const outcomesPayload = (type) => atrList
      .filter((item) => item.type === type)
      .map((item) => ({
        outcomeCode: item.code,
        observation: item.met ? '' : (item.remark || ''),
        actions: item.actions.filter(Boolean),
      }));
    return {
      status: 'DRAFT',
      poOutcomes: outcomesPayload('PO'),
      psoOutcomes: outcomesPayload('PSO'),
    };
  };

  const handleSaveAtr = async () => {
    if (!selectedBatchId || locked || atrSaveState === 'saving' || savedAtrSignature === atrSignature(atrList)) return;
    try {
      setAtrSaveState('saving');
      await saveProgrammeATR(selectedBatchId, buildAtrPayload());
      setSavedAtrSignature(atrSignature(atrList));
      setAtrSaveState('saved');
    } catch (error) {
      console.error('Failed to save Programme ATR:', error);
      setAtrSaveState('error');
    }
  };

  const handleSubmitAtrForReview = async () => {
    if (!selectedBatchId || locked) return;
    try {
      setAtrSaveState('submitting');
      // Save the current programme ATR immediately before submission so the
      // HOD review always receives the latest observations and actions.
      await saveProgrammeATR(selectedBatchId, buildAtrPayload());
      setSavedAtrSignature(atrSignature(atrList));
      await submitProgrammeATR(selectedBatchId);
      if (activeProgId) await loadProgrammeCoordinatorApprovals(activeProgId);
      setSubmittedForReview(true);
      setAtrSaveState('submitted');
    } catch (error) {
      console.error('Failed to submit Programme ATR:', error);
      setAtrSaveState('error');
    }
  };

  const handleOfficialPrint = async () => {
    if (!selectedBatchId) { setReportDownloadError('Select a programme batch before printing the Programme ATR.'); return; }
    setReportDownloadError('');
    try { openReportPdf(await reportsApi.downloadProgrammeAtrPdf(selectedBatchId)); }
    catch (error) { setReportDownloadError(error?.response?.data?.message || 'Unable to open the official Programme ATR PDF.'); }
  };

  const handleAddAction    = (idx)       => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (idx, j, v) => setAtrList((p) => p.map((c, i) => { if (i !== idx) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (idx, j)    => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));

  const isAtrSaved = savedAtrSignature !== null && savedAtrSignature === atrSignature(atrList);
  const currentAtrLoading = currentAtrLoadState === 'loading';

  const poList  = atrList.filter((i) => i.type === 'PO');
  const psoList = atrList.filter((i) => i.type === 'PSO');
  const metCount = atrList.filter((c) => c.met).length;
  const gapCount = atrList.length - metCount;

  // ── ATR Card renderer ────────────────────────────────────────────
  const renderCard = (item, accentColor, isReadOnly = locked) => {
    // PO and PSO codes can overlap. Resolve the row by both its outcome type
    // and code so actions added from a PSO card never modify a PO card.
    const idx       = atrList.findIndex((i) => i.type === item.type && i.code === item.code);
    const borderCol = item.met ? '#bbf7d0' : '#fecaca';
    const bgCol     = item.met ? '#f0fdf4'  : '#fef2f2';

    return (
      <div key={`${item.type}-${item.code}`} style={{ border: `1px solid ${borderCol}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {/* Card banner */}
        <div style={{ background: bgCol, borderBottom: `1px solid ${borderCol}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: ink }}>
            <span style={{ color: accentColor, fontWeight: '900', marginRight: '6px' }}>{item.code}:</span>
            {item.statement}
          </span>
        </div>

        {/* Inner table */}
        <table className="audit-data-table" style={{ margin: 0, border: 'none' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ width: '70px', textAlign: 'center' }}>{item.type}</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Target</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Attainment</th>
              <th style={{ width: '130px', textAlign: 'center' }}>Observation</th>
              <th>{item.met ? 'Action Taken' : 'Corrective Actions for Improvement'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: '800', color: accentColor, verticalAlign: 'top', paddingTop: '12px' }}>{item.code}</td>
              <td style={{ textAlign: 'center', fontWeight: '700', color: muted, verticalAlign: 'top', paddingTop: '12px' }}>{Number(item.target ?? 0).toFixed(2)}</td>
              <td style={{ textAlign: 'center', fontWeight: '800', color: item.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{Number(item.actual ?? 0).toFixed(2)}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: item.met ? '#dcfce7' : '#fee2e2', color: item.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                  {Number(item.pct ?? 0).toFixed(1)}% {item.met ? 'Achieved' : 'Gap'}
                </span>
              </td>
              <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.actions.map((act, aIdx) => (
                      <div key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#3b82f6', minWidth: '68px', fontSize: '12px', paddingTop: '9px' }}>Action {aIdx + 1}:</span>
                        {isReadOnly ? (
                          <div style={{ flex: 1, background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                            {act}
                          </div>
                        ) : (
                          <textarea rows={2} value={act}
                            onChange={(e) => handleUpdateAction(idx, aIdx, e.target.value)}
                            style={{ flex: 1, fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                          />
                        )}
                        {!isReadOnly && item.actions.length > 1 && (
                          <button onClick={() => handleDeleteAction(idx, aIdx)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '4px' }}>
                            <span style={{ fontSize: '15px', lineHeight: 1 }}>×</span>
                          </button>
                        )}
                      </div>
                    ))}
                    {!isReadOnly && (
                      <button onClick={() => handleAddAction(idx)}
                        style={{ alignSelf: 'flex-start', height: '28px', padding: '0 12px', fontSize: '11.5px', fontWeight: '700', background: '#f8fafc', color: accent, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                        <Plus size={12} /> Add Action
                      </button>
                    )}
                  </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      {!hideHeader && (
        <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
                Programme ATR
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
              {showBatchSelector && (
                <label style={{ display: 'grid', gap: 4, minWidth: 250, fontSize: '10.5px', fontWeight: '800', color: muted, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  Programme Batch
                  <select
                    aria-label="Programme batch"
                    value={selectedBatchId}
                    onChange={(event) => handleBatchChange(event.target.value)}
                    disabled={programmeBatches.length === 0}
                    style={{ height: 38, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', background: '#fff', color: ink, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 650, cursor: programmeBatches.length ? 'pointer' : 'not-allowed', textTransform: 'none', letterSpacing: 'normal' }}
                  >
                    {programmeBatches.length === 0 ? <option value="">No batches in selected programme</option> : programmeBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </label>
              )}
              {!showHistory && (!locked ? (
                <>
                  <button className="btn btn-primary" onClick={handleSaveAtr} disabled={currentAtrLoading || atrSaveState === 'saving' || isAtrSaved}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: isAtrSaved ? '#f1f5f9' : undefined, color: isAtrSaved ? '#64748b' : undefined, border: isAtrSaved ? '1px solid #cbd5e1' : undefined, cursor: currentAtrLoading || atrSaveState === 'saving' || isAtrSaved ? 'not-allowed' : 'pointer', opacity: currentAtrLoading || atrSaveState === 'saving' ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Save size={14} /> {atrSaveState === 'saving' ? 'Saving…' : isAtrSaved ? 'Saved' : 'Save ATR'}
                  </button>
                  <button className="btn btn-primary" onClick={handleSubmitAtrForReview} disabled={currentAtrLoading || atrSaveState === 'submitting'}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: '#ffffff', color: accent, border: `1px solid ${accent}`, borderRadius: '8px', cursor: currentAtrLoading || atrSaveState === 'submitting' ? 'not-allowed' : 'pointer', opacity: currentAtrLoading || atrSaveState === 'submitting' ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Send size={14} /> {atrSaveState === 'submitting' ? 'Submitting…' : 'Submit ATR for Review'}
                  </button>
                </>
              ) : (
                <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> {isPreviousBatch ? `${currentBatchObj.name} (Archived)` : isSubmittedForReview ? 'Submitted — Pending HOD Review' : 'Report Locked'}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons below the title */}
          {showHeaderActions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowHistory((v) => !v)}
                style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                <History size={13} /> {showHistory ? 'Hide Carry Forwarded ATR' : 'View Carry Forwarded ATR'}
              </button>

              <button onClick={handleOfficialPrint}
                style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
                <Printer size={13} /> Print
              </button>
              {reportDownloadError && <span style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 700 }}>{reportDownloadError}</span>}
            </div>
          )}
        </div>
      )}

      {/* ── CARRY-FORWARD REFERENCE ───────────────────────────────────────── */}
      {showHistory && (
        <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', borderColor: '#a5b4fc', borderWidth: '1.5px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Programme ATR Carry-Forward{previousYearAtr?.batch?.name ? ` — ${previousYearAtr.batch.name}` : ' — Previous Academic Batch'}
          </div>
          {previousYearLoadState === 'loading' ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: muted }}>Loading the previous academic batch ATR…</div>
          ) : previousYearLoadState === 'error' ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: '#b91c1c' }}>Unable to load the previous academic batch ATR.</div>
          ) : previousYearAtrList.length === 0 ? (
            <div style={{ padding: '14px 0', fontSize: '12.5px', color: muted }}>No previous-year Programme ATR is available for this batch.</div>
          ) : (
            <>
              <div style={{ background: '#f8fafc', borderLeft: '4px solid #4f46e5', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>Programme Outcomes (POs)</h4>
              </div>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '28px' }}>
                {previousYearPoList.map((outcome) => renderCard(outcome, accent, true))}
              </div>
              <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>Programme Specific Outcomes (PSOs)</h4>
              </div>
              <div style={{ display: 'grid', gap: '14px' }}>
                {previousYearPsoList.map((outcome) => renderCard(outcome, '#0284c7', true))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Archived Year Lock Banner */}
      {!showHistory && isPreviousBatch && (
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Lock size={20} style={{ color: '#1d4ed8', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e40af', display: 'block' }}>
              🔒 Archived Academic Batch ({currentBatchObj.name}) — Read Only
            </span>
            <span style={{ fontSize: '12px', color: '#1e3a8a', display: 'block', marginTop: '2px' }}>
              This Programme Action Taken Report is an archived historical record from {currentBatchObj.name}. Previous batch ATR reports are locked and cannot be edited.
            </span>
          </div>
        </div>
      )}

      {/* ── VERIFICATION APPROVED BANNER ─────────────────────────────────── */}
      {!showHistory && (reportStatus === 'VERIFIED' || reportStatus === 'APPROVED') && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#15803d' }}>
              ✓ Verified &amp; Approved by {verifierName}
            </span>
            <span style={{ fontSize: '12px', color: '#166534', display: 'block', marginTop: '2px' }}>
              Programme ATR has been verified and locked for this academic cycle.
            </span>
          </div>
        </div>
      )}

      {/* ── REVISION REQUESTED BANNER ─────────────────────────────────────── */}
      {!showHistory && reportStatus === 'REVISION_REQUESTED' && (
        <RequestRevisionCard
          title={`Programme ATR Revision Requested (${currentProgramme.code || 'Programme'})`}
          requestedBy={verifierName}
          remarks={verificationRemarks || 'Please review the PO/PSO observations and corrective actions as per HOD feedback.'}
          actionText="Please update the programme ATR details below and resubmit for HOD approval."
        />
      )}

      {/* ── PENDING REVIEW BANNER ─────────────────────────────────────────── */}
      {!showHistory && isSubmittedForReview && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400e' }}>
              Submitted — Pending HOD Review
            </span>
            <span style={{ fontSize: '12px', color: '#b45309', display: 'block', marginTop: '2px' }}>
              Submitted for Head of Department verification.
            </span>
          </div>
        </div>
      )}

      {/* The carry-forward view is intentionally exclusive: never mix the
          previous-year reference with editable/current-cycle ATR content. */}
      {!showHistory && (currentAtrLoading ? (
        <div style={{ ...surface, padding: '36px 20px', textAlign: 'center', color: muted, fontSize: '13px' }}>
          Loading Programme ATR…
        </div>
      ) : <>
        {/* ── PO SECTION HEADING ──────────────────────────────────────────── */}
        <div style={{ background: '#f8fafc', borderLeft: '4px solid #4f46e5', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>
            Programme Outcomes (POs)
          </h4>
        </div>

        <div style={{ display: 'grid', gap: '14px', marginBottom: '28px' }}>
          {poList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontSize: '13px' }}>
              No Programme Outcomes defined.
            </div>
          ) : (
            poList.map((po) => renderCard(po, accent))
          )}
        </div>

        {/* ── PSO SECTION HEADING ─────────────────────────────────────────── */}
        <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>
            Programme Specific Outcomes (PSOs)
          </h4>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {psoList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: '#f0f9ff', borderRadius: '8px', color: '#94a3b8', fontSize: '13px' }}>
              No Programme Specific Outcomes defined.
            </div>
          ) : (
            psoList.map((pso) => renderCard(pso, '#0284c7'))
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        {!hideFooter && isFaculty && (
          <div style={{ ...surface, padding: '14px 20px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {!locked ? (
              <button className="btn btn-primary" onClick={handleSubmitAtrForReview} disabled={atrSaveState === 'submitting'}
                style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', cursor: atrSaveState === 'submitting' ? 'not-allowed' : 'pointer', opacity: atrSaveState === 'submitting' ? 0.65 : 1, display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                <Send size={14} /> {atrSaveState === 'submitting' ? 'Submitting…' : 'Submit Report for Review'}
              </button>
            ) : (
              <span style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> {reportStatus === 'APPROVED' || reportStatus === 'VERIFIED' ? 'Report Locked' : 'Submitted — Pending HOD Review'}
              </span>
            )}
          </div>
        )}
      </>)}
    </div>
  );
}
