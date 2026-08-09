import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorSetupWorkflow from '../../features/director/DirectorSetupWorkflow';

export default function DirectorSetupWorkflowPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Create School Structure & Assign HODs" subtitle="Guided Director Workflow" />
        <div className="page-container">
          <DirectorSetupWorkflow />
        </div>
      </main>
    </div>
  );
}
