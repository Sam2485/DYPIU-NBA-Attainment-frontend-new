import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import UserManagement from '../features/users/UserManagement';

export default function UsersPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="User & Access Management" subtitle="System Accounts & Roles" />
        <div className="page-container">
          <UserManagement />
        </div>
      </main>
    </div>
  );
}
