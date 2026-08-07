import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import AttainmentOverviewHub from '../features/coAttainment/AttainmentOverviewHub';

export default function AttainmentOverviewPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <AttainmentOverviewHub />
        </div>
      </main>
    </div>
  );
}
