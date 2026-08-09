import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorProgrammeOverview from '../../features/director/DirectorProgrammeOverview';

export default function DirectorProgrammeOverviewPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Overview & Status" subtitle="School Director Portal" />
        <div className="page-container">
          <DirectorProgrammeOverview />
        </div>
      </main>
    </div>
  );
}
