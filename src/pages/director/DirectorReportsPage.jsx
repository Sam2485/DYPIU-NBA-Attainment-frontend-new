import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorReports from '../../features/director/DirectorReports';

export default function DirectorReportsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Reports & Downloads" subtitle="School Director Portal" />
        <div className="page-container">
          <DirectorReports />
        </div>
      </main>
    </div>
  );
}
