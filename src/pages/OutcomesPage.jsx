import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import OutcomesManagement from '../features/outcomes/OutcomesManagement';

export default function OutcomesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <OutcomesManagement hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
