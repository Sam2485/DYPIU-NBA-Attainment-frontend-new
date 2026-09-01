import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodProgrammeCoordinators from '../../features/hod/HodProgrammeCoordinators';

export default function HodProgrammeCoordinatorsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Coordinators" subtitle="Assign Programme Coordinators to Programme Batches" />
        <div className="page-container">
          <HodProgrammeCoordinators />
        </div>
      </main>
    </div>
  );
}
