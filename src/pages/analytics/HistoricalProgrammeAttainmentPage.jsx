import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import HistoricalProgrammeAttainmentView from '../../features/analytics/historical/HistoricalProgrammeAttainmentView';

export default function HistoricalProgrammeAttainmentPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <HistoricalProgrammeAttainmentView />
        </div>
      </main>
    </div>
  );
}
