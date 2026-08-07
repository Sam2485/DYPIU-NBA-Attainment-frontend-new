import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ATRReportsNavHub from '../features/atr/ATRReportsNavHub';

export default function ATRReportsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <ATRReportsNavHub />
        </div>
      </main>
    </div>
  );
}
