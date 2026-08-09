import { useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, Download, Printer, Check } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodProgrammeATR() {
  const {
    programmeId = 'prog-1',
    selectedProgramme = { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' },
    selectedBatch = { name: 'Batch 2024-28' },
    programmeAtrStore = {},
    approveProgrammeAtr = () => {},
  } = useAcademic();

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

  const isApproved = currentAtr.status === 'APPROVED';

  const handleApproveAtr = () => {
    approveProgrammeAtr(programmeId, 'Dr. Raj Shaikh (HOD)');
    alert('🎉 Final Programme ATR approved by HOD!');
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • PROGRAMME ATR
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Programme Action Taken Report (ATR) Approval
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Review programme-level observations, continuous improvement action plans, and grant HOD final approval.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isApproved ? (
              <button
                className="btn btn-primary"
                onClick={handleApproveAtr}
                style={{ height: '40px', padding: '0 20px', fontSize: '12.5px', fontWeight: '800', gap: '6px', background: '#059669' }}
              >
                <Check size={16} /> Approve Programme ATR
              </button>
            ) : (
              <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '8px 14px', fontSize: '12px' }}>
                ✓ Programme ATR Approved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── PROGRAMME & BATCH METADATA CARD ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
              {selectedProgramme.name} ({selectedProgramme.code})
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Cycle: <strong>{selectedBatch.name}</strong> • Department of Computer Science & Engineering
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Submitted by Programme Coordinator:</span>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#4f46e5' }}>{currentAtr.submittedBy}</div>
          </div>
        </div>
      </div>

      {/* ── OBSERVATIONS & CONTINUOUS IMPROVEMENT TABLE ───────────────────────────── */}
      <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
        Programme Observations & Action Taken Plans
      </h3>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
        {(currentAtr.observations || []).map((obs, idx) => (
          <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800' }}>
                OBSERVATION {idx + 1}
              </span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{obs.target}</strong>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px', lineHeight: 1.5 }}>
              <strong>Gap Analysis:</strong> {obs.gap}
            </div>

            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '12.5px', color: '#15803d', fontWeight: '600' }}>
              <strong>Corrective Action Plan:</strong> {obs.actionPlan}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
