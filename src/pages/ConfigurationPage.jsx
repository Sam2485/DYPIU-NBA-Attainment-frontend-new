import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import AttainmentConfig from '../features/configuration/AttainmentConfig';

export default function ConfigurationPage() {
  return (
    <div style={{ display: 'flex' }}>
      <AppSidebar />
      <main style={{ flex: 1 }}>
        <AppHeader title="Attainment Configurations" subtitle="Rules, Thresholds & Weightages" />
        <div className="page-container">
          <AttainmentConfig />
        </div>
      </main>
    </div>
  );
}
