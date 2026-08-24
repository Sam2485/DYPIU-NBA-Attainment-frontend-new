import { useState } from 'react';
import { Save, Check, ChevronDown, AlertCircle, CheckCircle2, Lock, Send, Clock } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';
import ProgrammeCoordinatorSetupWorkflow from './ProgrammeCoordinatorSetupWorkflow';

export default function ProgrammeTargetSettings() {
  return <ProgrammeCoordinatorSetupWorkflow standaloneTargetSettings />;
}

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px', fontSize: '13px', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '0 12px', background: '#ffffff',
  color: ink, width: '100%', outline: 'none', fontFamily: 'inherit',
};

const TARGET_INPUT = {
  type: 'number', min: 1, max: 3, step: 0.1,
  style: { height: '36px', width: '90px', fontSize: '13.5px', fontWeight: '700', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontFamily: 'inherit', textAlign: 'center', color: accent, background: '#ffffff' },
};

function LegacyProgrammeTargetSettings() {
  const { user } = useAuth();
  const {
    masterProgrammes    = [],
    programmeId,
    setProgrammeId,
    activePOs           = [],
    activePSOs          = [],
    poPsoTargets        = {},
    updatePoPsoTargets  = () => {},
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) ||
    masterProgrammes[0] ||
    { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };

  const targetsKey = `targets-${programmeId}`;
  const targetsRecord = courseVerificationStore[targetsKey] || courseVerificationStore[`allocation-${programmeId}`] || {};
  const targetsStatus = targetsRecord.poPsoTargetsStatus || targetsRecord.targetsStatus || 'DRAFT';
  const targetsRemarks = targetsRecord.poPsoTargetsRemarks || targetsRecord.targetsRemarks || '';
  const verifierName = targetsRecord.verifiedBy || 'Head of Department (HOD)';

  const isTargetsApproved = targetsStatus === 'APPROVED' || targetsStatus === 'VERIFIED';
  const isTargetsSubmitted = targetsStatus === 'SUBMITTED' || targetsStatus === 'PENDING_APPROVAL';
  const isTargetsRevision = targetsStatus === 'REVISION_REQUESTED' || targetsStatus === 'NEEDS_REVISION';

  const normPSOs = activePSOs.map((p) => ({ ...p, competencies: p.competencies ?? [] }));

  // Initialise draft from saved context targets
  const [poTargetDraft, setPoTargetDraft] = useState(() => {
    const saved = poPsoTargets[programmeId]?.poTargets || {};
    const out   = {};
    activePOs.forEach((po) => { out[po.code] = saved[po.code] ?? 2.0; });
    return out;
  });

  const [psoTargetDraft, setPsoTargetDraft] = useState(() => {
    const saved = poPsoTargets[programmeId]?.psoTargets || {};
    const out   = {};
    normPSOs.forEach((pso) => { out[pso.code] = saved[pso.code] ?? 2.0; });
    return out;
  });

  const [saved, setSaved] = useState(false);

  // Re-sync draft when programme changes
  const handleProgrammeChange = (newId) => {
    setProgrammeId(newId);
    setSaved(false);
    const prog    = masterProgrammes.find((p) => p.id === newId);
    const savedPo  = poPsoTargets[newId]?.poTargets  || {};
    const savedPso = poPsoTargets[newId]?.psoTargets || {};
    const newPoDraft  = {};
    const newPsoDraft = {};
    activePOs.forEach((po)  => { newPoDraft[po.code]   = savedPo[po.code]   ?? 2.0; });
    normPSOs.forEach((pso)  => { newPsoDraft[pso.code] = savedPso[pso.code] ?? 2.0; });
    setPoTargetDraft(newPoDraft);
    setPsoTargetDraft(newPsoDraft);
  };

  const handleSubmitTargets = () => {
    updatePoPsoTargets(programmeId, poTargetDraft, psoTargetDraft);
    updateCourseVerificationStatus(targetsKey, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    updateCourseVerificationStatus(`allocation-${programmeId}`, 'poPsoTargetsStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert(`PO & PSO target benchmarks for ${selectedProgramme?.name} submitted for HOD review!`);
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: '700', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Programme Coordinator &nbsp;·&nbsp; Target Settings
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
            PO &amp; PSO Target Levels
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: muted }}>
            Set benchmark target levels (1.0 – 3.0 scale).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {/* Programme selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={programmeId}
              onChange={(e) => handleProgrammeChange(e.target.value)}
              style={{ height: '38px', paddingLeft: '12px', paddingRight: '32px', fontSize: '12.5px', fontWeight: '600', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: accent, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', maxWidth: '300px' }}
            >
              {masterProgrammes.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: muted, pointerEvents: 'none' }} />
          </div>

          {/* Submit for HOD Review button */}
          {!isTargetsApproved ? (
            <button
              onClick={handleSubmitTargets}
              style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: saved ? '#16a34a' : accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit', transition: 'background .2s' }}
            >
              {saved ? <><Check size={14} /> Submitted</> : <><Send size={14} /> Submit Target for HOD Review</>}
            </button>
          ) : (
            <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} /> Targets Locked
            </span>
          )}
        </div>
      </div>

      {/* ── HOD REVISION REQUESTED BANNER ─────────────────────────────────── */}
      {isTargetsRevision && (
        <RequestRevisionCard
          title={`HOD Targets Revision Requested (${selectedProgramme?.code || 'Programme'})`}
          requestedBy={verifierName}
          remarks={targetsRemarks || 'Please review and adjust PO/PSO target levels as per HOD notes.'}
          actionText="Please adjust the target levels below and resubmit for HOD approval."
        />
      )}

      {/* ── APPROVED BANNER ────────────────────────────────────────────────── */}
      {isTargetsApproved && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '14px 18px', marginBottom: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800' }}>
              ✓ ALL PO &amp; PSO TARGET LEVELS VERIFIED &amp; APPROVED BY HOD
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#166534' }}>
              Benchmark target levels for {selectedProgramme.name} have been approved and are now locked.
            </p>
          </div>
        </div>
      )}

      {/* ── PENDING REVIEW BANNER ─────────────────────────────────────────── */}
      {isTargetsSubmitted && !isTargetsApproved && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '14px 18px', marginBottom: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '13.5px', color: '#92400e', fontWeight: '800' }}>
              ⏳ Submitted — Pending HOD Review
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
              PO/PSO target benchmarks for {selectedProgramme.name} have been submitted and are awaiting review by {verifierName}.
            </p>
          </div>
        </div>
      )}

      {/* ── NO OUTCOMES WARNING ────────────────────────────────────────────── */}
      {activePOs.length === 0 && normPSOs.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>No POs or PSOs defined yet</div>
            <div style={{ fontSize: '12px', color: '#b45309', marginTop: '1px' }}>Ask your HOD to add Programme Outcomes before setting targets.</div>
          </div>
        </div>
      )}

      {/* ── SAVED CONFIRMATION ─────────────────────────────────────────────── */}
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
            Target levels submitted successfully for {selectedProgramme.name}.
          </span>
        </div>
      )}

      {/* ── PO TARGETS TABLE ───────────────────────────────────────────────── */}
      {activePOs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Programme Outcomes — Target Levels ({activePOs.length} POs)
          </div>
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>PO</th>
                  <th>Statement</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                </tr>
              </thead>
              <tbody>
                {activePOs.map((po) => (
                  <tr key={po.code}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: accent }}>{po.code}</td>
                    <td style={{ fontSize: '12.5px', color: ink }}>{po.statement}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        {...TARGET_INPUT}
                        disabled={isTargetsApproved}
                        style={{
                          ...TARGET_INPUT.style,
                          color: accent,
                          background: isTargetsApproved ? '#f8fafc' : '#ffffff',
                          cursor: isTargetsApproved ? 'not-allowed' : 'text',
                        }}
                        value={poTargetDraft[po.code] ?? 2.0}
                        onChange={(e) => {
                          setSaved(false);
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v)) setPoTargetDraft((prev) => ({ ...prev, [po.code]: v }));
                        }}
                        onBlur={(e) => {
                          const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1));
                          setPoTargetDraft((prev) => ({ ...prev, [po.code]: Math.round(v * 10) / 10 }));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PSO TARGETS TABLE ──────────────────────────────────────────────── */}
      {normPSOs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Programme Specific Outcomes — Target Levels ({normPSOs.length} PSOs)
          </div>
          <div style={{ ...surface, overflow: 'hidden', padding: 0 }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>PSO</th>
                  <th>Statement</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>Target Level (1.0 – 3.0)</th>
                </tr>
              </thead>
              <tbody>
                {normPSOs.map((pso) => (
                  <tr key={pso.code}>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#059669' }}>{pso.code}</td>
                    <td style={{ fontSize: '12.5px', color: ink }}>{pso.statement}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        {...TARGET_INPUT}
                        disabled={isTargetsApproved}
                        style={{
                          ...TARGET_INPUT.style,
                          color: '#059669',
                          background: isTargetsApproved ? '#f8fafc' : '#ffffff',
                          cursor: isTargetsApproved ? 'not-allowed' : 'text',
                        }}
                        value={psoTargetDraft[pso.code] ?? 2.0}
                        onChange={(e) => {
                          setSaved(false);
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v)) setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: v }));
                        }}
                        onBlur={(e) => {
                          const v = Math.min(3, Math.max(1, parseFloat(e.target.value) || 1));
                          setPsoTargetDraft((prev) => ({ ...prev, [pso.code]: Math.round(v * 10) / 10 }));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CURRENT TARGETS SUMMARY ────────────────────────────────────────── */}
      {(activePOs.length > 0 || normPSOs.length > 0) && (
        <div style={{ ...surface, padding: '18px 20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Current Target Summary
          </div>
          {activePOs.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '6px' }}>PO Targets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activePOs.map((po) => (
                  <div key={po.code} style={{ ...surface, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: accent }}>{po.code}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(poTargetDraft[po.code] ?? 2.0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {normPSOs.length > 0 && (
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: muted, marginBottom: '6px' }}>PSO Targets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {normPSOs.map((pso) => (
                  <div key={pso.code} style={{ ...surface, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{pso.code}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: ink }}>{(psoTargetDraft[pso.code] ?? 2.0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
