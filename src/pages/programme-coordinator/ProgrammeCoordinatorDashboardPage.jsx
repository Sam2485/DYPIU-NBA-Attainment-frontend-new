import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ProgrammeCoordinatorDashboard from '../../features/programme-coordinator/ProgrammeCoordinatorDashboard';

export default function ProgrammeCoordinatorDashboardPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Coordinator Dashboard" subtitle="Programme Coordinator Portal" />
        <div className="page-container">
          <ProgrammeCoordinatorDashboard />
        </div>
      </main>
    </div>
  );
}
