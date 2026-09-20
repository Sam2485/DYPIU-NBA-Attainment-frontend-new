import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import CompareCoursesView from '../../features/analytics/compare-courses/CompareCoursesView';

export default function CompareCoursesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container">
          <CompareCoursesView />
        </div>
      </main>
    </div>
  );
}
