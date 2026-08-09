import { useState } from 'react';
import { Download, Printer, ShieldCheck, FileText } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodReports() {
  const {
    selectedProgramme = { name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' },
    selectedBatch = { name: 'Batch 2024-28' },
  } = useAcademic();

  const handleDownload = (type, title) => {
    alert(`📥 Downloading ${title} (${type})... Export started!`);
  };

  const reportCards = [
    {
      id: 'hod-rep-1',
      title: 'Batch-Wise Programme Attainment Audit Report',
      desc: 'Complete PO/PSO attainment summary for selected batch cycle across all direct & indirect assessments.',
      type: 'PDF Audit Report',
      category: 'Programme Attainment',
    },
    {
      id: 'hod-rep-2',
      title: 'Course Coordinator Allocation & Verification Summary',
      desc: 'Full roster of department courses, assigned faculty coordinators, and verification status.',
      type: 'Excel Sheet (.xlsx)',
      category: 'Course Allocation',
    },
    {
      id: 'hod-rep-3',
      title: 'Approved Programme Action Taken Report (ATR)',
      desc: 'Final HOD approved continuous improvement observations and gap action plans.',
      type: 'PDF Summary',
      category: 'Programme ATR',
    },
    {
      id: 'hod-rep-4',
      title: 'Master PO, PSO & PEO Outcomes Framework Summary',
      desc: 'Consolidated list of active Program Outcomes, PSOs, and Program Educational Objectives.',
      type: 'PDF Summary',
      category: 'Outcomes Framework',
    },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient print:hidden" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                HOD PORTAL • REPORTS & DOWNLOADS
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Batch & Programme Reports Export
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Download batch-wise programme reports, outcome frameworks, approval summaries, and ATR reports.
            </p>
          </div>

          <button className="btn btn-secondary" onClick={() => window.print()} style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', gap: '6px' }}>
            <Printer size={15} /> Print Summary Report
          </button>
        </div>
      </div>

      {/* ── REPORTS GRID ───────────────────────────────────────────────────────────── */}
      <div className="grid-cards-2" style={{ gap: '16px' }}>
        {reportCards.map((card) => (
          <div
            key={card.id}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                  {card.category}
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>
                  Format: {card.type}
                </span>
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '15.5px', color: '#0f172a', fontWeight: '800' }}>
                {card.title}
              </h4>

              <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>

            <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} /> Official HOD Record
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleDownload(card.type, card.title)}
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', gap: '6px' }}
              >
                <Download size={14} /> Download Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
