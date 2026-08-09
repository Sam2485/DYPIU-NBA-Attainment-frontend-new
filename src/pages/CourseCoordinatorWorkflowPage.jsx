import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseCoordinatorWorkflow from '../features/dashboard/CourseCoordinatorWorkflow';

export default function CourseCoordinatorWorkflowPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Course Attainment Guided Workflow" subtitle="D. Y. Patil International University" />
        <div className="page-container">
          <CourseCoordinatorWorkflow />
        </div>
      </main>
    </div>
  );
}
