import React, { useEffect, useMemo, useState } from 'react';
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
import COAttainmentEngine from '../coAttainment/COAttainmentEngine';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import * as XLSX from 'xlsx';
import { reportsApi } from '../../api/reports';

// ── Default Batches Option List ──────────────────────────────────────────────
const DEFAULT_BATCHES = [
  { id: 'batch-2022-26', name: 'Batch 2022–26 (Graduated / Completed)', isCompleted: true, endYear: 2026 },
  { id: 'batch-2023-27', name: 'Batch 2023–27 (Final Year / Sem 7 & 8)', isCompleted: true, endYear: 2027 },
  { id: 'batch-2024-28', name: 'Batch 2024–28 (3rd Year / Sem 5 & 6)', isCompleted: false, endYear: 2028 },
  { id: 'batch-2025-29', name: 'Batch 2025–29 (2nd Year / Sem 3 & 4)', isCompleted: false, endYear: 2029 },
];

const unwrapReportData = (response) => response?.data?.data ?? response?.data ?? response;
const codeOrder = (left, right) => String(left).localeCompare(String(right), undefined, { numeric: true });
const valueOrDash = (value) => value === null || value === undefined || value === '' ? '—' : Number.isFinite(Number(value)) ? Number(value).toFixed(2) : value;
const responseValue = (response, outcomeCode) => {
  const sources = [response?.poRatings, response?.psoRatings, response?.outcomeResponses, response?.poPsoResponses, response?.responses, response?.ratings, response?.poValues, response?.psoValues];
  for (const source of sources) {
    if (source?.[outcomeCode] !== undefined) return source[outcomeCode];
  }
  return '—';
};
const scoreMap = (scores, codeKey) => Object.fromEntries(
  (Array.isArray(scores)
    ? scores.map((item) => [item?.[codeKey], item?.indirectAttainment ?? item?.averageAttainment ?? item?.score])
    : Object.entries(scores || {})
  ).filter(([code]) => Boolean(code))
);

export default function ReportsHub() {
  const { user, role } = useAuth();
  const {
    programmeId = null,
    setProgrammeId = () => {},
    masterProgrammes = [],
    courseId = null,
    setCourseId = () => {},
    selectedProgramme = null,
    selectedCourse = null,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    availableCourses = [],
    courses = [],
    batches = [],
    batchId,
    academicYear = '',
    courseOfferings = [],
    selectedCourseOffering,
    courseOfferingId,
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    loadCourseOfferings = () => Promise.resolve([]),
    selectCourseOffering = () => {},
  } = useAcademic();

  // Role Checks
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const isProgrammeCoordinator = role === 'PROGRAMME_COORDINATOR';
  const isHod = role === 'HOD';
  const isDirector = role === 'DIRECTOR' || role === 'SCHOOL_DIRECTOR' || role === 'IQAC';
  const isHodOrDirector = isHod || isDirector;
  const reportSelectionStorageKey = (selection) =>
    `nba_reports_selected_${selection}:${role}:${user?.email ?? user?.id ?? 'current-user'}`;
  const readReportSelection = (selection) => (
    typeof window === 'undefined' ? '' : sessionStorage.getItem(reportSelectionStorageKey(selection)) ?? ''
  );
  const [hodProgrammes, setHodProgrammes] = useState([]);
  const [hodBatches, setHodBatches] = useState([]);
  const [coordinatorBatches, setCoordinatorBatches] = useState([]);
  const [directorProgrammes, setDirectorProgrammes] = useState([]);
  const [directorBatches, setDirectorBatches] = useState([]);

  useEffect(() => {
    if (programmeId || typeof window === 'undefined') return;
    const persistedProgrammeId = sessionStorage.getItem(reportSelectionStorageKey('master_programme'));
    if (persistedProgrammeId) setProgrammeId(persistedProgrammeId);
  }, [programmeId, role, setProgrammeId, user?.email, user?.id]);
  const assignedOfferings = useMemo(
    () => courseOfferings.filter((offering) => String(offering.batchId ?? offering.programmeBatchId) === String(batchId)),
    [batchId, courseOfferings],
  );

  useEffect(() => {
    if (!isCourseCoordinator || !batchId) return;
    // The coordinator-scoped programme-batch-courses endpoint returns only
    // courses assigned to the signed-in Course Coordinator. The offering ID
    // (`id`) is kept as the report scope for every course-level request.
    loadCourseOfferings(batchId).then((offerings) => {
      const selectedStillAssigned = (offerings ?? []).some(
        (offering) => String(offering.id) === String(courseOfferingId)
      );
      if (!selectedStillAssigned && offerings?.[0]) selectCourseOffering(offerings[0]);
    }).catch(() => {});
  }, [batchId, courseOfferingId, isCourseCoordinator, loadCourseOfferings, selectCourseOffering]);

  // Role-based Programmes List
  const roleProgrammes = (() => {
    if (isDirector) {
      // Director sees every programme in their school through the explicit
      // report-filter hierarchy, rather than data left over from another view.
      return directorProgrammes;
    }
    if (isHod) return hodProgrammes;
    if (isProgrammeCoordinator) {
      // Programme Coordinator sees only assigned programmes
      const userProgId = user?.programmeId || 'prog-1';
      const filtered = masterProgrammes.filter(
        (p) =>
          p.id === userProgId ||
          (p.coordinator && user?.name && p.coordinator.toLowerCase().includes(user.name.toLowerCase()))
      );
      return filtered.length > 0 ? filtered : masterProgrammes.filter((p) => p.id === 'prog-1');
    }
    // Course Coordinator
    return masterProgrammes.filter((p) => p.id === programmeId || p.id === 'prog-1');
  })();

  // Current Programme
  const currentProgId = roleProgrammes.some((p) => p.id === programmeId)
    ? programmeId
    : roleProgrammes[0]?.id || '';

  const currentProgramme =
    roleProgrammes.find((p) => p.id === currentProgId) ||
    masterProgrammes.find((p) => p.id === currentProgId) ||
    roleProgrammes[0] ||
    selectedProgramme ||
    { id: '', code: '—', name: 'No master programme selected' };

  // All courses under currently selected programme
  const programmeCourses = courses.filter(
    (c) => !c.programmeId || c.programmeId === currentProgramme.id
  );

  // Available courses for the dropdown:
  // For Course Coordinator: faculty assigned courses under current programme
  // For PC / HOD / Director: all courses under selected programme
  const roleCourses = isCourseCoordinator
    ? (availableCourses.length > 0 ? availableCourses : programmeCourses)
    : (programmeCourses.length > 0 ? programmeCourses : courses.filter((c) => c.programmeId === currentProgramme.id));

  const allProgrammeCourses = roleCourses.length > 0 ? roleCourses : courses;

  const selectedProgrammeBatchCourse = selectedCourseOffering ? {
    ...selectedCourseOffering,
    code: selectedCourseOffering.courseCode ?? selectedCourseOffering.code,
    name: selectedCourseOffering.courseName ?? selectedCourseOffering.name,
  } : null;
  const currentCourseObj =
    (isCourseCoordinator ? selectedProgrammeBatchCourse : null) ||
    allProgrammeCourses.find((c) => c.id === courseId) ||
    allProgrammeCourses[0] ||
    { code: '—', name: 'No course selected', id: '' };

  // ── 1. MAIN TAB STATE: 'attainment-reports' | 'atr-reports' ────────────────
  const [activeMainTab, setActiveMainTab] = useState('attainment-reports');

  // ── 2. ATTAINMENT VIEW MODE: 'course-attainment' | 'programme-attainment' ────
  // Course Coordinator sees only 'course-attainment'
  const [attainmentViewMode, setAttainmentViewMode] = useState('course-attainment');

  // ── 3. ATR SUB-TAB: 'course-atr' | 'programme-atr' ──────────────────────────
  const [atrSubTab, setAtrSubTab] = useState('course-atr');

  // ── 4. FILTERS STATE ────────────────────────────────────────────────────────
  const [selectedBatchId, setSelectedBatchId] = useState(
    () => readReportSelection('programme_batch')
  );
  const [selectedReportCourseOfferingId, setSelectedReportCourseOfferingId] = useState(
    () => readReportSelection('programme_batch_course')
  );
  const [batchReportType, setBatchReportType] = useState('average-mapping'); // 'average-mapping' | 'average-attainment-direct' | 'average-attainment-indirect' | 'overall-attainment'
  const [programmeBatchReports, setProgrammeBatchReports] = useState({ mapping: null, direct: null, indirect: null });
  const [programmeBatchReportsLoading, setProgrammeBatchReportsLoading] = useState(false);
  const [programmeBatchReportErrors, setProgrammeBatchReportErrors] = useState({ mapping: '', direct: '', indirect: '' });

  // Dynamic Lists
  const poList = (activePOs || []).map((p) => p?.code || p).filter(Boolean);
  const psoList = (activePSOs || []).map((p) => p?.code || p).filter(Boolean);
  const coList = activeCOs || [];

  // Batches
  const batchList = isHod
    ? hodBatches
    : isProgrammeCoordinator
    ? coordinatorBatches
    : isDirector
    ? directorBatches
    : (batches || []);
  const effectiveBatchId = isCourseCoordinator ? batchId : selectedBatchId;
  const currentBatchObj = batchList.find((b) => b.id === effectiveBatchId) || null;
  const currentBatchName = currentBatchObj?.name || 'No programme batch selected';
  const isFinalSemCompleted = currentBatchObj?.isCompleted || currentBatchObj?.name?.includes('Completed') || currentBatchObj?.name?.includes('Graduated');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = reportSelectionStorageKey('master_programme');
    // Persist only an explicit selection. A temporary first-option fallback
    // while programme data is loading must never overwrite a saved choice.
    if (programmeId) sessionStorage.setItem(key, programmeId);
  }, [programmeId, role, user?.email, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = reportSelectionStorageKey('programme_batch');
    if (selectedBatchId) sessionStorage.setItem(key, selectedBatchId);
    else sessionStorage.removeItem(key);
  }, [role, selectedBatchId, user?.email, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = reportSelectionStorageKey('programme_batch_course');
    if (selectedReportCourseOfferingId) sessionStorage.setItem(key, selectedReportCourseOfferingId);
    else sessionStorage.removeItem(key);
  }, [role, selectedReportCourseOfferingId, user?.email, user?.id]);

  // HOD Reports follows the backend's explicit selection hierarchy rather
  // than relying on programme/batch lists populated by another screen.
  useEffect(() => {
    if (!isHod) return;
    let cancelled = false;
    reportsApi.getMasterProgrammesByDepartment(user?.departmentId)
      .then((response) => {
        if (cancelled) return;
        const programmes = unwrapReportData(response) ?? [];
        const list = Array.isArray(programmes) ? programmes : [];
        setHodProgrammes(list);
        const selectedStillAvailable = list.some((programme) => String(programme.id) === String(programmeId));
        if (!selectedStillAvailable) setProgrammeId(list[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setHodProgrammes([]);
      });
    return () => { cancelled = true; };
  }, [isHod, programmeId, setProgrammeId, user?.departmentId]);

  // Director Reports uses the school-scoped hierarchy: Programme → Batch →
  // Course. The course offerings themselves are loaded below by batch ID.
  useEffect(() => {
    if (!isDirector) return;
    let cancelled = false;
    reportsApi.getMasterProgrammesBySchool(user?.schoolId)
      .then((response) => {
        if (cancelled) return;
        const programmes = unwrapReportData(response) ?? [];
        const list = Array.isArray(programmes) ? programmes : [];
        setDirectorProgrammes(list);
        const selectedStillAvailable = list.some((programme) => String(programme.id) === String(programmeId));
        if (!selectedStillAvailable) setProgrammeId(list[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setDirectorProgrammes([]);
      });
    return () => { cancelled = true; };
  }, [isDirector, programmeId, setProgrammeId, user?.schoolId]);

  useEffect(() => {
    if (!isHod || !currentProgId) {
      if (isHod) setHodBatches([]);
      return;
    }
    let cancelled = false;
    reportsApi.getProgrammeBatchesByMasterProgramme(currentProgId)
      .then((response) => {
        if (cancelled) return;
        const programmeBatches = unwrapReportData(response) ?? [];
        const list = Array.isArray(programmeBatches) ? programmeBatches : [];
        setHodBatches(list);
        setSelectedBatchId((current) => list.some((batch) => String(batch.id) === String(current))
          ? current
          : (list[0]?.id ?? ''));
      })
      .catch(() => {
        if (!cancelled) setHodBatches([]);
      });
    return () => { cancelled = true; };
  }, [currentProgId, isHod]);

  useEffect(() => {
    if (!isDirector || !currentProgId) {
      if (isDirector) setDirectorBatches([]);
      return;
    }
    let cancelled = false;
    reportsApi.getProgrammeBatchesByMasterProgramme(currentProgId)
      .then((response) => {
        if (cancelled) return;
        const programmeBatches = unwrapReportData(response) ?? [];
        const list = Array.isArray(programmeBatches) ? programmeBatches : [];
        setDirectorBatches(list);
        setSelectedBatchId((current) => list.some((batch) => String(batch.id) === String(current))
          ? current
          : (list[0]?.id ?? ''));
      })
      .catch(() => {
        if (!cancelled) setDirectorBatches([]);
      });
    return () => { cancelled = true; };
  }, [currentProgId, isDirector]);

  useEffect(() => {
    if (!isProgrammeCoordinator || !currentProgId) {
      if (isProgrammeCoordinator) setCoordinatorBatches([]);
      return;
    }
    let cancelled = false;
    // The coordinator token scopes this endpoint to only the programme
    // batches assigned to the signed-in Programme Coordinator.
    reportsApi.getProgrammeBatchesByMasterProgramme(currentProgId)
      .then((response) => {
        if (cancelled) return;
        const programmeBatches = unwrapReportData(response) ?? [];
        const list = Array.isArray(programmeBatches) ? programmeBatches : [];
        setCoordinatorBatches(list);
        setSelectedBatchId((current) => list.some((batch) => String(batch.id) === String(current))
          ? current
          : (list[0]?.id ?? ''));
      })
      .catch(() => {
        if (!cancelled) setCoordinatorBatches([]);
      });
    return () => { cancelled = true; };
  }, [currentProgId, isProgrammeCoordinator]);

  const reportCourseOfferings = useMemo(
    () => courseOfferings.filter((offering) =>
      // The API is requested with the selected programme-batch ID, and the
      // backend enforces the user's scope. Do not discard valid offerings
      // merely because this response does not include a masterProgrammeId.
      String(offering.batchId ?? offering.programmeBatchId) === String(effectiveBatchId)
    ),
    [courseOfferings, effectiveBatchId],
  );

  useEffect(() => {
    if (isCourseCoordinator || !effectiveBatchId) return;
    loadCourseOfferings(effectiveBatchId).catch(() => {});
  }, [effectiveBatchId, isCourseCoordinator, loadCourseOfferings]);

  useEffect(() => {
    if (isCourseCoordinator || !reportCourseOfferings.length) return;
    const matchingOffering = reportCourseOfferings.find((offering) =>
      String(offering.id) === String(selectedReportCourseOfferingId)
    ) ?? reportCourseOfferings.find((offering) =>
      String(offering.courseId ?? offering.masterCourseId) === String(courseId)
    ) ?? reportCourseOfferings[0];
    if (matchingOffering && String(matchingOffering.id) !== String(selectedCourseOffering?.id)) {
      selectCourseOffering(matchingOffering);
    }
  }, [courseId, isCourseCoordinator, reportCourseOfferings, selectCourseOffering, selectedCourseOffering?.id, selectedReportCourseOfferingId]);

  useEffect(() => {
    if (selectedCourseOffering?.id) setSelectedReportCourseOfferingId(selectedCourseOffering.id);
  }, [selectedCourseOffering?.id]);

  useEffect(() => {
    if (!currentProgId || !effectiveBatchId || isCourseCoordinator) {
      setProgrammeBatchReports({ mapping: null, direct: null, indirect: null });
      setProgrammeBatchReportErrors({ mapping: '', direct: '', indirect: '' });
      return;
    }

    let cancelled = false;
    setProgrammeBatchReportsLoading(true);
    setProgrammeBatchReportErrors({ mapping: '', direct: '', indirect: '' });

    Promise.allSettled([
      reportsApi.getAverageMapping(effectiveBatchId),
      reportsApi.getAverageDirectAttainment(effectiveBatchId),
      reportsApi.getAverageIndirectAttainment(effectiveBatchId),
    ])
      .then(([mappingResult, directResult, indirectResult]) => {
        if (!cancelled) {
          const resultData = (result) => result.status === 'fulfilled' ? unwrapReportData(result.value) : null;
          const resultError = (result, fallback) => {
            if (result.status === 'fulfilled') {
              const data = unwrapReportData(result.value);
              // Some backend validation failures return HTTP 200 with
              // success:false. Treat those responses as real report errors.
              return data?.success === false ? (data.message || fallback) : '';
            }
            return result.reason?.response?.data?.message
              || result.reason?.customMessage
              || result.reason?.message
              || fallback;
          };
          setProgrammeBatchReports({
            mapping: resultData(mappingResult),
            direct: resultData(directResult),
            indirect: resultData(indirectResult),
          });
          setProgrammeBatchReportErrors({
            mapping: resultError(mappingResult, 'Unable to load the average mapping report.'),
            direct: resultError(directResult, 'Unable to load the average direct attainment report.'),
            indirect: resultError(indirectResult, 'Unable to load the average indirect attainment report.'),
          });
        }
      })
      .finally(() => {
        if (!cancelled) setProgrammeBatchReportsLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentProgId, effectiveBatchId, isCourseCoordinator]);

  const buildProgrammeTable = (report, type) => {
    const courses = Array.isArray(report?.courses) ? report.courses : [];
    const poSummary = Array.isArray(report?.[type === 'mapping' ? 'poMappings' : 'poDirectAttainment'])
      ? report[type === 'mapping' ? 'poMappings' : 'poDirectAttainment']
      : [];
    const psoSummary = Array.isArray(report?.[type === 'mapping' ? 'psoMappings' : 'psoDirectAttainment'])
      ? report[type === 'mapping' ? 'psoMappings' : 'psoDirectAttainment']
      : [];
    const poCodes = [...new Set([...poSummary.map((item) => item.poCode), ...courses.flatMap((course) => Object.keys(course.poValues || {}))].filter(Boolean))].sort(codeOrder);
    const psoCodes = [...new Set([...psoSummary.map((item) => item.psoCode), ...courses.flatMap((course) => Object.keys(course.psoValues || {}))].filter(Boolean))].sort(codeOrder);
    const summaryValues = {
      ...(type === 'mapping' ? report?.averageMappingStrength : report?.averageDirectAttainment),
      ...Object.fromEntries([...poSummary, ...psoSummary].map((item) => [
        item.poCode || item.psoCode,
        item.overallAverage ?? item.programmeAverageMapping ?? item.programmeDirectAttainment,
      ])),
    };
    const groups = new Map();

    courses.forEach((course) => {
      const semester = course.semester ?? course.semesterNumber ?? course.sem ?? 'Unassigned';
      if (!groups.has(semester)) groups.set(semester, []);
      groups.get(semester).push(course);
    });

    const semesterValue = (semester) => {
      const number = Number(String(semester).match(/\d+/)?.[0]);
      return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER;
    };

    return {
      poCodes,
      psoCodes,
      summaryValues,
      groups: [...groups.entries()]
        .sort(([left], [right]) => semesterValue(left) - semesterValue(right) || codeOrder(left, right))
        .map(([semester, rows]) => ({
          semester,
          label: /^\d+$/.test(String(semester)) ? `Sem ${semester}` : String(semester),
          courses: [...rows].sort((left, right) => codeOrder(left.courseCode, right.courseCode)),
        })),
    };
  };

  const mappingTable = useMemo(() => buildProgrammeTable(programmeBatchReports.mapping, 'mapping'), [programmeBatchReports.mapping]);
  const directTable = useMemo(() => buildProgrammeTable(programmeBatchReports.direct, 'direct'), [programmeBatchReports.direct]);
  const indirectStudents = useMemo(() => {
    const rows = programmeBatchReports.indirect?.studentResponses ?? programmeBatchReports.indirect?.surveyResponses ?? programmeBatchReports.indirect?.responses ?? [];
    return Array.isArray(rows) ? rows : [];
  }, [programmeBatchReports.indirect]);
  const indirectPoScores = useMemo(() => ({ ...scoreMap(programmeBatchReports.indirect?.averageIndirectAttainment, 'poCode'), ...scoreMap(programmeBatchReports.indirect?.poIndirectAttainment, 'poCode') }), [programmeBatchReports.indirect]);
  const indirectPsoScores = useMemo(() => ({ ...scoreMap(programmeBatchReports.indirect?.averageIndirectAttainment, 'psoCode'), ...scoreMap(programmeBatchReports.indirect?.psoIndirectAttainment, 'psoCode') }), [programmeBatchReports.indirect]);
  const indirectPoCodes = useMemo(() => [...new Set([...Object.keys(indirectPoScores), ...indirectStudents.flatMap((student) => Object.keys(student.poRatings || {}))])].filter(Boolean).sort(codeOrder), [indirectPoScores, indirectStudents]);
  const indirectPsoCodes = useMemo(() => [...new Set([...Object.keys(indirectPsoScores), ...indirectStudents.flatMap((student) => Object.keys(student.psoRatings || {}))])].filter(Boolean).sort(codeOrder), [indirectPsoScores, indirectStudents]);
  const overallPoCodes = useMemo(() => [...new Set([...mappingTable.poCodes, ...directTable.poCodes, ...indirectPoCodes])].sort(codeOrder), [directTable.poCodes, indirectPoCodes, mappingTable.poCodes]);
  const overallPsoCodes = useMemo(() => [...new Set([...mappingTable.psoCodes, ...directTable.psoCodes, ...indirectPsoCodes])].sort(codeOrder), [directTable.psoCodes, indirectPsoCodes, mappingTable.psoCodes]);
  const showIndirectReport = isFinalSemCompleted || Boolean(programmeBatchReports.indirect);
  const overallAttainmentValue = (directValue, indirectValue) => {
    if (!Number.isFinite(Number(directValue)) || !Number.isFinite(Number(indirectValue))) return '—';
    return ((Number(directValue) * 0.8) + (Number(indirectValue) * 0.2)).toFixed(2);
  };

  const renderProgrammeRows = (table, totalLabel, reportError = '') => {
    const columnCount = 3 + table.poCodes.length + table.psoCodes.length;
    if (programmeBatchReportsLoading) {
      return <tr><td colSpan={columnCount} style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>Loading programme-batch report…</td></tr>;
    }
    if (reportError) {
      return <tr><td colSpan={columnCount} style={{ padding: '28px', textAlign: 'center', color: '#b91c1c' }}>{reportError}</td></tr>;
    }
    if (!table.groups.length) {
      return <tr><td colSpan={columnCount} style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No course data is available for this programme batch.</td></tr>;
    }

    return <>
      {table.groups.map((group) => group.courses.map((course, courseIndex) => (
        <tr key={course.programmeBatchCourseId || `${group.semester}-${course.courseCode}`} style={{ borderTop: courseIndex === 0 ? '2px solid #cbd5e1' : 'none' }}>
          {courseIndex === 0 && <td rowSpan={group.courses.length} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '800', fontSize: '12.5px', color: '#334155', background: '#f8fafc', borderRight: '1.5px solid #e2e8f0', padding: '12px 14px' }}>{group.label}</td>}
          <td style={{ fontWeight: '800', color: '#4f46e5' }}>{course.courseCode || '—'}</td>
          <td style={{ fontSize: '12.5px', color: '#0f172a' }}>{course.courseName || '—'}</td>
          {table.poCodes.map((code) => <td key={code} style={{ textAlign: 'center', fontWeight: '700' }}>{valueOrDash(course.poValues?.[code])}</td>)}
          {table.psoCodes.map((code) => <td key={code} style={{ textAlign: 'center', fontWeight: '700', color: '#047857', background: '#f0fdf4' }}>{valueOrDash(course.psoValues?.[code])}</td>)}
        </tr>
      )))}
      <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
        <td colSpan={3} style={{ textAlign: 'right', paddingRight: '16px', color: '#0f172a' }}>{totalLabel}</td>
        {table.poCodes.map((code) => <td key={code} style={{ textAlign: 'center', color: '#4f46e5' }}>{valueOrDash(table.summaryValues[code])}</td>)}
        {table.psoCodes.map((code) => <td key={code} style={{ textAlign: 'center', color: '#047857', background: '#e6f4ea' }}>{valueOrDash(table.summaryValues[code])}</td>)}
      </tr>
    </>;
  };

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
        filename = `Course_Attainment_${currentCourseObj?.code || 'Course'}_${currentBatchObj?.id || 'batch'}.xlsx`;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`COURSE ATTAINMENT REPORT — ${currentBatchObj?.name || 'Batch'}`],
          [`Programme: ${currentProgramme?.code || ''} - ${currentProgramme?.name || ''}`],
          [`Course: ${currentCourseObj?.code || ''} - ${currentCourseObj?.name || ''}`],
          [],
          [`1. TABLE 1: CO TO PO/PSO MAPPING MATRIX`],
          ['Sr No', 'CO Code', ...poList, ...psoList],
          ...coList.map((co, idx) => [
            idx + 1,
            co.code,
            ...poList.map((po) => coMapping?.[currentCourseObj?.id]?.[`${co.code}-${po}`] ?? '-'),
            ...psoList.map((pso) => coMapping?.[currentCourseObj?.id]?.[`${co.code}-${pso}`] ?? '-'),
          ]),
          [],
          [`2. TABLE 2: PO & PSO ATTAINMENT VALUES`],
          ['Course Code', ...poList, ...psoList],
          [currentCourseObj?.code || '', ...poList.map((po) => progTargets?.poTargets?.[po] ?? '-'), ...psoList.map((pso) => progTargets?.psoTargets?.[pso] ?? '-')],
          [],
          [`3. TABLE 3: CO ATTAINMENT (DIRECT + INDIRECT)`],
          ['Assessment Type', 'Metric', ...coList.map((co) => co.code)],
          ['Direct Examination', 'Direct Attainment Level (0-3)', ...coList.map((co) => co.directAttainment ?? '-')],
          ['Indirect Survey', 'Indirect Attainment Level (0-3)', ...coList.map((co) => co.indirectAttainment ?? '-')],
          ['Combined CO Attainment', 'Overall CO Attainment', ...coList.map((co) => co.attainment ?? '-')],
        ];
      } else {
        filename = `Programme_Attainment_${currentProgramme.code}_${currentBatchName}.xlsx`;
        const isMappingReport = batchReportType === 'average-mapping';
        const table = isMappingReport ? mappingTable : directTable;
        sheetData = [
          [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
          [`PROGRAMME ATTAINMENT BATCH REPORT — ${currentBatchName}`],
          [`Programme: ${currentProgramme.code} - ${currentProgramme.name}`],
          [`Report Type: ${batchReportType.toUpperCase().replace(/-/g, ' ')}`],
          [],
          ['Sem', 'Course Code', 'Course Name', ...table.poCodes, ...table.psoCodes],
        ];

        table.groups.forEach((group) => {
          group.courses.forEach((course, cIdx) => {
            sheetData.push([
              cIdx === 0 ? group.label : '',
              course.courseCode || '',
              course.courseName || '',
              ...table.poCodes.map((code) => course.poValues?.[code] ?? ''),
              ...table.psoCodes.map((code) => course.psoValues?.[code] ?? ''),
            ]);
          });
        });
        sheetData.push([
          isMappingReport ? 'Average Mapping Strength' : 'Average Attainment (Direct)',
          '',
          '',
          ...table.poCodes.map((code) => table.summaryValues[code] ?? ''),
          ...table.psoCodes.map((code) => table.summaryValues[code] ?? ''),
        ]);
      }
    } else {
      const typeLabel = atrSubTab === 'course-atr' ? 'Course_ATR' : 'Programme_ATR';
      filename = `${typeLabel}_${currentCourseObj.code}_${currentBatchObj?.id || 'unselected-batch'}.xlsx`;
      sheetData = [
        [`D. Y. PATIL INTERNATIONAL UNIVERSITY, AKURDI PUNE`],
        [`ACTION TAKEN REPORT (ATR) — ${currentBatchName}`],
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
            {isCourseCoordinator && <select
              value={selectedCourseOffering?.id ?? ''}
              onChange={(event) => {
                const offering = assignedOfferings.find((item) => String(item.id) === event.target.value);
                if (offering) selectCourseOffering(offering);
              }}
              disabled={!batchId || assignedOfferings.length === 0}
              style={{ height: '38px', width: '220px', padding: '0 8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#4f46e5', background: '#ffffff', fontSize: '12.5px', fontWeight: 700, fontFamily: 'inherit' }}
            >
              {assignedOfferings.length === 0 ? <option value="">No assigned courses</option> : assignedOfferings.map((offering) => <option key={offering.id} value={offering.id}>{offering.courseCode ?? offering.code ?? 'Course'} — {offering.courseName ?? offering.name ?? 'Programme-Batch Course'} · Sem {offering.semester ?? '—'}</option>)}
            </select>}
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
          
          {/* 1. PROGRAMME SELECTOR (For Programme Coordinator, HOD, Director) */}
          {!isCourseCoordinator && !isProgrammeCoordinator && (
            <div style={{ minWidth: '240px', flex: '1 1 240px', order: isHod || isDirector ? 1 : undefined }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isHod || isDirector ? 'Programme' : 'School Programme'}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={currentProgramme.id}
                  onChange={(e) => {
                    const newProgId = e.target.value;
                    setProgrammeId(newProgId);
                    if (isHod || isDirector) setSelectedBatchId('');
                    setSelectedReportCourseOfferingId('');
                    const matchingCourses = courses.filter((c) => !c.programmeId || c.programmeId === newProgId);
                    if (matchingCourses.length > 0) {
                      setCourseId(matchingCourses[0].id);
                    }
                  }}
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
                  {roleProgrammes.length === 0 && <option value="">No master programmes available</option>}
                  {roleProgrammes.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          {/* 2. COURSE SELECTOR (For All Roles) */}
          {!isCourseCoordinator && <div style={{ minWidth: '260px', flex: '1 1 260px', order: isProgrammeCoordinator ? 2 : isHod || isDirector ? 3 : undefined }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isProgrammeCoordinator || isHod || isDirector ? 'Course' : `Select Course (under ${currentProgramme.code})`}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={isProgrammeCoordinator || isHod || isDirector ? (selectedCourseOffering?.id ?? selectedReportCourseOfferingId) : (currentCourseObj.id || courseId || '')}
                onChange={(e) => {
                  const selectionId = e.target.value;
                  const matchingOffering = reportCourseOfferings.find((offering) =>
                    String(isProgrammeCoordinator || isHod || isDirector ? offering.id : (offering.courseId ?? offering.masterCourseId)) === String(selectionId)
                  );
                  if (matchingOffering) {
                    setCourseId(matchingOffering.courseId ?? matchingOffering.masterCourseId);
                    setSelectedReportCourseOfferingId(matchingOffering.id);
                    selectCourseOffering(matchingOffering);
                  }
                }}
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
                {isProgrammeCoordinator || isHod || isDirector ? (
                  <>
                    {reportCourseOfferings.length === 0 && <option value="">No courses available for this programme batch</option>}
                    {reportCourseOfferings.map((offering) => (
                      <option key={offering.id} value={offering.id}>
                        {offering.courseCode ?? offering.code ?? 'Course'} — {offering.courseName ?? offering.name ?? 'Programme-Batch Course'}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    {allProgrammeCourses.length === 0 && <option value="">No courses available</option>}
                    {allProgrammeCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>}

          {/* 3. ACADEMIC BATCH SELECTOR (For All Roles) */}
          {!isCourseCoordinator && <div style={{ minWidth: '240px', flex: '1 1 240px', order: isProgrammeCoordinator ? 1 : isHod || isDirector ? 2 : undefined }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isProgrammeCoordinator || isHod || isDirector ? 'Batch' : 'Academic Batch'}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  setSelectedReportCourseOfferingId('');
                }}
                style={{
                  height: '38px',
                  width: '100%',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#0f172a',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 28px 0 12px',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {batchList.length === 0 && <option value="">No programme batches available</option>}
                {batchList.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>}
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
                <Layers size={14} /> Programme Attainment
              </button>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE A: COURSE ATTAINMENT                                         */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {effectiveAttainmentViewMode === 'course-attainment' && (
            <COAttainmentEngine hideFooter />
          )}

          {/* Legacy report mockup retained temporarily for reference only. */}
          {false && effectiveAttainmentViewMode === 'course-attainment' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Header Info Bar */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                    Course Attainment Report — {currentBatchName}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {currentCourseObj.code} &nbsp;—&nbsp; {currentCourseObj.name} ({currentProgramme.code})
                  </p>
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: '700', background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '6px' }}>
                  {currentBatchName.split('—')[0] || currentBatchName}
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
                  Select Type of Batch Report ({currentBatchName})
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
                      Average Mapping Strength — {currentBatchName} (All Semesters)
                    </h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="audit-data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '160px', minWidth: '160px' }}>Sem</th>
                          <th style={{ width: '120px', minWidth: '120px' }}>Course Code</th>
                          <th style={{ minWidth: '280px', width: '320px' }}>Course Name</th>
                          {mappingTable.poCodes.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                          {mappingTable.psoCodes.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {renderProgrammeRows(mappingTable, 'Average Mapping Strength', programmeBatchReportErrors.mapping)}
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
                      Average Attainment (Direct) — {currentBatchName} (All Semesters)
                    </h4>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="audit-data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '160px', minWidth: '160px' }}>Sem</th>
                          <th style={{ width: '120px', minWidth: '120px' }}>Course Code</th>
                          <th style={{ minWidth: '280px', width: '320px' }}>Course Name</th>
                          {directTable.poCodes.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                          {directTable.psoCodes.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>{pso}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {renderProgrammeRows(directTable, 'Average Attainment (Direct)', programmeBatchReportErrors.direct)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. AVERAGE ATTAINMENT INDIRECT */}
              {batchReportType === 'average-attainment-indirect' && (
                <div>
                  {programmeBatchReportErrors.indirect ? (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                      <AlertCircle size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#991b1b', fontWeight: '800' }}>Unable to load indirect attainment</h4>
                      <p style={{ margin: '8px auto 0', fontSize: '13px', color: '#7f1d1d', maxWidth: '620px', lineHeight: '1.5' }}>{programmeBatchReportErrors.indirect}</p>
                    </div>
                  ) : !showIndirectReport ? (
                    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                      <Clock size={36} style={{ color: '#d97706', marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#92400e', fontWeight: '800' }}>
                        Not Available Yet
                      </h4>
                      <p style={{ margin: '8px auto 0', fontSize: '13px', color: '#b45309', maxWidth: '520px', lineHeight: '1.5' }}>
                        Indirect attainment survey data is compiled at the conclusion of the final semester (Semester 8) of the batch. This batch (<strong>{currentBatchName}</strong>) is currently in progress.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          Average Attainment (Indirect) — {currentBatchName}
                        </h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="audit-data-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: '80px', textAlign: 'center' }}>Sr No</th>
                              <th style={{ width: '140px' }}>PRN</th>
                              <th style={{ minWidth: '260px' }}>Name of the Student</th>
                              {indirectPoCodes.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                              {indirectPsoCodes.map((pso) => <th key={pso} style={{ textAlign: 'center', background: '#ecfdf5' }}>{pso}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {indirectStudents.length === 0 ? (
                              <tr>
                                <td colSpan={3 + indirectPoCodes.length + indirectPsoCodes.length} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                  No programme end-survey responses are available for this programme batch.
                                </td>
                              </tr>
                            ) : indirectStudents.map((student, index) => (
                              <tr key={`${student.prn ?? student.studentPrn ?? 'student'}-${student.srNo ?? index}`}>
                                <td style={{ textAlign: 'center', fontWeight: '600' }}>{student.srNo ?? index + 1}</td>
                                <td style={{ fontWeight: '600' }}>{student.prn ?? student.studentPrn ?? '—'}</td>
                                <td>{student.studentName ?? student.name ?? '—'}</td>
                                {indirectPoCodes.map((po) => <td key={po} style={{ textAlign: 'center' }}>{responseValue(student, po)}</td>)}
                                {indirectPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center', background: '#f0fdf4' }}>{responseValue(student, pso)}</td>)}
                              </tr>
                            ))}
                            <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                              <td colSpan={3} style={{ textAlign: 'right', paddingRight: '16px', color: '#0f172a' }}>Average Attainment (Indirect)</td>
                              {indirectPoCodes.map((po) => <td key={po} style={{ textAlign: 'center', color: '#4f46e5' }}>{valueOrDash(indirectPoScores[po])}</td>)}
                              {indirectPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center', color: '#047857', background: '#e6f4ea' }}>{valueOrDash(indirectPsoScores[pso])}</td>)}
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
                  {programmeBatchReportErrors.indirect ? (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
                      <AlertCircle size={36} style={{ color: '#dc2626', marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#991b1b', fontWeight: '800' }}>Unable to calculate overall attainment</h4>
                      <p style={{ margin: '8px auto 0', fontSize: '13px', color: '#7f1d1d', maxWidth: '620px', lineHeight: '1.5' }}>{programmeBatchReportErrors.indirect}</p>
                    </div>
                  ) : !showIndirectReport ? (
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
                          Overall Attainment — {currentBatchName}
                        </h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="audit-data-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: '180px', textAlign: 'center' }}>Year</th>
                              <th style={{ minWidth: '270px' }}>Course Name</th>
                              {overallPoCodes.map((po) => <th key={po} style={{ textAlign: 'center' }}>{po}</th>)}
                              {overallPsoCodes.map((pso) => <th key={pso} style={{ textAlign: 'center' }}>{pso}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td rowSpan={4} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', fontSize: '14px' }}>{academicYear || currentBatchObj?.academicYear || 'AY —'}</td>
                              <td style={{ fontWeight: '700', background: '#dcf0e0' }}>Average Mapping Values</td>
                              {overallPoCodes.map((po) => <td key={po} style={{ textAlign: 'center' }}>{valueOrDash(mappingTable.summaryValues[po])}</td>)}
                              {overallPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center' }}>{valueOrDash(mappingTable.summaryValues[pso])}</td>)}
                            </tr>
                            <tr>
                              <td style={{ fontWeight: '700' }}>Average Attainment (Direct)</td>
                              {overallPoCodes.map((po) => <td key={po} style={{ textAlign: 'center' }}>{valueOrDash(directTable.summaryValues[po])}</td>)}
                              {overallPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center' }}>{valueOrDash(directTable.summaryValues[pso])}</td>)}
                            </tr>
                            <tr>
                              <td style={{ fontWeight: '700' }}>Average Attainment (Indirect)</td>
                              {overallPoCodes.map((po) => <td key={po} style={{ textAlign: 'center' }}>{valueOrDash(indirectPoScores[po])}</td>)}
                              {overallPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center' }}>{valueOrDash(indirectPsoScores[pso])}</td>)}
                            </tr>
                            <tr style={{ fontWeight: '800' }}>
                              <td style={{ color: '#0f172a', fontSize: '13.5px', background: '#a8c4ed', lineHeight: '1.25' }}>Overall Attainment<br />(80% of Direct + 20% of Indirect)</td>
                              {overallPoCodes.map((po) => <td key={po} style={{ textAlign: 'center', background: '#b4dfe3', fontSize: '14px' }}>{overallAttainmentValue(directTable.summaryValues[po], indirectPoScores[po])}</td>)}
                              {overallPsoCodes.map((pso) => <td key={pso} style={{ textAlign: 'center', background: '#b4dfe3', fontSize: '14px' }}>{overallAttainmentValue(directTable.summaryValues[pso], indirectPsoScores[pso])}</td>)}
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
          
          {/* ATR Sub-Tab Navigation (Only for Programme Coordinator, HOD, Director) */}
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
          )}

          {/* ATR SUB-TAB 1: COURSE ATR (For Course Coordinator, or when course-atr selected) */}
          {(isCourseCoordinator || atrSubTab === 'course-atr') && (
            <CourseATR
              hideFooter={true}
              hideHeader={false}
              readOnly
              courseId={isCourseCoordinator ? selectedCourseOffering?.id : undefined}
              batchId={effectiveBatchId}
              showAssignedCourseSelector={isCourseCoordinator}
              assignedOfferings={assignedOfferings}
              selectorDisabled={!batchId}
              onSelectOffering={(offeringId) => {
                const offering = assignedOfferings.find((item) => String(item.id) === String(offeringId));
                if (offering) selectCourseOffering(offering);
              }}
            />
          )}

          {/* ATR SUB-TAB 2: PROGRAMME ATR (Only for Programme Coordinator, HOD, Director) */}
          {!isCourseCoordinator && atrSubTab === 'programme-atr' && (
            <ProgrammeATR
              readOnly
              hideFooter={true}
              hideHeader={false}
              showBatchSelector={false}
              showHeaderActions={false}
              programmeId={currentProgramme.id}
              courseId={currentCourseObj.id}
              batchId={currentBatchObj?.id}
            />
          )}

        </div>
      )}

    </div>
  );
}
