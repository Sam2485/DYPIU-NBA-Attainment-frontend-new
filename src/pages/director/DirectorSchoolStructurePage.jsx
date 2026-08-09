import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorSchoolStructure from '../../features/director/DirectorSchoolStructure';

export default function DirectorSchoolStructurePage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="School Structure & Hierarchy" subtitle="School Director Portal" />
        <div className="page-container">
          <DirectorSchoolStructure />
        </div>
      </main>
    </div>
  );
}
