import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import COTargetSettingHub from '../features/outcomes/COTargetSettingHub';

export default function COTargetSettingPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <COTargetSettingHub />
        </div>
      </main>
    </div>
  );
}
