import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CoordinatorReviewHub from '../features/review/CoordinatorReviewHub';

export default function CoordinatorReviewPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <CoordinatorReviewHub />
        </div>
      </main>
    </div>
  );
}
