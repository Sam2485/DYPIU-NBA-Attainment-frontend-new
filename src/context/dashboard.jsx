import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { useAuth } from './auth';
import { useAcademic } from './academic';
import { useApproval } from './approval';
import { useAttainment } from './attainment';
import { dashboardApi } from '../api/dashboard';

export const DashboardContext =
  createContext(null);

/* ========================================================================== */
/* WORKFLOW DEFINITIONS                                                       */
/* ========================================================================== */

export const CC_WORKFLOW_STEPS = [
  {
    step: 1,
    label: 'Add COs',
    path: '/outcomes',
  },
  {
    step: 2,
    label: 'CO–PO/PSO Mapping',
    path: '/co-mapping',
  },
  {
    step: 3,
    label: 'Direct Assessment',
    path: '/marks-upload',
  },
  {
    step: 4,
    label: 'Indirect Assessment',
    path: '/survey-upload',
  },
  {
    step: 5,
    label: 'CO Attainment',
    path: '/co-attainment',
  },
  {
    step: 6,
    label: 'Course ATR',
    path: '/course-atr',
  },
];

export const DIRECTOR_WORKFLOW_STEPS = [
  {
    number: 1,
    title: 'School Info',
    desc: 'Metadata & Dean allocation',
    path: '/director/school-structure',
    stepKey: 'step-1',
  },
  {
    number: 2,
    title: 'Departments',
    desc: 'Department hierarchy & HODs',
    path: '/director/department-management',
    stepKey: 'step-2',
  },
  {
    number: 3,
    title: 'Programmes',
    desc: 'Degree programmes & duration',
    path: '/director/programme-overview',
    stepKey: 'step-3',
  },
  {
    number: 4,
    title: 'Review & Verify',
    desc: 'Audit structure & complete setup',
    path: '/director/reports',
    stepKey: 'step-4',
  },
];

export const HOD_WORKFLOW_STEPS = [
  {
    step: 1,
    number: 1,
    title: 'Programme Coordinator',
    label: 'Programme Coordinator',
    desc: 'Assign coordinator for programme',
    path: '/hod/programme-coordinators',
    icon: 'UserCheck',
  },
  {
    step: 2,
    number: 2,
    title: 'Batch Setup',
    label: 'Batch Setup',
    desc: 'Initialize student batch cycle',
    path: '/hod/batch-management',
    icon: 'Calendar',
  },
  {
    step: 3,
    number: 3,
    title: 'PO / PSO / PEO',
    label: 'PO / PSO / PEO',
    desc: 'Define outcome framework',
    path: '/hod/programme-outcomes',
    icon: 'Layers',
  },
  {
    step: 4,
    number: 4,
    title: 'Review & Confirm',
    label: 'Review & Confirm',
    desc: 'Verify setup summary & finish',
    path: '/hod/reports',
    icon: 'CheckCircle2',
  },
];

export const PC_WORKFLOW_STEPS = [
  {
    step: 1,
    number: 1,
    title: 'Add Courses',
    label: 'Add Courses',
    desc: 'Add & allocate courses under programme',
    path: '/programme-coordinator/setup-workflow?step=1',
    icon: 'BookOpen',
  },
  {
    step: 2,
    number: 2,
    title: 'Set PO/PSO Targets',
    label: 'Set PO/PSO Targets',
    desc: 'Configure PO & PSO target levels',
    path: '/programme-coordinator/setup-workflow?step=2',
    icon: 'Target',
  },
  {
    step: 3,
    number: 3,
    title: 'Programme ATR',
    label: 'Programme ATR',
    desc: 'Fill & submit Programme Action Taken Report',
    path: '/programme-coordinator/setup-workflow?step=3',
    icon: 'Layers',
  },
  {
    step: 4,
    number: 4,
    title: 'Review & Confirm',
    label: 'Review & Confirm',
    desc: 'Verify setup summary & finish',
    path: '/programme-coordinator/setup-workflow?step=4',
    icon: 'CheckCircle2',
  },
];

/* ========================================================================== */
/* RESPONSE HELPERS                                                           */
/* ========================================================================== */

const unwrap = (response) => {
  if (response == null) {
    return null;
  }

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

/* ========================================================================== */
/* SETUP PROGRESS NORMALIZATION                                               */
/* ========================================================================== */

const normalizeProgress = (
  data,
  totalSteps
) => {
  const source = data ?? {};

  /*
   * Backend may expose:
   * - currentStep
   * - step
   * - completedStep
   * - completedSteps
   *
   * Preserve all backend fields.
   */
  const currentStep =
    source.currentStep ??
    source.step ??
    null;

  let completedSteps = [];

  if (
    Array.isArray(
      source.completedSteps
    )
  ) {
    completedSteps =
      source.completedSteps
        .map(Number)
        .filter(
          (step) =>
            Number.isFinite(step)
        );
  } else if (
    source.completedStep !==
      undefined &&
    source.completedStep !== null &&
    source.completedStep !== ''
  ) {
    const completedStep =
      Number(
        source.completedStep
      );

    if (
      Number.isFinite(
        completedStep
      )
    ) {
      completedSteps = [
        completedStep,
      ];
    }
  }

  /*
   * Some backend responses may contain a
   * completedSteps object/map.
   */
  if (
    !Array.isArray(
      source.completedSteps
    ) &&
    source.completedSteps &&
    typeof source.completedSteps ===
      'object'
  ) {
    completedSteps = Object.entries(
      source.completedSteps
    )
      .filter(
        ([, value]) =>
          value === true
      )
      .map(
        ([key]) =>
          Number(key)
      )
      .filter(
        Number.isFinite
      );
  }

  completedSteps =
    [...new Set(completedSteps)]
      .filter(
        (step) =>
          step >= 1 &&
          step <= totalSteps
      )
      .sort(
        (a, b) =>
          a - b
      );

  const completedSet =
    new Set(
      completedSteps
    );

  const stepStatus = Array.from(
    {
      length: totalSteps,
    },
    (_, index) =>
      completedSet.has(
        index + 1
      )
  );

  const completedStepsCount =
    completedSteps.length;

  const pendingStepsCount =
    Math.max(
      totalSteps -
        completedStepsCount,
      0
    );

  const progressPct =
    totalSteps > 0
      ? Math.round(
          (completedStepsCount /
            totalSteps) *
            100
        )
      : 0;

  let currentStepNumber =
    Number(
      currentStep
    );

  if (
    !Number.isFinite(
      currentStepNumber
    ) ||
    currentStepNumber < 1
  ) {
    const firstPending =
      stepStatus.findIndex(
        (done) => !done
      );

    currentStepNumber =
      firstPending === -1
        ? totalSteps
        : firstPending + 1;
  }

  return {
    ...source,

    currentStep:
      currentStepNumber,

    completedSteps,

    stepStatus,

    totalStepsCount:
      totalSteps,

    completedStepsCount,

    pendingStepsCount,

    progressPct,
  };
};

/* ========================================================================== */
/* PROVIDER                                                                   */
/* ========================================================================== */

export function DashboardProvider({
  children,
}) {
  const {
    user,
    role,
  } = useAuth();

  const {
    selectedSchool,
    selectedSchoolId,
    departments = [],
    programmes = [],
    masterProgrammes = [],
    selectedProgramme,
    programmeId,
    batches = [],
    batchId,
    courses = [],
    availableCourses = [],
    selectedCourse,
    courseId,
    courseOfferingId,
    selectedCourseOffering,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    students = [],
    academicYear,
  } = useAcademic();

  const {
    directorApprovals = [],
    hodApprovals = [],
    courseVerificationStore = {},
    getPendingVerificationsCount,
  } = useApproval();

  const {
    courseAttainmentStore = null,
    yearMetrics = null,
  } = useAttainment();

  /* ======================================================================== */
  /* Backend dashboard state                                                  */
  /* ======================================================================== */

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

  /* ======================================================================== */
  /* Backend setup progress state                                             */
  /* ======================================================================== */

  const [
    directorWorkflowProgress,
    setDirectorWorkflowProgress,
  ] = useState(null);

  const [
    hodWorkflowProgress,
    setHodWorkflowProgress,
  ] = useState(null);

  const [
    pcWorkflowProgress,
    setPcWorkflowProgress,
  ] = useState(null);

  const [
    ccWorkflowProgress,
    setCcWorkflowProgress,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* ======================================================================== */
  /* DIRECTOR DASHBOARD                                                       */
  /* ======================================================================== */

  const loadDirectorDashboard =
    useCallback(
      async (
        targetSchoolId =
          selectedSchoolId
      ) => {
        if (
          role !== 'DIRECTOR' &&
          role !== 'ADMIN'
        ) {
          return null;
        }

        const response =
          await dashboardApi.getDirectorDashboard(
            targetSchoolId,
            user?.email
          );

        const data =
          unwrap(response);

        setDirectorDashboard(
          data
        );

        return data;
      },
      [
        role,
        selectedSchoolId,
        user?.email,
      ]
    );

  /* ======================================================================== */
  /* HOD DASHBOARD                                                            */
  /* ======================================================================== */

  const loadHodDashboard =
    useCallback(
      async (
        targetDepartmentId =
          user?.departmentId
      ) => {
        if (role !== 'HOD') {
          return null;
        }

        const response =
          await dashboardApi.getHodDashboard(
            targetDepartmentId,
            user?.email
          );

        const data =
          unwrap(response);

        setHodDashboard(data);

        return data;
      },
      [
        role,
        user?.departmentId,
        user?.email,
      ]
    );

  /* ======================================================================== */
  /* PROGRAMME COORDINATOR DASHBOARD                                          */
  /* ======================================================================== */

  const loadProgrammeCoordinatorDashboard =
    useCallback(
      async (
        targetProgrammeId =
          programmeId
      ) => {
        if (
          role !==
          'PROGRAMME_COORDINATOR'
        ) {
          return null;
        }

        if (!targetProgrammeId) {
          setProgrammeCoordinatorDashboard(
            null
          );

          return null;
        }

        const response =
          await dashboardApi.getProgrammeCoordinatorDashboard(
            targetProgrammeId
          );

        const data =
          unwrap(response);

        setProgrammeCoordinatorDashboard(
          data
        );

        return data;
      },
      [
        role,
        programmeId,
      ]
    );

  /* ======================================================================== */
  /* COURSE COORDINATOR DASHBOARD                                             */
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
          role !== 'FACULTY' &&
          role !==
            'COURSE_COORDINATOR'
        ) {
          return null;
        }

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
         * IMPORTANT:
         *
         * Backend dashboard contract:
         *
         * GET /dashboard/course-coordinator
         * ?courseId=...&batchId=...
         *
         * This endpoint is NOT passed
         * courseOfferingId as courseId.
         */
        const response =
          await dashboardApi.getCourseCoordinatorDashboard(
            targetCourseId,
            targetBatchId
          );

        const data =
          unwrap(response);

        setCourseCoordinatorDashboard(
          data
        );

        return data;
      },
      [
        role,
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* SETUP PROGRESS: GET                                                      */
  /* ======================================================================== */

  const loadWorkflowProgress =
    useCallback(
      async () => {
        setError(null);

        try {
          /*
           * Director
           */
          if (
            role === 'DIRECTOR' ||
            role === 'ADMIN'
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

            /*
             * Use the backend setup-progress
             * API directly.
             */
            const response =
              await apiClientGet(
                '/academic/director/setup-progress',
                params
              );

            const raw =
              unwrap(response);

            const normalized =
              normalizeProgress(
                raw,
                DIRECTOR_WORKFLOW_STEPS.length
              );

            setDirectorWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * HOD
           */
          if (
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

            const response =
              await apiClientGet(
                '/academic/hod/setup-progress',
                params
              );

            const raw =
              unwrap(response);

            const normalized =
              normalizeProgress(
                raw,
                HOD_WORKFLOW_STEPS.length
              );

            setHodWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * Programme Coordinator
           */
          if (
            role ===
            'PROGRAMME_COORDINATOR'
          ) {
            if (
              !programmeId ||
              !batchId
            ) {
              setPcWorkflowProgress(
                null
              );

              return null;
            }

            const params = {
              coordinatorEmail:
                user?.email,

              programmeId,

              batchId,
            };

            const response =
              await apiClientGet(
                '/academic/coordinator/setup-progress',
                params
              );

            const raw =
              unwrap(response);

            const normalized =
              normalizeProgress(
                raw,
                PC_WORKFLOW_STEPS.length
              );

            setPcWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * Course Coordinator
           *
           * Backend contract calls the identity
           * parameter `courseId`.
           */
          if (
            role === 'FACULTY' ||
            role ===
              'COURSE_COORDINATOR'
          ) {
            if (
              !courseId
            ) {
              setCcWorkflowProgress(
                null
              );

              return null;
            }

            const params = {
              coordinatorEmail:
                user?.email,

              courseId,
            };

            const response =
              await apiClientGet(
                '/academic/course-coordinator/setup-progress',
                params
              );

            const raw =
              unwrap(response);

            const normalized =
              normalizeProgress(
                raw,
                CC_WORKFLOW_STEPS.length
              );

            setCcWorkflowProgress(
              normalized
            );

            return normalized;
          }

          return null;
        } catch (requestError) {
          console.error(
            'Failed to load workflow progress:',
            requestError
          );

          setError(
            requestError?.customMessage ??
            requestError?.message ??
            'Failed to load workflow progress.'
          );

          throw requestError;
        }
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
  /* SETUP PROGRESS: POST                                                     */
  /* ======================================================================== */

  const saveWorkflowProgress =
    useCallback(
      async ({
        nextStep,
        completedStep,
      }) => {
        setError(null);

        try {
          /*
           * Director
           */
          if (
            role === 'DIRECTOR' ||
            role === 'ADMIN'
          ) {
            const payload = {
              schoolId:
                selectedSchoolId,

              directorEmail:
                user?.email,

              step:
                nextStep,

              completedStep:
                String(
                  completedStep
                ),

              completedSteps:
                [
                  ...(directorWorkflowProgress
                    ?.completedSteps ||
                    []),
                  Number(
                    completedStep
                  ),
                ].filter(
                  (
                    value,
                    index,
                    array
                  ) =>
                    array.indexOf(
                      value
                    ) === index
                ),
            };

            const response =
              await apiClientPost(
                '/academic/director/setup-progress',
                payload
              );

            const normalized =
              normalizeProgress(
                unwrap(response),
                DIRECTOR_WORKFLOW_STEPS.length
              );

            setDirectorWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * HOD
           */
          if (
            role === 'HOD'
          ) {
            const completedSteps = [
              ...(hodWorkflowProgress
                ?.completedSteps ||
                []),
              Number(
                completedStep
              ),
            ].filter(
              (
                value,
                index,
                array
              ) =>
                array.indexOf(
                  value
                ) === index
            );

            const payload = {
              departmentId:
                user?.departmentId,

              email:
                user?.email,

              hodEmail:
                user?.email,

              step:
                nextStep,

              completedStep:
                String(
                  completedStep
                ),

              completedSteps,
            };

            const response =
              await apiClientPost(
                '/academic/hod/setup-progress',
                payload
              );

            const normalized =
              normalizeProgress(
                unwrap(response),
                HOD_WORKFLOW_STEPS.length
              );

            setHodWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * Programme Coordinator
           */
          if (
            role ===
            'PROGRAMME_COORDINATOR'
          ) {
            if (
              !programmeId ||
              !batchId
            ) {
              throw new Error(
                'programmeId and batchId are required to save programme coordinator workflow progress.'
              );
            }

            const completedSteps = [
              ...(pcWorkflowProgress
                ?.completedSteps ||
                []),
              Number(
                completedStep
              ),
            ].filter(
              (
                value,
                index,
                array
              ) =>
                array.indexOf(
                  value
                ) === index
            );

            const payload = {
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

              completedSteps,
            };

            const response =
              await apiClientPost(
                '/academic/coordinator/setup-progress',
                payload
              );

            const normalized =
              normalizeProgress(
                unwrap(response),
                PC_WORKFLOW_STEPS.length
              );

            setPcWorkflowProgress(
              normalized
            );

            return normalized;
          }

          /*
           * Course Coordinator
           */
          if (
            role === 'FACULTY' ||
            role ===
              'COURSE_COORDINATOR'
          ) {
            if (!courseId) {
              throw new Error(
                'courseId is required to save course coordinator workflow progress.'
              );
            }

            const payload = {
              coordinatorEmail:
                user?.email,

              courseId,

              currentStep:
                nextStep,
            };

            const response =
              await apiClientPost(
                '/academic/course-coordinator/setup-progress',
                payload
              );

            const normalized =
              normalizeProgress(
                unwrap(response),
                CC_WORKFLOW_STEPS.length
              );

            setCcWorkflowProgress(
              normalized
            );

            return normalized;
          }

          return null;
        } catch (requestError) {
          console.error(
            'Failed to save workflow progress:',
            requestError
          );

          setError(
            requestError?.customMessage ??
            requestError?.message ??
            'Failed to save workflow progress.'
          );

          throw requestError;
        }
      },
      [
        role,
        selectedSchoolId,
        user?.email,
        user?.departmentId,
        programmeId,
        batchId,
        courseId,
        directorWorkflowProgress,
        hodWorkflowProgress,
        pcWorkflowProgress,
      ]
    );

  /* ======================================================================== */
  /* Convenience compatibility methods                                       */
  /* ======================================================================== */

  /*
   * Existing screens may still call these methods.
   *
   * They now persist to backend instead of modifying
   * memory-only progress stores.
   */

  const markWorkflowStepComplete =
    useCallback(
      async (
        targetCourseOfferingId,
        path
      ) => {
        if (
          !targetCourseOfferingId ||
          !path
        ) {
          return null;
        }

        const step =
          CC_WORKFLOW_STEPS.find(
            (item) =>
              item.path ===
              path
          );

        if (!step) {
          return null;
        }

        return saveWorkflowProgress({
          nextStep:
            step.step + 1,

          completedStep:
            step.step,
        });
      },
      [
        saveWorkflowProgress,
      ]
    );

  const markDirectorWorkflowStepComplete =
    useCallback(
      async (
        stepNumber
      ) => {
        if (!stepNumber) {
          return null;
        }

        return saveWorkflowProgress({
          nextStep:
            Number(
              stepNumber
            ) + 1,

          completedStep:
            Number(
              stepNumber
            ),
        });
      },
      [
        saveWorkflowProgress,
      ]
    );

  const markHodWorkflowStepComplete =
    useCallback(
      async (
        targetProgId,
        stepNumber
      ) => {
        if (
          !targetProgId ||
          !stepNumber
        ) {
          return null;
        }

        return saveWorkflowProgress({
          nextStep:
            Number(
              stepNumber
            ) + 1,

          completedStep:
            Number(
              stepNumber
            ),
        });
      },
      [
        saveWorkflowProgress,
      ]
    );

  const markPcWorkflowStepComplete =
    useCallback(
      async (
        targetProgId,
        stepNumber
      ) => {
        if (
          !targetProgId ||
          !stepNumber
        ) {
          return null;
        }

        return saveWorkflowProgress({
          nextStep:
            Number(
              stepNumber
            ) + 1,

          completedStep:
            Number(
              stepNumber
            ),
        });
      },
      [
        saveWorkflowProgress,
      ]
    );

  /*
   * These reset methods no longer pretend to delete backend progress.
   *
   * No backend DELETE endpoint is documented in the API catalog.
   *
   * Therefore they simply refresh authoritative progress.
   */
  const resetWorkflowProgress =
    useCallback(
      async () => {
        return loadWorkflowProgress();
      },
      [
        loadWorkflowProgress,
      ]
    );

  const resetDirectorWorkflowProgress =
    useCallback(
      async () => {
        return loadWorkflowProgress();
      },
      [
        loadWorkflowProgress,
      ]
    );

  const resetHodWorkflowProgress =
    useCallback(
      async () => {
        return loadWorkflowProgress();
      },
      [
        loadWorkflowProgress,
      ]
    );

  const resetPcWorkflowProgress =
    useCallback(
      async () => {
        return loadWorkflowProgress();
      },
      [
        loadWorkflowProgress,
      ]
    );

  /* ======================================================================== */
  /* INITIAL / SELECTION-DRIVEN HYDRATION                                     */
  /* ======================================================================== */

  useEffect(() => {
    if (!role) {
      return;
    }

    loadWorkflowProgress().catch(
      () => {}
    );
  }, [
    role,
    selectedSchoolId,
    user?.email,
    user?.departmentId,
    programmeId,
    batchId,
    courseId,
    courseOfferingId,
    loadWorkflowProgress,
  ]);

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          if (
            role ===
              'DIRECTOR' ||
            role === 'ADMIN'
          ) {
            await loadDirectorDashboard();
          }

          if (
            role === 'HOD'
          ) {
            await loadHodDashboard();
          }

          if (
            role ===
            'PROGRAMME_COORDINATOR'
          ) {
            await loadProgrammeCoordinatorDashboard();
          }

          if (
            role === 'FACULTY' ||
            role ===
              'COURSE_COORDINATOR'
          ) {
            await loadCourseCoordinatorDashboard();
          }
        } catch (
          dashboardError
        ) {
          console.error(
            'Failed to load dashboard:',
            dashboardError
          );

          setError(
            dashboardError?.customMessage ??
            dashboardError?.message ??
            'Failed to load dashboard.'
          );
        } finally {
          setLoading(false);
        }
      };

    if (role) {
      loadDashboard();
    }
  }, [
    role,
    selectedSchoolId,
    user?.email,
    user?.departmentId,
    programmeId,
    courseId,
    batchId,
    loadDirectorDashboard,
    loadHodDashboard,
    loadProgrammeCoordinatorDashboard,
    loadCourseCoordinatorDashboard,
  ]);

  /* ======================================================================== */
  /* COURSE COORDINATOR STATS                                                 */
  /* ======================================================================== */

  const courseCoordinatorStats =
    useMemo(() => {
      const progress =
        ccWorkflowProgress ??
        normalizeProgress(
          null,
          CC_WORKFLOW_STEPS.length
        );

      const stepStatus =
        progress.stepStatus;

      const nextStepNumber =
        progress.currentStep;

      const nextStepItem =
        CC_WORKFLOW_STEPS.find(
          (step) =>
            step.step ===
            nextStepNumber
        ) ?? null;

      const dashboardData =
        courseCoordinatorDashboard ??
        null;

      return {
        /*
         * Backend dashboard is the
         * authoritative source.
         */
        ...(
          dashboardData &&
          typeof dashboardData ===
            'object'
            ? dashboardData
            : {}
        ),

        schoolName:
          selectedSchool?.name ??
          dashboardData?.schoolName ??
          null,

        coordinatorName:
          user?.name ??
          dashboardData?.coordinatorName ??
          null,

        courseCode:
          selectedCourse?.code ??
          dashboardData?.courseCode ??
          null,

        courseName:
          selectedCourse?.name ??
          dashboardData?.courseName ??
          null,

        courseId:
          courseId,

        batchId:
          batchId,

        courseOfferingId:
          courseOfferingId,

        courseOffering:
          selectedCourseOffering ??
          null,

        coCount:
          activeCOs.length,

        poCount:
          activePOs.length,

        psoCount:
          activePSOs.length,

        attainment:
          courseAttainmentStore,

        verification:
          courseVerificationStore[
            courseOfferingId
          ] ?? null,

        workflowProgress:
          progress,

        stepStatus,

        totalStepsCount:
          CC_WORKFLOW_STEPS.length,

        completedStepsCount:
          progress.completedStepsCount,

        pendingStepsCount:
          progress.pendingStepsCount,

        progressPct:
          progress.progressPct,

        targetStepNum:
          nextStepNumber,

        nextStep:
          nextStepItem,
      };
    }, [
      ccWorkflowProgress,
      courseCoordinatorDashboard,
      selectedSchool,
      user,
      selectedCourse,
      courseId,
      batchId,
      courseOfferingId,
      selectedCourseOffering,
      activeCOs,
      activePOs,
      activePSOs,
      courseAttainmentStore,
      courseVerificationStore,
    ]);

  /* ======================================================================== */
  /* PROGRAMME COORDINATOR STATS                                              */
  /* ======================================================================== */

  const programmeCoordinatorStats =
    useMemo(() => {
      const progress =
        pcWorkflowProgress ??
        normalizeProgress(
          null,
          PC_WORKFLOW_STEPS.length
        );

      const dashboardData =
        programmeCoordinatorDashboard ??
        null;

      const programmeCourses =
        programmeId
          ? courses.filter(
              (course) =>
                course.programmeId ===
                programmeId
            )
          : [];

      return {
        ...(
          dashboardData &&
          typeof dashboardData ===
            'object'
            ? dashboardData
            : {}
        ),

        schoolName:
          selectedSchool?.name ??
          dashboardData?.schoolName ??
          null,

        coordinatorName:
          user?.name ??
          selectedProgramme?.coordinator ??
          dashboardData?.coordinatorName ??
          null,

        programmeName:
          selectedProgramme?.name ??
          dashboardData?.programmeName ??
          null,

        programmeCode:
          selectedProgramme?.code ??
          dashboardData?.programmeCode ??
          null,

        programmeId,

        batchId,

        totalCoursesCount:
          dashboardData?.totalCoursesCount ??
          programmeCourses.length,

        assignedFacultyCount:
          dashboardData?.assignedFacultyCount ??
          null,

        poCount:
          activePOs.length,

        psoCount:
          activePSOs.length,

        pendingVerificationsCount:
          getPendingVerificationsCount
            ? getPendingVerificationsCount()
            : 0,

        selectedProgramme:
          selectedProgramme ??
          null,

        workflowProgress:
          progress,

        stepStatus:
          progress.stepStatus,

        completedStepsCount:
          progress.completedStepsCount,

        totalStepsCount:
          PC_WORKFLOW_STEPS.length,

        pendingStepsCount:
          progress.pendingStepsCount,

        progressPct:
          progress.progressPct,

        targetStepNum:
          progress.currentStep,

        nextStep:
          PC_WORKFLOW_STEPS.find(
            (step) =>
              step.step ===
              progress.currentStep
          ) ?? null,
      };
    }, [
      pcWorkflowProgress,
      programmeCoordinatorDashboard,
      selectedSchool,
      selectedProgramme,
      programmeId,
      batchId,
      courses,
      user,
      activePOs,
      activePSOs,
      getPendingVerificationsCount,
    ]);

  /* ======================================================================== */
  /* HOD STATS                                                                */
  /* ======================================================================== */

  const hodStats =
    useMemo(() => {
      const departmentId =
        user?.departmentId ??
        null;

      const departmentName =
        user?.department ??
        null;

      const departmentProgrammes =
        programmes.filter(
          (programme) => {
            if (departmentId) {
              return (
                programme.departmentId ===
                departmentId
              );
            }

            if (departmentName) {
              return (
                programme.department ===
                departmentName
              );
            }

            return false;
          }
        );

      const progress =
        hodWorkflowProgress ??
        normalizeProgress(
          null,
          HOD_WORKFLOW_STEPS.length
        );

      const dashboardData =
        hodDashboard ??
        null;

      const pendingApprovalsCount =
        hodApprovals.filter(
          (approval) =>
            approval.status ===
            'PENDING'
        ).length;

      const activeBatchesCount =
        batches.filter(
          (batch) =>
            batch.status ===
            'ACTIVE'
        ).length;

      return {
        ...(
          dashboardData &&
          typeof dashboardData ===
            'object'
            ? dashboardData
            : {}
        ),

        schoolName:
          selectedSchool?.name ??
          dashboardData?.schoolName ??
          null,

        hodName:
          user?.name ??
          dashboardData?.hodName ??
          null,

        departmentName,

        departmentId,

        programmesCount:
          dashboardData?.programmesCount ??
          departmentProgrammes.length,

        totalCoursesCount:
          dashboardData?.totalCoursesCount ??
          null,

        activeBatchesCount:
          dashboardData?.activeBatchesCount ??
          activeBatchesCount,

        pendingHodApprovalsCount:
          dashboardData?.pendingHodApprovalsCount ??
          pendingApprovalsCount,

        coordinatorsCount:
          dashboardData?.coordinatorsCount ??
          null,

        atrApprovedCount:
          dashboardData?.atrApprovedCount ??
          null,

        selectedProgramme:
          selectedProgramme ??
          null,

        workflowProgress:
          progress,

        stepStatus:
          progress.stepStatus,

        completedStepsCount:
          progress.completedStepsCount,

        totalStepsCount:
          HOD_WORKFLOW_STEPS.length,

        pendingStepsCount:
          progress.pendingStepsCount,

        progressPct:
          progress.progressPct,

        targetStepNum:
          progress.currentStep,

        nextStep:
          HOD_WORKFLOW_STEPS.find(
            (step) =>
              step.step ===
              progress.currentStep
          ) ?? null,
      };
    }, [
      hodWorkflowProgress,
      hodDashboard,
      user,
      selectedSchool,
      selectedProgramme,
      programmes,
      hodApprovals,
      batches,
    ]);

  /* ======================================================================== */
  /* DIRECTOR STATS                                                           */
  /* ======================================================================== */

  const directorStats =
    useMemo(() => {
      const progress =
        directorWorkflowProgress ??
        normalizeProgress(
          null,
          DIRECTOR_WORKFLOW_STEPS.length
        );

      const dashboardData =
        directorDashboard ??
        null;

      /*
       * Do not fabricate student counts.
       * The backend dashboard response is preferred.
       */
      return {
        ...(
          dashboardData &&
          typeof dashboardData ===
            'object'
            ? dashboardData
            : {}
        ),

        schoolName:
          selectedSchool?.name ??
          dashboardData?.schoolName ??
          null,

        directorName:
          user?.name ??
          dashboardData?.directorName ??
          null,

        departmentsCount:
          dashboardData?.departmentsCount ??
          departments.length,

        totalProgrammesCount:
          dashboardData?.totalProgrammesCount ??
          masterProgrammes.length,

        totalStudentsCount:
          dashboardData?.totalStudentsCount ??
          null,

        pendingDirectorApprovalsCount:
          dashboardData?.pendingDirectorApprovalsCount ??
          directorApprovals.filter(
            (approval) =>
              approval.status ===
              'PENDING'
          ).length,

        overallAttainmentAvg:
          dashboardData?.overallAttainmentAvg ??
          yearMetrics?.overallCOAttainment ??
          null,

        avgPoAttainment:
          dashboardData?.avgPoAttainment ??
          yearMetrics?.avgPoAttainment ??
          null,

        avgPsoAttainment:
          dashboardData?.avgPsoAttainment ??
          yearMetrics?.avgPsoAttainment ??
          null,

        accreditationReadinessPct:
          dashboardData?.accreditationReadinessPct ??
          null,

        workflowProgress:
          progress,

        stepDone:
          progress.stepStatus,

        completedStepsCount:
          progress.completedStepsCount,

        totalStepsCount:
          DIRECTOR_WORKFLOW_STEPS.length,

        pendingStepsCount:
          progress.pendingStepsCount,

        progressPct:
          progress.progressPct,

        targetStepNum:
          progress.currentStep,

        nextStep:
          DIRECTOR_WORKFLOW_STEPS.find(
            (step) =>
              step.number ===
              progress.currentStep
          ) ?? null,
      };
    }, [
      directorWorkflowProgress,
      directorDashboard,
      selectedSchool,
      user,
      departments,
      masterProgrammes,
      directorApprovals,
      yearMetrics,
    ]);

  /* ======================================================================== */
  /* ROLE ROUTING                                                             */
  /* ======================================================================== */

  const getDashboardData =
    useCallback(
      (
        targetRole = role
      ) => {
        switch (
          targetRole
        ) {
          case 'DIRECTOR':
            return directorStats;

          case 'HOD':
            return hodStats;

          case 'PROGRAMME_COORDINATOR':
            return programmeCoordinatorStats;

          case 'FACULTY':
          case 'COURSE_COORDINATOR':
          default:
            return courseCoordinatorStats;
        }
      },
      [
        role,
        directorStats,
        hodStats,
        programmeCoordinatorStats,
        courseCoordinatorStats,
      ]
    );

  /* ======================================================================== */
  /* PROVIDER                                                                 */
  /* ======================================================================== */

  return (
    <DashboardContext.Provider
      value={{
        /* Backend dashboard responses */
        directorDashboard,
        hodDashboard,
        programmeCoordinatorDashboard,
        courseCoordinatorDashboard,

        /* Derived dashboard data */
        directorStats,
        hodStats,
        programmeCoordinatorStats,
        courseCoordinatorStats,

        getDashboardData,

        /* Backend setup progress */
        directorWorkflowProgress,
        hodWorkflowProgress,
        pcWorkflowProgress,
        ccWorkflowProgress,

        loadWorkflowProgress,
        saveWorkflowProgress,

        /* Compatibility workflow methods */
        markWorkflowStepComplete,
        resetWorkflowProgress,

        markDirectorWorkflowStepComplete,
        resetDirectorWorkflowProgress,

        markHodWorkflowStepComplete,
        resetHodWorkflowProgress,

        markPcWorkflowStepComplete,
        resetPcWorkflowProgress,

        /* State */
        loading,
        error,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

/* ========================================================================== */
/* API helpers                                                                */
/* ========================================================================== */

/*
 * These two helpers keep the DashboardContext independent from
 * the shape of apiClient's interceptor.
 *
 * The current apiClient may return response.data,
 * but these helpers safely support both:
 *
 * AxiosResponse
 * or
 * response.data
 */

async function apiClientGet(
  url,
  params = {}
) {
  const module =
    await import(
      '../api/client'
    );

  const client =
    module.default;

  return client.get(
    url,
    { params }
  );
}

async function apiClientPost(
  url,
  payload
) {
  const module =
    await import(
      '../api/client'
    );

  const client =
    module.default;

  return client.post(
    url,
    payload
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useDashboard() {
  const context =
    useContext(
      DashboardContext
    );

  if (!context) {
    throw new Error(
      'useDashboard must be used within a DashboardProvider'
    );
  }

  return context;
}

export default useDashboard;