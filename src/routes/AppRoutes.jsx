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
import ProgrammeTargetSettingsPage from '../pages/programme-coordinator/ProgrammeTargetSettingsPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

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

function ProtectedRoute({ children }) {
  const { isAuthenticated, isRestoringSession } = useAuth();
  const location = useLocation();

  if (isRestoringSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <ErrorBoundary isScreen>
      {children}
    </ErrorBoundary>
  );
}

function AdminRoute({ children }) {
  const { role, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
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
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course-coordinator/workflow"
        element={
          <ProtectedRoute>
            <CourseCoordinatorWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Director Routes */}
      <Route
        path="/director/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/setup-workflow"
        element={
          <ProtectedRoute>
            <DirectorSetupWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/school-structure"
        element={
          <ProtectedRoute>
            <DirectorSchoolStructurePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/department-management"
        element={
          <ProtectedRoute>
            <DirectorDepartmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/programme-overview"
        element={
          <ProtectedRoute>
            <DirectorProgrammeOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director/reports"
        element={
          <ProtectedRoute>
            <DirectorReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Programme Coordinator Routes */}
      <Route
        path="/programme-coordinator/dashboard"
        element={
          <ProtectedRoute>
            <ProgrammeCoordinatorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/setup-workflow"
        element={
          <ProtectedRoute>
            <ProgrammeCoordinatorSetupWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programme-coordinator/target-settings"
        element={
          <ProtectedRoute>
            <ProgrammeTargetSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/setup-workflow"
        element={
          <ProtectedRoute>
            <HodSetupWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/batch-management"
        element={
          <ProtectedRoute>
            <HodBatchManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-outcomes"
        element={
          <ProtectedRoute>
            <HodProgrammeOutcomesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-coordinators"
        element={
          <ProtectedRoute>
            <HodProgrammeCoordinatorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/approvals"
        element={
          <ProtectedRoute>
            <HodApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/programme-atr"
        element={
          <ProtectedRoute>
            <HodProgrammeATRPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/reports"
        element={
          <ProtectedRoute>
            <HodReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Academic & Attainment Configuration */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configurations"
        element={
          <ProtectedRoute>
            <ConfigurationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attainment-config"
        element={
          <ProtectedRoute>
            <ConfigurationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic"
        element={
          <ProtectedRoute>
            <AcademicPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outcomes"
        element={
          <ProtectedRoute>
            <OutcomesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/co-targets"
        element={
          <ProtectedRoute>
            <COTargetSettingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/co-mapping"
        element={
          <ProtectedRoute>
            <MappingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marks-upload"
        element={
          <ProtectedRoute>
            <MarksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey-upload"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/co-attainment"
        element={
          <ProtectedRoute>
            <COAttainmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/po-pso-attainment"
        element={
          <ProtectedRoute>
            <POPSOAttainmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attainment-overview"
        element={
          <ProtectedRoute>
            <AttainmentOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course-atr"
        element={
          <ProtectedRoute>
            <CourseATRPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atr-reports"
        element={
          <ProtectedRoute>
            <ATRReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programme-atr"
        element={
          <ProtectedRoute>
            <ProgrammeATRPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator-review"
        element={
          <ProtectedRoute>
            <CoordinatorReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Default Fallback Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
