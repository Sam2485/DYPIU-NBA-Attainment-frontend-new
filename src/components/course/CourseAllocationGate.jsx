import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';

// This is a UX guard only. The backend remains the authority and independently
// rejects Faculty access to unapproved course allocations with 403 Forbidden.
export default function CourseAllocationGate({ children }) {
  const { role, user } = useAuth();
  const {
    batchId,
    selectedCourseOffering,
    loadAssignedCourseOfferings = () => Promise.resolve([]),
  } = useAcademic();
  const [state, setState] = useState('checking');
  const isFaculty = role === 'FACULTY' || role === 'COURSE_COORDINATOR';
  const targetBatchId = batchId ?? selectedCourseOffering?.batchId ?? selectedCourseOffering?.programmeBatchId ?? null;

  useEffect(() => {
    if (!isFaculty) {
      setState('approved');
      return;
    }

    let active = true;
    setState('checking');
    if (!user?.email || !targetBatchId) {
      setState('locked');
      return () => { active = false; };
    }

    loadAssignedCourseOfferings(user, targetBatchId)
      .then((offerings) => {
        if (active) setState(offerings?.length ? 'approved' : 'locked');
      })
      .catch(() => {
        if (active) setState('locked');
      });

    return () => { active = false; };
  }, [isFaculty, loadAssignedCourseOfferings, targetBatchId, user]);

  if (!isFaculty || state === 'approved') return children;
  if (state === 'checking') return null;

  return <Navigate to="/dashboard?courseAllocation=locked" replace />;
}
