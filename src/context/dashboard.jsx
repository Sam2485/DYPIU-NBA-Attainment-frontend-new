import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { useAuth } from './auth';
import { useAcademic } from './academic';
import { useApproval } from './approval';
import { useAttainment } from './attainment';
import { dashboardApi } from '../api/dashboard';
import apiClient from '../api/client';

export const DashboardContext = createContext(null);

/* ========================================================================== */
/* WORKFLOW DEFINITIONS                                                       */
/* ========================================================================== */

export const CC_WORKFLOW_STEPS = [
  { step: 1, label: 'Add COs', path: '/outcomes' },
  { step: 2, label: 'CO–PO/PSO Mapping', path: '/co-mapping' },
  { step: 3, label: 'Direct Assessment', path: '/marks-upload' },
  { step: 4, label: 'Indirect Assessment', path: '/survey-upload' },
  { step: 5, label: 'CO Attainment', path: '/co-attainment' },
  { step: 6, label: 'Course ATR', path: '/course-atr' },
];

export const DIRECTOR_WORKFLOW_STEPS = [
  { number: 1, title: 'School Info', desc: 'Metadata & Dean allocation', path: '/director/school-structure', stepKey: 'step-1' },
  { number: 2, title: 'Departments', desc: 'Department hierarchy & HODs', path: '/director/department-management', stepKey: 'step-2' },
  { number: 3, title: 'Programmes', desc: 'Degree programmes & duration', path: '/director/programme-overview', stepKey: 'step-3' },
  { number: 4, title: 'Review & Verify', desc: 'Audit structure & complete setup', path: '/director/reports', stepKey: 'step-4' },
];

export const HOD_WORKFLOW_STEPS = [
  { step: 1, key: 'master_courses', number: 1, title: 'Master Courses', label: 'Master Courses', desc: 'Build the programme course catalogue', path: '/hod/setup-workflow?step=1', icon: 'BookOpen' },
  { step: 2, key: 'batch', number: 2, title: 'Batch Setup', label: 'Batch Setup', desc: 'Initialize student batch cycle', path: '/hod/batch-management', icon: 'Calendar' },
  { step: 3, key: 'coordinators', number: 3, title: 'Coordinator Allocation', label: 'Coordinator Allocation', desc: 'Assign a coordinator to each batch', path: '/hod/setup-workflow?step=3', icon: 'UserCheck' },
  { step: 4, key: 'outcomes', number: 4, title: 'PO / PSO / PEO', label: 'PO / PSO / PEO', desc: 'Define outcome framework', path: '/hod/programme-outcomes', icon: 'Layers' },
  { step: 5, key: 'review', number: 5, title: 'Review & Confirm', label: 'Review & Confirm', desc: 'Verify setup summary & finish', path: '/hod/reports', icon: 'CheckCircle2' },
];

const HOD_STEP_ALIASES = {
  master_courses: 1, master_course: 1, mastercourse: 1, course: 1, courses: 1,
  batch: 2, batches: 2, batch_setup: 2,
  coordinators: 3, coordinator: 3, coordinator_allocation: 3, allocation: 3, programme_coordinator: 3,
  outcomes: 4, outcome: 4, po_pso: 4, po_pso_peo: 4, pos: 4, peo: 4, peos: 4,
  review: 5, review_and_confirm: 5, confirm: 5, review_confirm: 5,
};

export const PC_WORKFLOW_STEPS = [
  { step: 1, key: 'courses', number: 1, title: 'Add Courses', label: 'Add Courses', desc: 'Add courses to the programme batch', path: '/programme-coordinator/setup-workflow?step=1', icon: 'BookOpen' },
  { step: 2, key: 'po_pso_target', number: 2, title: 'Set PO/PSO Target', label: 'Set PO/PSO Target', desc: 'Set programme-batch PO and PSO targets', path: '/programme-coordinator/setup-workflow?step=2', icon: 'Target' },
  { step: 3, key: 'indirect_attainment', number: 3, title: 'Indirect Programme-Batch Attainment', label: 'Indirect Programme-Batch Attainment', desc: 'Upload and calculate indirect attainment', path: '/programme-coordinator/setup-workflow?step=3', icon: 'ClipboardList' },
  { step: 4, key: 'programme_atr', number: 4, title: 'Programme-Batch ATR', label: 'Programme-Batch ATR', desc: 'Prepare the programme-batch action taken report', path: '/programme-coordinator/setup-workflow?step=4', icon: 'Layers' },
  { step: 5, key: 'review', number: 5, title: 'Review & Confirm', label: 'Review & Confirm', desc: 'Verify setup summary & finish', path: '/programme-coordinator/setup-workflow?step=5', icon: 'CheckCircle2' },
];

const PC_STEP_ALIASES = { courses: 1, course: 1, po_pso_target: 2, po_pso_targets: 2, indirect_attainment: 3, programme_atr: 4, review: 5 };

/* ========================================================================== */
/* RESPONSE HELPERS                                                           */
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

/* ========================================================================== */
/* SETUP PROGRESS NORMALIZATION                                               */
/* ========================================================================== */

const normalizeProgress = (data, totalSteps, stepAliases = {}) => {
  const source = data ?? {};

  const stepNumber = (value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;

    const namedSteps = {
      school: 1,
      department: 2,
      programme: 3,
      program: 3,
      review: 4,
    };
    const key = String(value ?? '').trim().toLowerCase();
    return stepAliases[key] ?? namedSteps[key] ?? null;
  };

  const currentStep = source.currentStep ?? source.step ?? null;

  let completedSteps = [];

  if (Array.isArray(source.completedSteps)) {
    completedSteps = source.completedSteps
      .map(stepNumber)
      .filter((step) => Number.isFinite(step));
  } else if (
    source.completedStep !== undefined &&
    source.completedStep !== null &&
    source.completedStep !== ''
  ) {
    const completedStep = stepNumber(source.completedStep);
    if (Number.isFinite(completedStep)) {
      completedSteps = [completedStep];
    }
  } else if (
    source.completedSteps &&
    typeof source.completedSteps === 'object'
  ) {
    completedSteps = Object.entries(source.completedSteps)
      .filter(([, value]) => value === true)
      .map(([key]) => stepNumber(key))
      .filter(Number.isFinite);
  } else if (source.stepStatuses && typeof source.stepStatuses === 'object') {
    completedSteps = Object.entries(source.stepStatuses)
      .filter(([, status]) => status === 'COMPLETED')
      .map(([step]) => stepNumber(step))
      .filter(Number.isFinite);
  }

  completedSteps = [...new Set(completedSteps)]
    .filter((step) => step >= 1 && step <= totalSteps)
    .sort((a, b) => a - b);

  const completedSet = new Set(completedSteps);
  const stepStatus = Array.from({ length: totalSteps }, (_, index) =>
    completedSet.has(index + 1)
  );

  const completedStepsCount = completedSteps.length;
  const pendingStepsCount = Math.max(totalSteps - completedStepsCount, 0);
  const progressPct =
    totalSteps > 0
      ? Math.round((completedStepsCount / totalSteps) * 100)
      : 0;

  let currentStepNumber = Number(currentStep);
  if (!Number.isFinite(currentStepNumber) || currentStepNumber < 1) {
    const firstPending = stepStatus.findIndex((done) => !done);
    currentStepNumber = firstPending === -1 ? totalSteps : firstPending + 1;
  }

  return {
    ...source,
    currentStep: currentStepNumber,
    completedSteps,
    stepStatus,
    totalStepsCount: totalSteps,
    completedStepsCount,
    pendingStepsCount,
    progressPct,
  };
};

/* ========================================================================== */
/* PROVIDER                                                                   */
/* ========================================================================== */

export function DashboardProvider({ children }) {
  const { user, role } = useAuth();

  const {
    selectedSchool,
    selectedSchoolId,
    selectedDepartmentId,
    departments = [],
    programmes = [],
    masterProgrammes = [],
    selectedProgramme,
    programmeId,
    batches = [],
    batchId,
    courses = [],
    selectedCourse,
    courseId,
    courseOfferingId,
    selectedCourseOffering,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
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

  /* ------------------------------------------------------------------------ */
  /* Dashboard State                                                          */
  /* ------------------------------------------------------------------------ */

  const [directorDashboard, setDirectorDashboard] = useState(null);
  const [hodDashboard, setHodDashboard] = useState(null);
  const [programmeCoordinatorDashboard, setProgrammeCoordinatorDashboard] = useState(null);
  const [courseCoordinatorDashboard, setCourseCoordinatorDashboard] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Isolated Error States                                                    */
  /* ------------------------------------------------------------------------ */

  const [directorDashboardError, setDirectorDashboardError] = useState(null);
  const [hodDashboardError, setHodDashboardError] = useState(null);
  const [programmeCoordinatorDashboardError, setProgrammeCoordinatorDashboardError] = useState(null);
  const [courseCoordinatorDashboardError, setCourseCoordinatorDashboardError] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Setup Progress State                                                     */
  /* ------------------------------------------------------------------------ */

  const [directorWorkflowProgress, setDirectorWorkflowProgress] = useState(null);
  const [hodWorkflowProgress, setHodWorkflowProgress] = useState(null);
  const [pcWorkflowProgress, setPcWorkflowProgress] = useState(null);
  const [ccWorkflowProgress, setCcWorkflowProgress] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* 1. Explicit Dashboard Loaders                                            */
  /* ======================================================================== */

  const loadDirectorDashboard = useCallback(
    async (targetSchoolId = selectedSchoolId ?? user?.schoolId) => {
      try {
        setDirectorDashboardError(null);
        setError(null);

        const response = await dashboardApi.getDirectorDashboard(
          targetSchoolId
        );
        const data = unwrap(response);
        setDirectorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadDirectorDashboard failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load Director dashboard.';
        setDirectorDashboardError(msg);
        return null;
      }
    },
    [selectedSchoolId, user?.schoolId]
  );

  const loadHodDashboard = useCallback(
    async (targetDepartmentId = selectedDepartmentId ?? user?.departmentId, hodEmail = user?.email) => {
      try {
        setHodDashboardError(null);
        setError(null);

        const response = await dashboardApi.getHodDashboard(
          targetDepartmentId,
          hodEmail
        );
        const data = unwrap(response);
        setHodDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadHodDashboard failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load HOD dashboard.';
        setHodDashboardError(msg);
        return null;
      }
    },
    [selectedDepartmentId, user?.departmentId, user?.email]
  );

  const loadProgrammeCoordinatorDashboard = useCallback(
    async (targetMasterProgrammeId = programmeId, coordinatorEmail = user?.email) => {
      if (!targetMasterProgrammeId) {
        setProgrammeCoordinatorDashboard(null);
        return null;
      }

      try {
        setProgrammeCoordinatorDashboardError(null);
        setError(null);

        const response = await dashboardApi.getProgrammeCoordinatorDashboard(
          targetMasterProgrammeId,
          coordinatorEmail
        );
        const data = unwrap(response);
        setProgrammeCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeCoordinatorDashboard failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load Programme Coordinator dashboard.';
        setProgrammeCoordinatorDashboardError(msg);
        return null;
      }
    },
    [programmeId, user?.email]
  );

  const loadCourseCoordinatorDashboard = useCallback(
    async (targetOfferingId = courseOfferingId, coordinatorEmail = user?.email) => {
      try {
        setCourseCoordinatorDashboardError(null);
        setError(null);

        const response = await dashboardApi.getCourseCoordinatorDashboard({
          courseOfferingId: targetOfferingId,
          coordinatorEmail,
        });
        const data = unwrap(response);
        setCourseCoordinatorDashboard(data);
        return data;
      } catch (err) {
        console.warn('loadCourseCoordinatorDashboard failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load Course Coordinator dashboard.';
        setCourseCoordinatorDashboardError(msg);
        return null;
      }
    },
    [courseOfferingId, user?.email]
  );

  /* ======================================================================== */
  /* 2. Explicit Setup Progress Loaders                                       */
  /* ======================================================================== */

  const loadDirectorSetupProgress = useCallback(
    async (targetSchoolId = user?.schoolId) => {
      try {
        const params = {};
        if (targetSchoolId) params.schoolId = targetSchoolId;

        const response = await apiClient.get('/academic/director/setup-progress', { params });
        const normalized = normalizeProgress(unwrap(response), DIRECTOR_WORKFLOW_STEPS.length);
        setDirectorWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadDirectorSetupProgress failed:', err);
        return null;
      }
    },
    [user?.schoolId]
  );

  const loadHodSetupProgress = useCallback(
    async (targetDepartmentId = selectedDepartmentId ?? user?.departmentId) => {
      try {
        const params = {};
        if (targetDepartmentId) params.departmentId = targetDepartmentId;

        const response = await apiClient.get('/academic/hod/setup-progress', { params });
        const normalized = normalizeProgress(unwrap(response), HOD_WORKFLOW_STEPS.length, HOD_STEP_ALIASES);
        setHodWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadHodSetupProgress failed:', err);
        return null;
      }
    },
    [selectedDepartmentId, user?.departmentId]
  );

  const loadPcSetupProgress = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId, coordinatorEmail = user?.email) => {
      if (!targetProgrammeId || !targetBatchId) {
        setPcWorkflowProgress(null);
        return null;
      }

      try {
        // The coordinator endpoint resolves the assigned programme-batch
        // scope from the authenticated coordinator/email. Do not send
        // programme or batch selectors on this read request.
        const params = coordinatorEmail ? { coordinatorEmail } : {};

        const response = await apiClient.get('/academic/coordinator/setup-progress', { params });
        const normalized = normalizeProgress(unwrap(response), PC_WORKFLOW_STEPS.length, PC_STEP_ALIASES);
        setPcWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadPcSetupProgress failed:', err);
        return null;
      }
    },
    [programmeId, batchId, user?.email]
  );

  const loadCcSetupProgress = useCallback(
    async (targetOfferingOrCourse = (courseOfferingId || courseId), coordinatorEmail = user?.email) => {
      if (!targetOfferingOrCourse) {
        setCcWorkflowProgress(null);
        return null;
      }

      try {
        /*
         * CRITICAL:
         * For Course Coordinator setup-progress:
         * courseId = COURSE OFFERING ID
         */
        const params = {
          coordinatorEmail,
          courseId: targetOfferingOrCourse,
        };

        const response = await apiClient.get('/academic/course-coordinator/setup-progress', { params });
        const normalized = normalizeProgress(unwrap(response), CC_WORKFLOW_STEPS.length);
        setCcWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadCcSetupProgress failed:', err);
        return null;
      }
    },
    [courseOfferingId, courseId, user?.email]
  );

  /* General role-based workflow loader */
  const loadWorkflowProgress = useCallback(
    async (targetRole = role) => {
      if (targetRole === 'DIRECTOR' || targetRole === 'ADMIN') {
        return loadDirectorSetupProgress();
      }
      if (targetRole === 'HOD') {
        return loadHodSetupProgress();
      }
      if (targetRole === 'PROGRAMME_COORDINATOR') {
        return loadPcSetupProgress();
      }
      if (targetRole === 'FACULTY' || targetRole === 'COURSE_COORDINATOR') {
        return loadCcSetupProgress();
      }
      return null;
    },
    [role, loadDirectorSetupProgress, loadHodSetupProgress, loadPcSetupProgress, loadCcSetupProgress]
  );

  /* ======================================================================== */
  /* 3. Explicit Setup Progress Savers                                        */
  /* ======================================================================== */

  const saveDirectorSetupProgress = useCallback(
    async (nextStep, completedStep) => {
      try {
        const schoolId = selectedSchoolId ?? user?.schoolId;
        if (!schoolId) {
          throw new Error('A schoolId is required to save Director setup progress.');
        }

        const existingCompletedSteps = (directorWorkflowProgress?.completedSteps ?? []).map(String);
        const payload = {
          schoolId,
          currentStep: nextStep,
          completedStep: String(completedStep),
          completedSteps: [
            ...existingCompletedSteps,
            String(completedStep),
          ].filter((v, i, arr) => arr.indexOf(v) === i),
        };

        const response = await apiClient.post('/academic/director/setup-progress', payload);
        const normalized = normalizeProgress(unwrap(response), DIRECTOR_WORKFLOW_STEPS.length);
        setDirectorWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('saveDirectorSetupProgress failed:', err);
        throw err;
      }
    },
    [selectedSchoolId, user?.schoolId, directorWorkflowProgress?.completedSteps]
  );

  const saveHodSetupProgress = useCallback(
    async (nextStep, completedStep) => {
      try {
        const canonicalStep = HOD_WORKFLOW_STEPS.find(
          (item) => item.step === Number(completedStep)
        )?.key;
        const completedSteps = [
          ...(hodWorkflowProgress?.completedSteps || []),
          canonicalStep,
        ].filter((v, i, arr) => arr.indexOf(v) === i);

        const payload = {
          departmentId: selectedDepartmentId ?? user?.departmentId,
          hodEmail: user?.email,
          currentStep: nextStep,
          completedStep: canonicalStep,
          completedSteps,
        };

        const response = await apiClient.post('/academic/hod/setup-progress', payload);
        const normalized = normalizeProgress(unwrap(response), HOD_WORKFLOW_STEPS.length, HOD_STEP_ALIASES);
        setHodWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('saveHodSetupProgress failed:', err);
        throw err;
      }
    },
    [selectedDepartmentId, user?.departmentId, user?.email, hodWorkflowProgress?.completedSteps]
  );

  const completeHodSetupProgress = useCallback(async () => {
    const departmentId = selectedDepartmentId ?? user?.departmentId;
    const params = {};
    if (departmentId) params.departmentId = departmentId;
    if (user?.email) params.hodEmail = user.email;

    const response = await apiClient.post('/academic/hod/setup-progress/complete', null, { params });
    const normalized = normalizeProgress(unwrap(response), HOD_WORKFLOW_STEPS.length, HOD_STEP_ALIASES);
    setHodWorkflowProgress(normalized);
    return normalized;
  }, [selectedDepartmentId, user?.departmentId, user?.email]);

  const savePcSetupProgress = useCallback(
    async (nextStep, completedStep) => {
      if (!programmeId || !batchId) {
        throw new Error('programmeId and batchId are required to save PC progress');
      }

      try {
        const canonicalStep = PC_WORKFLOW_STEPS.find((item) => item.step === Number(completedStep))?.key;
        const completedSteps = [
          ...(pcWorkflowProgress?.completedSteps || []),
          canonicalStep,
        ].filter((v, i, arr) => arr.indexOf(v) === i);

        const payload = { completedStep: canonicalStep, completedSteps };
        const params = { programmeId, batchId, currentStep: nextStep };

        const response = await apiClient.post('/academic/coordinator/setup-progress', payload, { params });
        const normalized = normalizeProgress(unwrap(response), PC_WORKFLOW_STEPS.length, PC_STEP_ALIASES);
        setPcWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('savePcSetupProgress failed:', err);
        throw err;
      }
    },
    [programmeId, batchId, user?.email, pcWorkflowProgress?.completedSteps]
  );

  const completePcSetupProgress = useCallback(async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
    const params = {};
    if (targetProgrammeId) params.programmeId = targetProgrammeId;
    if (targetBatchId) params.batchId = targetBatchId;
    const response = await apiClient.post('/academic/coordinator/setup-progress/complete', null, { params });
    const normalized = normalizeProgress(unwrap(response), PC_WORKFLOW_STEPS.length, PC_STEP_ALIASES);
    setPcWorkflowProgress(normalized);
    return normalized;
  }, [programmeId, batchId]);

  const saveCcSetupProgress = useCallback(
    async (nextStep, completedStep) => {
      const targetOfferingOrCourse = courseOfferingId || courseId;
      if (!targetOfferingOrCourse) {
        throw new Error('courseOfferingId or courseId is required to save CC progress');
      }

      try {
        const completedSteps = [
          ...(ccWorkflowProgress?.completedSteps ?? []).map(String),
          String(completedStep),
        ].filter((value, index, all) => all.indexOf(value) === index);
        const payload = {
          courseId: targetOfferingOrCourse,
          stepNumber: nextStep,
          completedSteps,
        };

        // The deployed controller accepts POST only. It must implement this as
        // an upsert for an existing courseId; the frontend has no supported
        // update route when the record already exists.
        const response = await apiClient.post('/academic/course-coordinator/setup-progress', payload);
        const normalized = normalizeProgress(unwrap(response), CC_WORKFLOW_STEPS.length);
        setCcWorkflowProgress(normalized);
        return normalized;
      } catch (err) {
        console.warn('saveCcSetupProgress failed:', err);
        throw err;
      }
    },
    [ccWorkflowProgress?.completedSteps, courseOfferingId, courseId]
  );

  /* General role-based workflow saver */
  const saveWorkflowProgress = useCallback(
    async ({ nextStep, completedStep }) => {
      if (role === 'DIRECTOR' || role === 'ADMIN') {
        return saveDirectorSetupProgress(nextStep, completedStep);
      }
      if (role === 'HOD') {
        return saveHodSetupProgress(nextStep, completedStep);
      }
      if (role === 'PROGRAMME_COORDINATOR') {
        return savePcSetupProgress(nextStep, completedStep);
      }
      if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        return saveCcSetupProgress(nextStep, completedStep);
      }
      return null;
    },
    [role, saveDirectorSetupProgress, saveHodSetupProgress, savePcSetupProgress, saveCcSetupProgress]
  );

  /* ======================================================================== */
  /* 4. Workflow Convenience Compatibility Methods                            */
  /* ======================================================================== */

  const markWorkflowStepComplete = useCallback(
    async (targetCourseOfferingId, path) => {
      if (!targetCourseOfferingId || !path) {
        return null;
      }

      const step = CC_WORKFLOW_STEPS.find((item) => item.path === path);
      if (!step) {
        return null;
      }

      return saveWorkflowProgress({
        nextStep: step.step + 1,
        completedStep: step.step,
      });
    },
    [saveWorkflowProgress]
  );

  const markDirectorWorkflowStepComplete = useCallback(
    async (stepNumber) => {
      if (!stepNumber) return null;
      return saveDirectorSetupProgress(Number(stepNumber) + 1, Number(stepNumber));
    },
    [saveDirectorSetupProgress]
  );

  const markHodWorkflowStepComplete = useCallback(
    async (targetProgId, stepNumber) => {
      if (!stepNumber) return null;
      return saveHodSetupProgress(Number(stepNumber) + 1, Number(stepNumber));
    },
    [saveHodSetupProgress]
  );

  const markPcWorkflowStepComplete = useCallback(
    async (targetProgId, stepNumber) => {
      if (!stepNumber) return null;
      return savePcSetupProgress(Number(stepNumber) + 1, Number(stepNumber));
    },
    [savePcSetupProgress]
  );

  const resetWorkflowProgress = useCallback(async () => {
    return loadWorkflowProgress();
  }, [loadWorkflowProgress]);

  const resetDirectorWorkflowProgress = useCallback(async () => {
    return loadDirectorSetupProgress();
  }, [loadDirectorSetupProgress]);

  const resetHodWorkflowProgress = useCallback(async () => {
    return loadHodSetupProgress();
  }, [loadHodSetupProgress]);

  const resetPcWorkflowProgress = useCallback(async () => {
    return loadPcSetupProgress();
  }, [loadPcSetupProgress]);

  /* ======================================================================== */
  /* 5. Safe Normalized Role Stats (White-Screen Protected)                   */
  /* ======================================================================== */

  const courseCoordinatorStats = useMemo(() => {
    const progress = ccWorkflowProgress ?? normalizeProgress(null, CC_WORKFLOW_STEPS.length);
    const stepStatus = progress.stepStatus;
    const nextStepNumber = progress.currentStep;
    const nextStepItem = CC_WORKFLOW_STEPS.find((step) => step.step === nextStepNumber) ?? null;
    const dashboardData = courseCoordinatorDashboard ?? null;

    return {
      ...(dashboardData && typeof dashboardData === 'object' ? dashboardData : {}),
      schoolName: selectedSchool?.name ?? dashboardData?.schoolName ?? null,
      coordinatorName: user?.name ?? dashboardData?.coordinatorName ?? null,
      courseCode: selectedCourse?.code ?? dashboardData?.courseCode ?? null,
      courseName: selectedCourse?.name ?? dashboardData?.courseName ?? null,
      courseId,
      batchId,
      courseOfferingId,
      courseOffering: selectedCourseOffering ?? null,
      coCount: activeCOs.length,
      poCount: activePOs.length,
      psoCount: activePSOs.length,
      attainment: courseAttainmentStore,
      verification: (courseVerificationStore ?? {})[courseOfferingId] ?? null,
      workflowProgress: progress,
      stepStatus,
      totalStepsCount: CC_WORKFLOW_STEPS.length,
      completedStepsCount: progress.completedStepsCount,
      pendingStepsCount: progress.pendingStepsCount,
      progressPct: progress.progressPct,
      targetStepNum: nextStepNumber,
      nextStep: nextStepItem,
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

  const programmeCoordinatorStats = useMemo(() => {
    const progress = pcWorkflowProgress ?? normalizeProgress(null, PC_WORKFLOW_STEPS.length);
    const dashboardData = programmeCoordinatorDashboard ?? null;
    const programmeCourses = programmeId
      ? courses.filter((course) => course.programmeId === programmeId)
      : [];

    return {
      ...(dashboardData && typeof dashboardData === 'object' ? dashboardData : {}),
      schoolName: selectedSchool?.name ?? dashboardData?.schoolName ?? null,
      coordinatorName:
        user?.name ??
        selectedProgramme?.coordinator ??
        dashboardData?.coordinatorName ??
        null,
      programmeName: selectedProgramme?.name ?? dashboardData?.programmeName ?? null,
      programmeCode: selectedProgramme?.code ?? dashboardData?.programmeCode ?? null,
      programmeId,
      batchId,
      totalCoursesCount: dashboardData?.totalCoursesCount ?? programmeCourses.length,
      assignedFacultyCount: dashboardData?.assignedFacultyCount ?? null,
      poCount: activePOs.length,
      psoCount: activePSOs.length,
      pendingVerificationsCount: getPendingVerificationsCount
        ? getPendingVerificationsCount()
        : 0,
      selectedProgramme: selectedProgramme ?? null,
      workflowProgress: progress,
      stepStatus: progress.stepStatus,
      completedStepsCount: progress.completedStepsCount,
      totalStepsCount: PC_WORKFLOW_STEPS.length,
      pendingStepsCount: progress.pendingStepsCount,
      progressPct: progress.progressPct,
      targetStepNum: progress.currentStep,
      nextStep:
        PC_WORKFLOW_STEPS.find((step) => step.step === progress.currentStep) ?? null,
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

  const hodStats = useMemo(() => {
    const departmentId = user?.departmentId ?? null;
    const departmentName = user?.department ?? null;

    const departmentProgrammes = programmes.filter((programme) => {
      if (departmentId) {
        return programme.departmentId === departmentId;
      }
      if (departmentName) {
        return programme.department === departmentName;
      }
      return false;
    });

    const progress = hodWorkflowProgress ?? normalizeProgress(null, HOD_WORKFLOW_STEPS.length);
    const dashboardData = hodDashboard ?? null;

    const pendingApprovalsCount = hodApprovals.filter(
      (approval) => approval.status === 'PENDING'
    ).length;

    const activeBatchesCount = batches.filter(
      (batch) => batch.status === 'ACTIVE'
    ).length;

    return {
      ...(dashboardData && typeof dashboardData === 'object' ? dashboardData : {}),
      schoolName: selectedSchool?.name ?? dashboardData?.schoolName ?? null,
      hodName: user?.name ?? dashboardData?.hodName ?? null,
      departmentName,
      departmentId,
      programmesCount: dashboardData?.programmesCount ?? departmentProgrammes.length,
      totalCoursesCount: dashboardData?.totalCoursesCount ?? null,
      activeBatchesCount: dashboardData?.activeBatchesCount ?? activeBatchesCount,
      pendingHodApprovalsCount:
        dashboardData?.pendingHodApprovalsCount ?? pendingApprovalsCount,
      coordinatorsCount: dashboardData?.coordinatorsCount ?? null,
      atrApprovedCount: dashboardData?.atrApprovedCount ?? null,
      selectedProgramme: selectedProgramme ?? null,
      workflowProgress: progress,
      stepStatus: progress.stepStatus,
      completedStepsCount: progress.completedStepsCount,
      totalStepsCount: HOD_WORKFLOW_STEPS.length,
      pendingStepsCount: progress.pendingStepsCount,
      progressPct: progress.progressPct,
      targetStepNum: progress.currentStep,
      nextStep:
        HOD_WORKFLOW_STEPS.find((step) => step.step === progress.currentStep) ?? null,
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

  const directorStats = useMemo(() => {
    const progress = directorWorkflowProgress ?? normalizeProgress(null, DIRECTOR_WORKFLOW_STEPS.length);
    const dashboardData = directorDashboard ?? null;

    return {
      ...(dashboardData && typeof dashboardData === 'object' ? dashboardData : {}),
      schoolName: selectedSchool?.name ?? dashboardData?.schoolName ?? null,
      directorName: user?.name ?? dashboardData?.directorName ?? null,
      departmentsCount: dashboardData?.departmentsCount ?? departments.length,
      totalProgrammesCount: dashboardData?.totalProgrammesCount ?? masterProgrammes.length,
      totalStudentsCount: dashboardData?.totalStudentsCount ?? null,
      pendingDirectorApprovalsCount:
        dashboardData?.pendingDirectorApprovalsCount ??
        directorApprovals.filter((approval) => approval.status === 'PENDING').length,
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
      accreditationReadinessPct: dashboardData?.accreditationReadinessPct ?? null,
      workflowProgress: progress,
      stepDone: progress.stepStatus,
      completedStepsCount: progress.completedStepsCount,
      totalStepsCount: DIRECTOR_WORKFLOW_STEPS.length,
      pendingStepsCount: progress.pendingStepsCount,
      progressPct: progress.progressPct,
      targetStepNum: progress.currentStep,
      nextStep:
        DIRECTOR_WORKFLOW_STEPS.find((step) => step.number === progress.currentStep) ?? null,
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

  /* Safe Workflow Progress Store for screens that access workflowProgressStore[id] */
  const workflowProgressStore = useMemo(() => {
    const store = {};
    const defaultProgress = normalizeProgress(null, CC_WORKFLOW_STEPS.length);

    if (courseOfferingId) {
      store[courseOfferingId] = ccWorkflowProgress ?? defaultProgress;
    }
    if (courseId) {
      store[courseId] = ccWorkflowProgress ?? defaultProgress;
    }
    if (programmeId) {
      store[`allocation-${programmeId}`] = pcWorkflowProgress ?? normalizeProgress(null, PC_WORKFLOW_STEPS.length);
      store[`targets-${programmeId}`] = pcWorkflowProgress ?? normalizeProgress(null, PC_WORKFLOW_STEPS.length);
      store[`prog-atr-${programmeId}`] = pcWorkflowProgress ?? normalizeProgress(null, PC_WORKFLOW_STEPS.length);
    }
    return store;
  }, [courseOfferingId, courseId, programmeId, ccWorkflowProgress, pcWorkflowProgress]);

  const getDashboardData = useCallback(
    (targetRole = role) => {
      switch (targetRole) {
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
    [role, directorStats, hodStats, programmeCoordinatorStats, courseCoordinatorStats]
  );

  /* ======================================================================== */
  /* Context Value                                                            */
  /* ======================================================================== */

  const value = {
    /* Backend dashboard responses */
    directorDashboard,
    hodDashboard,
    programmeCoordinatorDashboard,
    courseCoordinatorDashboard,

    /* Isolated error states */
    directorDashboardError,
    hodDashboardError,
    programmeCoordinatorDashboardError,
    courseCoordinatorDashboardError,

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
    workflowProgressStore,

    /* Explicit Loaders */
    loadDirectorDashboard,
    loadHodDashboard,
    loadProgrammeCoordinatorDashboard,
    loadCourseCoordinatorDashboard,

    loadDirectorSetupProgress,
    loadHodSetupProgress,
    loadPcSetupProgress,
    loadCcSetupProgress,
    loadWorkflowProgress,

    /* Explicit Savers */
    saveDirectorSetupProgress,
    saveHodSetupProgress,
    completeHodSetupProgress,
    savePcSetupProgress,
    completePcSetupProgress,
    saveCcSetupProgress,
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

    /* Status */
    loading,
    error,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

export default useDashboard;
