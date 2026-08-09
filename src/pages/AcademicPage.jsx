import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import AcademicSetup from '../features/academic/AcademicSetup';

export default function AcademicPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Setup" subtitle="Courses & Coordinator Allocation" />
        <div className="page-container">
          <AcademicSetup />
        </div>
      </main>
    </div>
  );
}
