import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Filter,
  Calendar,
  Layers,
  BookOpen,
  Crown,
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
    courses: allProgrammeCourses,
  } = useAcademic();

  const [selectedReport, setSelectedReport] = useState('main-attainment');

  const poList = activePOs.map((p) => p.code);
  const psoList = activePSOs.map((p) => p.code);

  const reportsList = [
    {
      id: 'main-attainment',
      stepNumber: 'REPORT 1',
      title: 'Main-Attainment Report',
      subtitle: 'Table 1, Table 2 & CO Direct/Indirect Attainment',
      description: 'The master NBA attainment document for the active course. Includes CO to PO/PSO mapping matrix (Table 1), final PO/PSO attainment values (Table 2), and Direct Exam vs Indirect Survey CO attainment percentages.',
      bestFor: 'Course-Level NBA Accreditation Audit & Department Submissions',
      color: '#2563eb',
    },
    {
      id: 'po-mapping',
      stepNumber: 'REPORT 2',
      title: 'PO Mapping Report',
      subtitle: 'Detailed PO Keyword & Competency Mapping Sheet',
      description: 'The competency-level mapping sheet for Program Outcomes (PO1–PO12). Contains competency statements, teacher keyword inputs, auto-derived Y/N indicators, % mapped, and mapping strengths.',
      bestFor: 'Program Outcome Competency Audit & Verification',
      color: '#0284c7',
    },
    {
      id: 'pso-mapping',
      stepNumber: 'REPORT 3',
      title: 'PSO Mapping Report',
      subtitle: 'Detailed PSO Keyword & Competency Mapping Sheet',
      description: 'The competency-level mapping sheet for Program Specific Outcomes (PSO1–PSO3). Contains PSO competency statements, teacher keyword inputs, auto-derived Y/N indicators, % mapped, and mapping strengths.',
      bestFor: 'Program Specific Outcome Competency Audit & Verification',
      color: '#10b981',
    },
  ];

  const handleDownloadExcel = (reportId) => {
    let filename = '';
    let sheetData = [];

    if (reportId === 'main-attainment') {
      filename = `Main_Attainment_${selectedCourse.code}_${academicYear}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY`],
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
        ['Direct Examination', '% above threshold', ...activeCOs.map(() => '65%')],
        ['Direct Examination', 'Direct Attainment', ...activeCOs.map(() => 2)],
        ['Indirect Survey', '% above threshold', ...activeCOs.map(() => '80%')],
        ['Indirect Survey', 'Indirect Attainment', ...activeCOs.map(() => 3)],
        ['Combined Attainment of CO', '(0.8 Direct + 0.2 Indirect)', ...activeCOs.map(() => 2.2)],
        [],
        [`3. TABLE 2: PO & PSO ATTAINMENT VALUES`],
        ['Code', ...poList, ...psoList],
        [selectedCourse.code, ...poList.map(() => 1.5), ...psoList.map(() => 1.38)],
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

  const getProgHeader = () => [
    ['D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE'],
    [`School: ${selectedProgramme.department || 'School of Computer Science & Engineering'}`],
    [`Academic Year: ${academicYear}`, `Programme: ${selectedProgramme.code} - ${selectedProgramme.name}`],
    [],
  ];

  const getAverageMappingData = () => [
    ...getProgHeader(),
    ['AVERAGE MAPPING STRENGTH ACROSS ALL COURSES'],
    ['Sem', 'Course Code', 'Course Name', ...poList, ...psoList],
    ...allProgrammeCourses.map((crs) => [
      crs.semester || 'Sem I',
      crs.code,
      crs.name,
      ...poList.map((po) => (po === 'PO1' || po === 'PO2' ? 3 : po === 'PO3' ? 2 : 1)),
      ...psoList.map((pso) => (pso === 'PSO1' ? 3 : 2)),
    ]),
  ];

  const getAverageAttainmentDirectData = () => [
    ...getProgHeader(),
    ['PO & PSO ATTAINMENT (DIRECT) ACROSS ALL COURSES'],
    ['Sem', 'Course Code', 'Course Name', ...poList, ...psoList],
    ...allProgrammeCourses.map((crs) => [
      crs.semester || 'Sem I',
      crs.code,
      crs.name,
      ...poList.map(() => 2.15),
      ...psoList.map(() => 2.0),
    ]),
  ];

  const getAverageAttainmentIndirectData = () => [
    ...getProgHeader(),
    ['PO & PSO ATTAINMENT (INDIRECT SURVEY) ACROSS ALL COURSES'],
    ['Sem', 'Course Code', 'Course Name', ...poList, ...psoList],
    ...allProgrammeCourses.map((crs) => [
      crs.semester || 'Sem I',
      crs.code,
      crs.name,
      ...poList.map(() => 2.4),
      ...psoList.map(() => 2.2),
    ]),
  ];

  const getOverallAttainmentData = () => [
    ...getProgHeader(),
    ['OVERALL PROGRAMME ATTAINMENT SUMMARY (80% Direct + 20% Indirect)'],
    ['Metric', ...poList, ...psoList],
    ['Average Mapping Values', ...poList.map(() => 2.17), ...psoList.map(() => 2.0)],
    ['Average Attainment (Direct)', ...poList.map(() => 2.15), ...psoList.map(() => 2.0)],
    ['Average Attainment (Indirect)', ...poList.map(() => 2.4), ...psoList.map(() => 2.2)],
    ['OVERALL ATTAINMENT (80% Direct + 20% Indirect)', ...poList.map(() => 2.2), ...psoList.map(() => 2.04)],
  ];

  const handleDownloadSingleProgReport = (reportType) => {
    let filename = '';
    let sheetData = [];

    if (reportType === 'mapping') {
      filename = `Average_Mapping_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = getAverageMappingData();
    } else if (reportType === 'direct') {
      filename = `Average_Attainment_Direct_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = getAverageAttainmentDirectData();
    } else if (reportType === 'indirect') {
      filename = `Average_Attainment_Indirect_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = getAverageAttainmentIndirectData();
    } else if (reportType === 'overall') {
      filename = `Overall_Programme_Attainment_${selectedProgramme.code}_${academicYear}.xlsx`;
      sheetData = getOverallAttainmentData();
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  const handleDownloadMasterSuperAdminReport = () => {
    const filename = `Master_Combined_Programme_Attainment_${selectedProgramme.code}_${academicYear}.xlsx`;
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(getAverageMappingData()), 'Average Mapping');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(getAverageAttainmentDirectData()), 'Average Attainment(D)');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(getAverageAttainmentIndirectData()), 'Average Attainment(ID)');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(getOverallAttainmentData()), 'Overall-attainment');

    const sheet5Data = [
      ...getProgHeader(),
      ['COURSE OUTCOME (CO) ATTAINMENT SUMMARY FOR ALL PROGRAMME COURSES'],
      ['Sem', 'Course Code', 'Course Name', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'],
      ...allProgrammeCourses.map((crs) => [
        crs.semester || 'Sem I',
        crs.code,
        crs.name,
        2.8, 2.8, 3.0, 2.7, 2.8, 2.8,
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet5Data), 'Attainment of CO');

    XLSX.writeFile(wb, filename);
  };

  const handleDownloadPDF = (reportTitle) => {
    alert(`Preparing PDF Report for ${reportTitle}... Download will begin shortly.`);
  };

  return (
    <div className="animated-page">
      {/* Top Banner Header */}
      <div className="banner-dark-gradient">
        <div className="banner-content-row">
          <div>
            <div className="badge badge-active" style={{ marginBottom: '6px' }}>
              Reports Hub ({role})
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
              Reports & Attainment Documentation
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
              Scope: <strong style={{ color: '#0f172a' }}>{selectedProgramme?.code}</strong> • Course: <strong style={{ color: '#0f172a' }}>{selectedCourse?.code} - {selectedCourse?.name}</strong> • Academic Year: <strong style={{ color: '#0f172a' }}>{academicYear}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={() => handleDownloadExcel(selectedReport)}>
              <FileSpreadsheet size={15} /> Download Course Excel (.xlsx)
            </button>
            <button className="btn btn-primary" onClick={() => handleDownloadPDF(selectedReport)}>
              <FileText size={15} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN MASTER PROGRAMME REPORTS SECTION */}
      {role === 'SUPER_ADMIN' && (
        <div className="card" style={{ marginBottom: '24px', borderLeft: '5px solid #0284c7' }}>
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Crown size={18} style={{ color: '#f59e0b' }} />
                <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: '800', fontSize: '10px' }}>
                  SUPER ADMIN PROGRAMME-LEVEL REPORTS
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Programme-Wide Attainment Reports ({selectedProgramme?.code})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Download individual sheet reports separately or export the complete combined 5-sheet Master Workbook!
              </p>
            </div>

            <button
              className="btn btn-success"
              style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '700' }}
              onClick={handleDownloadMasterSuperAdminReport}
            >
              <Crown size={15} /> Download Combined Master Workbook (.xlsx)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="badge badge-active" style={{ fontSize: '9px', marginBottom: '6px' }}>Sheet 1</span>
              <h4 style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#0f172a' }}>Average Mapping</h4>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>PO & PSO Average Mapping strengths across all courses.</p>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                onClick={() => handleDownloadSingleProgReport('mapping')}
              >
                <FileSpreadsheet size={13} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="badge badge-active" style={{ fontSize: '9px', marginBottom: '6px', background: '#dbeafe', color: '#1e40af' }}>Sheet 2</span>
              <h4 style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#0f172a' }}>Average Attainment (D)</h4>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>Direct Examination PO & PSO attainment values.</p>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                onClick={() => handleDownloadSingleProgReport('direct')}
              >
                <FileSpreadsheet size={13} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="badge badge-active" style={{ fontSize: '9px', marginBottom: '6px', background: '#d1fae5', color: '#065f46' }}>Sheet 3</span>
              <h4 style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#0f172a' }}>Average Attainment (ID)</h4>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>Indirect Course Survey PO & PSO attainment values.</p>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                onClick={() => handleDownloadSingleProgReport('indirect')}
              >
                <FileSpreadsheet size={13} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="badge badge-active" style={{ fontSize: '9px', marginBottom: '6px', background: '#fef3c7', color: '#92400e' }}>Sheet 4</span>
              <h4 style={{ margin: '0 0 4px', fontSize: '13.5px', color: '#0f172a' }}>Overall Attainment</h4>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#64748b' }}>Combined Programme Attainment (80/20 ratio).</p>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                onClick={() => handleDownloadSingleProgReport('overall')}
              >
                <FileSpreadsheet size={13} /> Download (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Scope Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            <Filter size={15} style={{ color: '#2563eb' }} /> Filter Scope:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <Calendar size={14} style={{ color: '#64748b' }} />
            <span style={{ color: '#64748b' }}>AY:</span>
            <strong>{academicYear}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <Layers size={14} style={{ color: '#64748b' }} />
            <span style={{ color: '#64748b' }}>Programme:</span>
            <strong>{selectedProgramme?.code}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <BookOpen size={14} style={{ color: '#64748b' }} />
            <span style={{ color: '#64748b' }}>Course:</span>
            <strong>{selectedCourse?.code} - {selectedCourse?.name}</strong>
          </div>
        </div>
      </div>

      {/* 3 Self-Explaining Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {reportsList.map((report) => {
          const isSelected = selectedReport === report.id;
          return (
            <div
              key={report.id}
              className="card"
              style={{
                borderLeft: `4px solid ${report.color}`,
                borderColor: isSelected ? report.color : '#cbd5e1',
                background: isSelected ? '#f8fafc' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '18px',
              }}
              onClick={() => setSelectedReport(report.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-active" style={{ fontSize: '10px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                  {report.stepNumber}
                </span>
                {isSelected && <CheckCircle2 size={18} style={{ color: report.color }} />}
              </div>

              <h3 style={{ margin: '4px 0 2px', fontSize: '16px', color: '#0f172a' }}>{report.title}</h3>
              <p style={{ margin: '0 0 8px', fontSize: '11.5px', fontWeight: '700', color: report.color }}>{report.subtitle}</p>

              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b', lineHeight: '1.45' }}>
                {report.description}
              </p>

              <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#334155', marginBottom: '14px' }}>
                <strong>📌 Best Used For:</strong> {report.bestFor}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '11.5px', padding: '6px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadExcel(report.id);
                  }}
                >
                  <FileSpreadsheet size={13} /> Excel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '11.5px', padding: '6px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(report.title);
                  }}
                >
                  <FileText size={13} /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Container */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>
              Live Document Preview: {reportsList.find((r) => r.id === selectedReport)?.title}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
              Preview of data table included in the downloaded document for {selectedCourse.code}.
            </p>
          </div>
          <button className="btn btn-success" onClick={() => handleDownloadExcel(selectedReport)}>
            <Download size={14} /> Download File
          </button>
        </div>

        {/* 1. Main-Attainment Report Preview */}
        {selectedReport === 'main-attainment' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
                  <th style={{ width: '100px' }}>CO Code</th>
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
                        {po === 'PO1' || po === 'PO2' ? 3 : 2}
                      </td>
                    ))}
                    {psoList.map((pso) => (
                      <td key={pso} style={{ textAlign: 'center' }}>
                        {pso === 'PSO1' ? 3 : 2}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
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
                    <td key={po} style={{ textAlign: 'center', color: '#0f172a' }}>
                      1.50
                    </td>
                  ))}
                  {psoList.map((pso) => (
                    <td key={pso} style={{ textAlign: 'center', color: '#0f172a' }}>
                      1.38
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2. PO Mapping Report Preview */}
        {selectedReport === 'po-mapping' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>PO Code</th>
                  <th style={{ width: '380px' }}>Competency Statement</th>
                  {activeCOs.map((co) => (
                    <th key={co.code} style={{ textAlign: 'center' }}>
                      {co.code} (Keyword)
                    </th>
                  ))}
                  {activeCOs.map((co) => (
                    <th key={`yn-${co.code}`} style={{ width: '45px', textAlign: 'center' }}>
                      {co.code} (Y/N)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activePOs.map((po) => (
                  <tr key={po.code}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{po.code}</td>
                    <td style={{ fontSize: '12px' }}>{po.statement}</td>
                    {activeCOs.map((co) => (
                      <td key={co.code} style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                        Sample Keyword
                      </td>
                    ))}
                    {activeCOs.map((co) => (
                      <td key={`badge-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                        Y
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. PSO Mapping Report Preview */}
        {selectedReport === 'pso-mapping' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="audit-data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>PSO Code</th>
                  <th style={{ width: '380px' }}>Competency Statement</th>
                  {activeCOs.map((co) => (
                    <th key={co.code} style={{ textAlign: 'center' }}>
                      {co.code} (Keyword)
                    </th>
                  ))}
                  {activeCOs.map((co) => (
                    <th key={`yn-${co.code}`} style={{ width: '45px', textAlign: 'center' }}>
                      {co.code} (Y/N)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activePSOs.map((pso) => (
                  <tr key={pso.code}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{pso.code}</td>
                    <td style={{ fontSize: '12px' }}>{pso.statement}</td>
                    {activeCOs.map((co) => (
                      <td key={co.code} style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                        Sample Keyword
                      </td>
                    ))}
                    {activeCOs.map((co) => (
                      <td key={`badge-${co.code}`} style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                        Y
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save & Previous Footer */}
      <SectionSaveFooter
        label="Reports & Downloads"
        prevPath="/po-pso-attainment"
      />
    </div>
  );
}
