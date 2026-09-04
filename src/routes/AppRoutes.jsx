
/*
 * IMPORTANT SECURITY NOTICE:
 * Frontend route guards (RoleProtectedRoute) and scope limitations (e.g. academic loaders)
 * are implemented here to improve UX ONLY.
 * 
 * You must assume the backend must independently derive scope from the JWT and deny 
 * cross-scope requests, even if a client manipulates request parameters or bypasses the UI.
 * Do not rely on selectable IDs, emails, or query parameters as authorization.
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AcademicPage from '../pages/AcademicPage';
import UsersPage from '../pages/UsersPage';
import OutcomesPage from '../pages/OutcomesPage';
import COTargetSettingPage from '../pages/COTargetSettingPage';
import MappingPage from '../pages/MappingPage';
import MarksPage from '../pages/MarksPage';
import SurveyPage from '../pages/SurveyPage';
import ConfigurationPage from '../pages/ConfigurationPage';
import COAttainmentPage from '../pages/COAttainmentPage';
import POPSOAttainmentPage from '../pages/POPSOAttainmentPage';
import AttainmentOverviewPage from '../pages/AttainmentOverviewPage';
import CourseATRPage from '../pages/CourseATRPage';
import ProgrammeATRPage from '../pages/ProgrammeATRPage';
import ATRReportsPage from '../pages/ATRReportsPage';
import CoordinatorReviewPage from '../pages/CoordinatorReviewPage';
import ReportsPage from '../pages/ReportsPage';

// Director Pages
import DirectorSchoolStructurePage from '../pages/director/DirectorSchoolStructurePage';
import DirectorDepartmentPage from '../pages/director/DirectorDepartmentPage';
import DirectorProgrammeOverviewPage from '../pages/director/DirectorProgrammeOverviewPage';
import DirectorApprovalsPage from '../pages/director/DirectorApprovalsPage';
import DirectorReportsPage from '../pages/director/DirectorReportsPage';
import DirectorSetupWorkflowPage from '../pages/director/DirectorSetupWorkflowPage';

// Programme Coordinator Pages
import ProgrammeCoordinatorDashboardPage from '../pages/programme-coordinator/ProgrammeCoordinatorDashboardPage';
import ProgrammeCoordinatorSetupWorkflowPage from '../pages/programme-coordinator/ProgrammeCoordinatorSetupWorkflowPage';
import ProgrammeCoordinatorManageCoursesPage from '../pages/programme-coordinator/ProgrammeCoordinatorManageCoursesPage';
import ProgrammeTargetSettingsPage from '../pages/programme-coordinator/ProgrammeTargetSettingsPage';
import IqacDashboardPage from '../pages/iqac/IqacDashboardPage';
import IqacUsersPage from '../pages/iqac/IqacUsersPage';
import ReportTemplatePage from '../pages/iqac/ReportTemplatePage';
import GeneratedReportsPage from '../pages/iqac/GeneratedReportsPage';

// HOD Pages
import HodBatchManagementPage from '../pages/hod/HodBatchManagementPage';
import HodProgrammeOutcomesPage from '../pages/hod/HodProgrammeOutcomesPage';
import HodCourseManagementPage from '../pages/hod/HodCourseManagementPage';
import HodApprovalsPage from '../pages/hod/HodApprovalsPage';
import HodProgrammeATRPage from '../pages/hod/HodProgrammeATRPage';
import HodReportsPage from '../pages/hod/HodReportsPage';
import HodSetupWorkflowPage from '../pages/hod/HodSetupWorkflowPage';
import HodProgrammeCoordinatorsPage from '../pages/hod/HodProgrammeCoordinatorsPage';
import CourseCoordinatorWorkflowPage from '../pages/CourseCoordinatorWorkflowPage';

import ErrorBoundary from '../components/common/ErrorBoundary';

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

  return (
    <ErrorBoundary isScreen>
      {children}
    </ErrorBoundary>
  );
}




export default function AppRoutes() {
  return (
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
          <RoleProtectedRoute allowedRoles={['IQAC', 'FACULTY', 'COURSE_COORDINATOR']}>
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
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <ConfigurationPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/attainment-config"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
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
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
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
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <MappingPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/marks-upload"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <MarksPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/survey-upload"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <SurveyPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/co-attainment"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <COAttainmentPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/po-pso-attainment"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <POPSOAttainmentPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/attainment-overview"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <AttainmentOverviewPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/course-atr"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <CourseATRPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/atr-reports"
        element={
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
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
          <RoleProtectedRoute allowedRoles={['IQAC', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']}>
            <ReportsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Default Fallback Routes */}
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
}
