import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import POPSOAttainmentEngine from '../features/poPsoAttainment/POPSOAttainmentEngine';

export default function POPSOAttainmentPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="PO & PSO Attainment Engine" subtitle="Programme Outcome Aggregations" />
        <div className="page-container">
          <POPSOAttainmentEngine />
        </div>
      </main>
    </div>
  );
}
