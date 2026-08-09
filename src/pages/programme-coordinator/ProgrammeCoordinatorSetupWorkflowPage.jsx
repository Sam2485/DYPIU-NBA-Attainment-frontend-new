import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ProgrammeCoordinatorSetupWorkflow from '../../features/programme-coordinator/ProgrammeCoordinatorSetupWorkflow';

export default function ProgrammeCoordinatorSetupWorkflowPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Start / Continue Programme Setup" subtitle="Guided Programme Coordinator Workflow" />
        <div className="page-container">
          <ProgrammeCoordinatorSetupWorkflow />
        </div>
      </main>
    </div>
  );
}
