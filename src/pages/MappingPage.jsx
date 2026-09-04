import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseOfferingSelector from '../components/course/CourseOfferingSelector';
import COMappingMatrix from '../features/mapping/COMappingMatrix';

export default function MappingPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="CO–PO/PSO Mapping" subtitle="Course Coordinator Portal" />
        <div className="page-container">
          <CourseOfferingSelector />
          <COMappingMatrix hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
