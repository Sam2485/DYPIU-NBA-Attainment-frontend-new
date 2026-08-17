import { useState } from 'react';
import { FileText, Download, Printer, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export default function DirectorReports() {
  const {
    selectedSchool = { name: '—', code: '—' },
    departments = [],
    masterProgrammes = [],
  } = useAcademic();

  const handleDownloadReport = (reportType, title) => {
    alert(`📥 Downloading ${title} (${reportType})... Download started!`);
  };

  const handlePrintSchoolSummary = () => {
    window.print();
  };

  const reportCards = [
    {
      id: 'rep-1',
      title: 'School-Wide OBE Compliance & Structure Audit Report',
      desc: 'Complete audit summary of departments, HOD allocations, programme status, and director approvals.',
      type: 'PDF Audit Report',
      category: 'School Level',
    },
    {
      id: 'rep-2',
      title: 'Department-Wise HOD & Faculty Allocation Summary',
      desc: 'Detailed breakdown of departments, assigned HOD contacts, assigned course coordinators, and faculty workloads.',
      type: 'Excel Sheet (.xlsx)',
      category: 'Department Level',
    },
    {
      id: 'rep-3',
      title: 'School Programme Attainment & Target Summary',
      desc: 'Consolidated PO/PSO target benchmark achievements across all degree programmes under the school.',
      type: 'PDF Summary',
      category: 'Programme Level',
    },
    {
      id: 'rep-4',
      title: 'School Master Continuous Improvement (ATR) Summary',
      desc: 'Aggregated action taken report observations and corrective action plans across all departments.',
      type: 'PDF Summary',
      category: 'ATR Summary',
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
                DIRECTOR PORTAL • REPORTS & DOWNLOADS
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              School & Department Summary Reports
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Export official school-wide and department-wise compliance summaries, HOD allocations, and attainment reports.
            </p>
          </div>

          <button className="btn btn-secondary" onClick={handlePrintSchoolSummary} style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', gap: '6px' }}>
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
                <ShieldCheck size={14} style={{ color: '#10b981' }} /> Official School Record
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleDownloadReport(card.type, card.title)}
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
