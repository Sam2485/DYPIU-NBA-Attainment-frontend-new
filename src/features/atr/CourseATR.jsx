import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, Clock, ShieldCheck, History, Printer, ChevronDown, AlertCircle, Lock, Send } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

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

export default function CourseATR({ hideFooter = false, hideHeader = false, showHistoryProp, readOnly = false, courseId, batchId = null }) {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const {
    courses = [],
    availableCourses = [],
    selectedCourse,
    setCourseId = () => {},
    academicYear    = '2025-26',
    selectedBatch,
    courseAtrStore  = {},
    updateCourseAtrData          = () => {},
    courseVerificationStore      = {},
    updateCourseVerificationStatus = () => {},
  } = useAcademic();

  const isFaculty      = role === 'FACULTY';
  const isCoordinator  = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  const [showHistory, setShowHistory] = useState(showHistoryProp ?? false);

  useEffect(() => {
    if (showHistoryProp !== undefined) setShowHistory(showHistoryProp);
  }, [showHistoryProp]);

  const allCourses = availableCourses.length > 0 ? availableCourses : courses;
  const currentCourse = courseId
    ? allCourses.find((c) => c.id === courseId) || selectedCourse
    : selectedCourse;

  const activeCourseId = courseId || currentCourse?.id || selectedCourse?.id || 'crs-1';
  const activeCOs      = currentCourse?.courseOutcomes || [];

  const verificationData = courseVerificationStore[activeCourseId] || {};
  const atrStatus = verificationData.atrStatus || 'DRAFT';
  const atrRemarks = verificationData.atrRemarks || '';
  const verifiedBy = verificationData.verifiedBy || 'Programme Coordinator';

  const isApproved = atrStatus === 'VERIFIED' || atrStatus === 'APPROVED';
  const isRevision = atrStatus === 'REJECTED' || atrStatus === 'REVISION_REQUESTED' || atrStatus === 'NEEDS_REVISION';
  const isSubmitted = atrStatus === 'SUBMITTED' || atrStatus === 'PENDING_APPROVAL';

  // Build ATR list from COs
  const buildList = () => {
    const saved    = courseAtrStore[activeCourseId] || [];
    const savedMap = new Map(saved.map((i) => [i.code, i]));
    if (activeCOs.length === 0) return saved;
    return activeCOs.map((co, idx) => {
      const ex     = savedMap.get(co.code);
      const target = ex?.target ?? 2.50;
      const actual = ex?.actual ?? (idx % 2 === 0 ? 2.80 - idx * 0.1 : 2.10);
      const pct    = Number(((actual / target) * 100).toFixed(2));
      const met    = actual >= target;
      return {
        code: co.code, statement: co.statement, target, actual, pct, met,
        remark:  ex?.remark  ?? (met  ? 'Target achieved. Maintain current teaching methodology and continuous assessment structure.' : ''),
        actions: ex?.actions ?? (met  ? [] : [
          `Conduct extra tutorial sessions on ${co.statement.slice(0, 45)}...`,
          'Provide additional practice numericals and interactive assignment problem sets.',
        ]),
      };
    });
  };

  const [coList, setCoList] = useState(buildList);
  useEffect(() => { setCoList(buildList()); }, [activeCourseId, currentCourse, activeCOs, courseAtrStore]);

  const reportStatus = atrStatus;
  const locked       = readOnly || isApproved || role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveSubmit = () => {
    updateCourseAtrData(activeCourseId, coList);
    updateCourseVerificationStatus(activeCourseId, 'atrStatus', 'SUBMITTED', '', user?.name || 'Course Coordinator');
    alert(`Course ATR for ${currentCourse?.code || 'this course'} has been submitted for review to the Programme Coordinator!`);
  };
  const handleVerify = () => updateCourseVerificationStatus(activeCourseId, 'atrStatus', 'VERIFIED');

  const handleAddAction    = (i)        => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: [...c.actions, 'New corrective action...'] } : c));
  const handleUpdateAction = (i, j, v)  => setCoList((p) => p.map((c, idx) => { if (idx !== i) return c; const a = [...c.actions]; a[j] = v; return { ...c, actions: a }; }));
  const handleDeleteAction = (i, j)     => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, actions: c.actions.filter((_, k) => k !== j) } : c));
  const handleUpdateRemark = (i, v)     => setCoList((p) => p.map((c, idx) => idx === i ? { ...c, remark: v } : c));

  const metCount  = coList.filter((c) => c.met).length;
  const gapCount  = coList.length - metCount;

  // Carry-forward reference data
  const prevBatch = {
    batch: 'Batch 2024-28 (AY 2024-25)', preparedBy: 'Prof. XYZ',
    actions: [{ coCode: 'C321.3', actionPlan: 'Conducted 2 extra remedial tutorial classes on IPv4 CIDR subnetting.', impact: 'Attainment improved from 1.95 to 2.10 in current batch.' }],
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      {!hideHeader && (
        <div style={{ ...surface, padding: '20px 24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: ink, fontWeight: '800', letterSpacing: '-0.01em' }}>
                Course ATR
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
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
                <button onClick={handleSaveSubmit}
                  style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
                  <Send size={14} /> Submit ATR for Review
                </button>
              ) : (
                <span style={{ height: '38px', padding: '0 14px', fontSize: '12px', fontWeight: '700', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={13} /> Report Locked
                </span>
              )}
            </div>
          </div>

          {/* Action buttons below the title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHistory((v) => !v)}
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

      {!hideHeader && !showHistory && isSubmitted && !isApproved && (
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


      {/* ── CARRY-FORWARD REFERENCE ───────────────────────────────────────── */}
      {showHistory && (
        <div style={{ ...surface, padding: '16px 20px', marginBottom: '20px', borderColor: '#a5b4fc', borderWidth: '1.5px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            ATR Carry-Forward — Previous Batch ({prevBatch.batch}) · Prepared by {prevBatch.preparedBy}
          </div>
          <table className="audit-data-table">
            <thead><tr><th style={{ width: '80px' }}>CO</th><th>Action Taken (Previous Batch)</th><th>Impact in Current Batch</th></tr></thead>
            <tbody>
              {prevBatch.actions.map((a) => (
                <tr key={a.coCode}>
                  <td style={{ fontWeight: '700', color: accent }}>{a.coCode}</td>
                  <td style={{ fontSize: '12.5px' }}>{a.actionPlan}</td>
                  <td style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '600' }}>{a.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CO ATR CARDS ──────────────────────────────────────────────────── */}
      {coList.length === 0 ? (
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
                      <th>{co.met ? 'Remark (Target Met)' : 'Corrective Actions for Improvement'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: accent, verticalAlign: 'top', paddingTop: '12px' }}>{co.code}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: muted, verticalAlign: 'top', paddingTop: '12px' }}>{co.target.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: co.met ? '#16a34a' : '#dc2626', verticalAlign: 'top', paddingTop: '12px' }}>{co.actual.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                        <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', background: co.met ? '#dcfce7' : '#fee2e2', color: co.met ? '#15803d' : '#991b1b', borderRadius: '5px', padding: '3px 8px' }}>
                          {co.pct.toFixed(1)}% {co.met ? 'Achieved' : 'Gap'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                        {co.met ? (
                          locked ? (
                            <div style={{ fontSize: '12.5px', color: ink, background: '#f8fafc', padding: '10px 14px', borderRadius: '7px', border: '1px solid #e2e8f0', lineHeight: 1.5, fontWeight: '500' }}>
                              {co.remark || 'Target achieved. Maintain current teaching methodology and assessment structure.'}
                            </div>
                          ) : (
                            <textarea rows={3} value={co.remark} disabled={locked}
                              onChange={(e) => handleUpdateRemark(idx, e.target.value)}
                              placeholder="Enter remark for this CO..."
                              style={{ width: '100%', fontSize: '12.5px', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '8px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', color: ink, background: '#ffffff' }}
                            />
                          )
                        ) : (
                          locked ? (
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
                          )
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

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      {!hideFooter && isFaculty && (
        <div style={{ ...surface, padding: '14px 20px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!locked ? (
            <button onClick={handleSaveSubmit}
              style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'inherit' }}>
              <Send size={14} /> Submit ATR for Review
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
