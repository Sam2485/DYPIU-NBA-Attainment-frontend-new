import {
  AcademicContext,
  AcademicProvider,
  useAcademic as useAcademicCore,
  MASTER_BATCHES,
  INITIAL_SCHOOLS,
  INITIAL_DEPARTMENTS,
  INITIAL_MASTER_PROGRAMMES_LIST,
  MASTER_PROGRAMMES,
  INITIAL_PROGRAMME_OUTCOMES,
  INITIAL_PSO_OUTCOMES,
  INITIAL_PEO_OUTCOMES,
  INITIAL_COURSES,
} from './academic';

import {
  AttainmentContext,
  AttainmentProvider,
  useAttainment,
  defaultLevels,
  YEAR_ATTAINMENT_METRICS,
  INITIAL_ATTAINMENT_CONFIGS,
  INITIAL_PROGRAMME_ATR_LIST,
  INITIAL_COURSE_ATR_STORE,
} from './attainment';

import {
  ApprovalContext,
  ApprovalProvider,
  useApproval,
  INITIAL_DIRECTOR_APPROVALS_LIST,
  INITIAL_HOD_APPROVALS_LIST,
  INITIAL_COURSE_VERIFICATION_STORE,
} from './approval';

import {
  UserContext,
  UserProvider,
  useUser,
  MASTER_FACULTY_LIST,
  INITIAL_USERS,
} from './user';

import {
  DashboardContext,
  DashboardProvider,
  useDashboard,
  DIRECTOR_WORKFLOW_STEPS,
  HOD_WORKFLOW_STEPS,
  PC_WORKFLOW_STEPS,
} from './dashboard';

export {
  // Academic
  AcademicContext,
  AcademicProvider,
  MASTER_BATCHES,
  INITIAL_SCHOOLS,
  INITIAL_DEPARTMENTS,
  INITIAL_MASTER_PROGRAMMES_LIST,
  MASTER_PROGRAMMES,
  INITIAL_PROGRAMME_OUTCOMES,
  INITIAL_PSO_OUTCOMES,
  INITIAL_PEO_OUTCOMES,
  INITIAL_COURSES,
  // Attainment
  AttainmentContext,
  AttainmentProvider,
  useAttainment,
  defaultLevels,
  YEAR_ATTAINMENT_METRICS,
  INITIAL_ATTAINMENT_CONFIGS,
  INITIAL_PROGRAMME_ATR_LIST,
  INITIAL_COURSE_ATR_STORE,
  // Approval
  ApprovalContext,
  ApprovalProvider,
  useApproval,
  INITIAL_DIRECTOR_APPROVALS_LIST,
  INITIAL_HOD_APPROVALS_LIST,
  INITIAL_COURSE_VERIFICATION_STORE,
  // User
  UserContext,
  UserProvider,
  useUser,
  MASTER_FACULTY_LIST,
  INITIAL_USERS,
  // Dashboard
  DashboardContext,
  DashboardProvider,
  useDashboard,
  DIRECTOR_WORKFLOW_STEPS,
  HOD_WORKFLOW_STEPS,
  PC_WORKFLOW_STEPS,
};

export function useAcademic() {
  const academic = useAcademicCore();
  const attainment = useAttainment();
  const approval = useApproval();
  const dashboard = useDashboard();

  return {
    ...academic,
    ...attainment,
    ...approval,
    ...dashboard,
  };
}

export default useAcademic;

