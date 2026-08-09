import { Routes, Route, Navigate } from 'react-router-dom';

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

// HOD Pages
import HodBatchManagementPage from '../pages/hod/HodBatchManagementPage';
import HodProgrammeOutcomesPage from '../pages/hod/HodProgrammeOutcomesPage';
import HodCourseManagementPage from '../pages/hod/HodCourseManagementPage';
import HodApprovalsPage from '../pages/hod/HodApprovalsPage';
import HodProgrammeATRPage from '../pages/hod/HodProgrammeATRPage';
import HodReportsPage from '../pages/hod/HodReportsPage';
import HodSetupWorkflowPage from '../pages/hod/HodSetupWorkflowPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Director Routes */}
      <Route path="/director/dashboard" element={<DashboardPage />} />
      <Route path="/director/setup-workflow" element={<DirectorSetupWorkflowPage />} />
      <Route path="/director/school-structure" element={<DirectorSchoolStructurePage />} />
      <Route path="/director/department-management" element={<DirectorDepartmentPage />} />
      <Route path="/director/programme-overview" element={<DirectorProgrammeOverviewPage />} />
      <Route path="/director/approvals" element={<DirectorApprovalsPage />} />
      <Route path="/director/reports" element={<DirectorReportsPage />} />

      {/* HOD Routes */}
      <Route path="/hod/dashboard" element={<DashboardPage />} />
      <Route path="/hod/setup-workflow" element={<HodSetupWorkflowPage />} />
      <Route path="/hod/batch-management" element={<HodBatchManagementPage />} />
      <Route path="/hod/programme-outcomes" element={<HodProgrammeOutcomesPage />} />
      <Route path="/hod/course-management" element={<HodCourseManagementPage />} />
      <Route path="/hod/approvals" element={<HodApprovalsPage />} />
      <Route path="/hod/programme-atr" element={<HodProgrammeATRPage />} />
      <Route path="/hod/reports" element={<HodReportsPage />} />

      <Route path="/users" element={<UsersPage />} />
      <Route path="/configurations" element={<ConfigurationPage />} />
      <Route path="/academic" element={<AcademicPage />} />
      <Route path="/outcomes" element={<OutcomesPage />} />
      <Route path="/co-targets" element={<COTargetSettingPage />} />
      <Route path="/co-mapping" element={<MappingPage />} />
      <Route path="/marks-upload" element={<MarksPage />} />
      <Route path="/survey-upload" element={<SurveyPage />} />
      <Route path="/co-attainment" element={<COAttainmentPage />} />
      <Route path="/po-pso-attainment" element={<POPSOAttainmentPage />} />
      <Route path="/attainment-overview" element={<AttainmentOverviewPage />} />
      <Route path="/course-atr" element={<CourseATRPage />} />
      <Route path="/atr-reports" element={<ATRReportsPage />} />
      <Route path="/programme-atr" element={<ProgrammeATRPage />} />
      <Route path="/coordinator-review" element={<CoordinatorReviewPage />} />
      <Route path="/reports" element={<ReportsPage />} />

      {/* Default Fallback Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
