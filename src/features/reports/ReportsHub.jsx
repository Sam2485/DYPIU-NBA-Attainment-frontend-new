import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import CourseATR from '../atr/CourseATR';
import ProgrammeATR from '../atr/ProgrammeATR';
import * as XLSX from 'xlsx';

// ── Default Batches Option List ──────────────────────────────────────────────
const DEFAULT_BATCHES = [
  { id: 'batch-2022-26', name: 'Batch 2022–26 (Graduated / Completed)', isCompleted: true, endYear: 2026 },
  { id: 'batch-2023-27', name: 'Batch 2023–27 (Final Year / Sem 7 & 8)', isCompleted: true, endYear: 2027 },
  { id: 'batch-2024-28', name: 'Batch 2024–28 (3rd Year / Sem 5 & 6)', isCompleted: false, endYear: 2028 },
  { id: 'batch-2025-29', name: 'Batch 2025–29 (2nd Year / Sem 3 & 4)', isCompleted: false, endYear: 2029 },
];

// ── Semester Groups for Programme Attainment (Average Mapping & Direct) ─────
const SEMESTER_GROUPS = [
  {
    semLabel: 'FE Sem - I',
    courses: [
      { code: '310241', name: 'Engineering Mathematics - I' },
      { code: '310242', name: 'Physics for Computing' },
    ],
  },
  {
    semLabel: 'FE Sem - II',
    courses: [
      { code: '310243', name: 'Engineering Mathematics - II' },
      { code: '310244', name: 'Programming & Problem Solving' },
    ],
  },
  {
    semLabel: 'SE Sem - III',
    courses: [
      { code: '310245', name: 'Data Structures & Algorithms' },
      { code: '310246', name: 'Object Oriented Programming' },
    ],
  },
  {
    semLabel: 'SE Sem - IV',
    courses: [
      { code: '310247', name: 'Computer Graphics' },
      { code: '310248', name: 'Microprocessor Architecture' },
    ],
  },
  {
    semLabel: 'TE Sem - V',
    courses: [
      { code: '310249', name: 'Database Management Systems' },
      { code: '310250', name: 'Computer Networks & Security' },
    ],
  },
  {
    semLabel: 'TE Sem - VI',
    courses: [
      { code: '310251', name: 'Theory of Computation' },
      { code: '310252', name: 'Software Engineering & Project' },
    ],
  },
  {
    semLabel: 'BE Sem - VII',
    courses: [
      { code: '310253', name: 'Design & Analysis of Algorithms' },
      { code: '310254', name: 'Cloud Computing & DevOps' },
    ],
  },
  {
    semLabel: 'BE Sem - VIII',
    courses: [
      { code: '310255', name: 'Machine Learning & AI' },
      { code: '310256', name: 'Capstone Project Phase II' },
    ],
  },
];

export default function ReportsHub() {
  const { role } = useAuth();
  const {
    academicYear = '2025-26',
    availableYears = ['2026-27', '2025-26', '2024-25'],
    programmeId = 'prog-1',
    setProgrammeId = () => {},
    masterProgrammes = [],
    courseId = 'crs-1',
    setCourseId = () => {},
    selectedProgramme,
    selectedCourse,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    availableCourses = [],
    courses = [],
    batches = [],
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
  // Course Coordinator sees only 'course-attainment'
  const [attainmentViewMode, setAttainmentViewMode] = useState('course-attainment');

  // ── 3. ATR SUB-TAB: 'course-atr' | 'programme-atr' ──────────────────────────
  const [atrSubTab, setAtrSubTab] = useState('course-atr');

  // ── 4. FILTERS STATE ────────────────────────────────────────────────────────
  const [selectedAyFilter, setSelectedAyFilter] = useState(academicYear || '2025-26');
  const [selectedBatchId, setSelectedBatchId] = useState('batch-2023-27');
  const [batchReportType, setBatchReportType] = useState('average-mapping'); // 'average-mapping' | 'average-attainment-direct' | 'average-attainment-indirect' | 'overall-attainment'

  // Dynamic Lists
  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const coList = activeCOs.length > 0 ? activeCOs : [
    { code: 'CO1', statement: 'Understand fundamental algorithms and theoretical concepts.' },
    { code: 'CO2', statement: 'Analyze computational complexity and data structure efficiency.' },
    { code: 'CO3', statement: 'Design software modules using object-oriented principles.' },
    { code: 'CO4', statement: 'Implement database connectivity and backend API protocols.' },
    { code: 'CO5', statement: 'Conduct system verification and automated unit testing.' },
  ];

  const currentProgramme = selectedProgramme || masterProgrammes[0] || { code: 'BE-COMP', name: 'B.Tech Computer Science & Engineering' };
  const allProgrammeCourses = (availableCourses.length > 0 ? availableCourses : courses).filter(
    (c) => !c.programmeId || c.programmeId === currentProgramme.id || c.programmeId === programmeId
  );

  const currentCourseObj = selectedCourse || allProgrammeCourses[0] || { code: '310244', name: 'Computer Network and Security', id: 'crs-1' };

  // Batches
  const batchList = batches.length > 0 ? batches : DEFAULT_BATCHES;
  const currentBatchObj = batchList.find((b) => b.id === selectedBatchId) || batchList[0];
  const isFinalSemCompleted = currentBatchObj?.isCompleted || currentBatchObj?.name?.includes('Completed') || currentBatchObj?.name?.includes('Graduated') || currentBatchObj?.name?.includes('2023–27') || currentBatchObj?.name?.includes('2022–26');

  // Effective Attainment View Mode (Force Course Coordinator to 'course-attainment')
  const effectiveAttainmentViewMode = isCourseCoordinator ? 'course-attainment' : attainmentViewMode;

  // ───────────────────────────────────────────────────────────────────────────
  // DOWNLOAD HANDLER (EXCEL)
  // ───────────────────────────────────────────────────────────────────────────
  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    let filename = 'Report.xlsx';
    let sheetData = [];

    if (activeMainTab === 'attainment-reports') {
      if (effectiveAttainmentViewMode === 'course-attainment') {
        filename = `Course_Attainment_${currentCourseObj.code}_AY_${selectedAyFilter}.xlsx`;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`COURSE ATTAINMENT REPORT — ACADEMIC YEAR ${selectedAyFilter}`],
          [`Programme: ${currentProgramme.code} - ${currentProgramme.name}`],
          [`Course: ${currentCourseObj.code} - ${currentCourseObj.name}`],
          [],
          [`1. TABLE 1: CO TO PO/PSO MAPPING MATRIX`],
          ['Sr No', 'CO Code', ...poList, ...psoList],
          ...coList.map((co, idx) => [
            idx + 1,
            co.code,
            ...poList.map((po) => (po === 'PO1' || po === 'PO2' ? 3 : po === 'PO3' ? 2 : 1)),
            ...psoList.map((pso) => (pso === 'PSO1' ? 3 : 2)),
          ]),
          ['', 'Average Mapping Strength', ...poList.map(() => 2.17), ...psoList.map(() => 2.0)],
          [],
          [`2. TABLE 2: PO & PSO ATTAINMENT VALUES`],
          ['Course Code', ...poList, ...psoList],
          [currentCourseObj.code, ...poList.map(() => 1.83), ...psoList.map(() => 1.70)],
          [],
          [`3. TABLE 3: CO ATTAINMENT (DIRECT + INDIRECT)`],
          ['Assessment Type', 'Metric', ...coList.map((co) => co.code)],
          ['Direct Examination', '% Students ≥ Threshold (60%)', ...coList.map(() => '60%')],
          ['Direct Examination', 'Direct Attainment Level (0-3)', ...coList.map(() => 2.8)],
          ['Indirect Survey', '% Positive Feedback Rating', ...coList.map(() => '82%')],
          ['Indirect Survey', 'Indirect Attainment Level (0-3)', ...coList.map(() => 2.5)],
          ['Combined CO Attainment', '(80% Direct + 20% Indirect)', ...coList.map(() => 2.74)],
        ];
      } else {
        filename = `Programme_Attainment_${currentProgramme.code}_${currentBatchObj.name}.xlsx`;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`PROGRAMME ATTAINMENT BATCH REPORT — ${currentBatchObj.name}`],
          [`Programme: ${currentProgramme.code} - ${currentProgramme.name}`],
          [`Report Type: ${batchReportType.toUpperCase().replace(/-/g, ' ')}`],
          [],
          ['Sem', 'Course Code', 'Course Name', ...poList, ...psoList],
        ];

        SEMESTER_GROUPS.forEach((group, gIdx) => {
          group.courses.forEach((c, cIdx) => {
            sheetData.push([
              cIdx === 0 ? group.semLabel : '',
              c.code,
              c.name,
              ...poList.map((_, pIdx) => (batchReportType === 'average-mapping' ? (2.0 + ((pIdx + cIdx + gIdx) % 3) * 0.33).toFixed(2) : (1.75 + ((pIdx + cIdx + gIdx) % 4) * 0.15).toFixed(2))),
              ...psoList.map((_, pIdx) => (batchReportType === 'average-mapping' ? (2.0 + ((pIdx + cIdx + gIdx) % 2) * 0.50).toFixed(2) : (1.80 + ((pIdx + cIdx + gIdx) % 2) * 0.20).toFixed(2))),
            ]);
          });
        });
      }
    } else {
      const typeLabel = atrSubTab === 'course-atr' ? 'Course_ATR' : 'Programme_ATR';
      filename = `${typeLabel}_${currentCourseObj.code}_AY_${selectedAyFilter}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`ACTION TAKEN REPORT (ATR) — AY ${selectedAyFilter}`],
        [`Programme: ${currentProgramme.code}`],
        [`Course: ${currentCourseObj.code} - ${currentCourseObj.name}`],
        [],
        ['CO/PO Code', 'Target Level', 'Attainment Level', '% Achieved', 'Target Status', 'Observation & Action Taken'],
        ...coList.map((co, idx) => [
          co.code,
          2.50,
          idx % 2 === 0 ? 2.80 : 2.10,
          idx % 2 === 0 ? '112.0%' : '84.0%',
          idx % 2 === 0 ? 'Target Met' : 'Gap',
          idx % 2 === 0 ? 'Target achieved. Maintain current pedagogy.' : 'Increase practical hands-on problem sets.',
        ]),
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
    XLSX.writeFile(wb, filename);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleDownloadExcel}
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
              }}
            >
              <FileSpreadsheet size={15} /> Download Excel
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
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Select Programme
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={programmeId}
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
                  {masterProgrammes.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          {/* 2. COURSE SELECTOR (For All Roles) */}
          <div style={{ minWidth: '260px', flex: '1 1 260px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isHodOrDirector ? 'Select Course (of Programme)' : 'Select Course'}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={courseId || ''}
                onChange={(e) => setCourseId(e.target.value)}
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
                {allProgrammeCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* 3. ACADEMIC YEAR SELECTOR (Visible for AY Attainment mode or ATR Reports) */}
          {(activeMainTab === 'atr-reports' || effectiveAttainmentViewMode === 'course-attainment') && (
            <div style={{ width: '160px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Academic Year
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedAyFilter}
                  onChange={(e) => setSelectedAyFilter(e.target.value)}
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
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          {/* 4. BATCH SELECTOR (Visible when in Programme Attainment mode) */}
          {activeMainTab === 'attainment-reports' && effectiveAttainmentViewMode === 'programme-attainment' && (
            <div style={{ minWidth: '240px', flex: '1 1 240px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Target Batch
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedBatchId}
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
                  {batchList.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          )}
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
          
          {/* Sub-Mode Toggle Bar (Course Attainment vs Programme Attainment) */}
          {/* Shown for Programme Coordinator, HOD, Director. Hidden for Course Coordinator. */}
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
                <Calendar size={14} /> Course Attainment (By Academic Year)
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

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE A: COURSE ATTAINMENT (By Academic Year)                     */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {effectiveAttainmentViewMode === 'course-attainment' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Header Info Bar */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                    Course Attainment Report — AY {selectedAyFilter}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {currentCourseObj.code} &nbsp;—&nbsp; {currentCourseObj.name} ({currentProgramme.code})
                  </p>
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: '700', background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '6px' }}>
                  AY {selectedAyFilter}
                </span>
              </div>

              {/* TABLE 1: CO to PO/PSO Mapping & Attainment Matrix */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    1. Table 1: Combined Mapping of CO to PO / PSO
                  </h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="audit-data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>CO Code</th>
                        {poList.map((po) => (
                          <th key={po} style={{ width: '55px', textAlign: 'center' }}>{po}</th>
                        ))}
                        {psoList.map((pso) => (
                          <th key={pso} style={{ width: '60px', textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {coList.map((co, idx) => (
                        <tr key={co.code}>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ textAlign: 'center', fontWeight: '800', color: '#4f46e5' }}>{co.code}</td>
                          {poList.map((po, pIdx) => {
                            const val = (pIdx + idx) % 3 === 0 ? 3 : (pIdx + idx) % 2 === 0 ? 2 : 1;
                            return (
                              <td key={po} style={{ textAlign: 'center', fontWeight: '700', color: '#334155' }}>
                                {val}
                              </td>
                            );
                          })}
                          {psoList.map((pso, pIdx) => {
                            const val = (pIdx + idx) % 2 === 0 ? 3 : 2;
                            return (
                              <td key={pso} style={{ textAlign: 'center', fontWeight: '700', color: '#047857', background: '#f0fdf4' }}>
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                        <td colSpan={2} style={{ textAlign: 'right', paddingRight: '16px', color: '#0f172a' }}>
                          Average Mapping Strength:
                        </td>
                        {poList.map((po) => (
                          <td key={po} style={{ textAlign: 'center', color: '#4f46e5' }}>2.17</td>
                        ))}
                        {psoList.map((pso) => (
                          <td key={pso} style={{ textAlign: 'center', color: '#047857', background: '#e6f4ea' }}>2.00</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE 2: PO Attainment Values */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    2. Table 2: PO & PSO Attainment Values (Direct Attainment)
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
                        <td style={{ fontWeight: '800', color: '#4f46e5' }}>{currentCourseObj.code}</td>
                        {poList.map((po, idx) => {
                          const val = Number((1.75 + (idx % 4) * 0.15).toFixed(2));
                          return (
                            <td key={po} style={{ textAlign: 'center', fontWeight: '800', color: val >= 2.0 ? '#16a34a' : '#d97706' }}>
                              {val}
                            </td>
                          );
                        })}
                        {psoList.map((pso, idx) => {
                          const val = Number((1.80 + (idx % 2) * 0.20).toFixed(2));
                          return (
                            <td key={pso} style={{ textAlign: 'center', fontWeight: '800', color: val >= 2.0 ? '#16a34a' : '#d97706', background: '#f0fdf4' }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE 3: CO Attainment (Direct + Indirect) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    3. Table 3: CO Attainment Breakdown (Direct + Indirect)
                  </h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="audit-data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '180px' }}>Assessment Type</th>
                        <th style={{ width: '220px' }}>Metric</th>
                        {coList.map((co) => (
                          <th key={co.code} style={{ textAlign: 'center' }}>{co.code}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: '700', color: '#334155' }}>Direct Examination</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>% Students ≥ Threshold (60%)</td>
                        {coList.map((co) => <td key={co.code} style={{ textAlign: 'center', fontWeight: '700' }}>65.0%</td>)}
                      </tr>
                      <tr>
                        <td style={{ fontWeight: '700', color: '#334155' }}>Direct Examination</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>Direct Attainment Level (0–3)</td>
                        {coList.map((co) => <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#4f46e5' }}>2.80</td>)}
                      </tr>
                      <tr style={{ background: '#fafafa' }}>
                        <td style={{ fontWeight: '700', color: '#334155' }}>Indirect Survey</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>% Positive Feedback Rating</td>
                        {coList.map((co) => <td key={co.code} style={{ textAlign: 'center', fontWeight: '700' }}>82.0%</td>)}
                      </tr>
                      <tr style={{ background: '#fafafa' }}>
                        <td style={{ fontWeight: '700', color: '#334155' }}>Indirect Survey</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>Indirect Attainment Level (0–3)</td>
                        {coList.map((co) => <td key={co.code} style={{ textAlign: 'center', fontWeight: '800', color: '#059669' }}>2.50</td>)}
                      </tr>
                      <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                        <td style={{ color: '#3730a3' }}>Combined CO Attainment</td>
                        <td style={{ fontSize: '12px', color: '#4338ca' }}>(80% Direct + 20% Indirect)</td>
                        {coList.map((co) => <td key={co.code} style={{ textAlign: 'center', color: '#4338ca', fontSize: '13.5px' }}>2.74</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE B: PROGRAMME ATTAINMENT (By Batch)                          */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {!isCourseCoordinator && effectiveAttainmentViewMode === 'programme-attainment' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Batch Report Type Selector Pills */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Select Type of Batch Report ({currentBatchObj.name})
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
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. AVERAGE MAPPING */}
              {batchReportType === 'average-mapping' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      Average CO to PO/PSO Mapping — {currentBatchObj.name} (All Completed Semesters)
                    </h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="audit-data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '130px' }}>Sem</th>
                          <th style={{ width: '120px' }}>Course Code</th>
                          <th>Course Name</th>
                          {poList.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                          {psoList.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {SEMESTER_GROUPS.map((group, gIdx) => (
                          <React.Fragment key={group.semLabel}>
                            <tr style={{ background: '#f1f5f9', borderTop: gIdx > 0 ? '2px solid #cbd5e1' : 'none' }}>
                              <td colSpan={3 + poList.length + psoList.length} style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px', padding: '10px 14px' }}>
                                📌 {group.semLabel}
                              </td>
                            </tr>
                            {group.courses.map((c, cIdx) => (
                              <tr key={c.code}>
                                <td style={{ fontWeight: '700', color: '#64748b', fontSize: '12px' }}>{group.semLabel}</td>
                                <td style={{ fontWeight: '800', color: '#4f46e5' }}>{c.code}</td>
                                <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{c.name}</td>
                                {poList.map((po, pIdx) => (
                                  <td key={po} style={{ textAlign: 'center', fontWeight: '700' }}>
                                    {(2.0 + ((pIdx + cIdx + gIdx) % 3) * 0.33).toFixed(2)}
                                  </td>
                                ))}
                                {psoList.map((pso, pIdx) => (
                                  <td key={pso} style={{ textAlign: 'center', fontWeight: '700', color: '#047857', background: '#f0fdf4' }}>
                                    {(2.0 + ((pIdx + cIdx + gIdx) % 2) * 0.50).toFixed(2)}
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

              {/* 2. AVERAGE ATTAINMENT DIRECT */}
              {batchReportType === 'average-attainment-direct' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      Average Direct PO Attainment — {currentBatchObj.name} (Completed Semesters)
                    </h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="audit-data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '130px' }}>Sem</th>
                          <th style={{ width: '120px' }}>Course Code</th>
                          <th>Course Name</th>
                          {poList.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                          {psoList.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {SEMESTER_GROUPS.map((group, gIdx) => (
                          <React.Fragment key={group.semLabel}>
                            <tr style={{ background: '#f1f5f9', borderTop: gIdx > 0 ? '2px solid #cbd5e1' : 'none' }}>
                              <td colSpan={3 + poList.length + psoList.length} style={{ fontWeight: '800', color: '#1e293b', fontSize: '13px', padding: '10px 14px' }}>
                                📌 {group.semLabel}
                              </td>
                            </tr>
                            {group.courses.map((c, cIdx) => (
                              <tr key={c.code}>
                                <td style={{ fontWeight: '700', color: '#64748b', fontSize: '12px' }}>{group.semLabel}</td>
                                <td style={{ fontWeight: '800', color: '#4f46e5' }}>{c.code}</td>
                                <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{c.name}</td>
                                {poList.map((po, pIdx) => {
                                  const val = Number((1.75 + ((pIdx + cIdx + gIdx) % 4) * 0.15).toFixed(2));
                                  return (
                                    <td key={po} style={{ textAlign: 'center', fontWeight: '800', color: val >= 2.0 ? '#16a34a' : '#d97706' }}>
                                      {val}
                                    </td>
                                  );
                                })}
                                {psoList.map((pso, pIdx) => {
                                  const val = Number((1.80 + ((pIdx + cIdx + gIdx) % 2) * 0.20).toFixed(2));
                                  return (
                                    <td key={pso} style={{ textAlign: 'center', fontWeight: '800', color: val >= 2.0 ? '#16a34a' : '#d97706', background: '#f0fdf4' }}>
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. AVERAGE ATTAINMENT INDIRECT */}
              {batchReportType === 'average-attainment-indirect' && (
                <div>
                  {!isFinalSemCompleted ? (
                    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                      <Clock size={36} style={{ color: '#d97706', marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#92400e', fontWeight: '800' }}>
                        Not Available Yet
                      </h4>
                      <p style={{ margin: '8px auto 0', fontSize: '13px', color: '#b45309', maxWidth: '520px', lineHeight: '1.5' }}>
                        Indirect attainment survey data is compiled at the conclusion of the final semester (Semester 8) of the batch. This batch (<strong>{currentBatchObj.name}</strong>) is currently in progress.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          Average Indirect PO Attainment — {currentBatchObj.name} (Final Exit Surveys)
                        </h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="audit-data-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: '180px' }}>Survey Metric</th>
                              {poList.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                              {psoList.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5' }}>{pso}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#334155' }}>Graduate Exit Survey (0-3)</td>
                              {poList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '800', color: '#059669' }}>2.50</td>)}
                              {psoList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '800', color: '#059669', background: '#f0fdf4' }}>2.40</td>)}
                            </tr>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#334155' }}>Alumni & Employer Rating</td>
                              {poList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '800', color: '#059669' }}>2.60</td>)}
                              {psoList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '800', color: '#059669', background: '#f0fdf4' }}>2.55</td>)}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. OVERALL ATTAINMENT */}
              {batchReportType === 'overall-attainment' && (
                <div>
                  {!isFinalSemCompleted ? (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                      <AlertCircle size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#991b1b', fontWeight: '800' }}>
                        Not Generated Yet!
                      </h4>
                      <p style={{ margin: '8px auto 0', fontSize: '13px', color: '#7f1d1d', maxWidth: '520px', lineHeight: '1.5' }}>
                        Overall Attainment (80% Direct + 20% Indirect) is calculated upon completion of the final semester of the batch once all direct and indirect assessment data are submitted.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          Overall Batch PO & PSO Attainment (80% Direct + 20% Indirect) — {currentBatchObj.name}
                        </h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="audit-data-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: '220px' }}>Attainment Stream</th>
                              {poList.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                              {psoList.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5' }}>{pso}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#334155' }}>Direct Attainment (80%)</td>
                              {poList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '700' }}>2.10</td>)}
                              {psoList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '700', background: '#f0fdf4' }}>2.00</td>)}
                            </tr>
                            <tr>
                              <td style={{ fontWeight: '700', color: '#334155' }}>Indirect Attainment (20%)</td>
                              {poList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '700' }}>2.50</td>)}
                              {psoList.map(() => <td key={Math.random()} style={{ textAlign: 'center', fontWeight: '700', background: '#f0fdf4' }}>2.40</td>)}
                            </tr>
                            <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                              <td style={{ color: '#3730a3', fontSize: '13.5px' }}>Overall Attainment Score</td>
                              {poList.map(() => <td key={Math.random()} style={{ textAlign: 'center', color: '#4338ca', fontSize: '14px' }}>2.18</td>)}
                              {psoList.map(() => <td key={Math.random()} style={{ textAlign: 'center', color: '#047857', background: '#dcfce7', fontSize: '14px' }}>2.08</td>)}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
          
          {/* ATR Sub-Tab Navigation */}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={14} /> 2. Programme ATR
            </button>
          </div>

          {/* ATR SUB-TAB 1: COURSE ATR */}
          {atrSubTab === 'course-atr' && (
            <CourseATR hideFooter={true} hideHeader={true} courseId={courseId} />
          )}

          {/* ATR SUB-TAB 2: PROGRAMME ATR */}
          {atrSubTab === 'programme-atr' && (
            <ProgrammeATR hideFooter={true} hideHeader={true} courseId={courseId} />
          )}

        </div>
      )}

    </div>
  );
}
