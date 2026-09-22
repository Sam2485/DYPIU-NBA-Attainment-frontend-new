import React from 'react';
import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import QuickAnalysisDashboard from '../../features/analytics/quick-analysis/QuickAnalysisDashboard';

export default function QuickAnalysisPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main" style={{ minWidth: 0, flex: 1 }}>
        <AppHeader />
        <div className="page-container" style={{ padding: 0 }}>
          <QuickAnalysisDashboard />
        </div>
      </main>
    </div>
  );
}
