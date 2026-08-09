import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HodApprovals from '../../features/hod/HodApprovals';

export default function HodApprovalsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="HOD Verification & Submission Approval Panel" subtitle="HOD Control Portal" />
        <div className="page-container">
          <HodApprovals />
        </div>
      </main>
    </div>
  );
}
