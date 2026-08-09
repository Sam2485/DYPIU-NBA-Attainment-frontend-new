import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import COMappingMatrix from '../features/mapping/COMappingMatrix';

export default function MappingPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <COMappingMatrix hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
