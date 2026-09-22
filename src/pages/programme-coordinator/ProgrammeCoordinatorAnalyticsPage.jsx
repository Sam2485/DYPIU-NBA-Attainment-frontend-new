import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import RoleAnalyticsDashboard from '../../features/analytics/RoleAnalyticsDashboard';

export default function ProgrammeCoordinatorAnalyticsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Analytics" subtitle="Programme Coordinator Portal" />
        <div className="page-container">
          <RoleAnalyticsDashboard roleOverride="PROGRAMME_COORDINATOR" />
        </div>
      </main>
    </div>
  );
}
