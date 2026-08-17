import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSchools,
  getDepartments,
  getProgrammes,
  getBatches,
  getCourses,
  getCourseOfferings,
  getProgrammeOutcomes,
  getCourseOutcomes,
  getCOPOMappings,
  getAttainmentConfiguration,
} from '../api/academicApi';
import { useAuth } from './AuthContext';

const AcademicContext = createContext(null);

// Legacy backward-compatibility exports (No dummy data; database is the single source of truth)
export const MASTER_BATCHES = [];
export const MASTER_FACULTY_LIST = [];
export const INITIAL_SCHOOLS = [];
export const INITIAL_DEPARTMENTS = [];
export const INITIAL_MASTER_PROGRAMMES_LIST = [];
export const MASTER_PROGRAMMES = [];
export const INITIAL_DIRECTOR_APPROVALS_LIST = [];
export const INITIAL_HOD_APPROVALS_LIST = [];
export const INITIAL_COURSES = [];
export const INITIAL_PROGRAMME_OUTCOMES = {};
export const INITIAL_PSO_OUTCOMES = {};
export const INITIAL_PEO_OUTCOMES = {};
export const INITIAL_PROGRAMME_ATR_LIST = {};

export function AcademicProvider({ children }) {
  const { user, role } = useAuth();

  // ── 1. HIERARCHY STATES ───────────────────────────────────────────────────
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  const [programmes, setProgrammes] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');

  // ── 2. BATCH & COHORT CONTEXT (Central Anchor) ───────────────────────────
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // ── 3. MASTER COURSES & COURSE OFFERINGS ──────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [courseOfferings, setCourseOfferings] = useState([]);
  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState('');

  // ── 4. OUTCOMES (PEO / PO / PSO / CO) ─────────────────────────────────────
  const [activePEOs, setActivePEOs] = useState([]);
  const [activePOs, setActivePOs] = useState([]);
  const [activePSOs, setActivePSOs] = useState([]);
  const [activeCOs, setActiveCOs] = useState([]);
  const [activeMappings, setActiveMappings] = useState([]);
  const [attainmentConfigs, setAttainmentConfigs] = useState({});

  // ── 5. WORKFLOW & VERIFICATION TRACKERS ───────────────────────────────────
  const [courseVerificationStore, setCourseVerificationStore] = useState({});
  const [workflowProgressStore, setWorkflowProgressStore] = useState({});
  const [coTargets, setCoTargets] = useState({});

  // ── 6. LOADING STATES ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  const extractList = (res, key) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (key && Array.isArray(res[key])) return res[key];
    if (key && Array.isArray(res.data?.[key])) return res.data[key];
    if (key && Array.isArray(res.data?.data?.[key])) return res.data.data[key];
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.content)) return res.content;
    if (Array.isArray(res.data?.content)) return res.data.content;
    return [];
  };

  // ── A. FETCH INITIAL HIERARCHY (Schools & Departments) ───────────────────
  const loadSchools = useCallback(async (emailOverride) => {
    try {
      const emailToQuery = emailOverride || user?.email || '';
      const res = await getSchools(emailToQuery);
      const list = extractList(res, 'schools');
      if (Array.isArray(list)) {
        setSchools(list);
        if (list.length > 0) {
          setSelectedSchoolId((prev) => (list.some((s) => s.id === prev) ? prev : list[0].id));
        } else {
          setSelectedSchoolId('');
        }
      }
    } catch (err) {
      console.warn('[AcademicContext] Schools fetch returned empty/error:', err.message);
      setSchools([]);
      setSelectedSchoolId('');
    }
  }, [user?.email]);

  const loadDepartments = useCallback(async (schoolId) => {
    try {
      const res = await getDepartments(schoolId);
      const list = extractList(res, 'departments');
      if (Array.isArray(list)) {
        setDepartments(list);
        if (list.length > 0) {
          setSelectedDepartmentId((prev) => (list.some((d) => d.id === prev) ? prev : list[0].id));
        } else {
          setSelectedDepartmentId('');
        }
      }
    } catch (err) {
      console.warn('[AcademicContext] Departments fetch returned empty/error:', err.message);
      setDepartments([]);
      setSelectedDepartmentId('');
    }
  }, []);

  const loadProgrammes = useCallback(async (deptId) => {
    try {
      const res = await getProgrammes(deptId);
      const list = extractList(res, 'programmes');
      if (Array.isArray(list)) {
        setProgrammes(list);
        if (list.length > 0) {
          setSelectedProgrammeId((prev) => (list.some((p) => p.id === prev) ? prev : list[0].id));
        } else {
          setSelectedProgrammeId('');
        }
      }
    } catch (err) {
      console.warn('[AcademicContext] Programmes fetch returned empty/error:', err.message);
      setProgrammes([]);
      setSelectedProgrammeId('');
    }
  }, []);

  // ── B. FETCH BATCHES, COURSES & OUTCOMES WHEN PROGRAMME CHANGES ──────────
  const loadProgrammeData = useCallback(async (progId) => {
    if (!progId) {
      setBatches([]);
      setSelectedBatchId('');
      setCourses([]);
      setSelectedCourseId('');
      setActivePEOs([]);
      setActivePOs([]);
      setActivePSOs([]);
      return;
    }

    try {
      // 1. Fetch Batches for Programme
      const batchRes = await getBatches(progId);
      const batchList = extractList(batchRes, 'batches');
      if (Array.isArray(batchList)) {
        setBatches(batchList);
        if (batchList.length > 0) {
          setSelectedBatchId((prev) => (batchList.some((b) => b.id === prev) ? prev : batchList[0].id));
        } else {
          setSelectedBatchId('');
        }
      } else {
        setBatches([]);
        setSelectedBatchId('');
      }

      // 2. Fetch Master Courses for Programme
      const courseRes = await getCourses(progId);
      const courseList = extractList(courseRes, 'courses');
      if (Array.isArray(courseList)) {
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId((prev) => (courseList.some((c) => c.id === prev) ? prev : courseList[0].id));
        } else {
          setSelectedCourseId('');
        }
      } else {
        setCourses([]);
        setSelectedCourseId('');
      }

      // 3. Fetch Programme Outcomes (PEO, PO, PSO)
      const outcomesRes = await getProgrammeOutcomes(progId);
      const outcomesData = outcomesRes?.data?.data || outcomesRes?.data || outcomesRes || {};
      setActivePEOs(Array.isArray(outcomesData?.peos) ? outcomesData.peos : []);
      setActivePOs(Array.isArray(outcomesData?.pos) ? outcomesData.pos : []);
      setActivePSOs(Array.isArray(outcomesData?.psos) ? outcomesData.psos : []);
    } catch (err) {
      console.warn('[AcademicContext] Programme data fetch error:', err.message);
    }
  }, []);

  // ── C. FETCH COURSE OFFERINGS WHEN BATCH CHANGES ─────────────────────────
  const loadBatchOfferings = useCallback(async (batchId) => {
    if (!batchId) {
      setCourseOfferings([]);
      setSelectedCourseOfferingId('');
      return;
    }

    try {
      const res = await getCourseOfferings(batchId);
      const list = extractList(res, 'courseOfferings');
      if (Array.isArray(list)) {
        setCourseOfferings(list);
        if (list.length > 0) {
          setSelectedCourseOfferingId((prev) => (list.some((o) => o.id === prev) ? prev : list[0].id));
        } else {
          setSelectedCourseOfferingId('');
        }
      } else {
        setCourseOfferings([]);
        setSelectedCourseOfferingId('');
      }
    } catch (err) {
      console.warn('[AcademicContext] Course offerings fetch error:', err.message);
      setCourseOfferings([]);
      setSelectedCourseOfferingId('');
    }
  }, []);

  // ── D. FETCH COs & MAPPINGS WHEN COURSE OFFERING CHANGES ─────────────────
  const loadOfferingOutcomes = useCallback(async (offeringId) => {
    if (!offeringId) {
      setActiveCOs([]);
      setActiveMappings([]);
      return;
    }

    try {
      const [cosRes, mapRes] = await Promise.allSettled([
        getCourseOutcomes(offeringId),
        getCOPOMappings(offeringId),
      ]);

      if (cosRes.status === 'fulfilled') {
        const raw = cosRes.value;
        const cosData = raw?.data?.outcomes || raw?.outcomes || (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
        setActiveCOs(Array.isArray(cosData) ? cosData : []);
      }

      if (mapRes.status === 'fulfilled') {
        const raw = mapRes.value;
        const mapData = raw?.data?.mappings || raw?.mappings || (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
        setActiveMappings(Array.isArray(mapData) ? mapData : []);
      }
    } catch (err) {
      console.warn('[AcademicContext] Offering outcomes fetch error:', err.message);
    }
  }, []);

  // ── E. REACTIVE CASCADE TRIGGERS ─────────────────────────────────────────
  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  useEffect(() => {
    loadDepartments(selectedSchoolId);
  }, [selectedSchoolId, loadDepartments]);

  useEffect(() => {
    loadProgrammes(selectedDepartmentId);
  }, [selectedDepartmentId, loadProgrammes]);

  useEffect(() => {
    loadProgrammeData(selectedProgrammeId);
  }, [selectedProgrammeId, loadProgrammeData]);

  useEffect(() => {
    loadBatchOfferings(selectedBatchId);
  }, [selectedBatchId, loadBatchOfferings]);

  useEffect(() => {
    loadOfferingOutcomes(selectedCourseOfferingId);
  }, [selectedCourseOfferingId, loadOfferingOutcomes]);

  // ── F. CONTEXT UPDATE HANDLERS ───────────────────────────────────────────
  const updateCourseCoTargets = (targetKey, newTargets) => {
    setCoTargets((prev) => ({
      ...prev,
      [targetKey]: {
        ...(prev[targetKey] || {}),
        ...newTargets,
      },
    }));
  };

  const updateCourseCOs = (targetKey, newCOs) => {
    setActiveCOs(Array.isArray(newCOs) ? newCOs : []);
  };

  const updateCourseVerificationStatus = (targetKey, statusType, statusValue, remarksValue = '', verifierName = null) => {
    const remarkKey = statusType.replace('Status', 'Remarks');
    setCourseVerificationStore((prev) => ({
      ...prev,
      [targetKey]: {
        ...(prev[targetKey] || {}),
        [statusType]: statusValue,
        [remarkKey]: remarksValue,
        verifierName: verifierName || prev[targetKey]?.verifierName,
      },
    }));
  };

  const markWorkflowStepComplete = (targetKey, path) => {
    if (!targetKey) return;
    setWorkflowProgressStore((prev) => ({
      ...prev,
      [targetKey]: {
        ...(prev[targetKey] || {}),
        [path]: true,
      },
    }));
  };

  // ── G. DERIVED CONTEXT OBJECTS ───────────────────────────────────────────
  const selectedSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0] || null;
  const selectedDepartment = departments.find((d) => d.id === selectedDepartmentId) || departments[0] || null;
  const selectedProgramme = programmes.find((p) => p.id === selectedProgrammeId) || programmes[0] || null;
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;
  const selectedCourseOffering = courseOfferings.find((o) => o.id === selectedCourseOfferingId) || courseOfferings[0] || null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;

  return (
    <AcademicContext.Provider
      value={{
        // Schools & Departments
        schools,
        selectedSchoolId,
        setSelectedSchoolId,
        selectedSchool,
        departments,
        selectedDepartmentId,
        setSelectedDepartmentId,
        selectedDepartment,

        // Programmes
        programmes,
        masterProgrammes: programmes, // Backward-compatibility alias
        selectedProgrammeId,
        setSelectedProgrammeId,
        programmeId: selectedProgrammeId, // Backward-compatibility alias
        setProgrammeId: setSelectedProgrammeId,
        selectedProgramme,

        // Batches (Cohort Context)
        batches,
        setBatches,
        selectedBatchId,
        setSelectedBatchId,
        selectedBatch,
        academicYear: selectedBatch?.startYear || selectedBatch?.academicYear || '2025-26',
        setAcademicYear: () => {},
        availableYears: ['2024-25', '2025-26', '2026-27'],

        // Master Courses & Course Offerings
        courses,
        availableCourses: courses, // Backward-compatibility alias
        selectedCourseId,
        setSelectedCourseId,
        courseId: selectedCourseId, // Backward-compatibility alias
        setCourseId: setSelectedCourseId,
        selectedCourse,

        courseOfferings,
        selectedCourseOfferingId,
        setSelectedCourseOfferingId,
        courseOfferingId: selectedCourseOfferingId, // Backward-compatibility alias
        setCourseOfferingId: setSelectedCourseOfferingId,
        selectedCourseOffering,

        // Outcomes
        activePEOs,
        activePOs,
        activePSOs,
        activeCOs,
        activeMappings,
        attainmentConfigs,
        coTargets,
        updateCourseCoTargets,
        updateCourseCOs,

        // Verification & Workflow Stores
        courseVerificationStore,
        updateCourseVerificationStatus,
        workflowProgressStore,
        markWorkflowStepComplete,

        // Refresh actions
        reloadSchools: loadSchools,
        reloadDepartments: () => loadDepartments(selectedSchoolId),
        reloadProgrammes: () => loadProgrammes(selectedDepartmentId),
        reloadBatches: () => loadProgrammeData(selectedProgrammeId),
        reloadOfferings: () => loadBatchOfferings(selectedBatchId),
        reloadOutcomes: () => loadOfferingOutcomes(selectedCourseOfferingId),

        loading,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  return context || {};
}
