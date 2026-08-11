import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ReportsHub from '../../features/reports/ReportsHub';

export default function HodReportsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Reports Hub" subtitle="HOD Control Portal" />
        <div className="page-container">
          <ReportsHub />
        </div>
      </main>
    </div>
  );
}
