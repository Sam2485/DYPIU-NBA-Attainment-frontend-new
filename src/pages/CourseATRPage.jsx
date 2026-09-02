import { useEffect, useMemo } from 'react';
import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseATR from '../features/atr/CourseATR';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';

export default function CourseATRPage() {
  const { user, role } = useAuth();
  const {
    batchId,
    courseOfferings = [],
    selectedCourseOffering,
    courseOfferingId,
    loadAssignedCourseOfferings = () => Promise.resolve([]),
    selectCourseOffering = () => {},
  } = useAcademic();
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const assignedOfferings = useMemo(
    () => courseOfferings.filter((offering) => String(offering.batchId ?? offering.programmeBatchId) === String(batchId)),
    [batchId, courseOfferings],
  );

  useEffect(() => {
    if (!isCourseCoordinator || !user?.email || !batchId) return;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      const selectedStillAssigned = (offerings ?? []).some(
        (offering) => String(offering.id) === String(courseOfferingId)
      );
      if (!selectedStillAssigned && offerings?.[0]) selectCourseOffering(offerings[0]);
    }).catch(() => {});
  }, [batchId, courseOfferingId, isCourseCoordinator, loadAssignedCourseOfferings, selectCourseOffering, user]);

  const selectOffering = (event) => {
    const offering = assignedOfferings.find((item) => String(item.id) === event.target.value);
    if (offering) selectCourseOffering(offering);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <main className="nba-layout-main">
        <AppHeader title="Course Action Taken Report (ATR)" subtitle="Target Gap Analysis & Corrective Actions" />
        <div className="page-container">
          <CourseATR
            courseId={isCourseCoordinator ? selectedCourseOffering?.id : undefined}
            showAssignedCourseSelector={isCourseCoordinator}
            assignedOfferings={assignedOfferings}
            selectorDisabled={!batchId}
            onSelectOffering={(offeringId) => selectOffering({ target: { value: offeringId } })}
          />
        </div>
      </main>
    </div>
  );
}
