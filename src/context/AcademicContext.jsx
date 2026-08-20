import {
  AcademicContext,
  AcademicProvider,
  useAcademic as useAcademicCore,
} from './academic';

import {
  AttainmentContext,
  AttainmentProvider,
  useAttainment,
  defaultLevels,
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

/* -------------------------------------------------------------------------- */
/* Context exports                                                            */
/* -------------------------------------------------------------------------- */

export {
  AcademicContext,
  AcademicProvider,

  AttainmentContext,
  AttainmentProvider,
  useAttainment,
  defaultLevels,

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