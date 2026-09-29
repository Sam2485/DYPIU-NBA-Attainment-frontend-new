import { useEffect } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';

export default function CourseOfferingSelector() {
  const { user, role } = useAuth();
  const {
    batchId,
    courseOfferings = [],
    selectedCourseOffering = null,
    courseOfferingId = null,
    selectCourseOffering = () => {},
    loadAssignedCourseOfferings = () => Promise.resolve([]),
  } = useAcademic();

  useEffect(() => {
    let active = true;
    loadAssignedCourseOfferings(user, batchId).then((offerings) => {
      if (!active || !offerings?.length) return;
      const currentId = selectedCourseOffering?.id ?? courseOfferingId;
      const currentOffering = offerings.find((offering) => String(offering.id) === String(currentId));
      if (!currentOffering) selectCourseOffering(offerings[0]);
    }).catch(() => {});
    return () => { active = false; };
  }, [batchId, courseOfferingId, loadAssignedCourseOfferings, selectCourseOffering, selectedCourseOffering?.id, user]);

  const selectedId = selectedCourseOffering?.id ?? courseOfferingId ?? '';
  const isCourseCoordinator = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  return (
    <>
      {isCourseCoordinator && courseOfferings.length === 0 && (
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

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
        <label htmlFor="course-offering-selector" style={{ color: '#64748b', fontSize: '12px', fontWeight: '700' }}>
          Course Offering
        </label>
        <div style={{ position: 'relative', minWidth: '280px', maxWidth: '100%' }}>
          <select
            id="course-offering-selector"
            value={selectedId}
            onChange={(event) => {
              const offering = courseOfferings.find((item) => String(item.id) === event.target.value);
              if (offering) selectCourseOffering(offering);
            }}
            disabled={courseOfferings.length === 0}
            style={{ width: '100%', height: '38px', padding: '0 34px 0 12px', appearance: 'none', border: '1px solid #c7d2fe', borderRadius: '8px', background: '#f5f3ff', color: '#3730a3', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: '700', outline: 'none', cursor: courseOfferings.length ? 'pointer' : 'not-allowed' }}
          >
            {courseOfferings.length === 0 ? (
              <option value="">No courses assigned yet</option>
            ) : courseOfferings.map((offering) => (
              <option key={offering.id} value={offering.id}>
                {offering.courseCode || 'Course'} — {offering.courseName || 'Programme Batch Course'} · Sem {offering.semester ?? '—'}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4f46e5', pointerEvents: 'none' }} />
        </div>
      </div>
    </>
  );
}
