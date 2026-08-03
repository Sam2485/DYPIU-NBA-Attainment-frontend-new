import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import AcademicPage from '../pages/AcademicPage';
import UsersPage from '../pages/UsersPage';
import OutcomesPage from '../pages/OutcomesPage';
import MappingPage from '../pages/MappingPage';
import MarksPage from '../pages/MarksPage';
import SurveyPage from '../pages/SurveyPage';
import ConfigurationPage from '../pages/ConfigurationPage';
import COAttainmentPage from '../pages/COAttainmentPage';
import POPSOAttainmentPage from '../pages/POPSOAttainmentPage';
import ReportsPage from '../pages/ReportsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/configurations" element={<ConfigurationPage />} />
      <Route path="/academic" element={<AcademicPage />} />
      <Route path="/outcomes" element={<OutcomesPage />} />
      <Route path="/co-mapping" element={<MappingPage />} />
      <Route path="/marks-upload" element={<MarksPage />} />
      <Route path="/survey-upload" element={<SurveyPage />} />
      <Route path="/co-attainment" element={<COAttainmentPage />} />
      <Route path="/po-pso-attainment" element={<POPSOAttainmentPage />} />
      <Route path="/reports" element={<ReportsPage />} />

      {/* Default Fallback Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
