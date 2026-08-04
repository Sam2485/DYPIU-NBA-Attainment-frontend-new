import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import SectionSaveFooter from '../../components/layout/SectionSaveFooter';

export default function ReportsHub() {
  const { role } = useAuth();
  const {
    academicYear,
    selectedProgramme,
    selectedCourse,
    activePOs,
    activePSOs,
    activeCOs,
    availableCourses,
  } = useAcademic();

  // Dropdown Selections
  const [selectedCourseReport, setSelectedCourseReport] = useState('main-attainment');
  const [selectedProgrammeReport, setSelectedProgrammeReport] = useState('avg-mapping');
  const [exportFormat, setExportFormat] = useState('xlsx');

  const poList = activePOs.map((p) => p.code);
  const psoList = activePSOs.map((p) => p.code);

  const courseReportOptions = [
    { id: 'main-attainment', name: '1. Main-Attainment Master Report (Tables 1 & 2 + CO Direct/Indirect)', format: 'Excel & PDF' },
    { id: 'po-mapping', name: '2. Detailed PO Keyword & Competency Mapping Sheet', format: 'Excel' },
    { id: 'pso-mapping', name: '3. Detailed PSO Keyword & Competency Mapping Sheet', format: 'Excel' },
  ];

  const programmeReportOptions = [
    { id: 'avg-mapping', name: 'A. Average Mapping Strength Matrix Across All Courses', format: 'Master Excel' },
    { id: 'po-attainment-summary', name: 'B. Final PO & PSO Attainment Summary Matrix', format: 'Master Excel' },
  ];

  // Helper for Course-level Excel Download
  const handleDownloadCourseReport = (reportId) => {
    let filename = '';
    let sheetData = [];

    if (reportId === 'main-attainment') {
      filename = `Main_Attainment_${selectedCourse.code}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`MAIN ATTAINMENT REPORT - ACADEMIC YEAR ${academicYear}`],
        [`Programme: ${selectedProgramme.code} - ${selectedProgramme.name}`],
        [`Course: ${selectedCourse.code} - ${selectedCourse.name}`],
        [],
        [`1. TABLE 1: COMBINED MAPPING OF CO TO PO/PSO`],
        ['Sr No', 'CO Code', ...poList, ...psoList],
        ...activeCOs.map((co, idx) => [
          idx + 1,
          co.code,
          ...poList.map((po) => (po === 'PO1' || po === 'PO2' ? 3 : po === 'PO3' ? 2 : 1)),
          ...psoList.map((pso) => (pso === 'PSO1' ? 3 : 2)),
        ]),
        ['', 'Average', ...poList.map(() => 2.17), ...psoList.map(() => 2.0)],
        [],
        [`2. CO DIRECT & INDIRECT ATTAINMENT`],
        ['Attainment Method', 'Metric', ...activeCOs.map((co) => co.code)],
        ['Direct Examination', '% Students ≥ Threshold (60%)', ...activeCOs.map(() => '60%')],
        ['Direct Examination', 'Direct Attainment Level', ...activeCOs.map(() => 2.8)],
        ['Indirect Survey', '% Positive Feedback Rating', ...activeCOs.map(() => '82%')],
        ['Indirect Survey', 'Indirect Attainment Level', ...activeCOs.map(() => 2.5)],
        ['Combined Attainment of CO', '(80% Direct + 20% Indirect)', ...activeCOs.map(() => 2.74)],
        [],
        [`3. TABLE 2: PO & PSO ATTAINMENT VALUES`],
        ['Course Code', ...poList, ...psoList],
        [selectedCourse.code, ...poList.map(() => 1.83), ...psoList.map(() => 1.70)],
      ];
    } else if (reportId === 'po-mapping') {
      filename = `PO_Mapping_${selectedCourse.code}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PO KEYWORD MAPPING REPORT`],
        [`Programme: ${selectedProgramme.code}`],
        [`Course: ${selectedCourse.code} - ${selectedCourse.name}`],
        [],
        ['Programme Outcomes & Competency Definition', '', 'Keywords mapping to Competency from respective CO', '', '', 'Y or N Mapping Indicator'],
        ['PO Code', 'Competency Statement', ...activeCOs.map((co) => co.code), ...activeCOs.map((co) => co.code)],
        ...activePOs.flatMap((po) =>
          (po.competencies && po.competencies.length > 0
            ? po.competencies
            : [{ order: 1, statement: `Demonstrate competency statement for ${po.code}` }]
          ).map((comp) => [
            po.code,
            comp.statement,
            ...activeCOs.map(() => 'Sample keyword'),
            ...activeCOs.map(() => 'Y'),
          ])
        ),
      ];
    } else if (reportId === 'pso-mapping') {
      filename = `PSO_Mapping_${selectedCourse.code}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PSO KEYWORD MAPPING REPORT`],
        [`Programme: ${selectedProgramme.code}`],
        [`Course: ${selectedCourse.code} - ${selectedCourse.name}`],
        [],
        ['Programme Outcomes & Competency Definition', '', 'Keywords mapping to Competency from respective CO', '', '', 'Y or N Mapping Indicator'],
        ['PSO Code', 'Competency Statement', ...activeCOs.map((co) => co.code), ...activeCOs.map((co) => co.code)],
        ...activePSOs.flatMap((pso) =>
          (pso.competencies && pso.competencies.length > 0
            ? pso.competencies
            : [{ order: 1, statement: `Demonstrate PSO competency statement for ${pso.code}` }]
          ).map((comp) => [
            pso.code,
            comp.statement,
            ...activeCOs.map(() => 'Sample keyword'),
            ...activeCOs.map(() => 'Y'),
          ])
        ),
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  // Helper for Programme-level Excel Download
  const handleDownloadProgrammeReport = (reportId) => {
    let filename = '';
    let sheetData = [];

    const getProgHeader = () => [
      ['D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE'],
      [`School: ${selectedProgramme.department || 'School of Computer Science & Engineering'}`],
      [`Academic Year: ${academicYear}`, `Programme: ${selectedProgramme.code} - ${selectedProgramme.name}`],
      [],
    ];

    if (reportId === 'avg-mapping') {
      filename = `Master_Average_Mapping_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = [
        ...getProgHeader(),
        ['AVERAGE MAPPING STRENGTH MATRIX ACROSS ALL COURSES'],
        ['Course Code', 'Course Name', ...poList, ...psoList],
        ...availableCourses.map((c) => [
          c.code,
          c.name,
          ...poList.map((po) => (po === 'PO1' || po === 'PO2' ? 2.5 : 2.0)),
          ...psoList.map((pso) => (pso === 'PSO1' ? 2.5 : 2.0)),
        ]),
        ['', 'Programme Direct Target Attainment (Avg)', ...poList.map(() => 2.25), ...psoList.map(() => 2.25)],
      ];
    } else if (reportId === 'po-attainment-summary') {
      filename = `Master_PO_PSO_Attainment_Summary_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = [
        ...getProgHeader(),
        ['FINAL PO & PSO ATTAINMENT SUMMARY MATRIX ACROSS ALL COURSES'],
        ['Course Code', 'Course Name', ...poList, ...psoList],
        ...availableCourses.map((c) => [
          c.code,
          c.name,
          ...poList.map(() => 1.83),
          ...psoList.map(() => 1.70),
        ]),
        ['', 'Direct Exam Target Level (80%)', ...poList.map(() => 1.83), ...psoList.map(() => 1.70)],
        ['', 'Indirect Survey Target Level (20%)', ...poList.map(() => 2.50), ...psoList.map(() => 2.40)],
        ['', 'OVERALL PO / PSO ATTAINMENT (100%)', ...poList.map(() => 1.96), ...psoList.map(() => 1.84)],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Summary');
    XLSX.writeFile(wb, filename);
  };

  const handleTriggerPrintPDF = () => {
    window.print();
  };

  return (
    <div className="animated-page">
      {/* Standard Header Banner */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <div className="badge badge-active" style={{ marginBottom: '6px' }}>
              Reports & Downloads ({role})
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Reports & Attainment Documentation
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#475569' }}>
              Programme: <strong style={{ color: '#0f172a' }}>{selectedProgramme?.code}</strong> • Course: <strong style={{ color: '#0f172a' }}>{selectedCourse?.code} - {selectedCourse?.name}</strong> • Academic Year: <strong style={{ color: '#0f172a' }}>{academicYear}</strong>
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => handleDownloadCourseReport(selectedCourseReport)}>
            <Download size={15} /> Download {exportFormat.toUpperCase()} Report
          </button>
        </div>
      </div>

      {/* Main Dropdown Download Selector Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px 24px', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          {/* Dropdown 1: Course Level Report Selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
              📘 Select Course-Level Report:
            </label>
            <select
              value={selectedCourseReport}
              onChange={(e) => setSelectedCourseReport(e.target.value)}
              className="glass-selector-group"
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#4f46e5',
                background: '#ffffff',
                border: '1.5px solid #6366f1',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              {courseReportOptions.map((r) => (
                <option key={r.id} value={r.id} style={{ color: '#0f172a' }}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Export Format */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
              📄 Select Output Format:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="glass-selector-group"
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#4f46e5',
                background: '#ffffff',
                border: '1.5px solid #6366f1',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <option value="xlsx" style={{ color: '#0f172a' }}>Excel Spreadsheet (.xlsx)</option>
              <option value="pdf" style={{ color: '#0f172a' }}>PDF Print Document (.pdf)</option>
            </select>
          </div>

          {/* Download Trigger Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ height: '42px', flex: 1, fontSize: '13px' }}
              onClick={() => {
                if (exportFormat === 'pdf') {
                  handleTriggerPrintPDF();
                } else {
                  handleDownloadCourseReport(selectedCourseReport);
                }
              }}
            >
              <Download size={16} /> Download Selected ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      </div>

      {/* Two Dropdown Cards: Course Level & Programme Level */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Course Level Dropdown Downloads */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} style={{ color: '#2563eb' }} />
              Course-Level Accreditation Reports ({selectedCourse?.code})
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Generates individual course NBA attainment sheets, CO-PO mapping matrices, and competency keyword tables.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Course Report Document:</label>
              <select
                value={selectedCourseReport}
                onChange={(e) => setSelectedCourseReport(e.target.value)}
                className="form-select"
                style={{ fontWeight: '700', color: '#0f172a' }}
              >
                {courseReportOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleDownloadCourseReport(selectedCourseReport)}
              >
                <FileSpreadsheet size={15} /> Download Excel (.xlsx)
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={handleTriggerPrintPDF}
              >
                <FileText size={15} /> Print PDF
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Programme Level Master Dropdown Downloads */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: '#059669' }} />
              Programme-Level Master Aggregation Reports ({selectedProgramme?.code})
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Master programme matrices aggregating all courses for NBA Criteria 3 accreditation audits.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Programme Master Document:</label>
              <select
                value={selectedProgrammeReport}
                onChange={(e) => setSelectedProgrammeReport(e.target.value)}
                className="form-select"
                style={{ fontWeight: '700', color: '#0f172a' }}
              >
                {programmeReportOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn btn-success"
                style={{ flex: 1 }}
                onClick={() => handleDownloadProgrammeReport(selectedProgrammeReport)}
              >
                <FileSpreadsheet size={15} /> Download Master Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Report Preview Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
              Live Report Preview — {courseReportOptions.find((r) => r.id === selectedCourseReport)?.name}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Preview of Table 1 & Table 2 for {selectedCourse?.code} ({academicYear}) before downloading.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => handleDownloadCourseReport(selectedCourseReport)}>
            <Download size={14} /> Download File
          </button>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="audit-data-table">
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Course Outcomes ({activeCOs.length} COs)
                </th>
                <th colSpan={poList.length} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
                  Programme Outcomes ({poList.length} POs)
                </th>
                {psoList.length > 0 && (
                  <th colSpan={psoList.length} style={{ textAlign: 'center', background: '#e2e8f0', color: '#0f172a' }}>
                    Programme Specific Outcomes ({psoList.length} PSOs)
                  </th>
                )}
              </tr>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
                <th style={{ width: '120px' }}>CO Code</th>
                {poList.map((po) => (
                  <th key={po} style={{ width: '65px', textAlign: 'center' }}>
                    {po}
                  </th>
                ))}
                {psoList.map((pso) => (
                  <th key={pso} style={{ width: '65px', textAlign: 'center' }}>
                    {pso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeCOs.map((co, idx) => (
                <tr key={co.code}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{co.code}</td>
                  {poList.map((po) => (
                    <td key={po} style={{ textAlign: 'center' }}>
                      {po === 'PO1' || po === 'PO2' ? 3 : po === 'PO3' ? 2 : 1}
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center' }}>
                      {pso === 'PSO1' ? 3 : 2}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>
                  Average Mapping Strength
                </td>
                {poList.map((po) => (
                  <td key={po} style={{ textAlign: 'center', color: '#0f172a' }}>
                    2.17
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center', color: '#0f172a' }}>
                    2.00
                  </td>
                ))}
              </tr>
              <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>
                  Final PO / PSO Attainment Value (Table 2)
                </td>
                {poList.map((po) => (
                  <td key={po} style={{ textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                    1.83
                  </td>
                ))}
                {psoList.map((pso) => (
                  <td key={pso} style={{ textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                    1.70
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save, Previous & Save & Next Footer */}
      <SectionSaveFooter
        label="Reports & Downloads"
        prevPath="/po-pso-attainment"
        nextPath="/dashboard"
      />
    </div>
  );
}
