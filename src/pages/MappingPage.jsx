import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import COMappingMatrix from '../features/mapping/COMappingMatrix';

export default function MappingPage() {
  return (
    <div style={{ display: 'flex' }}>
      <AppSidebar />
      <main style={{ flex: 1 }}>
        <AppHeader title="CO Mapping Matrix" subtitle="CO to PO/PSO Competency Grids" />
        <div className="page-container">
          <COMappingMatrix />
        </div>
      </main>
    </div>
  );
}
