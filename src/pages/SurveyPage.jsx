import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseEndSurveyHub from '../features/survey/CourseEndSurveyHub';

export default function SurveyPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Course End Survey Hub" subtitle="Student Survey Feedback Parsing" />
        <div className="page-container">
          <CourseEndSurveyHub />
        </div>
      </main>
    </div>
  );
}
