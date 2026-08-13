import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Common pages
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage')
);

const AcademicPage = lazy(() =>
  import('../pages/AcademicPage')
);

const UsersPage = lazy(() =>
  import('../pages/UsersPage')
);

const OutcomesPage = lazy(() =>
  import('../pages/OutcomesPage')
);

const COTargetSettingPage = lazy(() =>
  import('../pages/COTargetSettingPage')
);

const MappingPage = lazy(() =>
  import('../pages/MappingPage')
);

const MarksPage = lazy(() =>
  import('../pages/MarksPage')
);

const SurveyPage = lazy(() =>
  import('../pages/SurveyPage')
);

const ConfigurationPage = lazy(() =>
  import('../pages/ConfigurationPage')
);

const COAttainmentPage = lazy(() =>
  import('../pages/COAttainmentPage')
);

const POPSOAttainmentPage = lazy(() =>
  import('../pages/POPSOAttainmentPage')
);

const AttainmentOverviewPage = lazy(() =>
  import('../pages/AttainmentOverviewPage')
);

const CourseATRPage = lazy(() =>
  import('../pages/CourseATRPage')
);

const ProgrammeATRPage = lazy(() =>
  import('../pages/ProgrammeATRPage')
);

const ATRReportsPage = lazy(() =>
  import('../pages/ATRReportsPage')
);

const CoordinatorReviewPage = lazy(() =>
  import('../pages/CoordinatorReviewPage')
);

const ReportsPage = lazy(() =>
  import('../pages/ReportsPage')
);

// Director
const DirectorSchoolStructurePage = lazy(() =>
  import('../pages/director/DirectorSchoolStructurePage')
);

const DirectorDepartmentPage = lazy(() =>
  import('../pages/director/DirectorDepartmentPage')
);

const DirectorProgrammeOverviewPage = lazy(() =>
  import('../pages/director/DirectorProgrammeOverviewPage')
);

const DirectorApprovalsPage = lazy(() =>
  import('../pages/director/DirectorApprovalsPage')
);

const DirectorReportsPage = lazy(() =>
  import('../pages/director/DirectorReportsPage')
);

const DirectorSetupWorkflowPage = lazy(() =>
  import('../pages/director/DirectorSetupWorkflowPage')
);

// Programme Coordinator
const ProgrammeCoordinatorDashboardPage = lazy(() =>
  import('../pages/programme-coordinator/ProgrammeCoordinatorDashboardPage')
);

const ProgrammeCoordinatorSetupWorkflowPage = lazy(() =>
  import('../pages/programme-coordinator/ProgrammeCoordinatorSetupWorkflowPage')
);

const ProgrammeTargetSettingsPage = lazy(() =>
  import('../pages/programme-coordinator/ProgrammeTargetSettingsPage')
);

// HOD

const HodBatchManagementPage = lazy(() =>
  import('../pages/hod/HodBatchManagementPage')
);

const HodProgrammeOutcomesPage = lazy(() =>
  import('../pages/hod/HodProgrammeOutcomesPage')
);

const HodCourseManagementPage = lazy(() =>
  import('../pages/hod/HodCourseManagementPage')
);

const HodApprovalsPage = lazy(() =>
  import('../pages/hod/HodApprovalsPage')
);

const HodProgrammeATRPage = lazy(() =>
  import('../pages/hod/HodProgrammeATRPage')
);

const HodReportsPage = lazy(() =>
  import('../pages/hod/HodReportsPage')
);

const HodSetupWorkflowPage = lazy(() =>
  import('../pages/hod/HodSetupWorkflowPage')
);

const HodProgrammeCoordinatorsPage = lazy(() =>
  import('../pages/hod/HodProgrammeCoordinatorsPage')
);

// Course Coordinator
const CourseCoordinatorWorkflowPage = lazy(() =>
  import('../pages/CourseCoordinatorWorkflowPage')
);


export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>

        {/* =====================================================
            DEFAULT
        ===================================================== */}

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />


        {/* =====================================================
            DIRECTOR
        ===================================================== */}

        <Route
          path="/director/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/director/setup-workflow"
          element={<DirectorSetupWorkflowPage />}
        />

        <Route
          path="/director/school-structure"
          element={<DirectorSchoolStructurePage />}
        />

        <Route
          path="/director/department-management"
          element={<DirectorDepartmentPage />}
        />

        <Route
          path="/director/programme-overview"
          element={<DirectorProgrammeOverviewPage />}
        />

        <Route
          path="/director/approvals"
          element={<DirectorApprovalsPage />}
        />

        <Route
          path="/director/reports"
          element={<DirectorReportsPage />}
        />


        {/* =====================================================
            PROGRAMME COORDINATOR
        ===================================================== */}

        <Route
          path="/programme-coordinator/dashboard"
          element={<ProgrammeCoordinatorDashboardPage />}
        />

        <Route
          path="/programme-coordinator/setup-workflow"
          element={<ProgrammeCoordinatorSetupWorkflowPage />}
        />

        <Route
          path="/programme-coordinator/target-settings"
          element={<ProgrammeTargetSettingsPage />}
        />


        {/* =====================================================
            HOD
        ===================================================== */}

        <Route
          path="/hod/dashboard"
          element={<DashboardPage />}
        />


        <Route
          path="/hod/setup-workflow"
          element={<HodSetupWorkflowPage />}
        />

        <Route
          path="/hod/batch-management"
          element={<HodBatchManagementPage />}
        />

        <Route
          path="/hod/programme-outcomes"
          element={<HodProgrammeOutcomesPage />}
        />

        <Route
          path="/hod/programme-coordinators"
          element={<HodProgrammeCoordinatorsPage />}
        />

        <Route
          path="/hod/course-management"
          element={<HodCourseManagementPage />}
        />

        <Route
          path="/hod/approvals"
          element={<HodApprovalsPage />}
        />

        <Route
          path="/hod/programme-atr"
          element={<HodProgrammeATRPage />}
        />

        <Route
          path="/hod/reports"
          element={<HodReportsPage />}
        />


        {/* =====================================================
            COURSE COORDINATOR
        ===================================================== */}

        <Route
          path="/course-coordinator/dashboard"
          element={<CourseCoordinatorWorkflowPage />}
        />

        <Route
          path="/course-coordinator/workflow"
          element={<CourseCoordinatorWorkflowPage />}
        />


        {/* =====================================================
            COMMON OBE MODULES
        ===================================================== */}

        <Route
          path="/academic"
          element={<AcademicPage />}
        />

        <Route
          path="/users"
          element={<UsersPage />}
        />

        <Route
          path="/outcomes"
          element={<OutcomesPage />}
        />

        <Route
          path="/co-targets"
          element={<COTargetSettingPage />}
        />

        <Route
          path="/co-mapping"
          element={<MappingPage />}
        />

        <Route
          path="/marks-upload"
          element={<MarksPage />}
        />

        <Route
          path="/survey-upload"
          element={<SurveyPage />}
        />

        <Route
          path="/configurations"
          element={<ConfigurationPage />}
        />

        <Route
          path="/attainment-config"
          element={<ConfigurationPage />}
        />

        <Route
          path="/co-attainment"
          element={<COAttainmentPage />}
        />

        <Route
          path="/po-pso-attainment"
          element={<POPSOAttainmentPage />}
        />

        <Route
          path="/attainment-overview"
          element={<AttainmentOverviewPage />}
        />

        <Route
          path="/coordinator-review"
          element={<CoordinatorReviewPage />}
        />


        {/* =====================================================
            ATR
        ===================================================== */}

        <Route
          path="/course-atr"
          element={<CourseATRPage />}
        />

        <Route
          path="/programme-atr"
          element={<ProgrammeATRPage />}
        />

        <Route
          path="/atr-reports"
          element={<ATRReportsPage />}
        />


        {/* =====================================================
            REPORTS
        ===================================================== */}

        <Route
          path="/reports"
          element={<ReportsPage />}
        />


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </Suspense>
  );
}