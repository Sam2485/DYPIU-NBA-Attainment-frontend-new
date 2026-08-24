import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CoordinatorReviewHub from '../features/review/CoordinatorReviewHub';
import ProgrammeCoordinatorApprovals from '../features/programme-coordinator/ProgrammeCoordinatorApprovals';
import { useAuth } from '../context/AuthContext';

export default function CoordinatorReviewPage() {
  const { role } = useAuth();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          {role === 'PROGRAMME_COORDINATOR' ? <ProgrammeCoordinatorApprovals /> : <CoordinatorReviewHub />}
        </div>
      </main>
    </div>
  );
}
