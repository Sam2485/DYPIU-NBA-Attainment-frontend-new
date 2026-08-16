// import { createContext, useContext } from 'react';

// // Master Batches
// export const MASTER_BATCHES = [];

// // Master Faculty Members Roster
// export const MASTER_FACULTY_LIST = [];

// // Centralized Master Schools Database
// export const INITIAL_SCHOOLS = [];

// // Centralized Master Departments Database
// export const INITIAL_DEPARTMENTS = [];

// // Centralized Master Programmes Database
// export const INITIAL_MASTER_PROGRAMMES_LIST = [];
// export const MASTER_PROGRAMMES = [];

// // Centralized Approvals Database
// export const INITIAL_DIRECTOR_APPROVALS_LIST = [];
// export const INITIAL_HOD_APPROVALS_LIST = [];
// export const INITIAL_COURSES = [];

// export const INITIAL_PROGRAMME_OUTCOMES = {};
// export const INITIAL_PSO_OUTCOMES = {};
// export const INITIAL_PEO_OUTCOMES = {};
// export const INITIAL_PROGRAMME_ATR_LIST = {};

// const DUMMY_ACADEMIC_STATE = {
//   departments: [],
//   masterProgrammes: [],
//   batches: [],
//   batchId: 'batch-2025-29',
//   setBatchId: () => {},
//   academicYear: '2025-26',
//   setAcademicYear: () => {},
//   availableYears: ['2024-25', '2025-26', '2026-27'],
//   yearMetrics: {
//     directExamAttainment: 2.80,
//     indirectSurveyAttainment: 2.50,
//     overallCOAttainment: 2.74,
//     avgPoAttainment: 1.83,
//     avgPsoAttainment: 1.70,
//     thresholdPct: '65%',
//   },
//   programmes: [],
//   programmeId: 'prog-1',
//   selectedProgramme: { id: 'prog-1', code: 'BE-COMP', name: 'B.Tech Computer Science & Engineering' },
//   setProgrammeId: () => {},
//   courses: [],
//   availableCourses: [],
//   courseId: '',
//   selectedCourse: null,
//   setCourseId: () => {},
//   activePOs: [],
//   activePSOs: [],
//   activeCOs: [],
//   activeAttainmentConfig: {
//     directWeight: 80,
//     indirectWeight: 20,
//     directThreshold: 60,
//     thresholdPct: '60%',
//   },
//   attainmentConfigs: {},
//   poPsoTargets: {},
//   updatePoPsoTargets: () => {},
//   coTargets: {},
//   updateCourseCoTargets: () => {},
//   updateCourseAttainmentConfig: () => {},
//   updateProgrammePOs: () => {},
//   updateProgrammePSOs: () => {},
//   updateCourseCOs: () => {},
//   updateCourseFacultyAllocation: () => {},
//   courseVerificationStore: {},
//   updateCourseVerificationStatus: () => {},
//   markWorkflowStepComplete: () => {},
//   workflowProgressStore: {},
//   addBatch: () => {},
//   updateBatch: () => {},
//   deleteBatch: () => {},
//   toggleBatchActiveStatus: () => {},
//   getStudentsByBatch: () => [],
//   addStudentToBatch: () => {},
//   updateStudentInBatch: () => {},
//   deleteStudentFromBatch: () => {},
// };

// const AcademicContext = createContext(DUMMY_ACADEMIC_STATE);

// export function AcademicProvider({ children }) {
//   return (
//     <AcademicContext.Provider value={DUMMY_ACADEMIC_STATE}>
//       {children}
//     </AcademicContext.Provider>
//   );
// }

// export function useAcademic() {
//   const context = useContext(AcademicContext);
//   return context || DUMMY_ACADEMIC_STATE;
// }
