import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import BatchProgrammeAtrView from '../../features/analytics/batch-atr/BatchProgrammeAtrView';

export default function BatchProgrammeAtrPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <BatchProgrammeAtrView />
        </div>
      </main>
    </div>
  );
}
