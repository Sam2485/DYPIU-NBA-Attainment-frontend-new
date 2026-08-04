import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import DashboardOverview from '../features/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="NBA Attainment Overview" subtitle="D. Y. Patil International University" />
        <div className="page-container">
          <DashboardOverview />
        </div>
      </main>
    </div>
  );
}
