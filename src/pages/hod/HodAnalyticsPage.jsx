import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import RoleAnalyticsDashboard from '../../features/analytics/RoleAnalyticsDashboard';

export default function HodAnalyticsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Analytics" subtitle="Head of Department Portal" />
        <div className="page-container">
          <RoleAnalyticsDashboard roleOverride="HOD" />
        </div>
      </main>
    </div>
  );
}
