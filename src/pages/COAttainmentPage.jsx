import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import COAttainmentEngine from '../features/coAttainment/COAttainmentEngine';

export default function COAttainmentPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="CO Attainment Engine" subtitle="Direct, Indirect & Overall Calculations" />
        <div className="page-container">
          <COAttainmentEngine />
        </div>
      </main>
    </div>
  );
}
