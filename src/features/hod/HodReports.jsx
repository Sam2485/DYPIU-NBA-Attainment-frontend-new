import { useState } from 'react';
import { Download, Printer, ShieldCheck, FileText, BarChart3, Users, Layers } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function HodReports() {
  const {
    selectedProgramme = null,
    selectedBatch = null,
  } = useAcademic();

  const progName = selectedProgramme?.name || 'No Programme Added Yet';
  const progCode = selectedProgramme?.code || '—';
  const batchName = selectedBatch?.name || 'No Batch Initialized';

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
      Icon: BarChart3,
      iconBg: '#e0e7ff',
      iconColor: '#4f46e5',
      borderColor: '#818cf8',
    },
    {
      id: 'hod-rep-2',
      title: 'Course Coordinator Allocation & Verification Summary',
      desc: 'Full roster of department courses, assigned faculty coordinators, and verification status.',
      type: 'Excel Sheet (.xlsx)',
      category: 'Course Allocation',
      Icon: Users,
      iconBg: '#ccfbf1',
      iconColor: '#0d9488',
      borderColor: '#2dd4bf',
    },
    {
      id: 'hod-rep-3',
      title: 'Approved Programme Action Taken Report (ATR)',
      desc: 'Final HOD approved continuous improvement observations and gap action plans.',
      type: 'PDF Summary',
      category: 'Programme ATR',
      Icon: FileText,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      borderColor: '#4ade80',
    },
    {
      id: 'hod-rep-4',
      title: 'Master PO, PSO & PEO Outcomes Framework Summary',
      desc: 'Consolidated list of active Program Outcomes, PSOs, and Program Educational Objectives.',
      type: 'PDF Summary',
      category: 'Outcomes Framework',
      Icon: Layers,
      iconBg: '#f3e8ff',
      iconColor: '#7c3aed',
      borderColor: '#a78bfa',
    },
  ];

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient print:hidden" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px', border: '1px solid #c7d2fe' }}>
                HOD PORTAL • REPORTS &amp; DOWNLOADS
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Batch &amp; Programme Reports Export
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
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
        {reportCards.map((card) => {
          const { Icon } = card;
          return (
            <div
              key={card.id}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                borderLeft: `4px solid ${card.borderColor}`,
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <div>
                {/* Icon + category row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    borderRadius: '10px',
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={24} style={{ color: card.iconColor }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className="badge badge-active" style={{
                      background: card.iconBg,
                      color: card.iconColor,
                      fontWeight: '800',
                      fontSize: '10.5px',
                      marginBottom: '6px',
                      display: 'inline-block',
                    }}>
                      {card.category}
                    </span>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800', lineHeight: 1.3 }}>
                      {card.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
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
          );
        })}
      </div>
    </div>
  );
}
