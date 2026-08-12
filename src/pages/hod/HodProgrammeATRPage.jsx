import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ATRReportsNavHub from '../../features/atr/ATRReportsNavHub';

export default function HodProgrammeATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Action Taken Report (ATR)" subtitle="HOD Control & Approvals Portal" />
        <div className="page-container">
          <ATRReportsNavHub initialTab="programme-atr" />
        </div>
      </main>
    </div>
  );
}
