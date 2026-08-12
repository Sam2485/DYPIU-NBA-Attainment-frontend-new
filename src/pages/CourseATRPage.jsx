import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import ATRReportsNavHub from '../features/atr/ATRReportsNavHub';

export default function CourseATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Course Action Taken Report (ATR)" subtitle="Target Gap Analysis & Corrective Actions" />
        <div className="page-container">
          <ATRReportsNavHub initialTab="course-atr" />
        </div>
      </main>
    </div>
  );
}
