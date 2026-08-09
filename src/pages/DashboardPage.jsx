import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import DashboardOverview from '../features/dashboard/DashboardOverview';
import DirectorDashboard from '../features/director/DirectorDashboard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader
          title={role === 'DIRECTOR' ? 'Director Overview & Actions' : 'NBA Attainment Overview'}
          subtitle="D. Y. Patil International University"
        />
        <div className="page-container">
          {role === 'DIRECTOR' ? <DirectorDashboard /> : <DashboardOverview />}
        </div>
      </main>
    </div>
  );
}
