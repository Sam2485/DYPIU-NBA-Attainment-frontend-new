import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import DashboardOverview from '../features/dashboard/DashboardOverview';
import DirectorDashboard from '../features/director/DirectorDashboard';
import HodDashboard from '../features/hod/HodDashboard';
import ProgrammeCoordinatorDashboard from '../features/programme-coordinator/ProgrammeCoordinatorDashboard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader
          title={
            role === 'DIRECTOR'
              ? 'Director Overview & Actions'
              : role === 'HOD'
              ? 'HOD Overview & Actions'
              : role === 'PROGRAMME_COORDINATOR'
              ? 'Programme Coordinator Overview & Actions'
              : 'NBA Attainment Overview'
          }
          subtitle="D. Y. Patil International University"
        />
        <div className="page-container">
          {role === 'DIRECTOR' ? (
            <DirectorDashboard />
          ) : role === 'HOD' ? (
            <HodDashboard />
          ) : role === 'PROGRAMME_COORDINATOR' ? (
            <ProgrammeCoordinatorDashboard />
          ) : (
            <DashboardOverview />
          )}
        </div>
      </main>
    </div>
  );
}
