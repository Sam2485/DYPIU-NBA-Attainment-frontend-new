import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ProgrammeATR from '../features/atr/ProgrammeATR';

export default function ProgrammeATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Programme Action Taken Report (ATR)" subtitle="PO & PSO Attainment Analysis & Action Plans" />
        <div className="page-container">
          <ProgrammeATR />
        </div>
      </main>
    </div>
  );
}
