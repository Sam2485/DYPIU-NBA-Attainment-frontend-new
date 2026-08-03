import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ReportsHub from '../features/reports/ReportsHub';

export default function ReportsPage() {
  return (
    <div style={{ display: 'flex' }}>
      <AppSidebar />
      <main style={{ flex: 1 }}>
        <AppHeader title="Reports & Export Hub" subtitle="PDF & Excel Attainment Snapshots" />
        <div className="page-container">
          <ReportsHub />
        </div>
      </main>
    </div>
  );
}
