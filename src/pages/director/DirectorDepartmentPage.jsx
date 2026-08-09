import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorDepartmentManagement from '../../features/director/DirectorDepartmentManagement';

export default function DirectorDepartmentPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Department Management & HOD Allocation" subtitle="School Director Portal" />
        <div className="page-container">
          <DirectorDepartmentManagement />
        </div>
      </main>
    </div>
  );
}
