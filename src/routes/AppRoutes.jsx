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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
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
