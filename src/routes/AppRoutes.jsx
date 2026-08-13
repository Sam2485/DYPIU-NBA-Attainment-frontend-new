import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Common pages
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

// Director
const DirectorSchoolStructurePage = lazy(() => import('../pages/director/DirectorSchoolStructurePage'));
const DirectorDepartmentPage = lazy(() => import('../pages/director/DirectorDepartmentPage'));
const DirectorProgrammeOverviewPage = lazy(() => import('../pages/director/DirectorProgrammeOverviewPage'));
const DirectorApprovalsPage = lazy(() => import('../pages/director/DirectorApprovalsPage'));
const DirectorReportsPage = lazy(() => import('../pages/director/DirectorReportsPage'));
const DirectorSetupWorkflowPage = lazy(() => import('../pages/director/DirectorSetupWorkflowPage'));

// Programme Coordinator
const ProgrammeCoordinatorDashboardPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorDashboardPage'));
const ProgrammeCoordinatorSetupWorkflowPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorSetupWorkflowPage'));
const ProgrammeTargetSettingsPage = lazy(() => import('../pages/programme-coordinator/ProgrammeTargetSettingsPage'));

// HOD
const HodBatchManagementPage = lazy(() => import('../pages/hod/HodBatchManagementPage'));
const HodProgrammeOutcomesPage = lazy(() => import('../pages/hod/HodProgrammeOutcomesPage'));
const HodCourseManagementPage = lazy(() => import('../pages/hod/HodCourseManagementPage'));
const HodApprovalsPage = lazy(() => import('../pages/hod/HodApprovalsPage'));
const HodProgrammeATRPage = lazy(() => import('../pages/hod/HodProgrammeATRPage'));
const HodReportsPage = lazy(() => import('../pages/hod/HodReportsPage'));
const HodSetupWorkflowPage = lazy(() => import('../pages/hod/HodSetupWorkflowPage'));
const HodProgrammeCoordinatorsPage = lazy(() => import('../pages/hod/HodProgrammeCoordinatorsPage'));

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/Login'));
const RegisterPage = lazy(() => import('../pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPassword'));

// Course Coordinator
const CourseCoordinatorWorkflowPage = lazy(() => import('../pages/CourseCoordinatorWorkflowPage'));

// Route Guard Component
function ProtectedRoute({ children }) {
  const { user, getAccessToken } = useAuth();
  const token = getAccessToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading...</div>}>
      <Routes>

        {/* =====================================================
            AUTHENTICATION (PUBLIC / ENTRY POINT)
        ===================================================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />

        {/* Entry Point / Root Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* =====================================================
            PROTECTED APPLICATION ROUTES
        ===================================================== */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />

        {/* DIRECTOR */}
        <Route
          path="/director/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/director/setup-workflow"
          element={<ProtectedRoute><DirectorSetupWorkflowPage /></ProtectedRoute>}
        />
        <Route
          path="/director/school-structure"
          element={<ProtectedRoute><DirectorSchoolStructurePage /></ProtectedRoute>}
        />
        <Route
          path="/director/department-management"
          element={<ProtectedRoute><DirectorDepartmentPage /></ProtectedRoute>}
        />
        <Route
          path="/director/programme-overview"
          element={<ProtectedRoute><DirectorProgrammeOverviewPage /></ProtectedRoute>}
        />
        <Route
          path="/director/approvals"
          element={<ProtectedRoute><DirectorApprovalsPage /></ProtectedRoute>}
        />
        <Route
          path="/director/reports"
          element={<ProtectedRoute><DirectorReportsPage /></ProtectedRoute>}
        />

        {/* PROGRAMME COORDINATOR */}
        <Route
          path="/programme-coordinator/dashboard"
          element={<ProtectedRoute><ProgrammeCoordinatorDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/programme-coordinator/setup-workflow"
          element={<ProtectedRoute><ProgrammeCoordinatorSetupWorkflowPage /></ProtectedRoute>}
        />
        <Route
          path="/programme-coordinator/target-settings"
          element={<ProtectedRoute><ProgrammeTargetSettingsPage /></ProtectedRoute>}
        />

        {/* HOD */}
        <Route
          path="/hod/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/setup-workflow"
          element={<ProtectedRoute><HodSetupWorkflowPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/batch-management"
          element={<ProtectedRoute><HodBatchManagementPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/programme-outcomes"
          element={<ProtectedRoute><HodProgrammeOutcomesPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/programme-coordinators"
          element={<ProtectedRoute><HodProgrammeCoordinatorsPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/course-management"
          element={<ProtectedRoute><HodCourseManagementPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/approvals"
          element={<ProtectedRoute><HodApprovalsPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/programme-atr"
          element={<ProtectedRoute><HodProgrammeATRPage /></ProtectedRoute>}
        />
        <Route
          path="/hod/reports"
          element={<ProtectedRoute><HodReportsPage /></ProtectedRoute>}
        />

        {/* COURSE COORDINATOR */}
        <Route
          path="/course-coordinator/dashboard"
          element={<ProtectedRoute><CourseCoordinatorWorkflowPage /></ProtectedRoute>}
        />
        <Route
          path="/course-coordinator/workflow"
          element={<ProtectedRoute><CourseCoordinatorWorkflowPage /></ProtectedRoute>}
        />

        {/* COMMON OBE MODULES */}
        <Route
          path="/academic"
          element={<ProtectedRoute><AcademicPage /></ProtectedRoute>}
        />
        <Route
          path="/users"
          element={<ProtectedRoute><UsersPage /></ProtectedRoute>}
        />
        <Route
          path="/outcomes"
          element={<ProtectedRoute><OutcomesPage /></ProtectedRoute>}
        />
        <Route
          path="/co-targets"
          element={<ProtectedRoute><COTargetSettingPage /></ProtectedRoute>}
        />
        <Route
          path="/co-mapping"
          element={<ProtectedRoute><MappingPage /></ProtectedRoute>}
        />
        <Route
          path="/marks-upload"
          element={<ProtectedRoute><MarksPage /></ProtectedRoute>}
        />
        <Route
          path="/survey-upload"
          element={<ProtectedRoute><SurveyPage /></ProtectedRoute>}
        />
        <Route
          path="/configurations"
          element={<ProtectedRoute><ConfigurationPage /></ProtectedRoute>}
        />
        <Route
          path="/attainment-config"
          element={<ProtectedRoute><ConfigurationPage /></ProtectedRoute>}
        />
        <Route
          path="/co-attainment"
          element={<ProtectedRoute><COAttainmentPage /></ProtectedRoute>}
        />
        <Route
          path="/po-pso-attainment"
          element={<ProtectedRoute><POPSOAttainmentPage /></ProtectedRoute>}
        />
        <Route
          path="/attainment-overview"
          element={<ProtectedRoute><AttainmentOverviewPage /></ProtectedRoute>}
        />
        <Route
          path="/coordinator-review"
          element={<ProtectedRoute><CoordinatorReviewPage /></ProtectedRoute>}
        />

        {/* ATR & REPORTS */}
        <Route
          path="/course-atr"
          element={<ProtectedRoute><CourseATRPage /></ProtectedRoute>}
        />
        <Route
          path="/programme-atr"
          element={<ProtectedRoute><ProgrammeATRPage /></ProtectedRoute>}
        />
        <Route
          path="/atr-reports"
          element={<ProtectedRoute><ATRReportsPage /></ProtectedRoute>}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute><ReportsPage /></ProtectedRoute>}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </Suspense>
  );
}