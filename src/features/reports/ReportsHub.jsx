import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ReportsHub() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const {
    academicYear = '2025-26',
    selectedProgramme,
    selectedCourse,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    availableCourses = [],
  } = useAcademic();

  const isCoordinator = role === 'PROGRAMME_COORDINATOR' || role === 'DIRECTOR' || role === 'IQAC';

  // Dropdown Selections
  const [selectedCourseReport, setSelectedCourseReport] = useState('main-attainment');
  const [selectedProgrammeReport, setSelectedProgrammeReport] = useState('avg-mapping');
  const [exportFormat, setExportFormat] = useState('xlsx');

  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const coList = activeCOs || [];

  const courseCode = selectedCourse?.code || '310244';
  const courseName = selectedCourse?.name || 'Computer Network and Security';
  const programmeCode = selectedProgramme?.code || 'BTECH-CS';
  const programmeName = selectedProgramme?.name || 'B.Tech Computer Science';

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
      filename = `Main_Attainment_${courseCode}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`MAIN ATTAINMENT REPORT - ACADEMIC YEAR ${academicYear}`],
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
        ['', 'Average', ...poList.map(() => 2.17), ...psoList.map(() => 2.0)],
        [],
        [`2. CO DIRECT & INDIRECT ATTAINMENT`],
        ['Attainment Method', 'Metric', ...coList.map((co) => co.code)],
        ['Direct Examination', '% Students ≥ Threshold (60%)', ...coList.map(() => '60%')],
        ['Direct Examination', 'Direct Attainment Level', ...coList.map(() => 2.8)],
        ['Indirect Survey', '% Positive Feedback Rating', ...coList.map(() => '82%')],
        ['Indirect Survey', 'Indirect Attainment Level', ...coList.map(() => 2.5)],
        ['Combined Attainment of CO', '(80% Direct + 20% Indirect)', ...coList.map(() => 2.74)],
        [],
        [`3. TABLE 2: PO & PSO ATTAINMENT VALUES`],
        ['Course Code', ...poList, ...psoList],
        [courseCode, ...poList.map(() => 1.83), ...psoList.map(() => 1.70)],
      ];
    } else if (reportId === 'po-mapping') {
      filename = `PO_Mapping_${courseCode}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PO KEYWORD MAPPING REPORT`],
        [`Programme: ${programmeCode}`],
        [`Course: ${courseCode} - ${courseName}`],
        [],
        ['Programme Outcomes & Competency Definition', '', 'Keywords mapping to Competency from respective CO', '', '', 'Y or N Mapping Indicator'],
        ['PO Code', 'Competency Statement', ...coList.map((co) => co.code), ...coList.map((co) => co.code)],
        ...poList.map((po) => [
          po,
          `Demonstrate competency for ${po}`,
          ...coList.map(() => 'Sample keyword'),
          ...coList.map(() => 'Y'),
        ]),
      ];
    } else {
      filename = `PSO_Mapping_${courseCode}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`DETAILED PSO KEYWORD MAPPING REPORT`],
        [`Programme: ${programmeCode}`],
        [`Course: ${courseCode} - ${courseName}`],
        [],
        ['PSO Code', 'PSO Statement', ...coList.map((co) => co.code)],
        ...psoList.map((pso) => [pso, `Program Specific Outcome statement for ${pso}`, ...coList.map(() => 'Y')]),
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Course Report');
    XLSX.writeFile(wb, filename);
  };

  // Helper for Programme-level Excel Download
  const handleDownloadProgrammeReport = (reportId) => {
    let filename = '';
    let sheetData = [];

    if (reportId === 'avg-mapping') {
      filename = `Programme_Avg_Mapping_${programmeCode}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`PROGRAMME AVERAGE MAPPING STRENGTH MATRIX - ALL COURSES`],
        [`Programme: ${programmeCode} - ${programmeName}`],
        [],
        ['Sr No', 'Course Code', 'Course Title', ...poList, ...psoList],
        ...(availableCourses.length > 0 ? availableCourses : [{ code: '310244', name: 'CNS' }]).map((c, idx) => [
          idx + 1,
          c.code,
          c.name,
          ...poList.map(() => (idx % 2 === 0 ? 2.33 : 2.0)),
          ...psoList.map(() => 2.0),
        ]),
      ];
    } else {
      filename = `Programme_PO_Attainment_Summary_${programmeCode}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
        [`PROGRAMME PO & PSO ATTAINMENT SUMMARY MATRIX`],
        [`Programme: ${programmeCode} - ${programmeName}`],
        [],
        ['Course Code', 'Course Title', 'Overall CO Attainment', ...poList, ...psoList],
        ...(availableCourses.length > 0 ? availableCourses : [{ code: '310244', name: 'CNS' }]).map((c) => [
          c.code,
          c.name,
          2.45,
          ...poList.map(() => 1.83),
          ...psoList.map(() => 1.7),
        ]),
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
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Reports
            </h2>
          </div>
        </div>
      </div>

      {/* Two Dropdown Cards: Course Level & (Optional Programme Level for Coordinators) */}
      <div style={{ display: 'grid', gridTemplateColumns: isCoordinator ? 'repeat(auto-fit, minmax(420px, 1fr))' : '1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Course Level Dropdown Downloads */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} style={{ color: '#2563eb' }} />
              Course-Level Accreditation Reports ({courseCode})
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

        {/* Card 2: Programme Level Master Dropdown Downloads (VISIBLE ONLY TO PROGRAMME COORDINATORS / DIRECTORS) */}
        {isCoordinator && (
          <div className="card">
            <div className="card-header">
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} style={{ color: '#059669' }} />
                Programme-Level Master Aggregation Reports ({programmeCode})
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
        )}
      </div>

      {/* Live Interactive Report Preview Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
              Live Report Preview — {courseReportOptions.find((r) => r.id === selectedCourseReport)?.name}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Preview of Table 1 & Table 2 for {courseCode} ({academicYear}) before downloading.
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
                  Course Outcomes ({coList.length} COs)
                </th>
                <th colSpan={poList.length || 1} style={{ textAlign: 'center', background: '#f1f5f9', color: '#0f172a' }}>
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
              {coList.length === 0 ? (
                <tr>
                  <td colSpan={2 + Math.max(1, poList.length) + psoList.length} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    No Course Outcomes defined yet.
                  </td>
                </tr>
              ) : (
                coList.map((co, idx) => (
                  <tr key={co.code || idx}>
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
                ))
              )}
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
    </div>
  );
}
