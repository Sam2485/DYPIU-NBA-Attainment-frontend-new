import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import EndSemMarksHub from '../features/marks/EndSemMarksHub';

export default function MarksPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader />
        <div className="page-container">
          <EndSemMarksHub hideFooter={true} />
        </div>
      </main>
    </div>
  );
}
