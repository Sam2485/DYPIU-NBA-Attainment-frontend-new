import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodProgrammeATR from '../../features/hod/HodProgrammeATR';

export default function HodProgrammeATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Action Taken Report (ATR)" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodProgrammeATR />
        </div>
      </main>
    </div>
  );
}
