import { useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
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
          {isCourseCoordinator && assignedOfferings.length === 0 && (
            <div style={{
              margin: '0 0 20px 0',
              padding: '16px 20px',
              borderRadius: '12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderLeft: '5px solid #d97706',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.08)',
            }}>
              <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#92400e' }}>
                  No courses assigned yet
                </div>
                <div style={{ fontSize: '13px', color: '#b45309', marginTop: '3px', lineHeight: '1.4' }}>
                  You currently have no course offerings allocated to you or course allocations are awaiting HOD approval. Once your course coordinator assignments are approved by the HOD, your assigned courses will appear here automatically.
                </div>
              </div>
            </div>
          )}
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
