import { useEffect } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';

// UX-only companion to the backend lifecycle gatekeeper. Course-level work is
// editable only while its programme batch is ACTIVE; the backend still owns
// enforcement and rejects bypassed writes with 409.
export default function CourseBatchLifecycleGate({ children }) {
  const { role, user } = useAuth();
  const {
    batchId,
    batches = [],
    selectedBatch,
    selectedCourseOffering,
    semestersStatusOverview = {},
    loadSemestersStatusOverview = () => Promise.resolve([]),
    loadCourseCoordinatorProgrammeBatches = () => Promise.resolve([]),
  } = useAcademic();
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  useEffect(() => {
    if (!isCourseCoordinator || !user?.email) return;
    loadCourseCoordinatorProgrammeBatches(user.email).catch(() => {});
  }, [isCourseCoordinator, loadCourseCoordinatorProgrammeBatches, user?.email]);

  useEffect(() => {
    if (!isCourseCoordinator || !batchId) return;
    loadSemestersStatusOverview(batchId).catch(() => {});
  }, [batchId, isCourseCoordinator, loadSemestersStatusOverview]);

  if (!isCourseCoordinator) return children;

  const scopedBatch = selectedBatch
    ?? batches.find((batch) => String(batch.id) === String(batchId))
    ?? null;
  const status = String(scopedBatch?.status ?? '').toUpperCase();
  const offeringSemester = Number(selectedCourseOffering?.semester);
  const semesterStatus = (semestersStatusOverview[batchId] ?? []).find(
    (semester) => Number(semester.semester) === offeringSemester
  );
  const isSemesterCompleted = selectedCourseOffering?.status === 'COMPLETED'
    || semesterStatus?.isCompleted
    || String(semesterStatus?.status ?? '').toUpperCase() === 'COMPLETED';
  const isLocked = (Boolean(status) && status !== 'ACTIVE') || isSemesterCompleted;

  if (!isLocked) return children;

  return (
    <>
      <div style={{ margin: '0 0 16px', padding: '14px 16px', borderRadius: '10px', border: '1px solid #c7d2fe', borderLeft: '4px solid #4f46e5', background: '#eef2ff', color: '#3730a3', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <LockKeyhole size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong style={{ display: 'block', fontSize: '13px' }}>{isSemesterCompleted ? `Semester ${offeringSemester} completed — Course work locked` : `Course work locked — Batch ${status}`}</strong>
          <span style={{ display: 'block', marginTop: '3px', fontSize: '12px', lineHeight: 1.45 }}>
            Courses, outcomes, mappings, marks, surveys, attainment, and Course ATR cannot be changed after a programme batch is completed or graduated.
          </span>
        </div>
      </div>
      <fieldset disabled style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0, opacity: 0.68 }}>
        {children}
      </fieldset>
    </>
  );
}
