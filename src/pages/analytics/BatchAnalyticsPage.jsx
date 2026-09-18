import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import BatchAnalyticsOverview from '../../features/analytics/batch-overview/BatchAnalyticsOverview';

export default function BatchAnalyticsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <BatchAnalyticsOverview />
        </div>
      </main>
    </div>
  );
}
