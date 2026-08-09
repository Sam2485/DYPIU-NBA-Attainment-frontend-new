import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodBatchManagement from '../../features/hod/HodBatchManagement';

export default function HodBatchManagementPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Batch Management & Initialization" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodBatchManagement />
        </div>
      </main>
    </div>
  );
}
