import { useEffect, useMemo } from 'react';
import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';
import CourseATR from '../features/atr/CourseATR';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';

export default function CourseATRPage() {
  const { role, user } = useAuth();
  const {
    batchId,
    courseOfferings = [],
    selectedCourseOffering,
    courseOfferingId,
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
  } = useAcademic();
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  useEffect(() => {
    if (!isCourseCoordinator || !user?.email || !batchId) return;
    let isCurrent = true;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      if (!isCurrent || !offerings?.length) return;
      const currentId = selectedCourseOffering?.id ?? courseOfferingId;
      const selected = (offerings ?? []).find(
        (offering) => String(offering.id) === String(currentId)
      ) ?? offerings[0];
      if (selected && String(selected.id) !== String(selectedCourseOffering?.id)) {
        selectCourseOffering(selected);
      }
    }).catch(() => {});
    return () => { isCurrent = false; };
  }, [batchId, courseOfferingId, isCourseCoordinator, loadAssignedCourseOfferings, selectCourseOffering, selectedCourseOffering?.id, user]);

  const assignedOfferings = useMemo(
    () => courseOfferings.filter((offering) => String(offering.batchId ?? offering.programmeBatchId) === String(batchId)),
    [batchId, courseOfferings],
  );

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
            batchId={batchId}
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
