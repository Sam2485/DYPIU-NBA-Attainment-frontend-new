import { useState, useEffect } from 'react';
import {
  Save, CheckCircle2, Clock, ShieldCheck, Printer,
  ChevronDown, AlertCircle, Plus, Lock, Send, History,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

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

export default function ProgrammeATR({ courseId = null, hideFooter = false, hideHeader = false, readOnly = false }) {
  const { user, role } = useAuth();
  const {
    selectedCourse,
    selectedProgramme,
    selectedBatch,
    masterProgrammes = [],
    setProgrammeId  = () => {},
    academicYear    = '2025-26',
    availableYears  = ['2025-26', '2024-25', '2023-24'],
    activePOs       = [],
    activePSOs      = [],
    poPsoTargets    = {},
    programmeId     = 'prog-1',
    courseVerificationStore = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const [showHistory, setShowHistory] = useState(false);

  // Carry-forward mock data for previous academic cycle
  const prevCycleActions = [
    { code: 'PO1', actionPlan: 'Conducted bridge courses in engineering mathematics and computational logic.', impact: 'Attainment improved from 1.72 to 1.88 across core computing courses.' },
    { code: 'PO3', actionPlan: 'Introduced capstone project milestones with industry mentor evaluations.', impact: 'Design of solutions attainment rose by +0.18 over benchmark.' },
    { code: 'PO5', actionPlan: 'Conducted hands-on tool workshops on Git, Docker, and modern CI/CD pipelines.', impact: 'Modern tool usage attainment increased from 1.65 to 1.92.' },
    { code: 'PSO2', actionPlan: 'Organized industry bootcamps on full-stack testing and secure software development.', impact: 'PSO2 attainment exceeded target with 91.4% achievement rate.' },
  ];

  const targetCourseId = courseId || selectedCourse?.id || 'crs-1';
  const progAtrKey = `prog-atr-${programmeId}`;
  const vRecord = courseVerificationStore[progAtrKey] || courseVerificationStore[`allocation-${programmeId}`] || courseVerificationStore[targetCourseId] || {};
  const reportStatus = vRecord.programmeAtrStatus || 'DRAFT';
  const verificationRemarks = vRecord.programmeAtrRemarks || '';
  const verifierName = vRecord.verifiedBy || 'Head of Department (HOD)';

  const isFaculty     = role === 'FACULTY';
  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC' || role === 'HOD';

  const [selectedYear, setSelectedYear] = useState(academicYear || '2025-26');
  const isPreviousYear = selectedYear !== (academicYear || '2025-26');
  const locked = readOnly || isPreviousYear || reportStatus === 'VERIFIED' || reportStatus === 'APPROVED';

  // ── Build PO/PSO ATR list ──────────────────────────────────────────
  const progTargets = poPsoTargets[programmeId] || { poTargets: {}, psoTargets: {} };

  const normPOs = activePOs.length > 0 ? activePOs : [
    { code: 'PO1',  statement: 'Apply knowledge of mathematics, science and engineering fundamentals to complex engineering problems.' },
    { code: 'PO2',  statement: 'Identify, formulate and analyze complex engineering problems using first principles.' },
    { code: 'PO3',  statement: 'Design solutions for complex problems with consideration for public health and safety.' },
    { code: 'PO4',  statement: 'Use research methods including design of experiments to provide valid conclusions.' },
    { code: 'PO5',  statement: 'Create, select and apply modern engineering tools to complex activities.' },
    { code: 'PO6',  statement: 'Apply reasoning to assess societal, health, safety and legal issues in engineering practice.' },
    { code: 'PO7',  statement: 'Understand impact of engineering solutions in environmental context and sustainable development.' },
    { code: 'PO8',  statement: 'Apply ethical principles and commit to professional ethics and norms of engineering practice.' },
    { code: 'PO9',  statement: 'Function effectively as an individual, member or leader in diverse teams.' },
    { code: 'PO10', statement: 'Communicate effectively on complex engineering activities with the engineering community.' },
    { code: 'PO11', statement: 'Demonstrate knowledge of engineering and management principles as member and leader in a team.' },
    { code: 'PO12', statement: 'Recognize the need for and ability to engage in independent and life-long learning.' },
  ];

  const normPSOs = activePSOs.length > 0 ? activePSOs : [
    { code: 'PSO1', statement: 'Demonstrate principles and working of hardware and software aspects of computer systems.' },
    { code: 'PSO2', statement: 'Use professional engineering practices for development, maintenance and testing of software solutions.' },
    { code: 'PSO3', statement: 'Provide effective and efficient real-time solutions using practical knowledge in IT domain.' },
  ];

  const buildList = () => [
    ...normPOs.map((po) => {
      const target  = progTargets.poTargets?.[po.code] ?? 1.80;
      const actual  = Number(Math.min(3.0, target * (0.88 + (po.code.charCodeAt(2) % 5) * 0.04)).toFixed(2));
      const pct     = Number(((actual / target) * 100).toFixed(1));
      const met     = actual >= target;
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
      const actual  = Number(Math.min(3.0, target * (0.88 + (pso.code.charCodeAt(3) % 5) * 0.04)).toFixed(2));
      const pct     = Number(((actual / target) * 100).toFixed(1));
      const met     = actual >= target;
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

  const handleSaveSubmit = () => {
    updateCourseVerificationStatus(progAtrKey, 'programmeAtrStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    updateCourseVerificationStatus(`allocation-${programmeId}`, 'programmeAtrStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    updateCourseVerificationStatus(targetCourseId, 'programmeAtrStatus', 'SUBMITTED', '', user?.name || 'Programme Coordinator');
    alert(`🎉 Programme ATR for ${selectedProgramme?.name || 'Programme'} saved and submitted successfully to ${verifierName}!`);
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
  const renderCard = (item, accentColor) => {
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
              <td style={{ textAlign: 'center', fontWeight: '700', color: muted, verticalAlign: 'top', paddingTop: '12px' }}>{item.target.toFixed(2)}</td>
              <td style={{ textAlign: 'center', fontWeight: '800', color: item.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{item.actual.toFixed(2)}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: item.met ? '#dcfce7' : '#fee2e2', color: item.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                  {item.pct.toFixed(1)}% {item.met ? 'Achieved' : 'Gap'}
                </span>
              </td>
              <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                {item.met ? (
                  locked ? (
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
                        {locked ? (
                          <div style={{ flex: 1, background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                            {act}
                          </div>
                        ) : (
                          <textarea rows={2} value={act}
                            onChange={(e) => handleUpdateAction(idx, aIdx, e.target.value)}
                            style={{ flex: 1, fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                          />
                        )}
                        {!locked && item.actions.length > 1 && (
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
              {/* Programme selector */}
              <div style={{ position: 'relative', minWidth: '280px' }}>
                <select
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  style={{
                    ...inputStyle,
                    height: '38px',
                    paddingRight: '32px',
                    appearance: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    color: accent,
                    background: '#f5f3ff',
                    border: '1.5px solid #c7d2fe',
                  }}
                >
                  {masterProgrammes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: accent, pointerEvents: 'none' }} />
              </div>

              {!locked ? (
                <button onClick={handleSaveSubmit}
                  style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                  <Send size={14} /> Submit Report for Review
                </button>
              ) : (
                <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> {isPreviousYear ? `AY ${selectedYear} Archived (Read-Only)` : 'Report Locked'}
                </span>
              )}
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
            Programme ATR Carry-Forward — Previous Academic Cycle (AY 2024-25) · Verified by Head of Department (HOD)
          </div>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th style={{ width: '90px', textAlign: 'center' }}>Outcome</th>
                <th>Action Taken (Previous Cycle)</th>
                <th>Impact Observed in Current Cycle</th>
              </tr>
            </thead>
            <tbody>
              {prevCycleActions.map((a) => (
                <tr key={a.code}>
                  <td style={{ textAlign: 'center', fontWeight: '800', color: accent }}>{a.code}</td>
                  <td style={{ fontSize: '12.5px' }}>{a.actionPlan}</td>
                  <td style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '600' }}>{a.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Archived Year Lock Banner */}
      {isPreviousYear && (
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Lock size={20} style={{ color: '#1d4ed8', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e40af', display: 'block' }}>
              🔒 Archived Academic Year ({selectedYear}) — Read Only
            </span>
            <span style={{ fontSize: '12px', color: '#1e3a8a', display: 'block', marginTop: '2px' }}>
              This Programme Action Taken Report is an archived historical record from AY {selectedYear}. Previous year ATR reports are locked and cannot be edited.
            </span>
          </div>
        </div>
      )}

      {/* ── VERIFICATION APPROVED BANNER ─────────────────────────────────── */}
      {(reportStatus === 'VERIFIED' || reportStatus === 'APPROVED') && (
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
      {reportStatus === 'REVISION_REQUESTED' && (
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
      {reportStatus === 'SUBMITTED' && (
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

      {/* ── PO SECTION HEADING ────────────────────────────────────────────── */}
      <div style={{ background: '#f8fafc', borderLeft: '4px solid #4f46e5', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>
          Programme Outcomes (POs)
        </h4>
      </div>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '28px' }}>
        {poList.map((po) => renderCard(po, accent))}
      </div>

      {/* ── PSO SECTION HEADING ───────────────────────────────────────────── */}
      <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: ink, fontWeight: '800' }}>
          Programme Specific Outcomes (PSOs)
        </h4>
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        {psoList.map((pso) => renderCard(pso, '#0284c7'))}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      {!hideFooter && isFaculty && (
        <div style={{ ...surface, padding: '14px 20px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!locked ? (
            <button onClick={handleSaveSubmit}
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
    </div>
  );
}
