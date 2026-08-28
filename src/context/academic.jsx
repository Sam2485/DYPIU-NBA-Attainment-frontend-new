import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { useAuth } from './auth';
import apiClient from '../api/client';

export const AcademicContext = createContext(null);

/* ========================================================================== */
/* Response helpers                                                           */
/* ========================================================================== */

const unwrap = (response) => {
  if (response == null) {
    return null;
  }

  if (response?.data?.data !== undefined) {
    return response.data.data;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

const unwrapList = (response) => {
  const value = unwrap(response);
  return Array.isArray(value) ? value : [];
};

/* ========================================================================== */
/* Normalizers                                                                */
/* ========================================================================== */

const normalizeSchool = (school) => ({
  // The current school API returns schoolId; retain id as the application-wide
  // selector key so Director Step 1 can resolve the loaded school.
  id: school?.id ?? school?.schoolId ?? null,
  schoolId: school?.schoolId ?? school?.id ?? null,
  code: school?.code ?? null,
  name: school?.name ?? null,
  dean:
    school?.dean ??
    school?.directorName ??
    school?.director ??
    '',
  deanEmail: school?.deanEmail ?? '',
  director:
    school?.directorName ??
    school?.director ??
    '',
  directorEmail:
    school?.directorEmail ??
    school?.email ??
    '',
  estYear: school?.estYear ?? null,
  email:
    school?.email ??
    school?.directorEmail ??
    '',
  status: school?.status ?? null,
  createdAt: school?.createdAt ?? null,
  updatedAt: school?.updatedAt ?? null,
});

const normalizeDepartment = (department) => ({
  // Department endpoints return departmentId in the current API contract.
  // Preserve it as the shared UI id so new rows do not replace all existing
  // rows during the optimistic state merge.
  id: department?.id ?? department?.departmentId ?? null,
  departmentId: department?.departmentId ?? department?.id ?? null,
  schoolId: department?.schoolId ?? null,
  code: department?.code ?? null,
  name: department?.name ?? null,
  hod: department?.hod ?? '',
  hodEmail: department?.hodEmail ?? '',
  status: department?.status ?? null,
  createdAt: department?.createdAt ?? null,
  updatedAt: department?.updatedAt ?? null,
});

const normalizeProgramme = (programme) => ({
  id: programme?.id ?? programme?.masterProgrammeId ?? null,
  masterProgrammeId: programme?.masterProgrammeId ?? programme?.id ?? null,
  departmentId: programme?.departmentId ?? null,
  code: programme?.code ?? null,
  name: programme?.name ?? null,
  degree: programme?.degree ?? null,
  durationYears: programme?.durationYears ?? null,
  department:
    programme?.departmentName ??
    programme?.department ??
    '',
  coordinator: programme?.coordinator ?? '',
  coordinatorEmail: programme?.coordinatorEmail ?? '',
  status: programme?.status ?? null,
  createdAt: programme?.createdAt ?? null,
  updatedAt: programme?.updatedAt ?? null,
});

const normalizeBatch = (batch) => ({
  id: batch?.id ?? batch?.programmeBatchId ?? null,
  programmeBatchId: batch?.programmeBatchId ?? batch?.id ?? null,
  name: batch?.name ?? null,
  masterProgrammeId: batch?.masterProgrammeId ?? null,
  programmeId: batch?.masterProgrammeId ?? null,
  programmeCode: batch?.programmeCode ?? null,
  programmeName: batch?.programmeName ?? null,
  durationYears: batch?.durationYears ?? null,
  coordinatorId: batch?.coordinatorId ?? null,
  coordinatorName: batch?.coordinatorName ?? batch?.coordinator ?? '',
  coordinatorEmail: batch?.coordinatorEmail ?? '',
  startYear: batch?.startYear ?? null,
  endYear: batch?.endYear ?? null,
  academicYear: batch?.academicYear ?? null,
  yearLevel:
    batch?.yearLevel ??
    batch?.currentYear ??
    null,
  status: batch?.status ?? null,
  createdAt: batch?.createdAt ?? null,
  updatedAt: batch?.updatedAt ?? null,
});

const normalizeCourse = (course) => ({
  id: course?.id ?? course?.masterCourseId ?? null,
  masterCourseId: course?.masterCourseId ?? course?.id ?? null,
  code: course?.code ?? null,
  name: course?.name ?? null,
  masterProgrammeId: course?.masterProgrammeId ?? null,
  programmeId: course?.masterProgrammeId ?? null,
  semester: course?.semester ?? null,
  credits: course?.credits ?? null,
  courseType: course?.courseType ?? null,
  coordinator: course?.coordinator ?? '',
  coordinatorEmail: course?.coordinatorEmail ?? '',
  faculty: course?.faculty ?? '',
  assignedFaculty: course?.assignedFaculty ?? '',
  status: course?.status ?? null,
  createdAt: course?.createdAt ?? null,
  updatedAt: course?.updatedAt ?? null,
});

const PC_SETUP_STEP_KEYS = {
  1: 'courses',
  2: 'po_pso_target',
  3: 'indirect_attainment',
  4: 'programme_atr',
  5: 'review',
};

const normalizeOffering = (offering) => ({
  id: offering?.id ?? offering?.programmeBatchCourseId ?? null,
  programmeBatchCourseId: offering?.programmeBatchCourseId ?? offering?.id ?? null,
  masterCourseId: offering?.masterCourseId ?? null,
  courseId: offering?.masterCourseId ?? null,
  masterProgrammeId: offering?.masterProgrammeId ?? null,
  programmeId: offering?.masterProgrammeId ?? null,
  programmeBatchId: offering?.programmeBatchId ?? null,
  batchId: offering?.programmeBatchId ?? null,
  semester: offering?.semester ?? null,
  academicYear: offering?.academicYear ?? null,
  courseCoordinatorId: offering?.courseCoordinatorId ?? null,
  courseCoordinatorName:
    offering?.courseCoordinatorName ??
    offering?.courseCoordinator ??
    '',
  courseCoordinatorEmail: offering?.courseCoordinatorEmail ?? '',
  status: offering?.status ?? null,
  assignedFaculty: offering?.assignedFaculty ?? null,
  createdAt: offering?.createdAt ?? null,
  updatedAt: offering?.updatedAt ?? null,
  course: offering?.course ?? null,
  courseName: offering?.courseName ?? offering?.courseNameOverride ?? null,
  courseCode: offering?.courseCode ?? offering?.courseCodeOverride ?? null,
  courseNameOverride: offering?.courseNameOverride ?? offering?.courseName ?? null,
  courseCodeOverride: offering?.courseCodeOverride ?? offering?.courseCode ?? null,
  credits: offering?.credits ?? null,
  courseType: offering?.courseType ?? null,
});

const normalizeUser = (user) => ({
  id: user?.id ?? user?.userId ?? user?.coordinatorId ?? user?.email ?? null,
  username: user?.username ?? null,
  name: user?.name ?? null,
  email: user?.email ?? null,
  role: user?.role ?? null,
  schoolId: user?.schoolId ?? null,
  departmentId: user?.departmentId ?? null,
  masterProgrammeId: user?.masterProgrammeId ?? null,
  department: user?.department ?? null,
  programme: user?.programme ?? null,
  isActive: user?.isActive ?? user?.is_active ?? true,
});

const toMasterProgrammePayload = (data = {}) => ({
  departmentId: data.departmentId,
  code: data.code,
  name: data.name,
  durationYears: data.durationYears,
});

const toProgrammeBatchPayload = (data = {}) => ({
  masterProgrammeId: data.masterProgrammeId ?? data.programmeId,
  name: data.name,
  startYear: data.startYear,
  endYear: data.endYear,
  durationYears: data.durationYears,
});

const toMasterCoursePayload = (data = {}) => ({
  masterProgrammeId: data.masterProgrammeId ?? data.programmeId,
  code: data.code,
  name: data.name,
  credits: data.credits,
  courseType: data.courseType,
});

const toProgrammeBatchCoursePayload = (data = {}) => ({
  masterCourseId: data.masterCourseId ?? data.courseId,
  programmeBatchId: data.programmeBatchId ?? data.batchId,
  semester: data.semester,
  courseCoordinatorEmail: data.courseCoordinatorEmail,
  assignedFaculty: data.assignedFaculty,
});

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function AcademicProvider({ children }) {
  const { role, user } = useAuth();

  const getHodDepartmentStorageKey = useCallback(
    () => `nba_hod_selected_department:${user?.email ?? user?.id ?? 'current-user'}`,
    [user?.email, user?.id]
  );
  const getHodProgrammeStorageKey = useCallback(
    () => `nba_hod_selected_master_programme:${user?.email ?? user?.id ?? 'current-user'}`,
    [user?.email, user?.id]
  );

  /* ------------------------------------------------------------------------ */
  /* Global selections                                                        */
  /* ------------------------------------------------------------------------ */

  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentIdState] = useState(
    () => {
      if (typeof window === 'undefined') return user?.departmentId ?? null;
      return sessionStorage.getItem(`nba_hod_selected_department:${user?.email ?? user?.id ?? 'current-user'}`)
        ?? user?.departmentId
        ?? null;
    }
  );
  const getPcSelectionStorageKey = (selection) =>
    `nba_pc_selected_${selection}:${user?.email ?? user?.id ?? 'current-user'}`;
  const readPcSelection = (selection) => {
    if (role !== 'PROGRAMME_COORDINATOR' || typeof window === 'undefined') return null;
    return sessionStorage.getItem(getPcSelectionStorageKey(selection));
  };
  const getCourseCoordinatorSelectionStorageKey = (selection) =>
    `nba_cc_selected_${selection}:${user?.email ?? user?.id ?? 'current-user'}`;
  const readCourseCoordinatorSelection = (selection) => {
    if ((role !== 'FACULTY' && role !== 'COURSE_COORDINATOR') || typeof window === 'undefined') return null;
    return sessionStorage.getItem(getCourseCoordinatorSelectionStorageKey(selection));
  };

  const [programmeId, setProgrammeIdState] = useState(() => {
    if (role === 'HOD' && typeof window !== 'undefined') {
      return sessionStorage.getItem(`nba_hod_selected_master_programme:${user?.email ?? user?.id ?? 'current-user'}`);
    }
    return readPcSelection('master_programme');
  });
  const [batchId, setBatchIdState] = useState(
    () => readPcSelection('programme_batch') ?? readCourseCoordinatorSelection('programme_batch')
  );
  const [courseId, setCourseId] = useState(null);
  const [courseOfferingId, setCourseOfferingId] = useState(
    () => readCourseCoordinatorSelection('programme_batch_course')
  );
  const [academicYear, setAcademicYear] = useState('');

  /* ------------------------------------------------------------------------ */
  /* Academic entities state                                                  */
  /* ------------------------------------------------------------------------ */

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [courseCoordinators, setCourseCoordinators] = useState([]);
  const [hods, setHods] = useState([]);
  const [programmeCoordinators, setProgrammeCoordinators] = useState([]);
  const [hodCoordinatorAssignments, setHodCoordinatorAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const masterProgrammeRequestsRef = useRef(new Map());

  useEffect(() => {
    if (role !== 'HOD') return;
    const persistedDepartmentId = typeof window === 'undefined'
      ? null
      : sessionStorage.getItem(getHodDepartmentStorageKey());
    
    // HOD department selection must be fixed to user.departmentId
    if (persistedDepartmentId && persistedDepartmentId !== user?.departmentId) {
      sessionStorage.removeItem(getHodDepartmentStorageKey());
    }
    
    if (user?.departmentId && selectedDepartmentId !== user?.departmentId) {
       setSelectedDepartmentIdState(user?.departmentId);
    }
  }, [getHodDepartmentStorageKey, role, selectedDepartmentId, user?.departmentId]);

  useEffect(() => {
    if (role !== 'HOD' || programmeId) return;
    const persistedProgrammeId = typeof window === 'undefined'
      ? null
      : sessionStorage.getItem(getHodProgrammeStorageKey());
    if (persistedProgrammeId) setProgrammeIdState(persistedProgrammeId);
  }, [getHodProgrammeStorageKey, programmeId, role]);

  useEffect(() => {
    if (role !== 'PROGRAMME_COORDINATOR') return;
    if (!programmeId) setProgrammeIdState(readPcSelection('master_programme'));
    if (!batchId) setBatchIdState(readPcSelection('programme_batch'));
  }, [batchId, programmeId, role, user?.email, user?.id]);

  useEffect(() => {
    if (role !== 'FACULTY' && role !== 'COURSE_COORDINATOR') return;
    if (!batchId) setBatchIdState(readCourseCoordinatorSelection('programme_batch'));
    if (!courseOfferingId) {
      setCourseOfferingId(readCourseCoordinatorSelection('programme_batch_course'));
    }
  }, [batchId, courseOfferingId, role, user?.email, user?.id]);

  /* ------------------------------------------------------------------------ */
  /* Outcomes & Mapping state                                                 */
  /* ------------------------------------------------------------------------ */

  const [activePOs, setActivePOs] = useState([]);
  const [activePSOs, setActivePSOs] = useState([]);
  const [activePEOs, setActivePEOs] = useState([]);
  const [poPsoTargets, setPoPsoTargets] = useState(null);
  const [activeCOs, setActiveCOs] = useState([]);
  const [coTargets, setCoTargets] = useState(null);
  const [coMapping, setCoMapping] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Attainment & ATR state                                                   */
  /* ------------------------------------------------------------------------ */

  const [attainmentSettings, setAttainmentSettings] = useState(null);
  const [coAttainment, setCoAttainment] = useState(null);
  const [programmeATR, setProgrammeATR] = useState(null);
  const [courseATR, setCourseATR] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Dashboards & Setup Progress state                                        */
  /* ------------------------------------------------------------------------ */

  const [directorDashboard, setDirectorDashboard] = useState(null);
  const [hodDashboard, setHodDashboard] = useState(null);
  const [programmeCoordinatorDashboard, setProgrammeCoordinatorDashboard] = useState(null);
  const [courseCoordinatorDashboard, setCourseCoordinatorDashboard] = useState(null);
  const [setupProgress, setSetupProgress] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Loading & Error state                                                    */
  /* ------------------------------------------------------------------------ */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* Derived selections                                                       */
  /* ======================================================================== */

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId]
  );

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId]
  );

  const setSelectedDepartmentId = useCallback((departmentId) => {
    const nextDepartmentId = departmentId || null;
    setSelectedDepartmentIdState(nextDepartmentId);
    if (role === 'HOD' && typeof window !== 'undefined') {
      const key = `nba_hod_selected_department:${user?.email ?? user?.id ?? 'current-user'}`;
      if (nextDepartmentId) sessionStorage.setItem(key, nextDepartmentId);
      else sessionStorage.removeItem(key);
      // A master programme belongs to a department, so it cannot be reused
      // after the HOD deliberately changes the department scope.
      sessionStorage.removeItem(`nba_hod_selected_master_programme:${user?.email ?? user?.id ?? 'current-user'}`);
    }
    // A programme, batch, course, or offering from the previous department
    // must never remain selected after the HOD changes department scope.
    setProgrammeIdState(null);
    setBatchId(null);
    setCourseId(null);
    setCourseOfferingId(null);
  }, [role, user?.email, user?.id]);

  const setBatchId = useCallback((newBatchId) => {
    const nextBatchId = newBatchId || null;
    setBatchIdState(nextBatchId);
    if (role === 'PROGRAMME_COORDINATOR' && typeof window !== 'undefined') {
      const key = `nba_pc_selected_programme_batch:${user?.email ?? user?.id ?? 'current-user'}`;
      if (nextBatchId) sessionStorage.setItem(key, nextBatchId);
      else sessionStorage.removeItem(key);
    }
    if ((role === 'FACULTY' || role === 'COURSE_COORDINATOR') && typeof window !== 'undefined') {
      const key = `nba_cc_selected_programme_batch:${user?.email ?? user?.id ?? 'current-user'}`;
      if (nextBatchId) sessionStorage.setItem(key, nextBatchId);
      else sessionStorage.removeItem(key);
    }
  }, [role, user?.email, user?.id]);

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === programmeId) ?? null,
    [programmes, programmeId]
  );

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === batchId) ?? null,
    [batches, batchId]
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId) ?? null,
    [courses, courseId]
  );

  const selectedCourseOffering = useMemo(
    () => courseOfferings.find((offering) => offering.id === courseOfferingId) ?? null,
    [courseOfferings, courseOfferingId]
  );

  const availableCourses = useMemo(() => {
    if (!programmeId) return [];
    return courses.filter((course) => course.programmeId === programmeId);
  }, [courses, programmeId]);

  const availableCourseOfferings = useMemo(() => {
    let result = courseOfferings;
    if (batchId) {
      result = result.filter((offering) => offering.batchId === batchId);
    }
    if (courseId) {
      result = result.filter((offering) => offering.courseId === courseId);
    }
    return result;
  }, [courseOfferings, batchId, courseId]);

  const facultyList = useMemo(() => {
    return courseCoordinators.map((c) => c.name || c.username || c.email).filter(Boolean);
  }, [courseCoordinators]);

  /* ======================================================================== */
  /* Explicit Callable Loaders (Isolated Error Handling)                      */
  /* ======================================================================== */

  /* --- Schools --- */
  const loadSchools = useCallback(async () => {
    try {
      const response = await apiClient.get('/academic/schools');
      let data = unwrapList(response).map(normalizeSchool);
      
      if (role === 'DIRECTOR') {
         data = data.filter(s => s.id === user?.schoolId);
      }
      
      setSchools(data);

      if (data.length > 0) {
        const scopedSchool = data.find((school) => school.id === user?.schoolId);
        if (scopedSchool) {
          setSelectedSchoolId(scopedSchool.id);
        } else if (role === 'ADMIN') {
           // Admin can select anything, but we shouldn't fallback to schools[0] automatically
           // Wait, prompt says: "Never fall back to schools[0]... when the authenticated scope is absent"
           // So just do nothing if no scope. But for ADMIN, they have no schoolId usually. So they just don't have a selection initially, or we leave it null.
           // Actually, let's just not set it to data[0].id
        }
      } else {
        setSelectedSchoolId(null);
      }

      return data;
    } catch (err) {
      console.warn('loadSchools failed:', err);
      return [];
    }
  }, [user?.schoolId, role]);

  /* --- Departments --- */
  const loadDepartments = useCallback(async (targetSchoolId = null) => {
    try {
      const params = targetSchoolId ? { schoolId: targetSchoolId } : {};
      const response = await apiClient.get('/academic/departments', { params });
      let data = unwrapList(response).map(normalizeDepartment);
      
      if (role === 'HOD') {
         data = data.filter(d => d.id === user?.departmentId);
      }
      
      setDepartments(data);
      return data;
    } catch (err) {
      console.warn('loadDepartments failed:', err);
      return [];
    }
  }, [role, user?.departmentId]);

  /* --- Programmes --- */
  const loadProgrammes = useCallback(async (targetDepartmentId = null, coordinatorEmail = null) => {
    try {
      const params = targetDepartmentId ? { departmentId: targetDepartmentId } : {};
      if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
      const response = await apiClient.get('/academic/master-programmes', { params });
      const data = unwrapList(response).map(normalizeProgramme);
      setProgrammes(data);
      return data;
    } catch (err) {
      console.warn('loadProgrammes failed:', err);
      return [];
    }
  }, []);

  // Director views manage the permanent catalogue through the authoritative
  // master-programme API. Filtering by department is done client-side because
  // the contract defines no list query parameters for this endpoint.
  const loadMasterProgrammes = useCallback(async (targetDepartmentId = null, coordinatorEmail = null) => {
    const requestKey = `${targetDepartmentId ?? '__all__'}:${coordinatorEmail ?? '__all__'}`;
    const inFlightRequest = masterProgrammeRequestsRef.current.get(requestKey);
    if (inFlightRequest) return inFlightRequest;

    const request = (async () => {
    try {
      const params = {};
      if (targetDepartmentId) params.departmentId = targetDepartmentId;
      if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
      const response = await apiClient.get('/academic/master-programmes', { params });
      const allProgrammes = unwrapList(response).map(normalizeProgramme);
      const data = allProgrammes.filter((programme) =>
        (!targetDepartmentId || programme.departmentId === targetDepartmentId) &&
        (!coordinatorEmail || !programme.coordinatorEmail || programme.coordinatorEmail === coordinatorEmail)
      );
      setProgrammes(data);
      return data;
    } catch (err) {
      console.warn('loadMasterProgrammes failed:', err);
      return [];
    } finally {
      masterProgrammeRequestsRef.current.delete(requestKey);
    }
    })();

    masterProgrammeRequestsRef.current.set(requestKey, request);
    return request;
  }, []);

  const loadCoordinatorMasterProgrammes = useCallback(async (coordinatorEmail = null) => {
    try {
      const params = {};
      if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
      const response = await apiClient.get('/academic/master-programmes', { params });
      const data = unwrapList(response).map(normalizeProgramme);
      setProgrammes(data);
      return data;
    } catch (err) {
      console.warn('loadCoordinatorMasterProgrammes failed:', err);
      return [];
    }
  }, []);

  /* --- Batches --- */
  const loadBatches = useCallback(
    async ({ targetProgrammeId = null, userEmail = null, targetRole = null } = {}) => {
      // Programme batches are never a global resource. Requiring the master
      // programme here prevents accidental unscoped calls that the backend
      // correctly cannot resolve for governance users.
      if (!targetProgrammeId) {
        console.warn('loadBatches skipped: targetProgrammeId is required.');
        setBatches([]);
        return [];
      }
      try {
        const params = {};
        params.masterProgrammeId = targetProgrammeId;
        if (userEmail) params.userEmail = userEmail;
        if (targetRole) params.role = targetRole;

        const response = await apiClient.get('/academic/programme-batches', { params });
        const data = unwrapList(response).map(normalizeBatch);
        setBatches(data);
        return data;
      } catch (err) {
        console.warn('loadBatches failed:', err);
        return [];
      }
    },
    []
  );

  const loadProgrammeBatches = useCallback(async (masterProgrammeId = null, hodEmail = null) => {
    try {
      const params = {};
      if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
      if (hodEmail) params.hodEmail = hodEmail;
      const response = await apiClient.get('/academic/programme-batches', { params });
      const data = unwrapList(response).map(normalizeBatch);
      setBatches(data);
      return data;
    } catch (err) {
      console.warn('loadProgrammeBatches failed:', err);
      return [];
    }
  }, []);

  const loadCoordinatorProgrammeBatches = useCallback(async (coordinatorEmail = null, masterProgrammeId = null) => {
    try {
      const params = {};
      if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
      if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
      const response = await apiClient.get('/academic/programme-batches', { params });
      const data = unwrapList(response).map(normalizeBatch);
      setBatches(data);
      return data;
    } catch (err) {
      console.warn('loadCoordinatorProgrammeBatches failed:', err);
      return [];
    }
  }, []);

  const loadCourseCoordinatorProgrammeBatches = useCallback(async (courseCoordinatorEmail = null) => {
    try {
      const params = {};
      if (courseCoordinatorEmail) params.courseCoordinatorEmail = courseCoordinatorEmail;
      const response = await apiClient.get('/academic/programme-batches', { params });
      const data = unwrapList(response).map(normalizeBatch);
      setBatches(data);
      return data;
    } catch (err) {
      console.warn('loadCourseCoordinatorProgrammeBatches failed:', err);
      return [];
    }
  }, []);

  /* --- Courses --- */
  const loadCourses = useCallback(
    async ({ targetProgrammeId = null, targetBatchId = null } = {}) => {
      try {
        const params = {};
        if (targetProgrammeId) params.masterProgrammeId = targetProgrammeId;
        if (targetBatchId) params.programmeBatchId = targetBatchId;

        const response = await apiClient.get('/academic/master-courses', { params });
        const data = unwrapList(response).map(normalizeCourse);
        setCourses(data);
        return data;
      } catch (err) {
        console.warn('loadCourses failed:', err);
        return [];
      }
    },
    []
  );

  const loadMasterCourses = useCallback(
    async ({ masterProgrammeId = null, programmeBatchId = null } = {}) => {
      try {
        const params = {};
        if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
        if (programmeBatchId) params.programmeBatchId = programmeBatchId;

        const response = await apiClient.get('/academic/master-courses', { params });
        const data = unwrapList(response).map(normalizeCourse);
        setCourses(data);
        return data;
      } catch (err) {
        console.warn('loadMasterCourses failed:', err);
        return [];
      }
    },
    []
  );

  /* --- Programme-Batch Courses --- */
  const loadCourseOfferings = useCallback(async (targetBatchId = batchId) => {
    if (!targetBatchId) {
      setCourseOfferings([]);
      return [];
    }
    try {
      const response = await apiClient.get('/academic/programme-batch-courses', {
        params: { programmeBatchId: targetBatchId },
      });
      const data = unwrapList(response).map(normalizeOffering);
      setCourseOfferings(data);
      return data;
    } catch (err) {
      console.warn('loadCourseOfferings failed:', err);
      return [];
    }
  }, [batchId]);

  // Course Coordinators work only with their assigned programme-batch courses.
  // The offering ID, not the master-course ID, is the scope for every
  // downstream CO, mapping, attainment and ATR operation.
  const loadAssignedCourseOfferings = useCallback(async (coordinator = user, targetBatchId = batchId) => {
    const coordinatorEmail = String(coordinator?.email ?? '').trim().toLowerCase();

    if (!coordinatorEmail || !targetBatchId) {
      setCourseOfferings([]);
      return [];
    }

    try {
      const response = await apiClient.get('/academic/programme-batch-courses', {
        params: {
          programmeBatchId: targetBatchId,
          coordinatorEmail,
        },
      });
      const assigned = unwrapList(response).map(normalizeOffering);
      setCourseOfferings(assigned);
      return assigned;
    } catch (err) {
      console.warn('loadAssignedCourseOfferings failed:', err);
      setCourseOfferings([]);
      return [];
    }
  }, [batchId, user]);

  const loadCourseOffering = useCallback(async (offeringId) => {
    if (!offeringId) return null;
    try {
      const response = await apiClient.get(`/academic/programme-batch-courses/${offeringId}`);
      const data = normalizeOffering(unwrap(response));
      setCourseOfferings((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== data.id);
        return [...withoutCurrent, data];
      });
      setCourseOfferingId(data.id ?? null);
      return data;
    } catch (err) {
      console.warn(`loadCourseOffering(${offeringId}) failed:`, err);
      return null;
    }
  }, []);

  /* --- Course Coordinators / Faculty --- */
  const loadCourseCoordinators = useCallback(async () => {
    try {
      const response = await apiClient.get('/academic/users', {
        params: { role: 'COURSE_COORDINATOR' },
      });
      const data = unwrapList(response).map(normalizeUser);
      setCourseCoordinators(data);
      return data;
    } catch (err) {
      console.warn('loadCourseCoordinators failed:', err);
      return [];
    }
  }, []);

  /* --- HOD Directory --- */
  const loadHods = useCallback(async () => {
    try {
      const response = await apiClient.get('/academic/users', {
        params: { role: 'HOD' },
      });
      const data = unwrapList(response).map(normalizeUser);
      setHods(data);
      return data;
    } catch (err) {
      console.warn('loadHods failed:', err);
      return [];
    }
  }, []);

  /* --- Programme Coordinator Directory & HOD Assignments --- */
  const loadProgrammeCoordinators = useCallback(async () => {
    try {
      // The user directory is the documented source for role-based users.
      const response = await apiClient.get('/academic/users', {
        params: { role: 'PROGRAMME_COORDINATOR' },
      });
      const data = unwrapList(response).map(normalizeUser);
      setProgrammeCoordinators(data);
      return data;
    } catch (err) {
      console.warn('loadProgrammeCoordinators failed:', err);
      return [];
    }
  }, []);

  const loadHodCoordinators = useCallback(async (departmentId = null) => {
    try {
      const params = departmentId ? { departmentId } : {};
      const response = await apiClient.get('/academic/hod/coordinators', { params });
      const data = unwrapList(response);
      setHodCoordinatorAssignments(data);
      return data;
    } catch (err) {
      console.warn('loadHodCoordinators failed:', err);
      return [];
    }
  }, []);

  const assignHodCoordinator = useCallback(async (payload) => {
    const response = await apiClient.put('/academic/hod/coordinators', payload);
    const data = unwrap(response);

    setHodCoordinatorAssignments((previous) => [
      ...previous.filter((item) => item.programmeId !== data?.programmeId),
      data,
    ]);

    setProgrammes((previous) => previous.map((programme) => (
      programme.id === data?.programmeId
        ? {
            ...programme,
            coordinator: data.coordinator,
            coordinatorEmail: data.coordinatorEmail,
          }
        : programme
    )));

    return data;
  }, []);

  /* --- Students --- */
  const loadStudents = useCallback(async (targetBatchId = batchId) => {
    if (!targetBatchId) return [];
    try {
      const response = await apiClient.get(`/academic/programme-batches/${targetBatchId}/students`);
      const data = unwrapList(response);
      setStudents(data);
      return data;
    } catch (err) {
      console.warn(`loadStudents(${targetBatchId}) failed:`, err);
      return [];
    }
  }, [batchId]);

  /* --- Programme Outcomes --- */
  const loadProgrammeOutcomes = useCallback(
    async (targetProgrammeId = programmeId, { includeTargets = true, includePEOs = true } = {}) => {
      if (!targetProgrammeId) {
        setActivePOs([]);
        setActivePSOs([]);
        setActivePEOs([]);
        setPoPsoTargets(null);
        return;
      }

      try {
        // Load the documented outcome resources in order. Competencies are a
        // separate backend resource and are not required to render this tab.
        const poResponse = await apiClient.get(`/outcomes/master-programmes/${targetProgrammeId}/pos`);
        const psoResponse = await apiClient.get(`/outcomes/master-programmes/${targetProgrammeId}/psos`);
        const peoResponse = includePEOs
          ? await apiClient.get(`/outcomes/master-programmes/${targetProgrammeId}/peos`)
          : null;

        const withStatement = (outcomes) => outcomes.map((outcome) => ({
          ...outcome,
          statement: outcome?.statement ?? outcome?.description ?? outcome?.name ?? '',
        }));

        const pos = withStatement(unwrapList(poResponse));
        const psos = withStatement(unwrapList(psoResponse));
        const peos = withStatement(unwrapList(peoResponse));

        setActivePOs(pos);
        setActivePSOs(psos);
        if (includePEOs) setActivePEOs(peos);

        let targets = null;
        if (includeTargets) {
          const targetResponse = await apiClient.get(
            `/academic/master-programmes/${targetProgrammeId}/targets`
          );
          targets = unwrap(targetResponse);
          setPoPsoTargets(targets);
        }

        return { pos, psos, peos, targets };
      } catch (err) {
        console.warn(`loadProgrammeOutcomes(${targetProgrammeId}) failed:`, err);
        return { pos: [], psos: [], peos: [], targets: null };
      }
    },
    [programmeId]
  );

  /* --- Programme Batch Outcomes (HOD workflow) --- */
  const loadProgrammeBatchOutcomes = useCallback(async (targetProgrammeId, targetBatchId) => {
    if (!targetProgrammeId || !targetBatchId) {
      setActivePOs([]);
      setActivePSOs([]);
      setActivePEOs([]);
      return { pos: [], psos: [], peos: [] };
    }

    try {
      const response = await apiClient.get('/academic/outcomes', {
        params: { masterProgrammeId: targetProgrammeId, programmeBatchId: targetBatchId },
      });
      const data = unwrap(response) ?? {};
      const withStatement = (outcomes = []) => outcomes.map((outcome) => ({
        ...outcome,
        statement: outcome?.statement ?? outcome?.description ?? outcome?.name ?? '',
      }));
      const pos = withStatement(data.pos ?? []);
      const psos = withStatement(data.psos ?? []);
      const peos = withStatement(data.peos ?? []);

      setActivePOs(pos);
      setActivePSOs(psos);
      setActivePEOs(peos);
      return { pos, psos, peos };
    } catch (err) {
      console.warn(`loadProgrammeBatchOutcomes(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
      return { pos: [], psos: [], peos: [] };
    }
  }, []);

  /* --- Programme Targets --- */
  const loadProgrammeTargets = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId) return null;
      try {
        const params = targetBatchId ? { programmeBatchId: targetBatchId } : {};
        const response = await apiClient.get(
          `/academic/master-programmes/${targetProgrammeId}/targets`,
          { params }
        );
        const data = unwrap(response);
        setPoPsoTargets(data);
        return data;
      } catch (err) {
        console.warn(`loadProgrammeTargets(${targetProgrammeId}) failed:`, err);
        return null;
      }
    },
    [programmeId, batchId]
  );

  /* --- Course Outcomes --- */
  const loadCourseOutcomes = useCallback(
    async (offeringId = courseOfferingId) => {
      if (!offeringId) {
        setActiveCOs([]);
        return [];
      }
      try {
        const response = await apiClient.get(
          `/programme-batch-courses/${offeringId}/course-outcomes`
        );
        const data = unwrapList(response);
        setActiveCOs(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseOutcomes(${offeringId}) failed:`, err);
        return [];
      }
    },
    [courseOfferingId]
  );

  /* --- CO Mapping --- */
  const loadCourseMapping = useCallback(
    async (programmeBatchCourseId = courseOfferingId) => {
      if (!programmeBatchCourseId) {
        setCoMapping(null);
        return null;
      }
      try {
        // Do not render a previously selected course's matrix while the new
        // programme-batch-course mapping request is in flight.
        setCoMapping(null);
        const response = await apiClient.get(
          `/programme-batch-courses/${programmeBatchCourseId}/co-po-pso-mappings`
        );
        const data = unwrap(response);
        setCoMapping(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseMapping(${programmeBatchCourseId}) failed:`, err);
        return null;
      }
    },
    [courseOfferingId]
  );

  /* --- Attainment Settings --- */
  const loadAttainmentSettings = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        setAttainmentSettings(null);
        return null;
      }
      try {
        const response = await apiClient.get(`/attainment/configurations/${targetOfferingId}`);
        const data = unwrap(response);
        setAttainmentSettings(data);
        return data;
      } catch (err) {
        console.warn(`loadAttainmentSettings(${targetOfferingId}) failed:`, err);
        return null;
      }
    },
    [courseOfferingId]
  );

  /* --- CO Attainment --- */
  const loadCOAttainment = useCallback(
    async (offeringId = courseOfferingId) => {
      if (!offeringId) {
        setCoAttainment(null);
        return null;
      }
      try {
        const response = await apiClient.get(
          `/academic/programme-batch-courses/${offeringId}/attainment-main`
        );
        const data = unwrap(response);
        setCoAttainment(data);
        return data;
      } catch (err) {
        console.warn(`loadCOAttainment(${offeringId}) failed:`, err);
        return null;
      }
    },
    [courseOfferingId]
  );

  /* --- Course ATR --- */
  const loadCourseATR = useCallback(
    async (programmeBatchCourseId = courseOfferingId) => {
      if (!programmeBatchCourseId) {
        setCourseATR(null);
        return null;
      }
      try {
        const response = await apiClient.get(`/academic/programme-batch-courses/${programmeBatchCourseId}/atr`);
        const data = unwrap(response);
        setCourseATR(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseATR(${programmeBatchCourseId}) failed:`, err);
        return null;
      }
    },
    [courseOfferingId]
  );

  /* --- Programme ATR --- */
  const loadProgrammeATR = useCallback(
    async (targetProgrammeBatchId = batchId) => {
      if (!targetProgrammeBatchId) {
        setProgrammeATR(null);
        return null;
      }
      try {
        const response = await apiClient.get(
          `/academic/programme-batches/${targetProgrammeBatchId}/atr`
        );
        const data = unwrap(response);
        setProgrammeATR(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeATR failed:', err);
        return null;
      }
    },
    [batchId]
  );

  const saveProgrammeATR = useCallback(
    async (targetProgrammeBatchId = batchId, payload = {}) => {
      if (!targetProgrammeBatchId) {
        throw new Error('programmeBatchId is required to save Programme ATR.');
      }

      const response = await apiClient.post(
        `/academic/programme-batches/${targetProgrammeBatchId}/atr`,
        payload
      );
      const data = unwrap(response);
      setProgrammeATR(data);
      return data;
    },
    [batchId]
  );

  const submitProgrammeATR = useCallback(
    async (targetProgrammeBatchId = batchId) => {
      if (!targetProgrammeBatchId) {
        throw new Error('programmeBatchId is required to submit Programme ATR.');
      }

      const response = await apiClient.post(
        `/academic/programme-batches/${targetProgrammeBatchId}/atr/submit`
      );
      const data = unwrap(response);
      setProgrammeATR((previous) => ({ ...previous, ...data }));
      return data;
    },
    [batchId]
  );

  /* --- Dashboards --- */
  const loadDirectorDashboard = useCallback(
    async (targetSchoolId = selectedSchoolId) => {
      try {
        const params = {};
        if (targetSchoolId) params.schoolId = targetSchoolId;
        if (user?.email) params.directorEmail = user.email;

        const response = await apiClient.get('/dashboard/director', { params });
        const data = unwrap(response);
        setDirectorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadDirectorDashboard failed:', err);
        return null;
      }
    },
    [selectedSchoolId, user?.email]
  );

  const loadHodDashboard = useCallback(async () => {
    try {
      const params = {};
      if (user?.departmentId) params.departmentId = user.departmentId;
      if (user?.email) params.hodEmail = user.email;

      const response = await apiClient.get('/dashboard/hod', { params });
      const data = unwrap(response);
      setHodDashboard(data);
      return data;
    } catch (err) {
      console.warn('loadHodDashboard failed:', err);
      return null;
    }
  }, [user?.departmentId, user?.email]);

  const loadProgrammeCoordinatorDashboard = useCallback(
    async (targetProgrammeId = programmeId) => {
      try {
        const params = targetProgrammeId ? { masterProgrammeId: targetProgrammeId } : {};
        if (user?.email) params.coordinatorEmail = user.email;
        const response = await apiClient.get('/dashboard/programme-coordinator', { params });
        const data = unwrap(response);
        setProgrammeCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeCoordinatorDashboard failed:', err);
        return null;
      }
    },
    [programmeId, user?.email]
  );

  const loadCourseCoordinatorDashboard = useCallback(
    async (targetOfferingId = courseOfferingId, coordinatorEmail = user?.email) => {
      try {
        const params = {};
        if (targetOfferingId) params.programmeBatchCourseId = targetOfferingId;
        if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
        const response = await apiClient.get('/academic/course-coordinator/summary', {
          params,
        });
        const data = unwrap(response);
        setCourseCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadCourseCoordinatorDashboard failed:', err);
        return null;
      }
    },
    [courseOfferingId, user?.email]
  );

  /* --- Setup Progress --- */
  const loadSetupProgress = useCallback(async () => {
    try {
      let response = null;

      if (role === 'DIRECTOR') {
        const params = {};
        const schoolId = selectedSchoolId ?? user?.schoolId;
        if (schoolId) params.schoolId = schoolId;
        response = await apiClient.get('/academic/director/setup-progress', { params });
      } else if (role === 'HOD') {
        const params = {};
        if (user?.departmentId) params.departmentId = user.departmentId;
        if (user?.email) params.hodEmail = user.email;
        response = await apiClient.get('/academic/hod/setup-progress', { params });
      } else if (role === 'PROGRAMME_COORDINATOR') {
        if (!programmeId) return null;
        response = await apiClient.get('/academic/coordinator/setup-progress', {
          params: {
            coordinatorEmail: user?.email,
            masterProgrammeId: programmeId,
          },
        });
      } else if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        const targetOfferingOrCourse = courseOfferingId || courseId;
        if (!targetOfferingOrCourse) return null;
        response = await apiClient.get('/academic/course-coordinator/setup-progress', {
          params: {
            coordinatorEmail: user?.email,
            programmeBatchCourseId: targetOfferingOrCourse,
          },
        });
      } else {
        return null;
      }

      const data = unwrap(response);
      setSetupProgress(data);
      return data;
    } catch (err) {
      console.warn('loadSetupProgress failed:', err);
      return null;
    }
  }, [
    role,
    selectedSchoolId,
    user?.schoolId,
    user?.email,
    user?.departmentId,
    programmeId,
    batchId,
    courseId,
    courseOfferingId,
  ]);

  /* ======================================================================== */
  /* Mutators & Actions                                                       */
  /* ======================================================================== */

  /* --- Setup Progress Mutator --- */
  const saveSetupProgress = useCallback(
    async (nextStep, completedStep) => {
      let endpoint = null;
      let payload = null;

      if (role === 'DIRECTOR') {
        endpoint = '/academic/director/setup-progress';
        payload = {
          schoolId: selectedSchoolId ?? user?.schoolId,
          currentStep: nextStep,
          completedStep: String(completedStep),
          completedSteps: [String(completedStep)],
        };
      } else if (role === 'HOD') {
        endpoint = '/academic/hod/setup-progress';
        payload = {
          departmentId: user?.departmentId,
          hodEmail: user?.email,
          currentStep: nextStep,
          completedStep: String(completedStep),
        };
      } else if (role === 'PROGRAMME_COORDINATOR') {
        endpoint = '/academic/coordinator/setup-progress';
        const completedStepKey = PC_SETUP_STEP_KEYS[Number(completedStep)] ?? String(completedStep);
        const completedSteps = [
          ...(Array.isArray(setupProgress?.completedSteps) ? setupProgress.completedSteps : []),
          completedStepKey,
        ].map(String).filter((step, index, allSteps) => allSteps.indexOf(step) === index);
        payload = {
          masterProgrammeId: programmeId,
          programmeBatchId: batchId,
          coordinatorEmail: user?.email,
          currentStep: nextStep,
          completedSteps,
        };
      } else if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        endpoint = '/academic/course-coordinator/setup-progress';
        payload = {
          coordinatorEmail: user?.email,
          programmeBatchCourseId: courseOfferingId || courseId,
          currentStep: nextStep,
        };
      } else {
        return null;
      }

      const response = await apiClient.post(endpoint, payload);
      const data = unwrap(response);
      setSetupProgress(data);
      return data;
    },
    [
      role,
      selectedSchoolId,
      user?.schoolId,
      user?.email,
      user?.departmentId,
      programmeId,
      batchId,
      courseId,
      courseOfferingId,
      setupProgress?.completedSteps,
    ]
  );

  const completeProgrammeCoordinatorSetupProgress = useCallback(async () => {
    if (!programmeId) {
      throw new Error('masterProgrammeId is required to complete Programme Coordinator setup progress.');
    }

    const response = await apiClient.post(
      '/academic/coordinator/setup-progress/complete',
      null,
      { params: { masterProgrammeId: programmeId } }
    );
    const data = unwrap(response);
    setSetupProgress(data);
    return data;
  }, [programmeId]);

  /* --- School CRUD --- */
  const createSchool = useCallback(async (data) => {
    const res = await apiClient.post('/academic/schools', data);
    const item = normalizeSchool(unwrap(res));
    setSchools((prev) => [...prev.filter((s) => s.id !== item.id), item]);
    return item;
  }, []);

  const updateSchool = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/schools/${id}`, data);
    const item = normalizeSchool(unwrap(res));
    setSchools((prev) => prev.map((s) => (s.id === id ? item : s)));
    return item;
  }, []);

  /* --- Department CRUD --- */
  const createDepartment = useCallback(async (data) => {
    const res = await apiClient.post('/academic/departments', data);
    const item = normalizeDepartment(unwrap(res));
    setDepartments((prev) => [...prev.filter((d) => d.id !== item.id), item]);
    return item;
  }, []);

  const updateDepartment = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/departments/${id}`, data);
    const item = normalizeDepartment(unwrap(res));
    setDepartments((prev) => prev.map((d) => (d.id === id ? item : d)));
    return item;
  }, []);

  const deleteDepartment = useCallback(async (id) => {
    await apiClient.delete(`/academic/departments/${id}`);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  /* --- Programme CRUD --- */
  const createProgramme = useCallback(async (data) => {
    const res = await apiClient.post('/academic/master-programmes', toMasterProgrammePayload(data));
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => [...prev.filter((p) => p.id !== item.id), item]);
    return item;
  }, []);

  const updateProgramme = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/master-programmes/${id}`, toMasterProgrammePayload(data));
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => prev.map((p) => (p.id === id ? item : p)));
    return item;
  }, []);

  const deleteProgramme = useCallback(async (id) => {
    await apiClient.delete(`/academic/master-programmes/${id}`);
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const createMasterProgramme = useCallback(async (data) => {
    const res = await apiClient.post('/academic/master-programmes', toMasterProgrammePayload(data));
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => [...prev.filter((programme) => programme.id !== item.id), item]);
    return item;
  }, []);

  const updateMasterProgramme = useCallback(async (masterProgrammeId, data) => {
    const res = await apiClient.put(
      `/academic/master-programmes/${masterProgrammeId}`,
      toMasterProgrammePayload(data)
    );
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => prev.map((programme) => (
      programme.id === masterProgrammeId ? item : programme
    )));
    return item;
  }, []);

  const deleteMasterProgramme = useCallback(async (masterProgrammeId) => {
    await apiClient.delete(`/academic/master-programmes/${masterProgrammeId}`);
    setProgrammes((prev) => prev.filter((programme) => programme.id !== masterProgrammeId));
  }, []);

  /* --- Batch CRUD --- */
  const createBatch = useCallback(async (data) => {
    const res = await apiClient.post('/academic/programme-batches', toProgrammeBatchPayload(data));
    const item = normalizeBatch(unwrap(res));
    setBatches((prev) => [...prev.filter((b) => b.id !== item.id), item]);
    return item;
  }, []);

  const updateBatch = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/programme-batches/${id}`, toProgrammeBatchPayload(data));
    const item = normalizeBatch(unwrap(res));
    setBatches((prev) => prev.map((b) => (b.id === id ? item : b)));
    return item;
  }, []);

  const deleteBatch = useCallback(async (id) => {
    await apiClient.delete(`/academic/programme-batches/${id}`);
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const createProgrammeBatch = useCallback(async (data) => {
    const response = await apiClient.post('/academic/programme-batches', toProgrammeBatchPayload(data));
    const item = normalizeBatch(unwrap(response));
    setBatches((previous) => [...previous.filter((batch) => batch.id !== item.id), item]);
    return item;
  }, []);

  const updateProgrammeBatch = useCallback(async (programmeBatchId, data) => {
    const response = await apiClient.put(
      `/academic/programme-batches/${programmeBatchId}`,
      toProgrammeBatchPayload(data)
    );
    const item = normalizeBatch(unwrap(response));
    setBatches((previous) => previous.map((batch) => batch.id === programmeBatchId ? item : batch));
    return item;
  }, []);

  const deleteProgrammeBatch = useCallback(async (programmeBatchId) => {
    await apiClient.delete(`/academic/programme-batches/${programmeBatchId}`);
    setBatches((previous) => previous.filter((batch) => batch.id !== programmeBatchId));
  }, []);

  const updateProgrammeBatchStatus = useCallback(async (programmeBatchId, status, reason = null) => {
    const response = await apiClient.post(`/academic/programme-batches/${programmeBatchId}/status`, {
      status,
      ...(reason ? { reason } : {}),
    });
    const item = normalizeBatch(unwrap(response));
    setBatches((previous) => previous.map((batch) =>
      batch.id === programmeBatchId ? { ...batch, ...item, status } : batch
    ));
    return item;
  }, []);

  /* --- Course CRUD --- */
  const createCourse = useCallback(async (data) => {
    const res = await apiClient.post('/academic/master-courses', toMasterCoursePayload(data));
    const item = normalizeCourse(unwrap(res));
    setCourses((prev) => [...prev.filter((c) => c.id !== item.id), item]);
    return item;
  }, []);

  const updateCourse = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/master-courses/${id}`, toMasterCoursePayload(data));
    const item = normalizeCourse(unwrap(res));
    setCourses((prev) => prev.map((c) => (c.id === id ? item : c)));
    return item;
  }, []);

  const deleteCourse = useCallback(async (id) => {
    await apiClient.delete(`/academic/master-courses/${id}`);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const createMasterCourse = useCallback(async (data) => {
    const response = await apiClient.post('/academic/master-courses', toMasterCoursePayload(data));
    const item = normalizeCourse(unwrap(response));
    setCourses((previous) => [...previous.filter((course) => course.id !== item.id), item]);
    return item;
  }, []);

  const deleteMasterCourse = useCallback(async (masterCourseId) => {
    await apiClient.delete(`/academic/master-courses/${masterCourseId}`);
    setCourses((previous) => previous.filter((course) => course.id !== masterCourseId));
  }, []);

  /* --- Course Offering CRUD --- */
  const addCourseOffering = useCallback(async (payload) => {
    const response = await apiClient.post(
      '/academic/programme-batch-courses',
      toProgrammeBatchCoursePayload(payload)
    );
    const data = normalizeOffering(unwrap(response));

    setCourseOfferings((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== data.id);
      return [...withoutCurrent, data];
    });

    if (data?.id) {
      setCourseOfferingId(data.id);
    }
    return data;
  }, []);

  // Programme-batch courses are the authoritative allocation resource. Keep
  // them in the existing offering collection because downstream course work
  // (COs, mappings and attainment) remains scoped by this generated ID.
  const addProgrammeBatchCourse = useCallback(async (payload) => {
    const response = await apiClient.post(
      '/academic/programme-batch-courses',
      toProgrammeBatchCoursePayload(payload)
    );
    const data = normalizeOffering(unwrap(response));

    setCourseOfferings((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== data.id);
      return [...withoutCurrent, data];
    });

    if (data?.id) setCourseOfferingId(data.id);
    return data;
  }, []);

  const updateCourseOffering = useCallback(
    async (offeringId, payload) => {
      const response = await apiClient.put(
        `/academic/programme-batch-courses/${offeringId}`,
        toProgrammeBatchCoursePayload(payload)
      );
      const data = normalizeOffering(unwrap(response));

      setCourseOfferings((prev) =>
        prev.map((offering) => (offering.id === offeringId ? data : offering))
      );

      if (courseOfferingId === offeringId) {
        setCourseOfferingId(data.id ?? offeringId);
      }
      return data;
    },
    [courseOfferingId]
  );

  const updateProgrammeBatchCourse = useCallback(
    async (programmeBatchCourseId, payload) => {
      const response = await apiClient.put(
        `/academic/programme-batch-courses/${programmeBatchCourseId}`,
        toProgrammeBatchCoursePayload(payload)
      );
      const data = normalizeOffering(unwrap(response));

      setCourseOfferings((prev) =>
        prev.map((offering) =>
          offering.id === programmeBatchCourseId ? data : offering
        )
      );

      if (courseOfferingId === programmeBatchCourseId) {
        setCourseOfferingId(data.id ?? programmeBatchCourseId);
      }
      return data;
    },
    [courseOfferingId]
  );

  const assignCourseCoordinator = useCallback(
    async (targetCourseId, coordinatorId, targetBatchId = batchId) => {
      const offering = courseOfferings.find(
        (item) => item.courseId === targetCourseId && item.batchId === targetBatchId
      );

      if (!offering) {
        throw new Error(
          `Course Offering not found for course ${targetCourseId} and batch ${targetBatchId}`
        );
      }

      const coordinator = courseCoordinators.find((user) => String(user.id) === String(coordinatorId));
      if (!coordinator?.email) {
        throw new Error('A course coordinator email is required for the programme-batch course assignment.');
      }

      return updateCourseOffering(offering.id, {
        masterCourseId: offering.masterCourseId,
        programmeBatchId: offering.programmeBatchId,
        semester: offering.semester,
        courseCoordinatorEmail: coordinator.email,
        assignedFaculty: coordinator.email,
      });
    },
    [batchId, courseCoordinators, courseOfferings, updateCourseOffering]
  );

  /* --- Course Allocation --- */
  const allocateCourses = useCallback(async (payload) => {
    const response = await apiClient.post('/academic/master-courses/allocate', payload);
    return unwrap(response);
  }, []);

  /* --- Course Outcomes Mutator --- */
  const updateCourseCOs = useCallback(
    async (newCOs, offeringId = courseOfferingId) => {
      if (!offeringId) {
        throw new Error('Course Offering is required to save Course Outcomes.');
      }
      const response = await apiClient.post(
        `/programme-batch-courses/${offeringId}/course-outcomes`,
        newCOs
      );
      const data = unwrapList(response);
      setActiveCOs(data);
      return data;
    },
    [courseOfferingId]
  );

  /* --- CO Mapping Mutator --- */
  const updateCourseMapping = useCallback(
    async (mappingPayload, programmeBatchCourseId = courseOfferingId) => {
      if (!programmeBatchCourseId) {
        throw new Error('Programme-batch course is required to save CO mapping.');
      }
      const response = await apiClient.put(
        `/programme-batch-courses/${programmeBatchCourseId}/co-po-pso-mappings`,
        mappingPayload
      );
      const data = unwrap(response);
      setCoMapping(data);
      return data;
    },
    [courseOfferingId]
  );

  /* --- Attainment Settings Mutator --- */
  const updateAttainmentSettings = useCallback(
    async (payload, targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        throw new Error('Course Offering ID is required to save attainment settings.');
      }

      const body = {
        programmeBatchCourseId: targetOfferingId,
        directWeight: payload.directWeight ?? 80.0,
        indirectWeight: payload.indirectWeight ?? 20.0,
        directThreshold: payload.directThreshold ?? payload.targetThresholdPercentage ?? 60.0,
        indirectThreshold: payload.indirectThreshold ?? 60.0,
        directLevels: payload.directLevels ?? [],
      };

      const response = await apiClient.post('/attainment/configurations/save', body);
      const data = unwrap(response);
      setAttainmentSettings(data);
      return data;
    },
    [courseOfferingId]
  );

  /* --- Programme Targets Mutator --- */
  const updatePoPsoTargets = useCallback(
    async (targetProgrammeId, poTargets, psoTargets, targetBatchId = batchId) => {
      const pId = targetProgrammeId || programmeId;
      if (!pId) throw new Error('programmeId is required');

      const payload = {
        masterProgrammeId: pId,
        programmeBatchId: targetBatchId || null,
        poTargets,
        psoTargets,
      };

      const response = await apiClient.post(`/academic/master-programmes/${pId}/targets`, payload);
      const data = unwrap(response);
      setPoPsoTargets(data);
      return data;
    },
    [programmeId, batchId]
  );

  // PC target editing uses the outcome-target endpoint. Its payload is only
  // the two target maps; no PO or PSO statements are resent.
  const updateProgrammeOutcomeTargets = useCallback(async (targetProgrammeId, poTargets, psoTargets) => {
    const pId = targetProgrammeId || programmeId;
    if (!pId) throw new Error('programmeId is required');

    const response = await apiClient.post(`/outcomes/master-programmes/${pId}/targets`, {
      poTargets,
      psoTargets,
    });
    const data = unwrap(response);
    setPoPsoTargets(data);
    return data;
  }, [programmeId]);

  /* --- Programme Outcome Drafts and Save --- */
  // Draft updates are deliberately local. The HOD workflow commits all outcome
  // definitions only when its Save & Continue action is used.
  const updateProgrammePOs = useCallback((_targetProgrammeId, nextPOs) => {
    setActivePOs(nextPOs);
  }, []);

  const updateProgrammePSOs = useCallback((_targetProgrammeId, nextPSOs) => {
    setActivePSOs(nextPSOs);
  }, []);

  const updateProgrammePEOs = useCallback((_targetProgrammeId, nextPEOs) => {
    setActivePEOs(nextPEOs);
  }, []);

  const saveProgrammeOutcomeDefinitions = useCallback(
    async (targetProgrammeId, { pos = activePOs, psos = activePSOs, peos = activePEOs } = {}) => {
      if (!targetProgrammeId) {
        throw new Error('A programmeId is required to save programme outcomes.');
      }

      const nestedOutcomePayload = (items) => items.map((item) => ({
        code: item.code?.trim() ?? '',
        statement: (item.statement ?? item.description ?? '').trim(),
        competencies: (item.competencies || []).map((competency, index) => ({
          code: `${item.code}.${index + 1}`,
          statement: competency.statement?.trim() ?? '',
        })),
      }));

      const poPayload = nestedOutcomePayload(pos);
      const psoPayload = nestedOutcomePayload(psos);
      const peoPayload = peos.map((item) => ({
        code: item.code?.trim() ?? '',
        name: item.name?.trim() ?? '',
        description: (item.description ?? item.statement ?? '').trim(),
      }));
      const invalidOutcome = [...poPayload, ...psoPayload].some(
        (item) => !item.code || !item.statement || item.competencies.some((competency) => !competency.statement)
      ) || peoPayload.some((item) => !item.code || !item.name || !item.description);
      if (invalidOutcome) {
        throw new Error('Enter a code and outcome statement for every PO and PSO, plus a statement for each competency.');
      }

      const poResponse = await apiClient.post(`/outcomes/master-programmes/${targetProgrammeId}/pos`, poPayload);
      const psoResponse = await apiClient.post(`/outcomes/master-programmes/${targetProgrammeId}/psos`, psoPayload);
      const peoResponse = await apiClient.post(`/outcomes/master-programmes/${targetProgrammeId}/peos`, peoPayload);

      const normalizeOutcomeDraft = (item) => ({
        ...item,
        statement: item?.statement ?? item?.description ?? '',
      });
      setActivePOs(unwrapList(poResponse).map(normalizeOutcomeDraft));
      setActivePSOs(unwrapList(psoResponse).map((item) => normalizeOutcomeDraft(item)));
      setActivePEOs(unwrapList(peoResponse).map((item) => normalizeOutcomeDraft(item)));
    },
    [activePEOs, activePOs, activePSOs]
  );

  const saveProgrammeBatchOutcomeDefinitions = useCallback(
    async (targetProgrammeId, targetBatchId, { pos = activePOs, psos = activePSOs, peos = activePEOs } = {}) => {
      if (!targetProgrammeId || !targetBatchId) {
        throw new Error('programmeId and batchId are required to save Programme Batch outcomes.');
      }

      const outcomePayload = (items, includeTarget = false) => items.map((item) => ({
        code: item.code?.trim() ?? '',
        statement: (item.statement ?? item.description ?? item.name ?? '').trim(),
        ...(includeTarget ? { target: Number.isFinite(Number(item.target)) ? Number(item.target) : 2.5 } : {}),
        competencies: (item.competencies || []).map((competency, index) => ({
          code: competency.code?.trim() || `${item.code}.${index + 1}`,
          statement: competency.statement?.trim() ?? '',
        })),
      }));
      const payload = {
        masterProgrammeId: targetProgrammeId,
        programmeBatchId: targetBatchId,
        pos: outcomePayload(pos, true),
        psos: outcomePayload(psos, true),
        peos: outcomePayload(peos),
      };
      const invalid = [...payload.pos, ...payload.psos, ...payload.peos].some((item) => !item.code || !item.statement);
      if (invalid) throw new Error('Enter a code and statement for every PO, PSO, and PEO.');

      const hasExistingOutcomes = [...pos, ...psos, ...peos].some((item) => item.id);
      const response = await apiClient[hasExistingOutcomes ? 'put' : 'post'](
        '/academic/outcomes',
        payload,
        { params: { masterProgrammeId: targetProgrammeId, programmeBatchId: targetBatchId } }
      );
      const data = unwrap(response) ?? {};
      setActivePOs((data.pos ?? payload.pos).map((item) => ({ ...item, statement: item.statement ?? item.description ?? '' })));
      setActivePSOs((data.psos ?? payload.psos).map((item) => ({ ...item, statement: item.statement ?? item.description ?? '' })));
      setActivePEOs((data.peos ?? payload.peos).map((item) => ({ ...item, statement: item.statement ?? item.description ?? '' })));
      return data;
    },
    [activePEOs, activePOs, activePSOs]
  );

  /* --- Student Mutators --- */
  const createStudent = useCallback(
    async (targetBatchId, studentData) => {
      const bId = targetBatchId || batchId;
      if (!bId) throw new Error('batchId is required');
      const response = await apiClient.post(`/academic/programme-batches/${bId}/students`, studentData);
      const data = unwrap(response);
      setStudents((prev) => [...prev, data]);
      return data;
    },
    [batchId]
  );

  const deleteStudent = useCallback(async (id) => {
    await apiClient.delete(`/academic/students/${id}`);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /* ======================================================================== */
  /* Local Selection Setters (No Eager Network Requests)                      */
  /* ======================================================================== */

  const setProgrammeId = useCallback((newProgrammeId) => {
    const nextProgrammeId = newProgrammeId || null;
    setProgrammeIdState(nextProgrammeId);
    if (role === 'HOD' && typeof window !== 'undefined') {
      const key = `nba_hod_selected_master_programme:${user?.email ?? user?.id ?? 'current-user'}`;
      if (nextProgrammeId) sessionStorage.setItem(key, nextProgrammeId);
      else sessionStorage.removeItem(key);
    }
    if (role === 'PROGRAMME_COORDINATOR' && typeof window !== 'undefined') {
      const key = `nba_pc_selected_master_programme:${user?.email ?? user?.id ?? 'current-user'}`;
      if (nextProgrammeId) sessionStorage.setItem(key, nextProgrammeId);
      else sessionStorage.removeItem(key);
    }
    setBatchId(null);
    setCourseId(null);
    setCourseOfferingId(null);
    setCourseOfferings([]);
    setActiveCOs([]);
    setCoMapping(null);
    setAttainmentSettings(null);
    setCoAttainment(null);
    setCourseATR(null);
  }, [role, setBatchId, user?.email, user?.id]);

  const selectCourseOffering = useCallback((offering) => {
    if (!offering) {
      setCourseOfferingId(null);
      setCourseId(null);
      if ((role === 'FACULTY' || role === 'COURSE_COORDINATOR') && typeof window !== 'undefined') {
        sessionStorage.removeItem(getCourseCoordinatorSelectionStorageKey('programme_batch_course'));
      }
      return;
    }
    setCourseOfferingId(offering.id);
    setCourseId(offering.courseId);
    setBatchId(offering.batchId);
    if ((role === 'FACULTY' || role === 'COURSE_COORDINATOR') && typeof window !== 'undefined') {
      sessionStorage.setItem(getCourseCoordinatorSelectionStorageKey('programme_batch_course'), offering.id);
    }
  }, [role, setBatchId, user?.email, user?.id]);

  /* ======================================================================== */
  /* Context value                                                            */
  /* ======================================================================== */

  const value = {
    loading,
    role,
    user,

    /* School */
    schools,
    selectedSchool,
    selectedSchoolId,
    setSelectedSchoolId,
    loadSchools,
    createSchool,
    addSchool: createSchool,
    updateSchool,

    /* Departments */
    departments,
    selectedDepartment,
    selectedDepartmentId,
    setSelectedDepartmentId,
    loadDepartments,
    createDepartment,
    addDepartment: createDepartment,
    updateDepartment,
    deleteDepartment,

    /* Programmes */
    programmes,
    masterProgrammes: programmes,
    allMasterProgrammes: programmes,
    selectedProgramme,
    programmeId,
    setProgrammeId,
    loadProgrammes,
    loadMasterProgrammes,
    loadCoordinatorMasterProgrammes,
    createProgramme,
    addProgramme: createProgramme,
    updateProgramme,
    deleteProgramme,
    createMasterProgramme,
    updateMasterProgramme,
    deleteMasterProgramme,

    /* Batches */
    batches,
    batchId,
    setBatchId,
    selectedBatch,
    loadBatches,
    loadProgrammeBatches,
    loadCoordinatorProgrammeBatches,
    loadCourseCoordinatorProgrammeBatches,
    createBatch,
    addBatch: createBatch,
    updateBatch,
    deleteBatch,
    createProgrammeBatch,
    updateProgrammeBatch,
    deleteProgrammeBatch,
    updateProgrammeBatchStatus,

    /* Academic year */
    academicYear,
    setAcademicYear,

    /* Courses */
    courses,
    availableCourses,
    selectedCourse,
    courseId,
    setCourseId,
    loadCourses,
    loadMasterCourses,
    createCourse,
    addCourse: createCourse,
    updateCourse,
    deleteCourse,
    createMasterCourse,
    deleteMasterCourse,

    /* Course Offerings */
    courseOfferings,
    availableCourseOfferings,
    selectedCourseOffering,
    courseOfferingId,
    setCourseOfferingId,
    selectCourseOffering,
    loadCourseOfferings,
    loadAssignedCourseOfferings,
    loadCourseOffering,
    addCourseOffering,
    createCourseOffering: addCourseOffering,
    updateCourseOffering,
    addProgrammeBatchCourse,
    updateProgrammeBatchCourse,
    assignCourseCoordinator,
    allocateCourses,

    /* Course Coordinators & Faculty */
    courseCoordinators,
    facultyList,
    loadCourseCoordinators,
    hods,
    loadHods,
    programmeCoordinators,
    loadProgrammeCoordinators,
    hodCoordinatorAssignments,
    loadHodCoordinators,
    assignHodCoordinator,

    /* Programme Outcomes */
    activePOs,
    activePSOs,
    activePEOs,
    poPsoTargets,
    loadProgrammeOutcomes,
    loadProgrammeBatchOutcomes,
    updateProgrammePOs,
    updateProgrammePSOs,
    updateProgrammePEOs,
    saveProgrammeOutcomeDefinitions,
    saveProgrammeBatchOutcomeDefinitions,
    loadProgrammeTargets,
    updatePoPsoTargets,
    updateProgrammeOutcomeTargets,
    saveProgrammeTargets: updatePoPsoTargets,

    /* Course Outcomes */
    activeCOs,
    coTargets,
    loadCourseOutcomes,
    updateCourseCOs,

    /* CO Mapping */
    coMapping,
    loadCourseMapping,
    updateCourseMapping,

    /* Attainment */
    attainmentSettings,
    loadAttainmentSettings,
    updateAttainmentSettings,
    coAttainment,
    loadCOAttainment,

    /* ATR */
    programmeATR,
    setProgrammeATR,
    loadProgrammeATR,
    saveProgrammeATR,
    submitProgrammeATR,
    courseATR,
    loadCourseATR,

    /* Dashboards */
    directorDashboard,
    hodDashboard,
    programmeCoordinatorDashboard,
    courseCoordinatorDashboard,
    loadDirectorDashboard,
    loadHodDashboard,
    loadProgrammeCoordinatorDashboard,
    loadCourseCoordinatorDashboard,

    /* Setup Progress */
    setupProgress,
    loadSetupProgress,
    saveSetupProgress,
    completeProgrammeCoordinatorSetupProgress,

    /* Students */
    students,
    setStudents,
    loadStudents,
    createStudent,
    deleteStudent,
  };

  return (
    <AcademicContext.Provider value={value}>
      {children}
    </AcademicContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}

export default useAcademic;
