import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
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
  id: school?.id ?? null,
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
  id: department?.id ?? null,
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
  id: programme?.id ?? null,
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
  id: batch?.id ?? null,
  name: batch?.name ?? null,
  programmeId: batch?.programmeId ?? null,
  programmeCode: batch?.programmeCode ?? null,
  programmeName: batch?.programmeName ?? null,
  durationYears: batch?.durationYears ?? null,
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
  id: course?.id ?? null,
  code: course?.code ?? null,
  name: course?.name ?? null,
  programmeId: course?.programmeId ?? null,
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
  batchId: course?.batchId ?? null,
  courseOfferingId: course?.courseOfferingId ?? null,
});

const normalizeOffering = (offering) => ({
  id: offering?.id ?? null,
  courseId: offering?.courseId ?? null,
  batchId: offering?.batchId ?? null,
  semester: offering?.semester ?? null,
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
  courseName: offering?.courseName ?? null,
  courseCode: offering?.courseCode ?? null,
});

const normalizeUser = (user) => ({
  id: user?.id ?? null,
  username: user?.username ?? null,
  name: user?.name ?? null,
  email: user?.email ?? null,
  role: user?.role ?? null,
  schoolId: user?.schoolId ?? null,
  departmentId: user?.departmentId ?? null,
  programmeId: user?.programmeId ?? null,
  department: user?.department ?? null,
  programme: user?.programme ?? null,
  isActive: user?.isActive ?? user?.is_active ?? true,
});

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function AcademicProvider({ children }) {
  const { role, user } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* Global selections                                                        */
  /* ------------------------------------------------------------------------ */

  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [programmeId, setProgrammeIdState] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [courseOfferingId, setCourseOfferingId] = useState(null);
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
      const data = unwrapList(response).map(normalizeSchool);
      setSchools(data);

      if (data.length > 0) {
        const scopedSchool = data.find((school) => school.id === user?.schoolId);
        setSelectedSchoolId((currentId) => currentId ?? scopedSchool?.id ?? data[0].id);
      }

      return data;
    } catch (err) {
      console.warn('loadSchools failed:', err);
      return [];
    }
  }, [user?.schoolId]);

  /* --- Departments --- */
  const loadDepartments = useCallback(async (targetSchoolId = null) => {
    try {
      const params = targetSchoolId ? { schoolId: targetSchoolId } : {};
      const response = await apiClient.get('/academic/departments', { params });
      const data = unwrapList(response).map(normalizeDepartment);
      setDepartments(data);
      return data;
    } catch (err) {
      console.warn('loadDepartments failed:', err);
      return [];
    }
  }, []);

  /* --- Programmes --- */
  const loadProgrammes = useCallback(async (targetDepartmentId = null, coordinatorEmail = null) => {
    try {
      const params = targetDepartmentId ? { departmentId: targetDepartmentId } : {};
      if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;
      const response = await apiClient.get('/academic/programmes', { params });
      const data = unwrapList(response).map(normalizeProgramme);
      setProgrammes(data);
      return data;
    } catch (err) {
      console.warn('loadProgrammes failed:', err);
      return [];
    }
  }, []);

  /* --- Batches --- */
  const loadBatches = useCallback(
    async ({ targetProgrammeId = null, userEmail = null, targetRole = null } = {}) => {
      try {
        const params = {};
        if (targetProgrammeId) params.programmeId = targetProgrammeId;
        if (userEmail) params.userEmail = userEmail;
        if (targetRole) params.role = targetRole;

        const response = await apiClient.get('/academic/batches', { params });
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

  /* --- Courses --- */
  const loadCourses = useCallback(
    async ({ targetProgrammeId = null, targetBatchId = null } = {}) => {
      try {
        const params = {};
        if (targetProgrammeId) params.programmeId = targetProgrammeId;
        if (targetBatchId) params.batchId = targetBatchId;

        const response = await apiClient.get('/academic/courses', { params });
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

  /* --- Course Offerings --- */
  const loadCourseOfferings = useCallback(async (targetBatchId = batchId) => {
    if (!targetBatchId) {
      setCourseOfferings([]);
      return [];
    }
    try {
      const response = await apiClient.get('/academic/course-offerings', {
        params: { batchId: targetBatchId },
      });
      const data = unwrapList(response).map(normalizeOffering);
      setCourseOfferings(data);
      return data;
    } catch (err) {
      console.warn('loadCourseOfferings failed:', err);
      return [];
    }
  }, [batchId]);

  const loadCourseOffering = useCallback(async (offeringId) => {
    if (!offeringId) return null;
    try {
      const response = await apiClient.get(`/academic/course-offerings/${offeringId}`);
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
        params: { role: 'FACULTY' },
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
      const response = await apiClient.get(`/academic/batches/${targetBatchId}/students`);
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
        const poResponse = await apiClient.get(`/outcomes/programmes/${targetProgrammeId}/pos`);
        const psoResponse = await apiClient.get(`/outcomes/programmes/${targetProgrammeId}/psos`);
        const peoResponse = includePEOs
          ? await apiClient.get(`/outcomes/programmes/${targetProgrammeId}/peos`)
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
            `/academic/programmes/${targetProgrammeId}/targets`
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

  /* --- Programme Targets --- */
  const loadProgrammeTargets = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId) return null;
      try {
        const params = targetBatchId ? { batchId: targetBatchId } : {};
        const response = await apiClient.get(
          `/academic/programmes/${targetProgrammeId}/targets`,
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
          `/academic/course-offerings/${offeringId}/outcomes`
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
    async (offeringId = courseOfferingId) => {
      if (!offeringId) {
        setCoMapping(null);
        return null;
      }
      try {
        const response = await apiClient.get(
          `/academic/course-offerings/${offeringId}/mappings`
        );
        const data = unwrap(response);
        setCoMapping(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseMapping(${offeringId}) failed:`, err);
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
        const response = await apiClient.get(`/attainment/config/${targetOfferingId}`);
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
          `/reports/attainment-main/course/${offeringId}`
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
    async (offeringId = courseOfferingId) => {
      if (!offeringId) {
        setCourseATR(null);
        return null;
      }
      try {
        const response = await apiClient.get(`/reports/course-atr/${offeringId}`);
        const data = unwrap(response);
        setCourseATR(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseATR(${offeringId}) failed:`, err);
        return null;
      }
    },
    [courseOfferingId]
  );

  /* --- Programme ATR --- */
  const loadProgrammeATR = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        setProgrammeATR(null);
        return null;
      }
      try {
        const response = await apiClient.get(`/atr/programme/${targetProgrammeId}`, {
          params: { batchId: targetBatchId },
        });
        const data = unwrap(response);
        setProgrammeATR(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeATR failed:', err);
        return null;
      }
    },
    [programmeId, batchId]
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
        const params = targetProgrammeId ? { programmeId: targetProgrammeId } : {};
        const response = await apiClient.get('/dashboard/programme-coordinator', { params });
        const data = unwrap(response);
        setProgrammeCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeCoordinatorDashboard failed:', err);
        return null;
      }
    },
    [programmeId]
  );

  const loadCourseCoordinatorDashboard = useCallback(
    async (targetCourseId = courseId, targetBatchId = batchId) => {
      if (!targetCourseId || !targetBatchId) {
        setCourseCoordinatorDashboard(null);
        return null;
      }
      try {
        const response = await apiClient.get('/dashboard/course-coordinator', {
          params: {
            courseId: targetCourseId,
            batchId: targetBatchId,
          },
        });
        const data = unwrap(response);
        setCourseCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadCourseCoordinatorDashboard failed:', err);
        return null;
      }
    },
    [courseId, batchId]
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
        if (!programmeId || !batchId) return null;
        response = await apiClient.get('/academic/coordinator/setup-progress', {
          params: {
            coordinatorEmail: user?.email,
            programmeId,
            batchId,
          },
        });
      } else if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        const targetOfferingOrCourse = courseOfferingId || courseId;
        if (!targetOfferingOrCourse) return null;
        response = await apiClient.get('/academic/course-coordinator/setup-progress', {
          params: {
            coordinatorEmail: user?.email,
            courseId: targetOfferingOrCourse,
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
        payload = {
          coordinatorEmail: user?.email,
          programmeId,
          batchId,
          currentStep: nextStep,
          completedStep: String(completedStep),
        };
      } else if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        endpoint = '/academic/course-coordinator/setup-progress';
        payload = {
          coordinatorEmail: user?.email,
          courseId: courseOfferingId || courseId,
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
    ]
  );

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
    const res = await apiClient.post('/academic/programmes', data);
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => [...prev.filter((p) => p.id !== item.id), item]);
    return item;
  }, []);

  const updateProgramme = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/programmes/${id}`, data);
    const item = normalizeProgramme(unwrap(res));
    setProgrammes((prev) => prev.map((p) => (p.id === id ? item : p)));
    return item;
  }, []);

  const deleteProgramme = useCallback(async (id) => {
    await apiClient.delete(`/academic/programmes/${id}`);
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* --- Batch CRUD --- */
  const createBatch = useCallback(async (data) => {
    const res = await apiClient.post('/academic/batches', data);
    const item = normalizeBatch(unwrap(res));
    setBatches((prev) => [...prev.filter((b) => b.id !== item.id), item]);
    return item;
  }, []);

  const updateBatch = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/batches/${id}`, data);
    const item = normalizeBatch(unwrap(res));
    setBatches((prev) => prev.map((b) => (b.id === id ? item : b)));
    return item;
  }, []);

  const deleteBatch = useCallback(async (id) => {
    await apiClient.delete(`/academic/batches/${id}`);
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /* --- Course CRUD --- */
  const createCourse = useCallback(async (data) => {
    const res = await apiClient.post('/academic/courses', data);
    const item = normalizeCourse(unwrap(res));
    setCourses((prev) => [...prev.filter((c) => c.id !== item.id), item]);
    return item;
  }, []);

  const updateCourse = useCallback(async (id, data) => {
    const res = await apiClient.put(`/academic/courses/${id}`, data);
    const item = normalizeCourse(unwrap(res));
    setCourses((prev) => prev.map((c) => (c.id === id ? item : c)));
    return item;
  }, []);

  const deleteCourse = useCallback(async (id) => {
    await apiClient.delete(`/academic/courses/${id}`);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /* --- Course Offering CRUD --- */
  const addCourseOffering = useCallback(async (payload) => {
    const response = await apiClient.post('/academic/course-offerings', payload);
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

  const updateCourseOffering = useCallback(
    async (offeringId, payload) => {
      const response = await apiClient.put(`/academic/course-offerings/${offeringId}`, payload);
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

      return updateCourseOffering(offering.id, {
        courseId: offering.courseId,
        batchId: offering.batchId,
        semester: offering.semester,
        courseCoordinatorId: coordinatorId,
      });
    },
    [batchId, courseOfferings, updateCourseOffering]
  );

  /* --- Course Allocation --- */
  const allocateCourses = useCallback(async (payload) => {
    const response = await apiClient.post('/academic/courses/allocate', payload);
    return unwrap(response);
  }, []);

  /* --- Course Outcomes Mutator --- */
  const updateCourseCOs = useCallback(
    async (newCOs, offeringId = courseOfferingId) => {
      if (!offeringId) {
        throw new Error('Course Offering is required to save Course Outcomes.');
      }
      const response = await apiClient.post(
        `/academic/course-offerings/${offeringId}/outcomes`,
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
    async (mappingPayload, offeringId = courseOfferingId) => {
      if (!offeringId) {
        throw new Error('Course Offering is required to save CO mapping.');
      }
      const response = await apiClient.put(
        `/academic/course-offerings/${offeringId}/mappings`,
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
        courseOfferingId: targetOfferingId,
        directWeight: payload.directWeight ?? 80.0,
        indirectWeight: payload.indirectWeight ?? 20.0,
        internalWeight: payload.internalWeight ?? 30.0,
        externalWeight: payload.externalWeight ?? 70.0,
        targetThresholdPercentage:
          payload.targetThresholdPercentage ?? payload.directThreshold ?? 60.0,
        status: payload.status ?? 'DRAFT',
        directLevelsJson:
          payload.directLevelsJson ??
          (payload.directLevels ? JSON.stringify(payload.directLevels) : null),
        indirectLevelsJson:
          payload.indirectLevelsJson ??
          (payload.indirectLevels ? JSON.stringify(payload.indirectLevels) : null),
      };

      const response = await apiClient.put(`/attainment/config/${targetOfferingId}`, body);
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
        programmeId: pId,
        batchId: targetBatchId || null,
        poTargets,
        psoTargets,
      };

      const response = await apiClient.post(`/academic/programmes/${pId}/targets`, payload);
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

    const response = await apiClient.post(`/outcomes/programmes/${pId}/targets`, {
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

      const poResponse = await apiClient.post(`/outcomes/programmes/${targetProgrammeId}/pos`, poPayload);
      const psoResponse = await apiClient.post(`/outcomes/programmes/${targetProgrammeId}/psos`, psoPayload);
      const peoResponse = await apiClient.post(`/outcomes/programmes/${targetProgrammeId}/peos`, peoPayload);

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

  /* --- Student Mutators --- */
  const createStudent = useCallback(
    async (targetBatchId, studentData) => {
      const bId = targetBatchId || batchId;
      if (!bId) throw new Error('batchId is required');
      const response = await apiClient.post(`/academic/batches/${bId}/students`, studentData);
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
    setProgrammeIdState(newProgrammeId);
    setBatchId(null);
    setCourseId(null);
    setCourseOfferingId(null);
    setCourseOfferings([]);
    setActiveCOs([]);
    setCoMapping(null);
    setAttainmentSettings(null);
    setCoAttainment(null);
    setCourseATR(null);
  }, []);

  const selectCourseOffering = useCallback((offering) => {
    if (!offering) {
      setCourseOfferingId(null);
      setCourseId(null);
      return;
    }
    setCourseOfferingId(offering.id);
    setCourseId(offering.courseId);
    setBatchId(offering.batchId);
  }, []);

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
    createProgramme,
    addProgramme: createProgramme,
    updateProgramme,
    deleteProgramme,

    /* Batches */
    batches,
    batchId,
    setBatchId,
    selectedBatch,
    loadBatches,
    createBatch,
    addBatch: createBatch,
    updateBatch,
    deleteBatch,

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
    createCourse,
    addCourse: createCourse,
    updateCourse,
    deleteCourse,

    /* Course Offerings */
    courseOfferings,
    availableCourseOfferings,
    selectedCourseOffering,
    courseOfferingId,
    setCourseOfferingId,
    selectCourseOffering,
    loadCourseOfferings,
    loadCourseOffering,
    addCourseOffering,
    createCourseOffering: addCourseOffering,
    updateCourseOffering,
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
    updateProgrammePOs,
    updateProgrammePSOs,
    updateProgrammePEOs,
    saveProgrammeOutcomeDefinitions,
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
