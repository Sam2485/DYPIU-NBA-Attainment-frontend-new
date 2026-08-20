import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { useAuth } from './auth';
import apiClient from '../api/client';

export const AcademicContext =
  createContext(null);

/* ========================================================================== */
/* Response helpers                                                           */
/* ========================================================================== */

const unwrap = (response) => {
  if (response == null) {
    return null;
  }

  /*
   * apiClient may return the raw Axios response OR response.data.
   */
  if (
    response?.data?.data !== undefined
  ) {
    return response.data.data;
  }

  if (
    response?.data !== undefined
  ) {
    return response.data;
  }

  return response;
};

const unwrapList = (response) => {
  const value = unwrap(response);
  return Array.isArray(value)
    ? value
    : [];
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
  deanEmail:
    school?.deanEmail ?? '',
  director:
    school?.directorName ??
    school?.director ??
    '',
  directorEmail:
    school?.directorEmail ??
    school?.email ??
    '',
  estYear:
    school?.estYear ?? null,
  email:
    school?.email ??
    school?.directorEmail ??
    '',
  status:
    school?.status ?? null,
  createdAt:
    school?.createdAt ?? null,
  updatedAt:
    school?.updatedAt ?? null,
});

const normalizeDepartment = (department) => ({
  id:
    department?.id ?? null,
  schoolId:
    department?.schoolId ?? null,
  code:
    department?.code ?? null,
  name:
    department?.name ?? null,
  hod:
    department?.hod ?? '',
  hodEmail:
    department?.hodEmail ?? '',
  status:
    department?.status ?? null,
  createdAt:
    department?.createdAt ?? null,
  updatedAt:
    department?.updatedAt ?? null,
});

const normalizeProgramme = (programme) => ({
  id:
    programme?.id ?? null,
  departmentId:
    programme?.departmentId ?? null,
  code:
    programme?.code ?? null,
  name:
    programme?.name ?? null,
  degree:
    programme?.degree ?? null,
  durationYears:
    programme?.durationYears ?? null,
  department:
    programme?.departmentName ??
    programme?.department ??
    '',
  coordinator:
    programme?.coordinator ?? '',
  coordinatorEmail:
    programme?.coordinatorEmail ?? '',
  status:
    programme?.status ?? null,
  createdAt:
    programme?.createdAt ?? null,
  updatedAt:
    programme?.updatedAt ?? null,
});

const normalizeBatch = (batch) => ({
  id:
    batch?.id ?? null,
  name:
    batch?.name ?? null,
  programmeId:
    batch?.programmeId ?? null,
  programmeCode:
    batch?.programmeCode ?? null,
  programmeName:
    batch?.programmeName ?? null,
  durationYears:
    batch?.durationYears ?? null,
  startYear:
    batch?.startYear ?? null,
  endYear:
    batch?.endYear ?? null,
  academicYear:
    batch?.academicYear ?? null,
  yearLevel:
    batch?.yearLevel ??
    batch?.currentYear ??
    null,
  status:
    batch?.status ?? null,
  createdAt:
    batch?.createdAt ?? null,
  updatedAt:
    batch?.updatedAt ?? null,
});

const normalizeCourse = (course) => ({
  id:
    course?.id ?? null,
  code:
    course?.code ?? null,
  name:
    course?.name ?? null,
  programmeId:
    course?.programmeId ?? null,
  semester:
    course?.semester ?? null,
  credits:
    course?.credits ?? null,
  status:
    course?.status ?? null,
  createdAt:
    course?.createdAt ?? null,
  updatedAt:
    course?.updatedAt ?? null,

  /*
   * Preserve any backend-supplied batch/offering
   * metadata without inventing values.
   */
  batchId:
    course?.batchId ?? null,

  courseOfferingId:
    course?.courseOfferingId ??
    null,
});

const normalizeOffering = (offering) => ({
  id:
    offering?.id ?? null,

  courseId:
    offering?.courseId ?? null,

  batchId:
    offering?.batchId ?? null,

  semester:
    offering?.semester ?? null,

  courseCoordinatorId:
    offering?.courseCoordinatorId ??
    null,

  courseCoordinatorName:
    offering?.courseCoordinatorName ??
    offering?.courseCoordinator ??
    '',

  courseCoordinatorEmail:
    offering?.courseCoordinatorEmail ??
    '',

  status:
    offering?.status ?? null,

  /*
   * Kept only for compatibility with
   * existing response fields.
   *
   * It is NOT used as an independent owner.
   */
  assignedFaculty:
    offering?.assignedFaculty ??
    null,

  createdAt:
    offering?.createdAt ?? null,

  updatedAt:
    offering?.updatedAt ?? null,

  course:
    offering?.course ?? null,

  courseName:
    offering?.courseName ?? null,

  courseCode:
    offering?.courseCode ?? null,
});

const normalizeUser = (user) => ({
  id:
    user?.id ?? null,
  username:
    user?.username ?? null,
  name:
    user?.name ?? null,
  email:
    user?.email ?? null,
  role:
    user?.role ?? null,
  schoolId:
    user?.schoolId ?? null,
  departmentId:
    user?.departmentId ?? null,
  programmeId:
    user?.programmeId ?? null,
  department:
    user?.department ?? null,
  programme:
    user?.programme ?? null,
  isActive:
    user?.isActive ??
    user?.is_active ??
    true,
});

const normalizeResponseData = (response) =>
  unwrap(response);

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function AcademicProvider({
  children,
}) {
  const {
    role,
    user,
  } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* Global selections                                                        */
  /* ------------------------------------------------------------------------ */

  const [
    selectedSchoolId,
    setSelectedSchoolId,
  ] = useState(null);

  const [
    programmeId,
    setProgrammeIdState,
  ] = useState(null);

  const [
    batchId,
    setBatchId,
  ] = useState(null);

  const [
    courseId,
    setCourseId,
  ] = useState(null);

  const [
    courseOfferingId,
    setCourseOfferingId,
  ] = useState(null);

  const [
    academicYear,
    setAcademicYear,
  ] = useState('');

  /* ------------------------------------------------------------------------ */
  /* Backend state                                                            */
  /* ------------------------------------------------------------------------ */

  const [
    schools,
    setSchools,
  ] = useState([]);

  const [
    departments,
    setDepartments,
  ] = useState([]);

  const [
    programmes,
    setProgrammes,
  ] = useState([]);

  const [
    batches,
    setBatches,
  ] = useState([]);

  const [
    courses,
    setCourses,
  ] = useState([]);

  const [
    courseOfferings,
    setCourseOfferings,
  ] = useState([]);

  const [
    courseCoordinators,
    setCourseCoordinators,
  ] = useState([]);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    activePOs,
    setActivePOs,
  ] = useState([]);

  const [
    activePSOs,
    setActivePSOs,
  ] = useState([]);

  const [
    activePEOs,
    setActivePEOs,
  ] = useState([]);

  const [
    poPsoTargets,
    setPoPsoTargets,
  ] = useState(null);

  const [
    activeCOs,
    setActiveCOs,
  ] = useState([]);

  const [
    coTargets,
    setCoTargets,
  ] = useState(null);

  const [
    programmeATR,
    setProgrammeATR,
  ] = useState(null);

  const [
    courseATR,
    setCourseATR,
  ] = useState(null);

  const [
    attainmentSettings,
    setAttainmentSettings,
  ] = useState(null);

  const [
    coMapping,
    setCoMapping,
  ] = useState(null);

  const [
    coAttainment,
    setCoAttainment,
  ] = useState(null);

  const [
    directorDashboard,
    setDirectorDashboard,
  ] = useState(null);

  const [
    hodDashboard,
    setHodDashboard,
  ] = useState(null);

  const [
    programmeCoordinatorDashboard,
    setProgrammeCoordinatorDashboard,
  ] = useState(null);

  const [
    courseCoordinatorDashboard,
    setCourseCoordinatorDashboard,
  ] = useState(null);

  const [
    setupProgress,
    setSetupProgress,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ======================================================================== */
  /* Derived selections                                                       */
  /* ======================================================================== */

  const selectedSchool =
    useMemo(
      () =>
        schools.find(
          (school) =>
            school.id ===
            selectedSchoolId
        ) ?? null,
      [
        schools,
        selectedSchoolId,
      ]
    );

  const selectedProgramme =
    useMemo(
      () =>
        programmes.find(
          (programme) =>
            programme.id ===
            programmeId
        ) ?? null,
      [
        programmes,
        programmeId,
      ]
    );

  const selectedBatch =
    useMemo(
      () =>
        batches.find(
          (batch) =>
            batch.id ===
            batchId
        ) ?? null,
      [
        batches,
        batchId,
      ]
    );

  const selectedCourse =
    useMemo(
      () =>
        courses.find(
          (course) =>
            course.id ===
            courseId
        ) ?? null,
      [
        courses,
        courseId,
      ]
    );

  const selectedCourseOffering =
    useMemo(
      () =>
        courseOfferings.find(
          (offering) =>
            offering.id ===
            courseOfferingId
        ) ?? null,
      [
        courseOfferings,
        courseOfferingId,
      ]
    );

  const availableCourses =
    useMemo(() => {
      if (!programmeId) {
        return [];
      }

      return courses.filter(
        (course) =>
          course.programmeId ===
          programmeId
      );
    }, [
      courses,
      programmeId,
    ]);

  const availableCourseOfferings =
    useMemo(() => {
      let result =
        courseOfferings;

      if (batchId) {
        result =
          result.filter(
            (offering) =>
              offering.batchId ===
              batchId
          );
      }

      if (courseId) {
        result =
          result.filter(
            (offering) =>
              offering.courseId ===
              courseId
          );
      }

      return result;
    }, [
      courseOfferings,
      batchId,
      courseId,
    ]);

  /* ======================================================================== */
  /* Schools                                                                  */
  /* ======================================================================== */

  const loadSchools =
    useCallback(
      async () => {
        const response =
          await apiClient.get(
            '/academic/schools'
          );

        const data =
          unwrapList(response)
            .map(normalizeSchool);

        setSchools(data);

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Departments                                                              */
  /* ======================================================================== */

  const loadDepartments =
    useCallback(
      async (
        targetSchoolId = null
      ) => {
        const params = {};

        if (targetSchoolId) {
          params.schoolId =
            targetSchoolId;
        }

        const response =
          await apiClient.get(
            '/academic/departments',
            { params }
          );

        const data =
          unwrapList(response)
            .map(
              normalizeDepartment
            );

        setDepartments(data);

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Programmes                                                               */
  /* ======================================================================== */

  const loadProgrammes =
    useCallback(
      async (
        targetDepartmentId = null
      ) => {
        const params = {};

        if (targetDepartmentId) {
          params.departmentId =
            targetDepartmentId;
        }

        const response =
          await apiClient.get(
            '/academic/programmes',
            { params }
          );

        const data =
          unwrapList(response)
            .map(
              normalizeProgramme
            );

        setProgrammes(data);

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Batches                                                                  */
  /* ======================================================================== */

  const loadBatches =
    useCallback(
      async ({
        targetProgrammeId = null,
        userEmail = null,
        targetRole = null,
      } = {}) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        if (userEmail) {
          params.userEmail =
            userEmail;
        }

        if (targetRole) {
          params.role =
            targetRole;
        }

        const response =
          await apiClient.get(
            '/academic/batches',
            { params }
          );

        const data =
          unwrapList(response)
            .map(normalizeBatch);

        setBatches(data);

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Courses                                                                  */
  /* ======================================================================== */

  const loadCourses =
    useCallback(
      async ({
        targetProgrammeId = null,
        targetBatchId = null,
      } = {}) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        if (
          targetBatchId
        ) {
          params.batchId =
            targetBatchId;
        }

        const response =
          await apiClient.get(
            '/academic/courses',
            { params }
          );

        const data =
          unwrapList(response)
            .map(normalizeCourse);

        setCourses(data);

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Course Offerings                                                         */
  /* ======================================================================== */

  const loadCourseOfferings =
    useCallback(
      async (
        targetBatchId = batchId
      ) => {
        if (!targetBatchId) {
          setCourseOfferings([]);
          setCourseOfferingId(
            null
          );

          return [];
        }

        const response =
          await apiClient.get(
            '/academic/course-offerings',
            {
              params: {
                batchId:
                  targetBatchId,
              },
            }
          );

        const data =
          unwrapList(response)
            .map(
              normalizeOffering
            );

        setCourseOfferings(data);

        return data;
      },
      [batchId]
    );

  /* ======================================================================== */
  /* Course Offering by ID                                                    */
  /* ======================================================================== */

  const loadCourseOffering =
    useCallback(
      async (
        offeringId
      ) => {
        if (!offeringId) {
          return null;
        }

        const response =
          await apiClient.get(
            `/academic/course-offerings/${offeringId}`
          );

        const data =
          normalizeOffering(
            normalizeResponseData(
              response
            )
          );

        setCourseOfferings(
          (previous) => {
            const existing =
              previous.filter(
                (item) =>
                  item.id !==
                  data.id
              );

            return [
              ...existing,
              data,
            ];
          }
        );

        setCourseOfferingId(
          data.id ??
            null
        );

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Initial loading                                                          */
  /* ======================================================================== */

  useEffect(() => {
    let mounted = true;

    const loadInitial =
      async () => {
        setLoading(true);

        try {
          const schoolData =
            await loadSchools();

          if (!mounted) {
            return;
          }

          const firstSchool =
            schoolData[0];

          if (
            !selectedSchoolId &&
            firstSchool?.id
          ) {
            setSelectedSchoolId(
              firstSchool.id
            );
          }

          /*
           * Do not automatically select
           * an arbitrary programme or batch.
           *
           * Those selections belong to the
           * role-specific workflow/sidebar.
           */
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadInitial().catch(
      (error) => {
        console.error(
          'Initial academic load failed:',
          error
        );

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
    };
  }, [
    loadSchools,
    selectedSchoolId,
  ]);

  /* ======================================================================== */
  /* Programme change                                                         */
  /* ======================================================================== */

  useEffect(() => {
    if (!programmeId) {
      return;
    }

    let mounted = true;

    const refreshProgrammeContext =
      async () => {
        const [
          batchData,
          courseData,
        ] =
          await Promise.all([
            loadBatches({
              targetProgrammeId:
                programmeId,
            }),

            loadCourses({
              targetProgrammeId:
                programmeId,

              /*
               * Do not send an old batch
               * belonging to another programme.
               */
              targetBatchId:
                null,
            }),
          ]);

        if (!mounted) {
          return;
        }

        /*
         * Preserve the currently selected batch
         * only if it actually belongs to the
         * selected programme.
         *
         * Otherwise clear it instead of
         * silently selecting batch[0].
         */
        const currentBatch =
          batchData.find(
            (batch) =>
              batch.id ===
              batchId
          );

        if (!currentBatch) {
          setBatchId(null);
          setCourseOfferingId(
            null
          );
          setCourseOfferings([]);
        }

        /*
         * Preserve course only when it belongs
         * to the selected programme.
         */
        const currentCourse =
          courseData.find(
            (course) =>
              course.id ===
              courseId
          );

        if (!currentCourse) {
          setCourseId(null);
        }
      };

    refreshProgrammeContext().catch(
      (error) => {
        console.error(
          'Failed to refresh programme context:',
          error
        );
      }
    );

    return () => {
      mounted = false;
    };
  }, [
    programmeId,
    batchId,
    courseId,
    loadBatches,
    loadCourses,
  ]);

  /* ======================================================================== */
  /* Batch change                                                             */
  /* ======================================================================== */

  useEffect(() => {
    if (!batchId) {
      setCourseOfferings([]);
      setCourseOfferingId(
        null
      );
      return;
    }

    loadCourseOfferings(
      batchId
    ).catch((error) => {
      console.error(
        'Failed to load course offerings:',
        error
      );
    });
  }, [
    batchId,
    loadCourseOfferings,
  ]);

  /* ======================================================================== */
  /* Course -> CourseOffering resolution                                      */
  /* ======================================================================== */

  useEffect(() => {
    if (
      !courseId ||
      !batchId
    ) {
      setCourseOfferingId(
        null
      );
      return;
    }

    const matchingOffering =
      courseOfferings.find(
        (offering) =>
          offering.courseId ===
            courseId &&
          offering.batchId ===
            batchId
      );

    setCourseOfferingId(
      matchingOffering?.id ??
        null
    );
  }, [
    courseId,
    batchId,
    courseOfferings,
  ]);

  /* ======================================================================== */
  /* Course Coordinators                                                      */
  /* ======================================================================== */

  const loadCourseCoordinators =
    useCallback(
      async () => {
        /*
         * Course Coordinator = FACULTY
         * in the backend.
         */
        const response =
          await apiClient.get(
            '/users',
            {
              params: {
                role: 'FACULTY',
              },
            }
          );

        const data =
          unwrapList(response)
            .map(normalizeUser);

        setCourseCoordinators(
          data
        );

        return data;
      },
      []
    );

  useEffect(() => {
    if (
      role ===
        'PROGRAMME_COORDINATOR' ||
      role === 'HOD' ||
      role === 'DIRECTOR' ||
      role === 'ADMIN'
    ) {
      loadCourseCoordinators()
        .catch((error) => {
          console.error(
            'Failed to load course coordinators:',
            error
          );
        });
    }
  }, [
    role,
    loadCourseCoordinators,
  ]);

  /* ======================================================================== */
  /* Programme Outcomes                                                      */
  /* ======================================================================== */

  const loadProgrammeOutcomes =
    useCallback(
      async (
        targetProgrammeId =
          programmeId
      ) => {
        if (
          !targetProgrammeId
        ) {
          setActivePOs([]);
          setActivePSOs([]);
          setActivePEOs([]);
          setPoPsoTargets(null);
          return;
        }

        const results =
          await Promise.allSettled([
            apiClient.get(
              `/outcomes/programmes/${targetProgrammeId}/pos`
            ),

            apiClient.get(
              `/outcomes/programmes/${targetProgrammeId}/psos`
            ),

            apiClient.get(
              `/outcomes/programmes/${targetProgrammeId}/peos`
            ),

            apiClient.get(
              `/outcomes/programmes/${targetProgrammeId}/targets`
            ),
          ]);

        if (
          results[0].status ===
          'fulfilled'
        ) {
          setActivePOs(
            unwrapList(
              results[0].value
            )
          );
        }

        if (
          results[1].status ===
          'fulfilled'
        ) {
          setActivePSOs(
            unwrapList(
              results[1].value
            )
          );
        }

        if (
          results[2].status ===
          'fulfilled'
        ) {
          setActivePEOs(
            unwrapList(
              results[2].value
            )
          );
        }

        if (
          results[3].status ===
          'fulfilled'
        ) {
          setPoPsoTargets(
            unwrap(
              results[3].value
            )
          );
        }
      },
      [programmeId]
    );

  useEffect(() => {
    loadProgrammeOutcomes(
      programmeId
    ).catch((error) => {
      console.error(
        'Failed to load programme outcomes:',
        error
      );
    });
  }, [
    programmeId,
    loadProgrammeOutcomes,
  ]);

  /* ======================================================================== */
  /* Course Outcomes                                                          */
  /* ======================================================================== */

  const loadCourseOutcomes =
    useCallback(
      async (
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          setActiveCOs([]);
          return [];
        }

        const response =
          await apiClient.get(
            `/academic/course-offerings/${offeringId}/outcomes`
          );

        const data =
          unwrapList(response);

        setActiveCOs(data);

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* CO Mapping                                                               */
  /* ======================================================================== */

  const loadCourseMapping =
    useCallback(
      async (
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          setCoMapping(null);
          return null;
        }

        const response =
          await apiClient.get(
            `/academic/course-offerings/${offeringId}/mappings`
          );

        const data =
          unwrap(response);

        setCoMapping(data);

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* Attainment Settings                                                      */
  /* ======================================================================== */

  const loadAttainmentSettings =
    useCallback(
      async (
        targetCourseId =
          courseId,
        targetBatchId =
          batchId
      ) => {
        if (
          !targetCourseId
        ) {
          setAttainmentSettings(
            null
          );

          return null;
        }

        const params = {};

        if (
          targetBatchId
        ) {
          params.batchId =
            targetBatchId;
        }

        const response =
          await apiClient.get(
            `/attainment/config/${targetCourseId}`,
            { params }
          );

        const data =
          unwrap(response);

        setAttainmentSettings(
          data
        );

        return data;
      },
      [
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* CO Attainment                                                            */
  /* ======================================================================== */

  const loadCOAttainment =
    useCallback(
      async (
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          setCoAttainment(null);
          return null;
        }

        const response =
          await apiClient.get(
            `/reports/attainment-main/course/${offeringId}`
          );

        const data =
          unwrap(response);

        setCoAttainment(data);

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* Course ATR                                                               */
  /* ======================================================================== */

  const loadCourseATR =
    useCallback(
      async (
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          setCourseATR(null);
          return null;
        }

        const response =
          await apiClient.get(
            `/reports/course-atr/${offeringId}`
          );

        const data =
          unwrap(response);

        setCourseATR(data);

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* Course-level workflow hydration                                         */
  /* ======================================================================== */

  useEffect(() => {
    if (!courseOfferingId) {
      setActiveCOs([]);
      setCoMapping(null);
      setCoAttainment(null);
      setCourseATR(null);

      /*
       * Attainment settings is courseId +
       * batchId based in the documented API.
       */
      setAttainmentSettings(null);

      return;
    }

    Promise.allSettled([
      loadCourseOutcomes(
        courseOfferingId
      ),

      loadCourseMapping(
        courseOfferingId
      ),

      loadAttainmentSettings(
        courseId,
        batchId
      ),

      loadCOAttainment(
        courseOfferingId
      ),

      loadCourseATR(
        courseOfferingId
      ),
    ]).catch((error) => {
      console.error(
        'Course workflow hydration failed:',
        error
      );
    });
  }, [
    courseOfferingId,
    courseId,
    batchId,
    loadCourseOutcomes,
    loadCourseMapping,
    loadAttainmentSettings,
    loadCOAttainment,
    loadCourseATR,
  ]);

  /* ======================================================================== */
  /* Director Dashboard                                                       */
  /* ======================================================================== */

  const loadDirectorDashboard =
    useCallback(
      async (
        targetSchoolId =
          selectedSchoolId
      ) => {
        const params = {};

        if (
          targetSchoolId
        ) {
          params.schoolId =
            targetSchoolId;
        }

        if (user?.email) {
          params.directorEmail =
            user.email;
        }

        const response =
          await apiClient.get(
            '/dashboard/director',
            { params }
          );

        const data =
          unwrap(response);

        setDirectorDashboard(
          data
        );

        return data;
      },
      [
        selectedSchoolId,
        user?.email,
      ]
    );

  /* ======================================================================== */
  /* HOD Dashboard                                                            */
  /* ======================================================================== */

  const loadHodDashboard =
    useCallback(
      async () => {
        const params = {};

        if (
          user?.departmentId
        ) {
          params.departmentId =
            user.departmentId;
        }

        if (user?.email) {
          params.hodEmail =
            user.email;
        }

        const response =
          await apiClient.get(
            '/dashboard/hod',
            { params }
          );

        const data =
          unwrap(response);

        setHodDashboard(data);

        return data;
      },
      [
        user?.departmentId,
        user?.email,
      ]
    );

  /* ======================================================================== */
  /* Programme Coordinator Dashboard                                          */
  /* ======================================================================== */

  const loadProgrammeCoordinatorDashboard =
    useCallback(
      async (
        targetProgrammeId =
          programmeId
      ) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        const response =
          await apiClient.get(
            '/dashboard/programme-coordinator',
            { params }
          );

        const data =
          unwrap(response);

        setProgrammeCoordinatorDashboard(
          data
        );

        return data;
      },
      [programmeId]
    );

  /* ======================================================================== */
  /* Course Coordinator Dashboard                                              */
  /* ======================================================================== */

  const loadCourseCoordinatorDashboard =
    useCallback(
      async (
        targetCourseId =
          courseId,
        targetBatchId =
          batchId
      ) => {
        if (
          !targetCourseId ||
          !targetBatchId
        ) {
          setCourseCoordinatorDashboard(
            null
          );

          return null;
        }

        /*
         * Backend contract:
         *
         * GET /dashboard/course-coordinator
         * ?courseId=...&batchId=...
         *
         * This endpoint is NOT
         * CourseOffering-ID based.
         */
        const response =
          await apiClient.get(
            '/dashboard/course-coordinator',
            {
              params: {
                courseId:
                  targetCourseId,

                batchId:
                  targetBatchId,
              },
            }
          );

        const data =
          unwrap(response);

        setCourseCoordinatorDashboard(
          data
        );

        return data;
      },
      [
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Setup Progress                                                           */
  /* ======================================================================== */

  const loadSetupProgress =
    useCallback(
      async () => {
        let response = null;

        if (
          role ===
          'DIRECTOR'
        ) {
          const params = {};

          if (
            selectedSchoolId
          ) {
            params.schoolId =
              selectedSchoolId;
          }

          if (user?.email) {
            params.directorEmail =
              user.email;
          }

          response =
            await apiClient.get(
              '/academic/director/setup-progress',
              { params }
            );
        } else if (
          role === 'HOD'
        ) {
          const params = {};

          if (
            user?.departmentId
          ) {
            params.departmentId =
              user.departmentId;
          }

          if (user?.email) {
            params.hodEmail =
              user.email;
          }

          response =
            await apiClient.get(
              '/academic/hod/setup-progress',
              { params }
            );
        } else if (
          role ===
          'PROGRAMME_COORDINATOR'
        ) {
          if (
            !programmeId ||
            !batchId
          ) {
            return null;
          }

          response =
            await apiClient.get(
              '/academic/coordinator/setup-progress',
              {
                params: {
                  coordinatorEmail:
                    user?.email,

                  programmeId,

                  batchId,
                },
              }
            );
        } else if (
          role === 'FACULTY' ||
          role ===
            'COURSE_COORDINATOR'
        ) {
          if (!courseId) {
            return null;
          }

          response =
            await apiClient.get(
              '/academic/course-coordinator/setup-progress',
              {
                params: {
                  coordinatorEmail:
                    user?.email,

                  courseId,
                },
              }
            );
        } else {
          return null;
        }

        const data =
          unwrap(response);

        setSetupProgress(data);

        return data;
      },
      [
        role,
        selectedSchoolId,
        user?.email,
        user?.departmentId,
        programmeId,
        batchId,
        courseId,
      ]
    );

  /* ======================================================================== */
  /* Save Setup Progress                                                      */
  /* ======================================================================== */

  const saveSetupProgress =
    useCallback(
      async (
        nextStep,
        completedStep
      ) => {
        let endpoint = null;
        let payload = null;

        if (
          role ===
          'DIRECTOR'
        ) {
          endpoint =
            '/academic/director/setup-progress';

          payload = {
            schoolId:
              selectedSchoolId,

            directorEmail:
              user?.email,

            currentStep:
              nextStep,

            completedStep:
              String(
                completedStep
              ),
          };
        } else if (
          role === 'HOD'
        ) {
          endpoint =
            '/academic/hod/setup-progress';

          payload = {
            departmentId:
              user?.departmentId,

            hodEmail:
              user?.email,

            currentStep:
              nextStep,

            completedStep:
              String(
                completedStep
              ),
          };
        } else if (
          role ===
          'PROGRAMME_COORDINATOR'
        ) {
          endpoint =
            '/academic/coordinator/setup-progress';

          payload = {
            coordinatorEmail:
              user?.email,

            programmeId,

            batchId,

            currentStep:
              nextStep,

            completedStep:
              String(
                completedStep
              ),
          };
        } else if (
          role === 'FACULTY' ||
          role ===
            'COURSE_COORDINATOR'
        ) {
          endpoint =
            '/academic/course-coordinator/setup-progress';

          payload = {
            coordinatorEmail:
              user?.email,

            courseId,

            currentStep:
              nextStep,
          };
        } else {
          return null;
        }

        const response =
          await apiClient.post(
            endpoint,
            payload
          );

        const data =
          unwrap(response);

        setSetupProgress(data);

        return data;
      },
      [
        role,
        selectedSchoolId,
        user?.email,
        user?.departmentId,
        programmeId,
        batchId,
        courseId,
      ]
    );

  /* ======================================================================== */
  /* Course Offering CRUD                                                     */
  /* ======================================================================== */

  const addCourseOffering =
    useCallback(
      async (payload) => {
        const response =
          await apiClient.post(
            '/academic/course-offerings',
            payload
          );

        const data =
          normalizeOffering(
            unwrap(response)
          );

        setCourseOfferings(
          (previous) => {
            const withoutCurrent =
              previous.filter(
                (item) =>
                  item.id !==
                  data.id
              );

            return [
              ...withoutCurrent,
              data,
            ];
          }
        );

        if (data?.id) {
          setCourseOfferingId(
            data.id
          );
        }

        return data;
      },
      []
    );

  const updateCourseOffering =
    useCallback(
      async (
        offeringId,
        payload
      ) => {
        const response =
          await apiClient.put(
            `/academic/course-offerings/${offeringId}`,
            payload
          );

        const data =
          normalizeOffering(
            unwrap(response)
          );

        setCourseOfferings(
          (previous) =>
            previous.map(
              (offering) =>
                offering.id ===
                offeringId
                  ? data
                  : offering
            )
        );

        if (
          courseOfferingId ===
          offeringId
        ) {
          setCourseOfferingId(
            data.id ??
              offeringId
          );
        }

        return data;
      },
      [
        courseOfferingId,
      ]
    );

  const assignCourseCoordinator =
    useCallback(
      async (
        targetCourseId,
        coordinatorId,
        targetBatchId = batchId
      ) => {
        const offering =
          courseOfferings.find(
            (item) =>
              item.courseId ===
                targetCourseId &&
              item.batchId ===
                targetBatchId
          );

        if (!offering) {
          throw new Error(
            `Course Offering not found for course ${targetCourseId} and batch ${targetBatchId}`
          );
        }

        return updateCourseOffering(
          offering.id,
          {
            courseId:
              offering.courseId,

            batchId:
              offering.batchId,

            semester:
              offering.semester,

            courseCoordinatorId:
              coordinatorId,
          }
        );
      },
      [
        batchId,
        courseOfferings,
        updateCourseOffering,
      ]
    );

  /* ======================================================================== */
  /* Course Outcomes                                                          */
  /* ======================================================================== */

  const updateCourseCOs =
    useCallback(
      async (
        newCOs,
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          throw new Error(
            'Course Offering is required to save Course Outcomes.'
          );
        }

        const response =
          await apiClient.post(
            `/academic/course-offerings/${offeringId}/outcomes`,
            newCOs
          );

        const data =
          unwrapList(response);

        setActiveCOs(data);

        return data;
      },
      [
        courseOfferingId,
      ]
    );

  /* ======================================================================== */
  /* CO Mapping                                                               */
  /* ======================================================================== */

  const updateCourseMapping =
    useCallback(
      async (
        mappingPayload,
        offeringId =
          courseOfferingId
      ) => {
        if (!offeringId) {
          throw new Error(
            'Course Offering is required to save CO mapping.'
          );
        }

        const response =
          await apiClient.put(
            `/academic/course-offerings/${offeringId}/mappings`,
            mappingPayload
          );

        const data =
          unwrap(response);

        setCoMapping(data);

        return data;
      },
      [
        courseOfferingId,
      ]
    );

  /* ======================================================================== */
  /* Attainment Settings                                                      */
  /* ======================================================================== */

  const updateAttainmentSettings =
    useCallback(
      async (
        payload,
        targetCourseId =
          courseId,
        targetBatchId =
          batchId
      ) => {
        if (
          !targetCourseId
        ) {
          throw new Error(
            'Course ID is required to save attainment settings.'
          );
        }

        const body = {
          ...payload,

          /*
           * Send the identifiers explicitly when
           * the backend DTO supports them.
           */
          courseId:
            targetCourseId,

          ...(targetBatchId
            ? {
                batchId:
                  targetBatchId,
              }
            : {}),
        };

        const response =
          await apiClient.put(
            `/attainment/config/${targetCourseId}`,
            body
          );

        const data =
          unwrap(response);

        setAttainmentSettings(
          data
        );

        return data;
      },
      [
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Programme selection                                                      */
  /* ======================================================================== */

  const setProgrammeId =
    useCallback(
      (newProgrammeId) => {
        setProgrammeIdState(
          newProgrammeId
        );

        /*
         * A programme change invalidates
         * all child selections.
         */
        setBatchId(null);
        setCourseId(null);
        setCourseOfferingId(
          null
        );
        setCourseOfferings([]);
        setActiveCOs([]);
        setCoMapping(null);
        setAttainmentSettings(
          null
        );
        setCoAttainment(null);
        setCourseATR(null);
      },
      []
    );

  /* ======================================================================== */
  /* Course Offering selection                                                */
  /* ======================================================================== */

  const selectCourseOffering =
    useCallback(
      (offering) => {
        if (!offering) {
          setCourseOfferingId(
            null
          );
          setCourseId(null);

          return;
        }

        setCourseOfferingId(
          offering.id
        );

        setCourseId(
          offering.courseId
        );

        setBatchId(
          offering.batchId
        );
      },
      []
    );

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

    /* Departments */
    departments,
    loadDepartments,

    /* Programmes */
    programmes,

    masterProgrammes:
      programmes,

    allMasterProgrammes:
      programmes,

    selectedProgramme,
    programmeId,
    setProgrammeId,
    loadProgrammes,

    /* Batches */
    batches,
    batchId,
    setBatchId,
    selectedBatch,
    loadBatches,

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
    updateCourseOffering,
    assignCourseCoordinator,

    /* Course Coordinators */
    courseCoordinators,

    /* Programme Outcomes */
    activePOs,
    activePSOs,
    activePEOs,
    poPsoTargets,
    loadProgrammeOutcomes,

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
  };

  return (
    <AcademicContext.Provider
      value={value}
    >
      {children}
    </AcademicContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useAcademic() {
  const context =
    useContext(
      AcademicContext
    );

  if (!context) {
    throw new Error(
      'useAcademic must be used within an AcademicProvider'
    );
  }

  return context;
}

export default useAcademic;