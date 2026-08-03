import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import EndSemMarksHub from '../features/marks/EndSemMarksHub';

export default function MarksPage() {
  return (
    <div style={{ display: 'flex' }}>
      <AppSidebar />
      <main style={{ flex: 1 }}>
        <AppHeader title="End Semester Marks Hub" subtitle="Excel Ingestion & Marks Grid" />
        <div className="page-container">
          <EndSemMarksHub />
        </div>
      </main>
    </div>
  );
}
