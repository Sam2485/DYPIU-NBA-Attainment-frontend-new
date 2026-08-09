import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ProgrammeATR from '../features/atr/ProgrammeATR';

export default function ProgrammeATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <ProgrammeATR hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
