import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import OutcomesManagement from '../features/outcomes/OutcomesManagement';

export default function OutcomesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Outcome Management" subtitle="POs, PSOs, COs & Competencies" />
        <div className="page-container">
          <OutcomesManagement />
        </div>
      </main>
    </div>
  );
}
