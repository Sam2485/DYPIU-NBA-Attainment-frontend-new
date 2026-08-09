import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodReports from '../../features/hod/HodReports';

export default function HodReportsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Batch & Programme Reports Export" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodReports />
        </div>
      </main>
    </div>
  );
}
