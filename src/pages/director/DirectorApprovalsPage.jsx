import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import DirectorApprovals from '../../features/director/DirectorApprovals';

export default function DirectorApprovalsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Director Approvals & Visibility" subtitle="School Director Portal" />
        <div className="page-container">
          <DirectorApprovals />
        </div>
      </main>
    </div>
  );
}
