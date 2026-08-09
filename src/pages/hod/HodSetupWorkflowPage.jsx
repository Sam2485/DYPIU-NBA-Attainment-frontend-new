import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodSetupWorkflow from '../../features/hod/HodSetupWorkflow';

export default function HodSetupWorkflowPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Start / Continue Programme Setup" subtitle="Guided HOD Workflow" />
        <div className="page-container">
          <HodSetupWorkflow />
        </div>
      </main>
    </div>
  );
}
