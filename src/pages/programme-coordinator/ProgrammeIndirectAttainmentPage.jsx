import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ProgrammeIndirectAttainment from '../../features/programme-coordinator/ProgrammeIndirectAttainment';

export default function ProgrammeIndirectAttainmentPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader
          title="Indirect Attainment"
          subtitle="Surveys & Co-Curricular Events, Programme End Survey, and Indirect Attainment Table"
        />
        <div className="page-container">
          <ProgrammeIndirectAttainment />
        </div>
      </main>
    </div>
  );
}
