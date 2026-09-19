import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import OutcomeIndirectDrilldownView from '../../features/analytics/indirect-drilldown/OutcomeIndirectDrilldownView';

export default function OutcomeIndirectDrilldownPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <OutcomeIndirectDrilldownView />
        </div>
      </main>
    </div>
  );
}
