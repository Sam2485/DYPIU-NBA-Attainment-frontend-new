import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, CheckCircle2, ShieldCheck, Download, Printer, Check, TrendingUp, AlertTriangle, RefreshCw, X, BookOpen } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import RequestRevisionCard from '../../components/common/RequestRevisionCard';

export default function HodProgrammeATR() {
  const {
    programmeId = 'prog-1',
    selectedProgramme = { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' },
    selectedBatch = { name: 'Batch 2024-28' },
    programmeAtrStore = {},
    approveProgrammeAtr = () => {},
  } = useAcademic();

  const [isNeedsRevision, setIsNeedsRevision] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const currentAtr = programmeAtrStore[programmeId] || {
    status: 'SUBMITTED_FOR_APPROVAL',
    submittedBy: 'Dr. A. K. Sharma (Programme Coordinator)',
    submittedAt: '2026-08-06',
    observations: [
      {
        target: 'PO1 & PO2 (Engineering Knowledge & Problem Analysis)',
        gap: 'Direct assessment target achieved at 84%. Gap identified in advanced data structures problem formulation.',
        actionPlan: 'Introduce mandatory tutorial lab sessions with HackerRank/LeetCode competitive programming modules.',
      },
      {
        target: 'PO3 & PO5 (Design & Modern Tool Usage)',
        gap: 'Cloud deployment and DevOps tool usage showed minor deficit in 2024-25 batch.',
        actionPlan: 'Organize 2-day hands-on AWS & Docker containerization workshop before Sem VI.',
      },
      {
        target: 'PSO1 (Software System Development)',
        gap: 'Full-stack web framework implementation targets met successfully at 108%.',
        actionPlan: 'Maintain current project-based learning model and integrate microservices architecture topics.',
      },
    ],
  };

  const isApproved = currentAtr.status === 'APPROVED' && !isNeedsRevision;

  const handleApproveAtr = () => {
    setIsNeedsRevision(false);
    approveProgrammeAtr(programmeId, 'Dr. Raj Shaikh (HOD)');
    alert('🎉 Final Programme ATR approved by HOD!');
  };

  const handleConfirmAtrRevision = () => {
    const finalRemarks = rejectRemarks.trim() || 'Action Taken Report (ATR) sent back to Programme Coordinator for continuous improvement revisions.';
    setRejectRemarks(finalRemarks);
    setIsNeedsRevision(true);
    setShowRejectModal(false);
    alert('⚠️ Revision request for Programme ATR sent to Programme Coordinator!');
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px', border: '1px solid #c7d2fe' }}>
                HOD PORTAL • PROGRAMME ATR
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Programme Action Taken Report (ATR) Approval
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Review programme-level observations, continuous improvement action plans, and grant HOD final approval.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isApproved ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleApproveAtr}
                  style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '6px', background: '#059669' }}
                >
                  <Check size={16} /> Approve Programme ATR
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  style={{ height: '40px', padding: '0 16px', fontSize: '12.5px', fontWeight: '700', gap: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  <RefreshCw size={14} /> Request Revision
                </button>
              </>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '8px 14px', fontSize: '12px' }}>
                ✓ Programme ATR Approved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── REVISION ALERT CARD ─────────────────────────────────────────── */}
      {isNeedsRevision && (
        <RequestRevisionCard
          title="Revision Requested for Programme Action Taken Report (ATR)"
          requestedBy="Head of Department (HOD)"
          remarks={rejectRemarks || 'Action Taken Report (ATR) sent back to Programme Coordinator for continuous improvement revisions.'}
          actionText="The Programme Coordinator has been notified to revise the Action Taken Report observation notes and action plans."
        />
      )}

      {/* ── PROGRAMME & BATCH METADATA CARD ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Left: code pill + name + dept */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{
              background: '#e0e7ff',
              color: '#4f46e5',
              fontWeight: '900',
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}>
              {selectedProgramme.code}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                {selectedProgramme.name}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Cycle: <strong>{selectedBatch.name}</strong> &nbsp;•&nbsp; Department of Computer Science &amp; Engineering
              </p>
            </div>
          </div>

          {/* Right: submitted by + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Submitted by</span>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}>{currentAtr.submittedBy}</div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '16px',
            }}>
              {currentAtr.submittedBy.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* ── OBSERVATIONS & CONTINUOUS IMPROVEMENT TABLE ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 14px 0' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <TrendingUp size={18} style={{ color: '#4f46e5' }} />
        </div>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
          Programme Observations &amp; Action Taken Plans
        </h3>
      </div>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
        {(currentAtr.observations || []).map((obs, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            display: 'flex',
            gap: '0',
            overflow: 'hidden',
          }}>
            {/* Numbered step circle column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 16px 20px 16px',
              borderRight: '1px solid #f1f5f9',
              background: '#f8fafc',
              minWidth: '56px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {idx + 1}
              </div>
            </div>

            {/* Card body */}
            <div style={{ flex: 1, padding: '18px 20px' }}>
              {/* Target heading */}
              <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '12px' }}>
                {obs.target}
              </strong>

              {/* Gap Analysis */}
              <div style={{
                borderLeft: '3px solid #f59e0b',
                background: '#fffbeb',
                borderRadius: '0 8px 8px 0',
                padding: '10px 14px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <AlertTriangle size={15} style={{ color: '#d97706', marginTop: '1px', flexShrink: 0 }} />
                <div style={{ fontSize: '12.5px', color: '#78350f', lineHeight: 1.5 }}>
                  <strong style={{ color: '#92400e' }}>Gap Analysis:&nbsp;</strong>{obs.gap}
                </div>
              </div>

              {/* Action Plan */}
              <div style={{
                borderLeft: '3px solid #22c55e',
                background: '#f0fdf4',
                borderRadius: '0 8px 8px 0',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <CheckCircle2 size={15} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                <div style={{ fontSize: '12.5px', color: '#14532d', lineHeight: 1.5 }}>
                  <strong style={{ color: '#166534' }}>Action Plan:&nbsp;</strong>{obs.actionPlan}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── REJECT / REVISION MODAL ─────────────────────────────────────── */}
      {showRejectModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '20px',
          boxSizing: 'border-box',
        }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Request Revision for Programme ATR</div>
              <button onClick={() => setShowRejectModal(false)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Revision Remarks for Programme Coordinator *</label>
                <textarea
                  rows={4}
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="Describe what needs to be updated in the action plans or observation notes..."
                  style={{ width: '100%', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setShowRejectModal(false)} style={{ height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAtrRevision}
                  style={{ height: '38px', padding: '0 18px', fontSize: '13px', fontWeight: '700', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Send Revision Request
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
