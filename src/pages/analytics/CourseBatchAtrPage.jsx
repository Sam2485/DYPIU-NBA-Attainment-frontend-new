import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import CourseBatchAtrView from '../../features/analytics/course-atr/CourseBatchAtrView';

export default function CourseBatchAtrPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <CourseBatchAtrView />
        </div>
      </main>
    </div>
  );
}
