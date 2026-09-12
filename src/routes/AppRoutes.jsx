
/*
 * IMPORTANT SECURITY NOTICE:
 * Frontend route guards (RoleProtectedRoute) and scope limitations (e.g. academic loaders)
 * are implemented here to improve UX ONLY.
 * 
 * You must assume the backend must independently derive scope from the JWT and deny 
 * cross-scope requests, even if a client manipulates request parameters or bypasses the UI.
 * Do not rely on selectable IDs, emails, or query parameters as authorization.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ScreenLoadingState } from '../components/common/ScreenState';

// Core Pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AcademicPage = lazy(() => import('../pages/AcademicPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const OutcomesPage = lazy(() => import('../pages/OutcomesPage'));
const COTargetSettingPage = lazy(() => import('../pages/COTargetSettingPage'));
const MappingPage = lazy(() => import('../pages/MappingPage'));
const MarksPage = lazy(() => import('../pages/MarksPage'));
const SurveyPage = lazy(() => import('../pages/SurveyPage'));
const ConfigurationPage = lazy(() => import('../pages/ConfigurationPage'));
const COAttainmentPage = lazy(() => import('../pages/COAttainmentPage'));
const POPSOAttainmentPage = lazy(() => import('../pages/POPSOAttainmentPage'));
const AttainmentOverviewPage = lazy(() => import('../pages/AttainmentOverviewPage'));
const CourseATRPage = lazy(() => import('../pages/CourseATRPage'));
const ProgrammeATRPage = lazy(() => import('../pages/ProgrammeATRPage'));
const ATRReportsPage = lazy(() => import('../pages/ATRReportsPage'));
const CoordinatorReviewPage = lazy(() => import('../pages/CoordinatorReviewPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));

// Director Pages
const DirectorSchoolStructurePage = lazy(() => import('../pages/director/DirectorSchoolStructurePage'));
const DirectorDepartmentPage = lazy(() => import('../pages/director/DirectorDepartmentPage'));
const DirectorProgrammeOverviewPage = lazy(() => import('../pages/director/DirectorProgrammeOverviewPage'));
const DirectorApprovalsPage = lazy(() => import('../pages/director/DirectorApprovalsPage'));
const DirectorReportsPage = lazy(() => import('../pages/director/DirectorReportsPage'));
const DirectorSetupWorkflowPage = lazy(() => import('../pages/director/DirectorSetupWorkflowPage'));

// Programme Coordinator Pages
const ProgrammeCoordinatorDashboardPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorDashboardPage'));
const ProgrammeCoordinatorSetupWorkflowPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorSetupWorkflowPage'));
const ProgrammeCoordinatorManageCoursesPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorManageCoursesPage'));
const ProgrammeTargetSettingsPage = lazy(() => import('../pages/programme-coordinator/ProgrammeTargetSettingsPage'));
const ProgrammeIndirectAttainmentPage = lazy(() => import('../pages/programme-coordinator/ProgrammeIndirectAttainmentPage'));
const IqacDashboardPage = lazy(() => import('../pages/iqac/IqacDashboardPage'));
const IqacUsersPage = lazy(() => import('../pages/iqac/IqacUsersPage'));
const ReportTemplatePage = lazy(() => import('../pages/iqac/ReportTemplatePage'));
const GeneratedReportsPage = lazy(() => import('../pages/iqac/GeneratedReportsPage'));

// HOD Pages
const HodBatchManagementPage = lazy(() => import('../pages/hod/HodBatchManagementPage'));
const HodProgrammeOutcomesPage = lazy(() => import('../pages/hod/HodProgrammeOutcomesPage'));
const HodCourseManagementPage = lazy(() => import('../pages/hod/HodCourseManagementPage'));
const HodApprovalsPage = lazy(() => import('../pages/hod/HodApprovalsPage'));
const HodProgrammeATRPage = lazy(() => import('../pages/hod/HodProgrammeATRPage'));
const HodReportsPage = lazy(() => import('../pages/hod/HodReportsPage'));
const HodSetupWorkflowPage = lazy(() => import('../pages/hod/HodSetupWorkflowPage'));
const HodProgrammeCoordinatorsPage = lazy(() => import('../pages/hod/HodProgrammeCoordinatorsPage'));
const CourseCoordinatorWorkflowPage = lazy(() => import('../pages/CourseCoordinatorWorkflowPage'));

const dashboardPathForRole = (role) => {
  switch (role) {
    case 'IQAC': return '/admin/dashboard';
    case 'DIRECTOR': return '/director/dashboard';
    case 'HOD': return '/hod/dashboard';
    case 'PROGRAMME_COORDINATOR': return '/programme-coordinator/dashboard';
    case 'FACULTY':
    case 'COURSE_COORDINATOR': return '/course-coordinator/dashboard';
    default: return '/dashboard';
  }
};

function RoleHomeRedirect() {
  const { isAuthenticated, isRestoringSession, role } = useAuth();
  if (isRestoringSession) return null;
  return <Navigate to={isAuthenticated ? dashboardPathForRole(role) : '/login'} replace />;
}

function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isRestoringSession, role } = useAuth();
  const location = useLocation();

  if (isRestoringSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <ErrorBoundary isScreen>{children}</ErrorBoundary>;
}




export default function AppRoutes() {
  return (
    <Suspense fallback={<ScreenLoadingState message="Loading page..." />}>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']}>
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/course-coordinator/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'FACULTY', 'COURSE_COORDINATOR']}>
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/course-coordinator/workflow"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <CourseCoordinatorWorkflowPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC']}>
            
              <IqacDashboardPage />
            
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC']}>
            <IqacUsersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/report-template"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC']}>
            <ReportTemplatePage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC']}>
            <GeneratedReportsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Director Routes */}
      <Route
        path="/director/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/director/setup-workflow"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DirectorSetupWorkflowPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/director/school-structure"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DirectorSchoolStructurePage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/director/department-management"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DirectorDepartmentPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/director/programme-overview"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DirectorProgrammeOverviewPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/director/reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR']}>
            <DirectorReportsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Programme Coordinator Routes */}
      <Route
        path="/programme-coordinator/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeCoordinatorDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/setup-workflow"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeCoordinatorSetupWorkflowPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/manage-courses"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeCoordinatorManageCoursesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/target-settings"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeTargetSettingsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/indirect-attainment"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeIndirectAttainmentPage />
          </RoleProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/setup-workflow"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodSetupWorkflowPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/batch-management"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodBatchManagementPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-outcomes"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodProgrammeOutcomesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-coordinators"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodProgrammeCoordinatorsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/approvals"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodApprovalsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-atr"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodProgrammeATRPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/hod/reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'HOD']}>
            <HodReportsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Academic & Attainment Configuration */}
      <Route
        path="/users"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC']}>
            <UsersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/configurations"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <ConfigurationPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/attainment-config"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <ConfigurationPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/academic"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD']}>
            <AcademicPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/outcomes"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <OutcomesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/co-targets"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR']}>
            <COTargetSettingPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/co-mapping"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <MappingPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/marks-upload"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <MarksPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/survey-upload"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <SurveyPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/co-attainment"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <COAttainmentPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/po-pso-attainment"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <POPSOAttainmentPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/attainment-overview"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <AttainmentOverviewPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/course-atr"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <CourseATRPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/atr-reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <ATRReportsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/programme-atr"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR']}>
            <ProgrammeATRPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/coordinator-review"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR', 'HOD']}>
            <CoordinatorReviewPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY', 'COURSE_COORDINATOR']} requiresCourseAllocation>
            <ReportsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Default Fallback Routes */}
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
    </Suspense>
  );
}
