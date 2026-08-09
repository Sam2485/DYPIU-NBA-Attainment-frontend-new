import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodCourseManagement from '../../features/hod/HodCourseManagement';

export default function HodCourseManagementPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Course Management & Coordinator Allocation" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodCourseManagement />
        </div>
      </main>
    </div>
  );
}
