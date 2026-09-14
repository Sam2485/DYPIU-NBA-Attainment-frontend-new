import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import IqacAnalyticsDashboard from '../../features/analytics/IqacAnalyticsDashboard';

export default function IqacAnalyticsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader title="IQAC Attainment Analytics" subtitle="D. Y. Patil International University" />
        <div className="page-container">
          <IqacAnalyticsDashboard />
        </div>
      </main>
    </div>
  );
}
