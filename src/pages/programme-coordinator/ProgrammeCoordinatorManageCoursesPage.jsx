import AppHeader from '../../components/layout/AppHeader';
import AppSidebar from '../../components/layout/AppSidebar';
import ProgrammeCoordinatorSetupWorkflow from '../../features/programme-coordinator/ProgrammeCoordinatorSetupWorkflow';

export default function ProgrammeCoordinatorManageCoursesPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader
          title="Manage Courses"
          subtitle="Add programme-batch courses and assign Course Coordinators"
        />
        <div className="page-container">
          <ProgrammeCoordinatorSetupWorkflow standaloneCourseManagement />
        </div>
      </main>
    </div>
  );
}
