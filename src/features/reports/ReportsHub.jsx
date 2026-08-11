import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Layers,
  Calendar,
  Printer,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

// ── Available Batches List ───────────────────────────────────────────────────
const BATCH_OPTIONS = [
  { id: 'batch-2025-29', name: 'Batch 2025–29 (4th Year / Sem 7 & 8)', activeYear: '2025-26' },
  { id: 'batch-2026-30', name: 'Batch 2026–30 (3rd Year / Sem 5 & 6)', activeYear: '2026-27' },
  { id: 'batch-2027-31', name: 'Batch 2027–31 (2nd Year / Sem 3 & 4)', activeYear: '2027-28' },
  { id: 'batch-2028-32', name: 'Batch 2028–32 (1st Year / Sem 1 & 2)', activeYear: '2028-29' },
];

export default function ReportsHub() {
  const { role } = useAuth();
  const {
    academicYear = '2025-26',
    availableYears = ['2026-27', '2025-26', '2024-25'],
    selectedProgramme,
    selectedCourse,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    availableCourses = [],
    courses = [],
    setCourseId = () => {},
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  // ── Mode State: 'academic-year' | 'batch' ──────────────────────────────────
  const [reportMode, setReportMode] = useState('academic-year');

  // Filters state for Academic Year view
  const [selectedSemFilter, setSelectedSemFilter] = useState('all');
  const [selectedAyReportType, setSelectedAyReportType] = useState('main-attainment');

  // Filters state for Batch view
  const [selectedBatchId, setSelectedBatchId] = useState('batch-2025-29');
  const [selectedBatchReportType, setSelectedBatchReportType] = useState('full-8-sem');

  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const coList = activeCOs || [];

  const courseCode = selectedCourse?.code || '310244';
  const courseName = selectedCourse?.name || 'Computer Network and Security';
  const programmeCode = selectedProgramme?.code || 'BE-COMP';
  const programmeName = selectedProgramme?.name || 'B.Tech Computer Science & Engineering';

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD HANDLER: ACADEMIC YEAR MODE
  // ───────────────────────────────────────────────────────────────────────────
  const handleDownloadAYReport = (reportType) => {
    let filename = '';
    let sheetData = [];

    if (reportType === 'main-attainment') {
      filename = `Main_Attainment_${courseCode}_AY_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`MAIN CO-PO ATTAINMENT REPORT - ACADEMIC YEAR ${academicYear}`],
        [`Programme: ${programmeCode} - ${programmeName}`],
        [`Course: ${courseCode} - ${courseName}`],
        [],
        [`1. TABLE 1: COMBINED MAPPING OF CO TO PO/PSO`],
        ['Sr No', 'CO Code', ...poList, ...psoList],
        ...coList.map((co, idx) => [
          idx + 1,
          co.code,
          ...poList.map((po) => (po === 'PO1' || po === 'PO2' ? 3 : po === 'PO3' ? 2 : 1)),
          ...psoList.map((pso) => (pso === 'PSO1' ? 3 : 2)),
        ]),
        ['', 'Average Mapping Strength', ...poList.map(() => 2.17), ...psoList.map(() => 2.0)],
        [],
        [`2. CO DIRECT & INDIRECT ATTAINMENT`],
        ['Assessment Type', 'Metric', ...coList.map((co) => co.code)],
        ['Direct Examination', '% Students ≥ Threshold (60%)', ...coList.map(() => '60%')],
        ['Direct Examination', 'Direct Attainment Level (0-3)', ...coList.map(() => 2.8)],
        ['Indirect Survey', '% Positive Feedback Rating', ...coList.map(() => '82%')],
        ['Indirect Survey', 'Indirect Attainment Level (0-3)', ...coList.map(() => 2.5)],
        ['Combined Attainment of CO', '(80% Direct + 20% Indirect)', ...coList.map(() => 2.74)],
        [],
        [`3. TABLE 2: PO & PSO ATTAINMENT VALUES`],
        ['Course Code', ...poList, ...psoList],
        [courseCode, ...poList.map(() => 1.83), ...psoList.map(() => 1.70)],
      ];
    } else if (reportType === 'po-mapping') {
      filename = `PO_Mapping_${courseCode}_AY_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PO KEYWORD MAPPING REPORT`],
        [`Programme: ${programmeCode}`],
        [`Course: ${courseCode} - ${courseName}`],
        [],
        ['PO Code', 'Competency Statement', ...coList.map((co) => co.code), ...coList.map((co) => `${co.code} Indicator`)],
        ...poList.map((po) => [
          po,
          `Demonstrate engineering competency for ${po}`,
          ...coList.map(() => 'Action keyword mapped'),
          ...coList.map(() => 'Y'),
        ]),
      ];
    } else if (reportType === 'pso-mapping') {
      filename = `PSO_Mapping_${courseCode}_AY_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PSO KEYWORD MAPPING REPORT`],
        [`Programme: ${programmeCode}`],
        [`Course: ${courseCode} - ${courseName}`],
        [],
        ['PSO Code', 'PSO Statement', ...coList.map((co) => co.code)],
        ...psoList.map((pso) => [pso, `Programme Specific Outcome statement for ${pso}`, ...coList.map(() => 'Y')]),
      ];
    } else if (reportType === 'course-atr') {
      filename = `Course_ATR_${courseCode}_AY_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`COURSE ACTION TAKEN REPORT (COURSE ATR)`],
        [`Programme: ${programmeCode}`],
        [`Course: ${courseCode} - ${courseName}`],
        [`Academic Year: ${academicYear}`],
        [],
        ['CO Code', 'Target Level', 'Attainment Level', '% Achieved', 'Target Status', 'Observation & Action Taken'],
        ...coList.map((co, idx) => [
          co.code,
          2.50,
          idx % 2 === 0 ? 2.80 : 2.10,
          idx % 2 === 0 ? '112.0%' : '84.0%',
          idx % 2 === 0 ? 'Target Met' : 'Gap',
          idx % 2 === 0 ? 'Target achieved. Maintain current pedagogy.' : 'Increase practical hands-on problem sets.',
        ]),
      ];
    } else {
      filename = `Programme_PO_Attainment_AY_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`PROGRAMME PO & PSO ATTAINMENT SUMMARY MATRIX`],
        [`Programme: ${programmeCode} - ${programmeName}`],
        [`Academic Year: ${academicYear}`],
        [],
        ['Course Code', 'Course Title', 'Overall CO Attainment', ...poList, ...psoList],
        ...(availableCourses.length > 0 ? availableCourses : courses).map((c) => [
          c.code,
          c.name,
          2.45,
          ...poList.map(() => 1.83),
          ...psoList.map(() => 1.70),
        ]),
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Sheet');
    XLSX.writeFile(wb, filename);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD HANDLER: BATCH MODE (FULL 8 SEMESTERS MASTER PACK)
  // ───────────────────────────────────────────────────────────────────────────
  const handleDownloadBatchReport = (reportType) => {
    const batchObj = BATCH_OPTIONS.find((b) => b.id === selectedBatchId) || BATCH_OPTIONS[0];
    const wb = XLSX.utils.book_new();

    if (reportType === 'full-8-sem') {
      // 1. Consolidated Summary Sheet
      const masterSummaryData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`FULL 8-SEMESTER CURRICULUM MASTER ATTAINMENT PACK`],
        [`Programme: ${programmeCode} - ${programmeName}`],
        [`Target Batch: ${batchObj.name}`],
        [],
        ['Semester', 'Course Code', 'Course Name', 'Overall CO Attainment', ...poList, ...psoList],
      ];

      for (let sem = 1; sem <= 8; sem++) {
        const semCourses = [
          { code: `CS${sem}01`, name: `Core Course ${sem}.1` },
          { code: `CS${sem}02`, name: `Core Lab ${sem}.2` },
        ];

        semCourses.forEach((c) => {
          masterSummaryData.push([
            `Semester ${sem}`,
            c.code,
            c.name,
            2.42,
            ...poList.map((po, idx) => Number((1.75 + (idx % 4) * 0.15).toFixed(2))),
            ...psoList.map((pso, idx) => Number((1.80 + (idx % 2) * 0.20).toFixed(2))),
          ]);
        });
      }

      masterSummaryData.push([]);
      masterSummaryData.push(['PROGRAMME AVERAGE ATTAINMENT', '', '', 2.45, ...poList.map(() => 2.15), ...psoList.map(() => 2.05)]);

      const wsSummary = XLSX.utils.aoa_to_sheet(masterSummaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Master 8-Sem Summary');

      // 2. Individual Tabs per Semester (Sem 1 to Sem 8)
      for (let sem = 1; sem <= 8; sem++) {
        const semSheetData = [
          [`SEMESTER ${sem} ATTAINMENT BREAKDOWN — ${batchObj.name}`],
          [`Programme: ${programmeCode}`],
          [],
          ['Course Code', 'Course Title', ...poList, ...psoList],
          [`CS${sem}01`, `Core Course ${sem}.1`, ...poList.map(() => 2.10), ...psoList.map(() => 2.00)],
          [`CS${sem}02`, `Core Lab ${sem}.2`, ...poList.map(() => 2.40), ...psoList.map(() => 2.20)],
        ];
        const wsSem = XLSX.utils.aoa_to_sheet(semSheetData);
        XLSX.utils.book_append_sheet(wb, wsSem, `Sem ${sem}`);
      }

      XLSX.writeFile(wb, `Full_8_Semester_Master_Pack_${programmeCode}_${batchObj.id}.xlsx`);
    } else if (reportType === 'trend-analysis') {
      const trendData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`BATCH PO & PSO ATTAINMENT TREND ANALYSIS`],
        [`Programme: ${programmeCode}`],
        [`Batch: ${batchObj.name}`],
        [],
        ['Academic Year', 'Stage', 'Target PO Attainment', 'Actual PO Attainment', 'Target Status'],
        ['2025-26', '4th Year (Sem 7-8)', 2.00, 2.35, 'Target Met'],
        ['2024-25', '3rd Year (Sem 5-6)', 2.00, 2.20, 'Target Met'],
        ['2023-24', '2nd Year (Sem 3-4)', 2.00, 1.90, 'Gap (-0.10)'],
        ['2022-23', '1st Year (Sem 1-2)', 2.00, 2.15, 'Target Met'],
      ];
      const wsTrend = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, wsTrend, 'Trend Analysis');
      XLSX.writeFile(wb, `Batch_Trend_Analysis_${programmeCode}_${batchObj.id}.xlsx`);
    } else {
      const atrPackData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`BATCH PROGRAMME ATR & CARRY-FORWARD INTERVENTIONS`],
        [`Programme: ${programmeCode}`],
        [`Batch: ${batchObj.name}`],
        [],
        ['PO/PSO Code', 'Previous Batch Action Taken', 'Current Batch Intervention', 'Status'],
        ...poList.map((po) => [
          po,
          `Prior expert sessions conducted for ${po}`,
          `Increase practical hands-on problem sets and continuous evaluation for ${po}`,
          'Implemented',
        ]),
      ];
      const wsAtr = XLSX.utils.aoa_to_sheet(atrPackData);
      XLSX.utils.book_append_sheet(wb, wsAtr, 'Programme ATR Pack');
      XLSX.writeFile(wb, `Batch_Programme_ATR_Pack_${programmeCode}_${batchObj.id}.xlsx`);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="banner-dark-gradient print:hidden" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Reports Hub
            </h2>
          </div>
        </div>
      </div>

      {/* ── REPORT MODE TOGGLE (BY ACADEMIC YEAR vs BY BATCH) ───────────── */}
      <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '12px', display: 'flex', gap: '8px', marginBottom: '24px', width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setReportMode('academic-year')}
          style={{
            padding: '10px 22px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            background: reportMode === 'academic-year' ? '#ffffff' : 'transparent',
            color: reportMode === 'academic-year' ? '#4f46e5' : '#64748b',
            boxShadow: reportMode === 'academic-year' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <Calendar size={16} /> 1. Reports By Academic Year (Daily Work)
        </button>

        <button
          type="button"
          onClick={() => setReportMode('batch')}
          style={{
            padding: '10px 22px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            background: reportMode === 'batch' ? '#ffffff' : 'transparent',
            color: reportMode === 'batch' ? '#4f46e5' : '#64748b',
            boxShadow: reportMode === 'batch' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} /> 2. Reports By Batch (Full 8 Semesters Master Pack)
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 1: REPORTS BY ACADEMIC YEAR                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {reportMode === 'academic-year' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Filter Bar Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={18} style={{ color: '#4f46e5' }} />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                Academic Year Report Generator (AY {academicYear})
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Programme Read-only Info */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Programme</label>
                <div style={{ height: '38px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {programmeCode} — {programmeName}
                </div>
              </div>

              {/* Course Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Target Course</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCourse?.id || ''}
                    onChange={(e) => setCourseId(e.target.value)}
                    style={{ height: '38px', width: '100%', fontSize: '13px', fontWeight: '700', color: '#4f46e5', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0 30px 0 12px', appearance: 'none', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                  >
                    {(availableCourses.length > 0 ? availableCourses : courses).map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Semester Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Semester</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedSemFilter}
                    onChange={(e) => setSelectedSemFilter(e.target.value)}
                    style={{ height: '38px', width: '100%', fontSize: '13px', fontWeight: '700', color: '#0f172a', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 30px 0 12px', appearance: 'none', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="all">All Active Semesters</option>
                    <option value="sem-1">Semester 1 (1st Year)</option>
                    <option value="sem-2">Semester 2 (1st Year)</option>
                    <option value="sem-3">Semester 3 (2nd Year)</option>
                    <option value="sem-4">Semester 4 (2nd Year)</option>
                    <option value="sem-5">Semester 5 (3rd Year)</option>
                    <option value="sem-6">Semester 6 (3rd Year)</option>
                    <option value="sem-7">Semester 7 (4th Year)</option>
                    <option value="sem-8">Semester 8 (4th Year)</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Download Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {/* Card A: Main Attainment Master Report */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Main Attainment Master Report</h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Tables 1 &amp; 2 + Direct/Indirect CO Attainment</span>
                  </div>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Includes CO-PO mapping strength matrix, direct examination level, survey ratings, and Table 2 final PO/PSO values for {courseCode}.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadAYReport('main-attainment')}
                  style={{ flex: 1, height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                >
                  <Download size={15} /> Download Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                >
                  <Printer size={15} /> Print PDF
                </button>
              </div>
            </div>

            {/* Card B: Course Action Taken Report (Course ATR) */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Course Action Taken Report (ATR)</h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Target vs Actual CO Gap Analysis &amp; Actions</span>
                  </div>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Generates course action taken report with target attainment status, gaps, and proposed corrective action plans.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadAYReport('course-atr')}
                  style={{ flex: 1, height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                >
                  <Download size={15} /> Download ATR Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  style={{ height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                >
                  <Printer size={15} /> Print PDF
                </button>
              </div>
            </div>

            {/* Card C: PO & PSO Keyword Mapping Sheets */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>PO &amp; PSO Keyword Mapping Sheets</h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Competency &amp; Indicator Mapping Matrix</span>
                  </div>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Detailed keyword alignment tables for PO1–PO12 and PSO1–PSO3 against course competencies.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadAYReport('po-mapping')}
                  style={{ flex: 1, height: '38px', padding: '0 12px', fontSize: '12px', fontWeight: '700', background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: 'inherit' }}
                >
                  <Download size={14} /> PO Sheet (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAYReport('pso-mapping')}
                  style={{ flex: 1, height: '38px', padding: '0 12px', fontSize: '12px', fontWeight: '700', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: 'inherit' }}
                >
                  <Download size={14} /> PSO Sheet (.xlsx)
                </button>
              </div>
            </div>

            {/* Card D: Programme PO & PSO Attainment Summary (For Coordinators/Directors) */}
            {isCoordinator && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#059669', display: 'grid', placeItems: 'center' }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Programme Master PO/PSO Summary</h4>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>All Courses Aggregated for AY {academicYear}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px', lineHeight: 1.4 }}>
                    Master summary matrix listing all courses across the department with PO/PSO attainment levels for NBA Criteria 3.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadAYReport('programme-summary')}
                    style={{ flex: 1, height: '38px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                  >
                    <Download size={15} /> Download Programme Master (.xlsx)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 2: REPORTS BY BATCH (FULL 8 SEMESTERS MASTER PACK)            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {reportMode === 'batch' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Batch Selector Header Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} style={{ color: '#059669' }} />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                Full-Cycle Batch Report Generator (Semesters 1 to 8)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {/* Batch Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Select Target Student Batch</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    style={{ height: '40px', width: '100%', fontSize: '13px', fontWeight: '800', color: '#059669', background: '#ffffff', border: '1.5px solid #059669', borderRadius: '8px', padding: '0 30px 0 12px', appearance: 'none', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
                  >
                    {BATCH_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#059669', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Programme Readonly */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Programme Scope</label>
                <div style={{ height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {programmeCode} — {programmeName}
                </div>
              </div>
            </div>
          </div>

          {/* Batch Download Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Card 1: Full 8-Semester Master Curriculum Pack */}
            <div style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(5,150,105,0.06)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>Full 8-Semesters Master Report Pack</h4>
                    <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>Consolidated Curriculum Workbook (Sem 1 to Sem 8)</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 18px', lineHeight: 1.45 }}>
                  Generates a single multi-sheet Excel workbook containing individual tabs for each Semester (Sem 1 through Sem 8) plus a Master PO/PSO Summary sheet.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadBatchReport('full-8-sem')}
                  style={{ flex: 1, height: '42px', padding: '0 16px', fontSize: '13px', fontWeight: '800', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
                >
                  <Download size={16} /> Download 8-Sem Master Pack (.xlsx)
                </button>
              </div>
            </div>

            {/* Card 2: Batch Attainment Trend Analysis */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'grid', placeItems: 'center' }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>Batch Attainment Trend Analysis</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>4-Year Progression Tracking</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 18px', lineHeight: 1.45 }}>
                  Tracks attainment progression across 1st Year (Sem 1-2), 2nd Year (Sem 3-4), 3rd Year (Sem 5-6), and 4th Year (Sem 7-8) for this batch.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadBatchReport('trend-analysis')}
                  style={{ flex: 1, height: '42px', padding: '0 16px', fontSize: '13px', fontWeight: '800', background: '#0369a1', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                >
                  <Download size={16} /> Download Trend Sheet (.xlsx)
                </button>
              </div>
            </div>

            {/* Card 3: Batch Programme ATR & Carry-Forward Pack */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>Batch Programme ATR Pack</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Carry-Forward &amp; Action Plans</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 18px', lineHeight: 1.45 }}>
                  Consolidated Programme Action Taken Report for NBA Section 7.1, linking previous batch interventions to current batch actions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadBatchReport('atr-pack')}
                  style={{ flex: 1, height: '42px', padding: '0 16px', fontSize: '13px', fontWeight: '800', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
                >
                  <Download size={16} /> Download ATR Pack (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  style={{ height: '42px', padding: '0 14px', fontSize: '12.5px', fontWeight: '700', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                >
                  <Printer size={15} /> Print PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
