import AppSidebar from '../../components/layout/AppSidebar';
import HodProgrammeCoordinators from '../../features/hod/HodProgrammeCoordinators';

export default function HodProgrammeCoordinatorsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <div className="page-container">
          <HodProgrammeCoordinators />
        </div>
      </main>
    </div>
  );
}
