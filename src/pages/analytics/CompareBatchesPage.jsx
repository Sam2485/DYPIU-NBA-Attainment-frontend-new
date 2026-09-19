import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import CompareBatchesView from '../../features/analytics/compare-batches/CompareBatchesView';

export default function CompareBatchesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <CompareBatchesView />
        </div>
      </main>
    </div>
  );
}
