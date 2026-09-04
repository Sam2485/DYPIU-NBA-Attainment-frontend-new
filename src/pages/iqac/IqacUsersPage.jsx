import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import AdminDashboardPage from '../admin/AdminDashboardPage';

export default function IqacUsersPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <AdminDashboardPage />
      </main>
    </div>
  );
}
