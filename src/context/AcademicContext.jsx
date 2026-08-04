import { createContext, useContext, useState } from 'react';

const AcademicContext = createContext(null);

// Centralized Master Programmes Database
export const MASTER_PROGRAMMES = [
  { id: 'prog-1', code: 'BE-COMP', name: 'B.Tech Computer Science & Engineering', department: 'School of Computer Science' },
  { id: 'prog-2', code: 'BE-AI', name: 'B.Tech AI & Data Science', department: 'School of Computer Science' },
  { id: 'prog-3', code: 'MBA', name: 'Master of Business Administration', department: 'School of Management' },
];

export const INITIAL_PROGRAMME_OUTCOMES = {
  'prog-1': [
    { code: 'PO1', statement: '1. Apply the knowledge of mathematics, science, engineering fundamentals and specialization to the solution of complex engineering problems' },
    { code: 'PO2', statement: '2. Identify, formulate, review research literature, and analyze complex computer engineering problems reaching substantiated conclusions' },
    { code: 'PO3', statement: '3. Design solutions for complex computer engineering problems and design system components' },
    { code: 'PO4', statement: '4. Use research-based knowledge and research methods including design of experiments' },
    { code: 'PO5', statement: '5. Create, select, and apply appropriate techniques, resources, and modern engineering tools' },
    { code: 'PO6', statement: '6. Apply reasoning informed by contextual knowledge to assess societal issues' },
    { code: 'PO7', statement: '7. Understand the impact of professional engineering solutions in environmental contexts' },
    { code: 'PO8', statement: '8. Apply ethical principles and commit to professional ethics and responsibilities' },
    { code: 'PO9', statement: '9. Function effectively as an individual, and as a member or leader in diverse teams' },
    { code: 'PO10', statement: '10. Communicate effectively on complex engineering activities with the engineering community' },
    { code: 'PO11', statement: '11. Demonstrate knowledge and understanding of engineering management principles' },
    { code: 'PO12', statement: '12. Recognize the need for, and have the preparation and ability to engage in independent learning' },
  ],
  'prog-2': [
    { code: 'PO1', statement: '1. Mathematical and Statistical Foundations for AI & DS' },
    { code: 'PO2', statement: '2. Machine Learning Algorithm Formulation & Optimization' },
    { code: 'PO3', statement: '3. Deep Learning & Neural Network Architecture Design' },
    { code: 'PO4', statement: '4. Data Engineering and Big Data Analytics Pipeline' },
  ],
  'prog-3': [
    { code: 'PO1', statement: '1. Business Environment & Strategic Management Fundamentals' },
    { code: 'PO2', statement: '2. Financial Analysis, Corporate Accounting & Managerial Economics' },
    { code: 'PO3', statement: '3. Organizational Behavior & Human Resource Strategy' },
  ],
};

export const INITIAL_PSO_OUTCOMES = {
  'prog-1': [
    { code: 'PSO1', statement: 'Professional Skills: Analyze and develop software systems' },
    { code: 'PSO2', statement: 'Problem-Solving Skills: Apply algorithmic principles to real-world problems' },
    { code: 'PSO3', statement: 'Successful Career and Entrepreneurship: Adapt to emerging software technologies' },
  ],
  'prog-2': [
    { code: 'PSO1', statement: 'AI System Deployment and Model Lifecycle Management' },
    { code: 'PSO2', statement: 'Data Insights and Predictive Analytics Solutions' },
  ],
  'prog-3': [
    { code: 'PSO1', statement: 'Strategic Leadership in Corporate Operations' },
  ],
};

export const INITIAL_COURSES = [
  {
    id: 'crs-1',
    code: '310244',
    name: 'Computer Network and Security',
    programmeId: 'prog-1',
    semester: 'Sem I',
    faculty: 'Dr. Raj Shaikh / XYZ',
    courseOutcomes: [
      { code: 'C321.1', statement: 'Interpret fundamental concepts of Computer Networks, architectures, protocols and technologies' },
      { code: 'C321.2', statement: 'Demonstrate the working and functions of data link layer for flow and error control' },
      { code: 'C321.3', statement: 'Analyze the working of different routing protocols and mechanisms for transmission of data' },
      { code: 'C321.4', statement: 'Implement client-server applications using sockets' },
      { code: 'C321.5', statement: 'Analyze role of application layer with its protocols, client-server architectures' },
      { code: 'C321.6', statement: 'Interpret the basics of Network Security for secured communication' },
    ],
  },
  {
    id: 'crs-2',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    programmeId: 'prog-1',
    semester: 'Sem III',
    faculty: 'Prof. Ananya Roy',
    courseOutcomes: [
      { code: 'CS301.1', statement: 'Analyze time and space complexity of sorting and searching algorithms' },
      { code: 'CS301.2', statement: 'Implement linear data structures (stacks, queues, linked lists)' },
      { code: 'CS301.3', statement: 'Apply non-linear graph algorithms (BFS, DFS, Dijkstra)' },
      { code: 'CS301.4', statement: 'Design dynamic programming and greedy algorithm solutions' },
    ],
  },
  {
    id: 'crs-3',
    code: 'AI201',
    name: 'Machine Learning Fundamentals',
    programmeId: 'prog-2',
    semester: 'Sem IV',
    faculty: 'Dr. Vikram Joshi',
    courseOutcomes: [
      { code: 'AI201.1', statement: 'Understand supervised and unsupervised learning algorithms' },
      { code: 'AI201.2', statement: 'Implement linear and logistic regression models' },
      { code: 'AI201.3', statement: 'Evaluate model performance using precision, recall, and ROC curves' },
    ],
  },
  {
    id: 'crs-4',
    code: 'MBA101',
    name: 'Organizational Behavior',
    programmeId: 'prog-3',
    semester: 'Sem I',
    faculty: 'Dr. Sameer Khan',
    courseOutcomes: [
      { code: 'MBA101.1', statement: 'Analyze individual and group dynamics in corporate organizations' },
      { code: 'MBA101.2', statement: 'Evaluate leadership models and conflict resolution strategies' },
    ],
  },
];

// Year-wise Attainment Multipliers & Sample Data
const YEAR_ATTAINMENT_METRICS = {
  '2024-25': {
    directExamAttainment: 2.10,
    indirectSurveyAttainment: 2.40,
    overallCOAttainment: 2.16,
    avgPoAttainment: 1.44,
    avgPsoAttainment: 1.35,
    thresholdPct: '60%',
  },
  '2025-26': {
    directExamAttainment: 2.80,
    indirectSurveyAttainment: 2.50,
    overallCOAttainment: 2.74,
    avgPoAttainment: 1.83,
    avgPsoAttainment: 1.70,
    thresholdPct: '65%',
  },
  '2026-27': {
    directExamAttainment: 2.95,
    indirectSurveyAttainment: 2.85,
    overallCOAttainment: 2.93,
    avgPoAttainment: 1.95,
    avgPsoAttainment: 1.88,
    thresholdPct: '70%',
  },
};

export function AcademicProvider({ children }) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const availableYears = ['2024-25', '2025-26', '2026-27'];
  const [programmeId, setProgrammeIdState] = useState('prog-1');

  // Master Outcomes State (Keyed by Academic Year)
  const [poStoreByYear, setPoStoreByYear] = useState({
    '2024-25': INITIAL_PROGRAMME_OUTCOMES,
    '2025-26': INITIAL_PROGRAMME_OUTCOMES,
    '2026-27': INITIAL_PROGRAMME_OUTCOMES,
  });

  const [psoStoreByYear, setPsoStoreByYear] = useState({
    '2024-25': INITIAL_PSO_OUTCOMES,
    '2025-26': INITIAL_PSO_OUTCOMES,
    '2026-27': INITIAL_PSO_OUTCOMES,
  });

  const [coursesStoreByYear, setCoursesStoreByYear] = useState({
    '2024-25': INITIAL_COURSES,
    '2025-26': INITIAL_COURSES,
    '2026-27': INITIAL_COURSES,
  });

  // Course-wise Attainment Configurations Store (Dynamic Direct/Indirect weights & Target Thresholds)
  const [attainmentConfigs, setAttainmentConfigs] = useState({
    'crs-1': { directWeight: 80, indirectWeight: 20, directThreshold: 60, thresholdPct: '60%' },
    'crs-2': { directWeight: 80, indirectWeight: 20, directThreshold: 65, thresholdPct: '65%' },
    'crs-3': { directWeight: 80, indirectWeight: 20, directThreshold: 60, thresholdPct: '60%' },
    'crs-4': { directWeight: 80, indirectWeight: 20, directThreshold: 60, thresholdPct: '60%' },
  });

  const updateCourseAttainmentConfig = (targetCourseId, newConfig) => {
    setAttainmentConfigs((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...prev[targetCourseId],
        ...newConfig,
        thresholdPct: `${newConfig.directThreshold}%`,
      },
    }));
  };

  const poStore = poStoreByYear[academicYear] || INITIAL_PROGRAMME_OUTCOMES;
  const psoStore = psoStoreByYear[academicYear] || INITIAL_PSO_OUTCOMES;
  const coursesStore = coursesStoreByYear[academicYear] || INITIAL_COURSES;
  const yearMetrics = YEAR_ATTAINMENT_METRICS[academicYear] || YEAR_ATTAINMENT_METRICS['2025-26'];

  // Derived available courses for active programme
  const availableCourses = coursesStore.filter((c) => c.programmeId === programmeId);

  const setProgrammeId = (newProgId) => {
    setProgrammeIdState(newProgId);
    const newAvail = coursesStore.filter((c) => c.programmeId === newProgId);
    if (newAvail.length > 0) {
      setCourseId(newAvail[0].id);
    }
  };

  // Active Course ID
  const [courseId, setCourseId] = useState('crs-1');

  // Active Objects
  const selectedProgramme = MASTER_PROGRAMMES.find((p) => p.id === programmeId) || MASTER_PROGRAMMES[0];
  const selectedCourse =
    coursesStore.find((c) => c.id === courseId && c.programmeId === programmeId) ||
    availableCourses[0] ||
    coursesStore[0];

  // Dynamic PO & PSO arrays for active Programme & Year
  const activePOs = poStore[programmeId] || [];
  const activePSOs = psoStore[programmeId] || [];

  // Dynamic COs for active Course & Year
  const activeCOs = selectedCourse ? selectedCourse.courseOutcomes || [] : [];

  // Active Dynamic Attainment Config for active Course
  const activeAttainmentConfig = attainmentConfigs[selectedCourse?.id || 'crs-1'] || {
    directWeight: 80,
    indirectWeight: 20,
    directThreshold: 60,
    thresholdPct: '60%',
  };

  // Dynamic Actions
  const updateProgrammePOs = (progId, newPOs) => {
    setPoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...prev[academicYear],
        [progId]: newPOs,
      },
    }));
  };

  const updateProgrammePSOs = (progId, newPSOs) => {
    setPsoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...prev[academicYear],
        [progId]: newPSOs,
      },
    }));
  };

  const updateCourseCOs = (targetCourseId, newCOs) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: (prev[academicYear] || []).map((c) =>
        c.id === targetCourseId ? { ...c, courseOutcomes: newCOs } : c
      ),
    }));
  };

  return (
    <AcademicContext.Provider
      value={{
        academicYear,
        setAcademicYear,
        availableYears,
        yearMetrics,
        programmes: MASTER_PROGRAMMES,
        programmeId,
        selectedProgramme,
        setProgrammeId,
        courses: coursesStore,
        availableCourses,
        courseId: selectedCourse ? selectedCourse.id : 'crs-1',
        selectedCourse,
        setCourseId,
        activePOs,
        activePSOs,
        activeCOs,
        activeAttainmentConfig,
        attainmentConfigs,
        updateCourseAttainmentConfig,
        updateProgrammePOs,
        updateProgrammePSOs,
        updateCourseCOs,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}
