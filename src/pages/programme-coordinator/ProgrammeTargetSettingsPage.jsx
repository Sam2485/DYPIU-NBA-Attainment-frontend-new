import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ProgrammeTargetSettings from '../../features/programme-coordinator/ProgrammeTargetSettings';

export default function ProgrammeTargetSettingsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Target Settings" subtitle="PO & PSO Benchmark Levels" />
        <div className="page-container">
          <ProgrammeTargetSettings />
        </div>
      </main>
    </div>
  );
}
