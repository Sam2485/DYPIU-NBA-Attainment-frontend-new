import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseOfferingSelector from '../components/course/CourseOfferingSelector';
import CourseEndSurveyHub from '../features/survey/CourseEndSurveyHub';

export default function SurveyPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Indirect Assessment" subtitle="Course Coordinator Portal" />
        <div className="page-container">
          <CourseOfferingSelector />
          <CourseEndSurveyHub hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
