import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseATR from '../features/atr/CourseATR';

export default function CourseATRPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <CourseATR hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
