import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Layers,
  Calendar,
  Printer,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  GraduationCap,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { downloadAttainmentExcel, downloadAttainmentPdf } from '../../api/academic';
import { getProgrammeBatchDataset, getCourseAttainment } from '../../api/attainmentApi';
import CourseATR from '../atr/CourseATR';
import ProgrammeATR from '../atr/ProgrammeATR';

export default function ReportsHub() {
  const { role } = useAuth();
  const {
    academicYear = '2025-26',
    availableYears = ['2026-27', '2025-26', '2024-25'],
    programmeId,
    setProgrammeId = () => {},
    programmes = [],
    selectedProgramme,
    selectedBatch,
    batches = [],
    selectedCourseOffering,
    courseOfferings = [],
    selectedCourse,
    courses = [],
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
  } = useAcademic();

  // Role Checks
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const isProgrammeCoordinator = role === 'PROGRAMME_COORDINATOR';
  const isHod = role === 'HOD';
  const isDirector = role === 'DIRECTOR' || role === 'SCHOOL_DIRECTOR';
  const isHodOrDirector = isHod || isDirector;

  // ── 1. MAIN TAB STATE: 'attainment-reports' | 'atr-reports' ────────────────
  const [activeMainTab, setActiveMainTab] = useState('attainment-reports');

  // ── 2. ATTAINMENT VIEW MODE: 'course-attainment' | 'programme-attainment' ────
  const [attainmentViewMode, setAttainmentViewMode] = useState('course-attainment');

  // ── 3. ATR SUB-TAB: 'course-atr' | 'programme-atr' ──────────────────────────
  const [atrSubTab, setAtrSubTab] = useState('course-atr');

  // ── 4. FILTERS STATE ────────────────────────────────────────────────────────
  const [selectedAyFilter, setSelectedAyFilter] = useState(academicYear || '2025-26');
  const [selectedBatchId, setSelectedBatchId] = useState(selectedBatch?.id || '');
  const [batchReportType, setBatchReportType] = useState('average-mapping'); // 'average-mapping' | 'average-attainment-direct' | 'average-attainment-indirect' | 'overall-attainment'

  const [loadingBatchDataset, setLoadingBatchDataset] = useState(false);
  const [batchDataset, setBatchDataset] = useState(null);
  const [courseAttainmentData, setCourseAttainmentData] = useState(null);
  const [loadingCourseAttainment, setLoadingCourseAttainment] = useState(false);

  const [exportingBackendExcel, setExportingBackendExcel] = useState(false);
  const [exportingBackendPdf, setExportingBackendPdf] = useState(false);

  const currentProgramme = selectedProgramme || programmes[0];
  const activeProgId = currentProgramme?.id || programmeId;

  // Sync selectedBatchId with context
  useEffect(() => {
    if (selectedBatch?.id && !selectedBatchId) {
      setSelectedBatchId(selectedBatch.id);
    } else if (batches.length > 0 && (!selectedBatchId || !batches.some((b) => b.id === selectedBatchId))) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatch]);

  const targetOffering = selectedCourseOffering || courseOfferings[0];
  const targetCourse = selectedCourse || courses[0];
  const targetOfferingId = targetOffering?.id || targetCourse?.id;

  // Fetch Course Attainment Data
  useEffect(() => {
    let isMounted = true;
    if (!targetOfferingId) return;

    setLoadingCourseAttainment(true);
    getCourseAttainment(targetOfferingId)
      .then((res) => {
        if (isMounted) {
          setCourseAttainmentData(res?.data || res || null);
        }
      })
      .catch((err) => {
        console.warn('Error fetching course attainment in ReportsHub:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCourseAttainment(false);
      });

    return () => { isMounted = false; };
  }, [targetOfferingId]);

  // Fetch Programme Batch Dataset
  useEffect(() => {
    let isMounted = true;
    if (!activeProgId || !selectedBatchId) return;

    setLoadingBatchDataset(true);
    getProgrammeBatchDataset(activeProgId, selectedBatchId)
      .then((res) => {
        if (isMounted) {
          setBatchDataset(res?.data || res || null);
        }
      })
      .catch((err) => {
        console.warn('Error fetching programme batch dataset in ReportsHub:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingBatchDataset(false);
      });

    return () => { isMounted = false; };
  }, [activeProgId, selectedBatchId]);

  // Dynamic POs / PSOs
  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const coList = (activeCOs && activeCOs.length > 0) ? activeCOs : (courseAttainmentData?.outcomes || courseAttainmentData?.coAttainments || []);

  const currentBatchObj = batches.find((b) => b.id === selectedBatchId) || selectedBatch || batches[0];
  const isFinalSemCompleted = currentBatchObj?.isCompleted || currentBatchObj?.status === 'COMPLETED';

  const effectiveAttainmentViewMode = isCourseCoordinator ? 'course-attainment' : attainmentViewMode;

  // Real semester groups from database dataset
  const semesterGroups = batchDataset?.semesters || [];

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD HANDLER (EXCEL & PDF)
  // ───────────────────────────────────────────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (activeMainTab === 'attainment-reports' && effectiveAttainmentViewMode === 'course-attainment' && targetOfferingId) {
      try {
        setExportingBackendExcel(true);
        await downloadAttainmentExcel(targetOfferingId, selectedBatchId);
        return;
      } catch (err) {
        console.warn('Backend excel download error, falling back to client XLSX:', err);
      } finally {
        setExportingBackendExcel(false);
      }
    }

    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    let filename = 'Report.xlsx';
    let sheetData = [];

    if (activeMainTab === 'attainment-reports') {
      if (effectiveAttainmentViewMode === 'course-attainment') {
        const cCode = targetOffering?.courseCode || targetCourse?.code || 'Course';
        filename = `Course_Attainment_${cCode}_AY_${selectedAyFilter}.xlsx`;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`COURSE ATTAINMENT REPORT — ACADEMIC YEAR ${selectedAyFilter}`],
          [`Programme: ${currentProgramme?.code || ''} - ${currentProgramme?.name || ''}`],
          [`Course: ${cCode} - ${targetOffering?.courseName || targetCourse?.name || ''}`],
          [],
          [`1. TABLE 1: CO TO PO/PSO MAPPING MATRIX`],
          ['Sr No', 'CO Code', ...poList, ...psoList],
          ...coList.map((co, idx) => [
            idx + 1,
            co.code || co.coCode,
            ...poList.map((po) => courseAttainmentData?.mappings?.[`${co.code || co.coCode}_${po}`] || '-'),
            ...psoList.map((pso) => courseAttainmentData?.mappings?.[`${co.code || co.coCode}_${pso}`] || '-'),
          ]),
          [],
          [`2. TABLE 2: PO & PSO ATTAINMENT VALUES`],
          ['Course Code', ...poList, ...psoList],
          [cCode, ...poList.map((po) => courseAttainmentData?.poAttainments?.[po] || '-'), ...psoList.map((pso) => courseAttainmentData?.psoAttainments?.[pso] || '-')],
        ];
      } else {
        filename = `Programme_Attainment_${currentProgramme?.code || 'Prog'}_${currentBatchObj?.name || 'Batch'}.xlsx`;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`PROGRAMME ATTAINMENT BATCH REPORT — ${currentBatchObj?.name || ''}`],
          [`Programme: ${currentProgramme?.code || ''} - ${currentProgramme?.name || ''}`],
          [`Report Type: ${batchReportType.toUpperCase().replace(/-/g, ' ')}`],
          [],
          ['Sem', 'Course Code', 'Course Name', ...poList, ...psoList],
        ];

        semesterGroups.forEach((group) => {
          (group.courses || []).forEach((c, cIdx) => {
            sheetData.push([
              cIdx === 0 ? group.semesterName || `Sem ${group.semester}` : '',
              c.code || c.courseCode,
              c.name || c.courseName,
              ...poList.map((po) => c.poAttainments?.[po] || '-'),
              ...psoList.map((pso) => c.psoAttainments?.[pso] || '-'),
            ]);
          });
        });
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
    XLSX.writeFile(wb, filename);
  };

  const handleDownloadPdfBackend = async () => {
    if (targetOfferingId) {
      try {
        setExportingBackendPdf(true);
        await downloadAttainmentPdf(targetOfferingId, selectedBatchId);
      } catch (err) {
        alert('Failed to generate backend PDF: ' + (err.message || 'Error'));
      } finally {
        setExportingBackendPdf(false);
      }
    } else {
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '48px' }}>
      {/* ── TOP HEADER & ROLE-BASED SELECTOR BAR ─────────────────────────────── */}
      <div
        className="print:hidden"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Academic Governance &nbsp;·&nbsp; Consolidated Reports
            </div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Reports Hub
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
              Unified attainment and Action Taken Reports (ATR) for OBE NBA auditing.
            </p>
          </div>

          {/* Actions: Download & Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={exportingBackendExcel}
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                opacity: exportingBackendExcel ? 0.7 : 1,
              }}
            >
              <FileSpreadsheet size={15} /> {exportingBackendExcel ? 'Exporting...' : 'Download Excel'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdfBackend}
              disabled={exportingBackendPdf}
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                opacity: exportingBackendPdf ? 0.7 : 1,
              }}
            >
              <FileText size={15} /> {exportingBackendPdf ? 'Generating PDF...' : 'Export PDF'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                height: '38px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'inherit',
              }}
            >
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* Dynamic Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
          {/* 1. PROGRAMME SELECTOR (Only for HOD & Director) */}
          {isHodOrDirector && (
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <label htmlFor="reports-programme-select" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Select Programme
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="reports-programme-select"
                  aria-label="Select Programme"
                  value={activeProgId || ''}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  style={{
                    height: '38px',
                    width: '100%',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#0f172a',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 30px 0 12px',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          {/* 2. COURSE / OFFERING SELECTOR */}
          <div style={{ minWidth: '260px', flex: '1 1 260px' }}>
            <label htmlFor="reports-course-select" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Select Course Offering
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="reports-course-select"
                aria-label="Select Course"
                value={targetOfferingId || ''}
                onChange={() => {}}
                style={{
                  height: '38px',
                  width: '100%',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#4f46e5',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 30px 0 12px',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {courseOfferings.length > 0 ? (
                  courseOfferings.map((co) => (
                    <option key={co.id} value={co.id}>{co.courseCode || co.code} — {co.courseName || co.name}</option>
                  ))
                ) : courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))
                ) : (
                  <option value="">No courses available</option>
                )}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* 3. BATCH SELECTOR */}
          <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
            <label htmlFor="reports-batch-select" style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Target Batch (Cohort)
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="reports-batch-select"
                aria-label="Target Batch"
                value={selectedBatchId || ''}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                style={{
                  height: '38px',
                  width: '100%',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 28px 0 12px',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name || `${b.startYear} - ${b.endYear}`}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. MAIN TAB STRIP (Attainment Reports vs ATR Reports) ───────────── */}
      <div
        className="print:hidden"
        style={{
          display: 'flex',
          gap: '10px',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '20px',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveMainTab('attainment-reports')}
          style={{
            padding: '10px 24px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            background: activeMainTab === 'attainment-reports' ? '#ffffff' : 'transparent',
            color: activeMainTab === 'attainment-reports' ? '#4f46e5' : '#64748b',
            boxShadow: activeMainTab === 'attainment-reports' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <FileSpreadsheet size={16} /> Attainment Reports
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('atr-reports')}
          style={{
            padding: '10px 24px',
            borderRadius: '9px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            background: activeMainTab === 'atr-reports' ? '#ffffff' : 'transparent',
            color: activeMainTab === 'atr-reports' ? '#4f46e5' : '#64748b',
            boxShadow: activeMainTab === 'atr-reports' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} /> ATR Reports
        </button>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: ATTAINMENT REPORTS TAB                                   */}
      {/* =================================================================== */}
      {activeMainTab === 'attainment-reports' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {!isCourseCoordinator && (
            <div
              className="print:hidden"
              style={{
                display: 'flex',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '6px',
                borderRadius: '10px',
                width: 'fit-content',
              }}
            >
              <button
                type="button"
                onClick={() => setAttainmentViewMode('course-attainment')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: attainmentViewMode === 'course-attainment' ? '#eef2ff' : 'transparent',
                  color: attainmentViewMode === 'course-attainment' ? '#4f46e5' : '#64748b',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Calendar size={14} /> Course Attainment
              </button>

              <button
                type="button"
                onClick={() => setAttainmentViewMode('programme-attainment')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: attainmentViewMode === 'programme-attainment' ? '#eef2ff' : 'transparent',
                  color: attainmentViewMode === 'programme-attainment' ? '#4f46e5' : '#64748b',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={14} /> Programme Attainment (By Batch)
              </button>
            </div>
          )}

          {/* MODE A: COURSE ATTAINMENT */}
          {effectiveAttainmentViewMode === 'course-attainment' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                    Course Attainment Report
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {targetOffering?.courseCode || targetCourse?.code} &nbsp;—&nbsp; {targetOffering?.courseName || targetCourse?.name}
                  </p>
                </div>
              </div>

              {loadingCourseAttainment ? (
                <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <RefreshCw size={24} className="spin" style={{ color: '#4f46e5', marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Loading course attainment dataset from database...</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Table 1: PO & PSO Attainment Values */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        PO &amp; PSO Attainment Values (Authoritative Calculation)
                      </h4>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="audit-data-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: '140px' }}>Course Code</th>
                            {poList.map((po) => (
                              <th key={po} style={{ textAlign: 'center' }}>{po}</th>
                            ))}
                            {psoList.map((pso) => (
                              <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: '800', color: '#4f46e5' }}>{targetOffering?.courseCode || targetCourse?.code || 'Course'}</td>
                            {poList.map((po) => {
                              const val = courseAttainmentData?.poAttainments?.[po] ?? '-';
                              return (
                                <td key={po} style={{ textAlign: 'center', fontWeight: '800', color: val !== '-' && Number(val) >= 2.0 ? '#16a34a' : '#d97706' }}>
                                  {val}
                                </td>
                              );
                            })}
                            {psoList.map((pso) => {
                              const val = courseAttainmentData?.psoAttainments?.[pso] ?? '-';
                              return (
                                <td key={pso} style={{ textAlign: 'center', fontWeight: '800', color: val !== '-' && Number(val) >= 2.0 ? '#16a34a' : '#d97706', background: '#f0fdf4' }}>
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE B: PROGRAMME ATTAINMENT (By Batch) */}
          {!isCourseCoordinator && effectiveAttainmentViewMode === 'programme-attainment' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Select Type of Batch Report ({currentBatchObj?.name || 'Selected Batch'})
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'average-mapping', label: '1. Average Mapping' },
                    { id: 'average-attainment-direct', label: '2. Average Attainment Direct' },
                    { id: 'average-attainment-indirect', label: '3. Average Attainment Indirect' },
                    { id: 'overall-attainment', label: '4. Overall Attainment' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBatchReportType(type.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '7px',
                        border: batchReportType === type.id ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: batchReportType === type.id ? '#eef2ff' : '#ffffff',
                        color: batchReportType === type.id ? '#4f46e5' : '#475569',
                        fontFamily: 'inherit',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingBatchDataset ? (
                <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <RefreshCw size={24} className="spin" style={{ color: '#4f46e5', marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Loading Programme Batch dataset from database...</div>
                </div>
              ) : semesterGroups.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <AlertCircle size={32} style={{ color: '#d97706', marginBottom: '10px' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>No Batch Attainment Records Found</h4>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Course offerings and attainment data for batch <strong>{currentBatchObj?.name || 'Selected'}</strong> have not been calculated yet.
                  </p>
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      {batchReportType.replace(/-/g, ' ').toUpperCase()} — {currentBatchObj?.name}
                    </h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="audit-data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '160px' }}>Sem</th>
                          <th style={{ width: '120px' }}>Course Code</th>
                          <th style={{ minWidth: '240px' }}>Course Name</th>
                          {poList.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                          {psoList.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {semesterGroups.map((group) => (
                          <React.Fragment key={group.semesterName || group.semester}>
                            {(group.courses || []).map((c, cIdx) => (
                              <tr key={c.code || c.courseCode || cIdx}>
                                {cIdx === 0 && (
                                  <td
                                    rowSpan={group.courses.length}
                                    style={{
                                      textAlign: 'center',
                                      verticalAlign: 'middle',
                                      fontWeight: '800',
                                      color: '#334155',
                                      background: '#f8fafc',
                                      borderRight: '1.5px solid #e2e8f0',
                                    }}
                                  >
                                    {group.semesterName || `Sem ${group.semester}`}
                                  </td>
                                )}
                                <td style={{ fontWeight: '800', color: '#4f46e5' }}>{c.code || c.courseCode}</td>
                                <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{c.name || c.courseName}</td>
                                {poList.map((po) => (
                                  <td key={po} style={{ textAlign: 'center', fontWeight: '700' }}>
                                    {c.poAttainments?.[po] ?? c.mappingAverages?.[po] ?? '-'}
                                  </td>
                                ))}
                                {psoList.map((pso) => (
                                  <td key={pso} style={{ textAlign: 'center', fontWeight: '700', color: '#047857', background: '#f0fdf4' }}>
                                    {c.psoAttainments?.[pso] ?? c.mappingAverages?.[pso] ?? '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 2: ATR REPORTS TAB                                         */}
      {/* =================================================================== */}
      {activeMainTab === 'atr-reports' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {!isCourseCoordinator && (
            <div
              className="print:hidden"
              style={{
                display: 'flex',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '6px',
                borderRadius: '10px',
                width: 'fit-content',
              }}
            >
              <button
                type="button"
                onClick={() => setAtrSubTab('course-atr')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: atrSubTab === 'course-atr' ? '#eef2ff' : 'transparent',
                  color: atrSubTab === 'course-atr' ? '#4f46e5' : '#64748b',
                  fontFamily: 'inherit',
                }}
              >
                <FileText size={14} /> 1. Course ATR
              </button>

              <button
                type="button"
                onClick={() => setAtrSubTab('programme-atr')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: atrSubTab === 'programme-atr' ? '#eef2ff' : 'transparent',
                  color: atrSubTab === 'programme-atr' ? '#4f46e5' : '#64748b',
                  fontFamily: 'inherit',
                }}
              >
                <Layers size={14} /> 2. Programme ATR
              </button>
            </div>
          )}

          {(isCourseCoordinator || atrSubTab === 'course-atr') && (
            <CourseATR hideFooter={true} hideHeader={true} courseId={targetOfferingId} />
          )}

          {!isCourseCoordinator && atrSubTab === 'programme-atr' && (
            <ProgrammeATR hideFooter={true} hideHeader={true} courseId={targetOfferingId} />
          )}
        </div>
      )}
    </div>
  );
}
