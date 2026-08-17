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
    const prog = selectedProgramme || masterProgrammes[0];
    const progCourses = courses.filter((c) => !c.programmeId || c.programmeId === prog?.id);
    const assignedCount = progCourses.filter((c) => c.coordinator && c.coordinator !== 'Pending HOD Assignment').length;
    const pendingVerifs = getPendingVerificationsCount();

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
      setupProgressPct: progCourses.length > 0 && activePOs.length > 0 ? 100 : 66,
    };
  }, [selectedSchool, user, selectedProgramme, masterProgrammes, courses, getPendingVerificationsCount, activePOs, activePSOs]);

  // ── 3. HOD Dashboard Stats ────────────────────────────────────────────────
  const hodStats = useMemo(() => {
    const deptName = user?.department || 'Department of Computer Science & Engineering';
    const deptProgrammes = masterProgrammes.filter((p) => p.department === deptName || p.departmentId === 'dept-1');
    const pendingApprovals = hodApprovals.filter((a) => a.status === 'PENDING').length;
    const activeBatches = batches.filter((b) => b.status === 'ACTIVE').length;

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
    };
  }, [user, selectedSchool, masterProgrammes, hodApprovals, batches, courses]);

  // ── 4. Director Dashboard Stats ───────────────────────────────────────────
  const directorStats = useMemo(() => {
    const totalStudents = Object.values(batchStudentsStore).reduce((acc, list) => acc + (list?.length || 0), 0) + 120;
    const pendingApprovals = directorApprovals.filter((a) => a.status === 'PENDING').length;

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
    };
  }, [selectedSchool, user, departments, masterProgrammes, batchStudentsStore, directorApprovals, yearMetrics]);

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
