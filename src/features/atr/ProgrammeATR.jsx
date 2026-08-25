import { useState, useEffect } from 'react';
import {
  Save, CheckCircle2, Clock, ShieldCheck, Printer,
  AlertCircle, Plus, Lock, Send, History,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

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

export default function ProgrammeATR({ courseId = null, programmeId: propProgrammeId = null, batchId: propBatchId = null, hideFooter = false, hideHeader = false, readOnly = false }) {
  const { user, role } = useAuth();
  const {
    selectedCourse,
    selectedBatch,
    batches         = [],
    activePOs       = [],
    activePSOs      = [],
    poPsoTargets    = {},
    programmeId     = 'prog-1',
    programmeATR = null,
    loadProgrammeATR = () => Promise.resolve(null),
    loadPreviousYearProgrammeATR = () => Promise.resolve(null),
    saveProgrammeATR = () => Promise.resolve(null),
    submitProgrammeATR = () => Promise.resolve(null),
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const [showHistory, setShowHistory] = useState(false);
  const [previousYearAtr, setPreviousYearAtr] = useState(null);
  const [previousYearLoadState, setPreviousYearLoadState] = useState('idle');

  const activeProgId = propProgrammeId || programmeId || null;
  const targetCourseId = courseId || selectedCourse?.id || null;
  const progAtrKey = activeProgId ? `prog-atr-${activeProgId}` : '';
  const safeVerificationStore = courseVerificationStore ?? {};
  const vRecord = (progAtrKey && safeVerificationStore[progAtrKey]) || (activeProgId && safeVerificationStore[`allocation-${activeProgId}`]) || (targetCourseId && safeVerificationStore[targetCourseId]) || {};
  const reportStatus = programmeATR?.status ?? vRecord.programmeAtrStatus ?? 'DRAFT';
  const verificationRemarks = programmeATR?.verificationComments ?? vRecord.programmeAtrRemarks ?? '';
  const verifierName = programmeATR?.verifiedBy ?? vRecord.verifiedBy ?? 'Head of Department (HOD)';

  const isFaculty     = role === 'FACULTY';
  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC' || role === 'HOD';

  const batchList = batches || [];
  const [selectedBatchId, setSelectedBatchId] = useState(() => propBatchId || selectedBatch?.id || batches?.[0]?.id || '');
  const currentBatchObj = batchList.find((b) => b.id === selectedBatchId) || batchList[0] || null;
  const isPreviousBatch = currentBatchObj?.name?.includes('Archived') || currentBatchObj?.name?.includes('Graduated');
  const isSubmittedForReview = reportStatus === 'SUBMITTED_FOR_VERIFICATION' || reportStatus === 'SUBMITTED';
  const locked = readOnly || isPreviousBatch || isSubmittedForReview || reportStatus === 'VERIFIED' || reportStatus === 'APPROVED';
  const [atrSaveState, setAtrSaveState] = useState('idle');

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
        remark:  met ? 'Target achieved. Maintain current teaching methodology and continuous assessment structure.' : '',
        actions: met ? [] : [
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
        remark:  met ? 'Target achieved. Maintain current project evaluation and hands-on lab sessions.' : '',
        actions: met ? [] : [
          `Organize real-time project workshops and industry visits for ${pso.code}.`,
          'Encourage student certifications in latest IT domain software principles.',
        ],
      };
    }),
  ];

  const [atrList, setAtrList] = useState(buildList);

  useEffect(() => { setAtrList(buildList()); }, [programmeId, targetCourseId, activePOs.length, activePSOs.length]);

  useEffect(() => {
    if (propBatchId || selectedBatch?.id) setSelectedBatchId(propBatchId || selectedBatch.id);
  }, [propBatchId, selectedBatch?.id]);

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
    if (!activeProgId || !selectedBatchId) return;
    let isCurrent = true;

    loadProgrammeATR(selectedBatchId).then((atr) => {
      if (!isCurrent || !atr) return;
      const outcomeDefinitions = [...normPOs, ...normPSOs];
      const reportOutcomes = [
        ...(atr.poOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PO' })),
        ...(atr.psoOutcomes ?? []).map((outcome) => ({ ...outcome, type: 'PSO' })),
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
          remark: attained ? (observation.observation ?? observation.actionPlan ?? '') : '',
          actions: observation.actions ?? (observation.actionPlan ? [observation.actionPlan] : []),
        };
      }));
    }).catch(() => {});

    return () => { isCurrent = false; };
  }, [loadProgrammeATR, selectedBatchId, activePOs, activePSOs]);

  const buildAtrPayload = () => {
    const outcomesPayload = (type) => atrList
      .filter((item) => item.type === type)
      .map((item) => ({
        outcomeCode: item.code,
        outcomeStatement: item.statement,
        targetLevel: Number(item.target) || 0,
        attainmentLevel: Number(item.actual) || 0,
        achievementPercentage: Number(item.pct) || 0,
        observation: item.remark || '',
        actions: item.actions.filter(Boolean),
      }));
    return {
      status: 'DRAFT',
      poOutcomes: outcomesPayload('PO'),
      psoOutcomes: outcomesPayload('PSO'),
    };
  };

  const handleSaveAtr = async () => {
    if (!selectedBatchId || locked) return;
    try {
      setAtrSaveState('saving');
      await saveProgrammeATR(selectedBatchId, buildAtrPayload());
      setAtrSaveState('saved');
    } catch (error) {
      console.error('Failed to save Programme ATR:', error);
      setAtrSaveState('error');
    }
  };

  const handleSubmitAtrForReview = async () => {
    if (!selectedBatchId || locked) return;
    try {
      await submitProgrammeATR(selectedBatchId);
    } catch (error) {
      console.error('Failed to submit Programme ATR:', error);
    }
  };

  const handleUpdateRemark = (idx, v)    => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, remark: v } : c));
  const handleAddAction    = (idx)       => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (idx, j, v) => setAtrList((p) => p.map((c, i) => { if (i !== idx) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (idx, j)    => setAtrList((p) => p.map((c, i) => i === idx ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));

  const poList  = atrList.filter((i) => i.type === 'PO');
  const psoList = atrList.filter((i) => i.type === 'PSO');
  const metCount = atrList.filter((c) => c.met).length;
  const gapCount = atrList.length - metCount;

  // ── ATR Card renderer ────────────────────────────────────────────
  const renderCard = (item, accentColor, isReadOnly = locked) => {
    const idx       = atrList.findIndex((i) => i.code === item.code);
    const borderCol = item.met ? '#bbf7d0' : '#fecaca';
    const bgCol     = item.met ? '#f0fdf4'  : '#fef2f2';

    return (
      <div key={item.code} style={{ border: `1px solid ${borderCol}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
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
              <th>{item.met ? 'Remark (Target Met)' : 'Corrective Actions for Improvement'}</th>
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
                {item.met ? (
                  isReadOnly ? (
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12.5px' }}>
                      {item.remark || 'Target achieved. Maintain current teaching strategy.'}
                    </div>
                  ) : (
                    <textarea rows={3} value={item.remark}
                      onChange={(e) => handleUpdateRemark(idx, e.target.value)}
                      placeholder={`Enter remark for this ${item.type}...`}
                      style={{ width: '100%', fontSize: '12.5px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '8px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                    />
                  )
                ) : (
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
                )}
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
              {!showHistory && (!locked ? (
                <>
                  <button onClick={handleSaveAtr}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Save size={14} /> {atrSaveState === 'saving' ? 'Saving…' : atrSaveState === 'saved' ? 'Saved' : 'Save ATR'}
                  </button>
                  <button onClick={handleSubmitAtrForReview}
                    style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: '#ffffff', color: accent, border: `1px solid ${accent}`, borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                    <Send size={14} /> Submit ATR for Review
                  </button>
                </>
              ) : (
                <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> {isPreviousBatch ? `${currentBatchObj.name} (Archived)` : isSubmittedForReview ? 'Submitted for Review' : 'Report Locked'}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons below the title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHistory((v) => !v)}
              style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <History size={13} /> {showHistory ? 'Hide Carry Forwarded ATR' : 'View Carry Forwarded ATR'}
            </button>

            <button onClick={() => window.print()}
              style={{ height: '34px', padding: '0 14px', fontSize: '12px', fontWeight: '600', background: '#f8fafc', color: ink, border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
              <Printer size={13} /> Print
            </button>
          </div>
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
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#991b1b' }}>
              ⚠ Revision Requested by {verifierName}
            </span>
            {verificationRemarks && (
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#7f1d1d', fontStyle: 'italic' }}>
                "{verificationRemarks}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── PENDING REVIEW BANNER ─────────────────────────────────────────── */}
      {!showHistory && isSubmittedForReview && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400e' }}>
              Submitted — Pending Verification
            </span>
            <span style={{ fontSize: '12px', color: '#b45309', display: 'block', marginTop: '2px' }}>
              Submitted for Programme Coordinator verification.
            </span>
          </div>
        </div>
      )}

      {/* The carry-forward view is intentionally exclusive: never mix the
          previous-year reference with editable/current-cycle ATR content. */}
      {!showHistory && <>
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
              <button onClick={handleSubmitAtrForReview}
                style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                <Send size={14} /> Submit Report for Review
              </button>
            ) : (
              <span style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Report Locked
              </span>
            )}
          </div>
        )}
      </>}
    </div>
  );
}
