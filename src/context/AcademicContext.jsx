import { createContext, useContext, useState } from 'react';

const AcademicContext = createContext(null);

export const MASTER_BATCHES = [];
export const MASTER_FACULTY_LIST = [];
export const INITIAL_SCHOOLS = [];
export const INITIAL_DEPARTMENTS = [];
export const INITIAL_MASTER_PROGRAMMES_LIST = [];
export const MASTER_PROGRAMMES = [];
export const INITIAL_DIRECTOR_APPROVALS_LIST = [];
export const INITIAL_HOD_APPROVALS_LIST = [];
export const INITIAL_COURSES = [];
export const INITIAL_PROGRAMME_OUTCOMES = {};
export const INITIAL_PSO_OUTCOMES = {};
export const INITIAL_PEO_OUTCOMES = {};
export const INITIAL_PROGRAMME_ATR_LIST = {};

export function AcademicProvider({ children }) {
  const [programmeId, setProgrammeId] = useState('prog-1');
  const [courseId, setCourseId] = useState('');
  const [coTargets, setCoTargets] = useState({});
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [activeCOs, setActiveCOs] = useState([]);
  const [attainmentConfigs, setAttainmentConfigs] = useState({});
  const [courseVerificationStore, setCourseVerificationStore] = useState({});
  const [workflowProgressStore, setWorkflowProgressStore] = useState({});

  const updateCourseCoTargets = (targetCourseId, newTargets) => {
    setCoTargets((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || {}),
        ...newTargets,
      },
    }));
  };

  const updateCourseCOs = (targetCourseId, newCOs) => {
    setActiveCOs(newCOs);
  };

  const updateCourseVerificationStatus = (targetCourseId, statusType, statusValue, remarksValue = '', verifierName = null) => {
    const remarkKey = statusType.replace('Status', 'Remarks');
    setCourseVerificationStore((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || {}),
        [statusType]: statusValue,
        [remarkKey]: remarksValue,
      },
    }));
  };

  const markWorkflowStepComplete = (targetCourseId, path) => {
    if (!targetCourseId) return;
    setWorkflowProgressStore((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || {}),
        [path]: true,
      },
    }));
  };

  return (
    <AcademicContext.Provider
      value={{
        programmeId,
        setProgrammeId,
        courseId,
        setCourseId,
        selectedCourse: availableCourses.find((c) => c.id === courseId) || null,
        availableCourses,
        courses,
        activeCOs,
        activePOs: [],
        activePSOs: [],
        activeAttainmentConfig: { directWeight: 80, indirectWeight: 20, directThreshold: 60 },
        attainmentConfigs,
        coTargets,
        updateCourseCoTargets,
        updateCourseCOs,
        courseVerificationStore,
        updateCourseVerificationStatus,
        workflowProgressStore,
        markWorkflowStepComplete,
        academicYear: '2025-26',
        setAcademicYear: () => {},
        availableYears: ['2024-25', '2025-26', '2026-27'],
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  return context || {};
}
