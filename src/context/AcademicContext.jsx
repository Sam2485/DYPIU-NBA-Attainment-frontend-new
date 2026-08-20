import {
  AcademicContext,
  AcademicProvider,
  useAcademic as useAcademicCore,
} from './academic';

import {
  AttainmentContext,
  AttainmentProvider,
  useAttainment,
} from './attainment';

import {
  ApprovalContext,
  ApprovalProvider,
  useApproval,
} from './approval';

import {
  UserContext,
  UserProvider,
  useUser,
} from './user';

import {
  DashboardContext,
  DashboardProvider,
  useDashboard,
  DIRECTOR_WORKFLOW_STEPS,
  HOD_WORKFLOW_STEPS,
  PC_WORKFLOW_STEPS,
} from './dashboard';

export const MASTER_FACULTY_LIST = [
  'Course Coordinator',
  'Programme Coordinator',
  'Head of Department (HOD)',
  'School Director',
];

export const defaultLevels = [
  { level: 1, minPercentage: 0, maxPercentage: 50 },
  { level: 2, minPercentage: 50, maxPercentage: 70 },
  { level: 3, minPercentage: 70, maxPercentage: 100 },
];

/* -------------------------------------------------------------------------- */
/* Context exports                                                            */
/* -------------------------------------------------------------------------- */

export {
  AcademicContext,
  AcademicProvider,

  AttainmentContext,
  AttainmentProvider,
  useAttainment,

  ApprovalContext,
  ApprovalProvider,
  useApproval,

  UserContext,
  UserProvider,
  useUser,

  DashboardContext,
  DashboardProvider,
  useDashboard,

  DIRECTOR_WORKFLOW_STEPS,
  HOD_WORKFLOW_STEPS,
  PC_WORKFLOW_STEPS,
};

/* -------------------------------------------------------------------------- */
/* Combined hook                                                              */
/* -------------------------------------------------------------------------- */

export function useAcademic() {
  const academic = useAcademicCore();
  const attainment = useAttainment();
  const approval = useApproval();
  const dashboard = useDashboard();
  const userCtx = useUser();

  return {
    ...academic,
    ...attainment,
    ...approval,
    ...dashboard,
    ...userCtx,
  };
}

export default useAcademic;