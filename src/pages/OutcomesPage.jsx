import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import OutcomesManagement from '../features/outcomes/OutcomesManagement';

export default function OutcomesPage() {
  return (
    <div style={{ display: 'flex' }}>
      <AppSidebar />
      <main style={{ flex: 1 }}>
        <AppHeader title="Outcome Management" subtitle="POs, PSOs, COs & Competencies" />
        <div className="page-container">
          <OutcomesManagement />
        </div>
      </main>
    </div>
  );
}
