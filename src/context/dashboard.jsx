import { createContext, useContext, useState, useMemo } from 'react';
import { useAuth } from './auth';
import { useAcademic } from './academic';
import { useApproval } from './approval';
import { useAttainment } from './attainment';

export const DashboardContext = createContext(null);

const CC_WORKFLOW_STEPS = [
  { step: 1, label: 'Add COs',             path: '/outcomes' },
  { step: 2, label: 'CO–PO/PSO Mapping',   path: '/co-mapping' },
  { step: 3, label: 'Direct Assessment',   path: '/marks-upload' },
  { step: 4, label: 'Indirect Assessment', path: '/survey-upload' },
  { step: 5, label: 'CO Attainment',       path: '/co-attainment' },
  { step: 6, label: 'Course ATR',          path: '/course-atr' },
];

export const DIRECTOR_WORKFLOW_STEPS = [
  { number: 1, title: 'School Info',     desc: 'Metadata & Dean allocation',      path: '/director/school-structure',     stepKey: 'step-1' },
  { number: 2, title: 'Departments',     desc: 'Department hierarchy & HODs',     path: '/director/department-management', stepKey: 'step-2' },
  { number: 3, title: 'Programmes',      desc: 'Degree programmes & duration',    path: '/director/programme-overview',    stepKey: 'step-3' },
  { number: 4, title: 'Review & Verify', desc: 'Audit structure & complete setup', path: '/director/reports',              stepKey: 'step-4' },
];

export const HOD_WORKFLOW_STEPS = [
  { step: 1, number: 1, title: 'Programme Coordinator', label: 'Programme Coordinator', desc: 'Assign coordinator for programme', path: '/hod/programme-coordinators', icon: 'UserCheck',   color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, number: 2, title: 'Batch Setup',          label: 'Batch Setup',          desc: 'Initialize student batch cycle',   path: '/hod/batch-management',      icon: 'Calendar',    color: '#0284c7', bg: '#f0f9ff' },
  { step: 3, number: 3, title: 'PO / PSO / PEO',       label: 'PO / PSO / PEO',       desc: 'Define outcome framework',         path: '/hod/programme-outcomes',    icon: 'Layers',      color: '#7c3aed', bg: '#f5f3ff' },
  { step: 4, number: 4, title: 'Review & Confirm',     label: 'Review & Confirm',     desc: 'Verify setup summary & finish',    path: '/hod/reports',               icon: 'CheckCircle2',color: '#059669', bg: '#f0fdf4' },
];

export const PC_WORKFLOW_STEPS = [
  { step: 1, number: 1, title: 'Add Courses',        label: 'Add Courses',        desc: 'Add & allocate courses under programme',      path: '/programme-coordinator/setup-workflow?step=1', icon: 'BookOpen',     color: '#4f46e5', bg: '#eef2ff' },
  { step: 2, number: 2, title: 'Set PO/PSO Targets', label: 'Set PO/PSO Targets', desc: 'Configure PO & PSO target levels (1.0 – 3.0)', path: '/programme-coordinator/setup-workflow?step=2', icon: 'Target',       color: '#7c3aed', bg: '#f5f3ff' },
  { step: 3, number: 3, title: 'Programme ATR',     label: 'Programme ATR',     desc: 'Fill & submit Programme Action Taken Report', path: '/programme-coordinator/setup-workflow?step=3', icon: 'Layers',       color: '#0284c7', bg: '#f0f9ff' },
  { step: 4, number: 4, title: 'Review & Confirm',   label: 'Review & Confirm',   desc: 'Verify setup summary & finish',               path: '/programme-coordinator/setup-workflow?step=4', icon: 'CheckCircle2', color: '#059669', bg: '#f0fdf4' },
];

export function DashboardProvider({ children }) {
  const { user, role } = useAuth();
  const {
    selectedSchool,
    selectedDepartment,
    departments = [],
    masterProgrammes = [],
    selectedProgramme,
    courses = [],
    availableCourses = [],
    selectedCourse,
    activePOs = [],
    activePSOs = [],
    activeCOs = [],
    batches = [],
    batchStudentsStore = {},
    academicYear,
  } = useAcademic();

  const {
    directorApprovals = [],
    hodApprovals = [],
    courseVerificationStore = {},
    getPendingVerificationsCount = () => 0,
  } = useApproval();

  const { yearMetrics = {}, courseAttainmentStore = {} } = useAttainment();

  // Workflow Progress Store for Course Coordinator
  const [workflowProgressStore, setWorkflowProgressStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_workflow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const markWorkflowStepComplete = (targetCourseId, path) => {
    const cid = targetCourseId || selectedCourse?.id || 'crs-1';
    setWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [cid]: {
          ...(prev[cid] || {}),
          [path]: true,
        },
      };
      try {
        localStorage.setItem('dypiu_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetWorkflowProgress = (targetCourseId) => {
    const cid = targetCourseId || selectedCourse?.id || 'crs-1';
    setWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [cid]: {},
      };
      try {
        localStorage.setItem('dypiu_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Director Setup Workflow Progress
  const [directorWorkflowProgress, setDirectorWorkflowProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_director_workflow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const markDirectorWorkflowStepComplete = (stepNumber) => {
    setDirectorWorkflowProgress((prev) => {
      const updated = {
        ...prev,
        [stepNumber]: true,
      };
      try {
        localStorage.setItem('dypiu_director_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetDirectorWorkflowProgress = () => {
    const fresh = {};
    setDirectorWorkflowProgress(fresh);
    try {
      localStorage.setItem('dypiu_director_workflow_progress', JSON.stringify(fresh));
    } catch {}
  };

  // HOD Setup Workflow Progress Store (keyed by programme ID, e.g. 'prog-1')
  const [hodWorkflowProgressStore, setHodWorkflowProgressStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_hod_workflow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const markHodWorkflowStepComplete = (targetProgId, stepNumber) => {
    const pid = targetProgId || selectedProgramme?.id || masterProgrammes[0]?.id || 'prog-1';
    setHodWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [pid]: {
          ...(prev[pid] || {}),
          [stepNumber]: true,
        },
      };
      try {
        localStorage.setItem('dypiu_hod_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetHodWorkflowProgress = (targetProgId) => {
    const pid = targetProgId || selectedProgramme?.id || masterProgrammes[0]?.id || 'prog-1';
    setHodWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [pid]: {},
      };
      try {
        localStorage.setItem('dypiu_hod_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Programme Coordinator Setup Workflow Progress Store (keyed by programme ID, e.g. 'prog-1')
  const [pcWorkflowProgressStore, setPcWorkflowProgressStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_pc_workflow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const markPcWorkflowStepComplete = (targetProgId, stepNumber) => {
    const pid = targetProgId || selectedProgramme?.id || masterProgrammes[0]?.id || 'prog-1';
    setPcWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [pid]: {
          ...(prev[pid] || {}),
          [stepNumber]: true,
        },
      };
      try {
        localStorage.setItem('dypiu_pc_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetPcWorkflowProgress = (targetProgId) => {
    const pid = targetProgId || selectedProgramme?.id || masterProgrammes[0]?.id || 'prog-1';
    setPcWorkflowProgressStore((prev) => {
      const updated = {
        ...prev,
        [pid]: {},
      };
      try {
        localStorage.setItem('dypiu_pc_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // ── 1. Course Coordinator Dashboard Stats ─────────────────────────────────
  const courseCoordinatorStats = useMemo(() => {
    const currentCourse = selectedCourse || availableCourses[0] || courses[0];
    const courseId = currentCourse?.id || 'crs-1';
    const courseProg = workflowProgressStore[courseId] || {};

    const stepStatus = CC_WORKFLOW_STEPS.map((s) => !!courseProg[s.path]);
    const completedStepsCount = stepStatus.filter(Boolean).length;
    const totalStepsCount = CC_WORKFLOW_STEPS.length;
    const pendingStepsCount = totalStepsCount - completedStepsCount;
    const progressPct = Math.round((completedStepsCount / totalStepsCount) * 100);

    const nextStepItem = CC_WORKFLOW_STEPS.find((s) => !courseProg[s.path]) || null;
    const targetStepNum = nextStepItem ? nextStepItem.step : 1;

    return {
      schoolName: selectedSchool?.name || 'School of Engineering & Technology',
      coordinatorName: user?.name || currentCourse?.coordinator || 'Course Coordinator',
      activeCourse: currentCourse,
      courseCode: currentCourse?.code || '—',
      courseName: currentCourse?.name || 'No Course Selected',
      coCount: currentCourse?.courseOutcomes?.length || activeCOs.length || 0,
      poCount: activePOs.length || 12,
      psoCount: activePSOs.length || 3,
      workflowProgressStore,
      stepStatus,
      totalStepsCount,
      completedStepsCount,
      pendingStepsCount,
      progressPct,
      targetStepNum,
      nextStep: nextStepItem,
      attainmentSummary: courseAttainmentStore[courseId] || { overallCOAttainment: 2.74 },
    };
  }, [
    selectedSchool, user, selectedCourse, availableCourses, courses,
    workflowProgressStore, activeCOs, activePOs, activePSOs, courseAttainmentStore,
  ]);

  // ── 2. Programme Coordinator Dashboard Stats ──────────────────────────────
  const programmeCoordinatorStats = useMemo(() => {
    const prog = selectedProgramme || masterProgrammes[0] || { id: 'prog-1', name: 'B.Tech Computer Science & Engineering', code: 'BE-COMP' };
    const pid = prog?.id || 'prog-1';
    const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === pid);
    const assignedCount = progCourses.filter((c) => c.coordinator && c.coordinator !== 'Pending HOD Assignment').length;
    const pendingVerifs = getPendingVerificationsCount();
    const progWorkflowProgress = pcWorkflowProgressStore[pid] || {};

    const stepStatus = [1, 2, 3, 4].map((num) => !!progWorkflowProgress[num]);
    const completedStepsCount = stepStatus.filter(Boolean).length;
    const totalStepsCount = 4;
    const pendingStepsCount = totalStepsCount - completedStepsCount;
    const progressPct = Math.round((completedStepsCount / totalStepsCount) * 100);

    const nextStepIdx = stepStatus.findIndex((done) => !done);
    const nextStepItem = nextStepIdx !== -1 ? PC_WORKFLOW_STEPS[nextStepIdx] : null;
    const targetStepNum = nextStepIdx !== -1 ? nextStepIdx + 1 : 1;

    return {
      schoolName: selectedSchool?.name || 'School of Engineering & Technology',
      coordinatorName: user?.name || prog?.coordinator || 'Programme Coordinator',
      programmeName: prog?.name || 'B.Tech Computer Science & Engineering',
      programmeCode: prog?.code || 'BE-COMP',
      totalCoursesCount: progCourses.length,
      assignedFacultyCount: assignedCount,
      poCount: activePOs.length || 12,
      psoCount: activePSOs.length || 3,
      pendingVerificationsCount: pendingVerifs,
      targetsConfiguredCount: activePOs.length + activePSOs.length,
      selectedProgramme: prog,
      pcWorkflowProgressStore,
      progWorkflowProgress,
      stepStatus,
      completedStepsCount,
      totalStepsCount,
      pendingStepsCount,
      progressPct,
      targetStepNum,
      nextStep: nextStepItem,
    };
  }, [selectedSchool, user, selectedProgramme, masterProgrammes, courses, getPendingVerificationsCount, activePOs, activePSOs, pcWorkflowProgressStore]);

  // ── 3. HOD Dashboard Stats ────────────────────────────────────────────────
  const hodStats = useMemo(() => {
    const deptName = user?.department || 'Department of Computer Science & Engineering';
    const deptProgrammes = masterProgrammes.filter((p) => p.department === deptName || p.departmentId === 'dept-1');
    const pendingApprovals = hodApprovals.filter((a) => a.status === 'PENDING' || a.status === 'SUBMITTED').length;
    const activeBatches = batches.filter((b) => b.status === 'ACTIVE').length;
    const currentProg = selectedProgramme || deptProgrammes[0] || masterProgrammes[0];
    const pid = currentProg?.id || 'prog-1';
    const progWorkflowProgress = hodWorkflowProgressStore[pid] || {};

    const stepStatus = [1, 2, 3, 4].map((num) => !!progWorkflowProgress[num]);
    const completedStepsCount = stepStatus.filter(Boolean).length;
    const totalStepsCount = 4;
    const pendingStepsCount = totalStepsCount - completedStepsCount;
    const progressPct = Math.round((completedStepsCount / totalStepsCount) * 100);

    const nextStepIdx = stepStatus.findIndex((done) => !done);
    const nextStepItem = nextStepIdx !== -1 ? HOD_WORKFLOW_STEPS[nextStepIdx] : null;
    const targetStepNum = nextStepIdx !== -1 ? nextStepIdx + 1 : 1;

    return {
      schoolName: selectedSchool?.name || 'School of Engineering & Technology',
      hodName: user?.name || 'Dr. Raj Shaikh',
      departmentName: deptName,
      programmesCount: deptProgrammes.length || masterProgrammes.length,
      totalCoursesCount: courses.length,
      activeBatchesCount: activeBatches,
      pendingHodApprovalsCount: pendingApprovals,
      coordinatorsCount: 6,
      atrApprovedCount: 1,
      selectedProgramme: currentProg,
      hodWorkflowProgressStore,
      progWorkflowProgress,
      stepStatus,
      completedStepsCount,
      totalStepsCount,
      pendingStepsCount,
      progressPct,
      targetStepNum,
      nextStep: nextStepItem,
    };
  }, [user, selectedSchool, masterProgrammes, selectedProgramme, hodApprovals, batches, courses, hodWorkflowProgressStore]);

  // ── 4. Director Dashboard Stats ───────────────────────────────────────────
  const directorStats = useMemo(() => {
    const totalStudents = Object.values(batchStudentsStore).reduce((acc, list) => acc + (list?.length || 0), 0) + 120;
    const pendingApprovals = directorApprovals.filter((a) => a.status === 'PENDING').length;

    const stepDone = [1, 2, 3, 4].map((num) => !!directorWorkflowProgress[num]);
    const completedStepsCount = stepDone.filter(Boolean).length;
    const totalStepsCount = 4;
    const pendingStepsCount = totalStepsCount - completedStepsCount;
    const progressPct = Math.round((completedStepsCount / totalStepsCount) * 100);

    const nextStepIdx = stepDone.findIndex((done) => !done);
    const nextStepItem = nextStepIdx !== -1 ? DIRECTOR_WORKFLOW_STEPS[nextStepIdx] : null;
    const targetStepNum = nextStepIdx !== -1 ? nextStepIdx + 1 : 1;

    return {
      schoolName: selectedSchool?.name || 'School of Engineering & Technology',
      directorName: user?.name || 'Dr. R. K. Deshmukh',
      departmentsCount: departments.length || 4,
      totalProgrammesCount: masterProgrammes.length,
      totalStudentsCount: totalStudents,
      pendingDirectorApprovalsCount: pendingApprovals,
      overallAttainmentAvg: yearMetrics.overallCOAttainment || 2.74,
      avgPoAttainment: yearMetrics.avgPoAttainment || 1.83,
      avgPsoAttainment: yearMetrics.avgPsoAttainment || 1.70,
      accreditationReadinessPct: 88,
      directorWorkflowProgress,
      stepDone,
      completedStepsCount,
      totalStepsCount,
      pendingStepsCount,
      progressPct,
      targetStepNum,
      nextStep: nextStepItem,
    };
  }, [selectedSchool, user, departments, masterProgrammes, batchStudentsStore, directorApprovals, yearMetrics, directorWorkflowProgress]);

  const getDashboardData = (targetRole = role) => {
    switch (targetRole) {
      case 'DIRECTOR':
        return directorStats;
      case 'HOD':
        return hodStats;
      case 'PROGRAMME_COORDINATOR':
        return programmeCoordinatorStats;
      case 'FACULTY':
      default:
        return courseCoordinatorStats;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        courseCoordinatorStats,
        programmeCoordinatorStats,
        hodStats,
        directorStats,
        getDashboardData,
        workflowProgressStore,
        markWorkflowStepComplete,
        resetWorkflowProgress,
        directorWorkflowProgress,
        markDirectorWorkflowStepComplete,
        resetDirectorWorkflowProgress,
        hodWorkflowProgressStore,
        markHodWorkflowStepComplete,
        resetHodWorkflowProgress,
        pcWorkflowProgressStore,
        markPcWorkflowStepComplete,
        resetPcWorkflowProgress,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
