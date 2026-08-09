import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodProgrammeOutcomes from '../../features/hod/HodProgrammeOutcomes';

export default function HodProgrammeOutcomesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Outcomes (PO, PSO & PEO)" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodProgrammeOutcomes />
        </div>
      </main>
    </div>
  );
}
