import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseEndSurveyHub from '../features/survey/CourseEndSurveyHub';

export default function SurveyPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <CourseEndSurveyHub hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
