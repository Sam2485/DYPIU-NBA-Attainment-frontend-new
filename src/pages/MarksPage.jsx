import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseOfferingSelector from '../components/course/CourseOfferingSelector';
import EndSemMarksHub from '../features/marks/EndSemMarksHub';

export default function MarksPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Direct Assessment" subtitle="Course Coordinator Portal" />
        <div className="page-container">
          <CourseOfferingSelector />
          <EndSemMarksHub hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
