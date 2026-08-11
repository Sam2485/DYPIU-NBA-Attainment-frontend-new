import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const AcademicContext = createContext(null);

// Master Batches (Concurrently Active Batches matching Programme Duration e.g. 4 Batches for 4-Yr Degree, 2 Batches for 2-Yr Degree)
export const MASTER_BATCHES = [
  // 4-Year Batches for B.Tech Computer Science & Engineering (prog-1 - Up to 4 Concurrently Active Batches)
  { id: 'batch-comp-2025-29', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2025-29 (BE-COMP) — AY 2025-26 to 2028-29', startYear: '2025-26', endYear: '2028-29', yearLevel: 'Year 1 (Freshmen)', status: 'ACTIVE' },
  { id: 'batch-comp-2024-28', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2024-28 (BE-COMP) — AY 2024-25 to 2027-28', startYear: '2024-25', endYear: '2027-28', yearLevel: 'Year 2 (Sophomores)', status: 'ACTIVE' },
  { id: 'batch-comp-2023-27', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2023-27 (BE-COMP) — AY 2023-24 to 2026-27', startYear: '2023-24', endYear: '2026-27', yearLevel: 'Year 3 (Juniors)', status: 'ACTIVE' },
  { id: 'batch-comp-2022-26', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2022-26 (BE-COMP) — AY 2022-23 to 2025-26', startYear: '2022-23', endYear: '2025-26', yearLevel: 'Year 4 (Seniors / Final Year)', status: 'ACTIVE' },
  { id: 'batch-comp-2026-30', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2026-30 (BE-COMP) — AY 2026-27 to 2029-30', startYear: '2026-27', endYear: '2029-30', yearLevel: 'Upcoming Batch', status: 'INITIALIZED' },
  { id: 'batch-comp-2021-25', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2021-25 (BE-COMP) — AY 2021-22 to 2024-25', startYear: '2021-22', endYear: '2024-25', yearLevel: 'Graduated Alumni', status: 'GRADUATED' },

  // 2-Year Batches for Master of Business Administration (prog-3 - Up to 2 Concurrently Active Batches)
  { id: 'batch-mba-2025-27', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2025-27 (MBA) — AY 2025-26 to 2026-27', startYear: '2025-26', endYear: '2026-27', yearLevel: 'Year 1 (Junior Batch)', status: 'ACTIVE' },
  { id: 'batch-mba-2024-26', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2024-26 (MBA) — AY 2024-25 to 2025-26', startYear: '2024-25', endYear: '2025-26', yearLevel: 'Year 2 (Senior Batch)', status: 'ACTIVE' },
  { id: 'batch-mba-2026-28', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2026-28 (MBA) — AY 2026-27 to 2027-28', startYear: '2026-27', endYear: '2027-28', yearLevel: 'Upcoming Batch', status: 'INITIALIZED' },
  { id: 'batch-mba-2023-25', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2023-25 (MBA) — AY 2023-24 to 2024-25', startYear: '2023-24', endYear: '2024-25', yearLevel: 'Graduated Alumni', status: 'GRADUATED' },
];

// Master Faculty Members Roster
export const MASTER_FACULTY_LIST = [
  'Dr. Raj Shaikh',
  'Prof. XYZ',
  'Prof. Ananya Roy',
  'Dr. Vikram Joshi',
  'Dr. Sameer Khan',
  'Prof. Priya Verma',
];

// Centralized Master Schools Database
export const INITIAL_SCHOOLS = [
  { id: 'sch-1', code: 'SET', name: 'School of Engineering & Technology', dean: 'Dr. R. K. Deshmukh', estYear: '2019', email: 'set.director@dypiu.ac.in' },
  { id: 'sch-2', code: 'SOM', name: 'School of Management Studies', dean: 'Dr. P. S. Mehta', estYear: '2020', email: 'som.director@dypiu.ac.in' },
];

// Centralized Master Departments Database
export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', schoolId: 'sch-1', code: 'CSE', name: 'Department of Computer Science & Engineering', hod: 'Dr. Raj Shaikh', hodEmail: 'raj.shaikh@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-2', schoolId: 'sch-1', code: 'ENTC', name: 'Department of Electronics & Telecommunication', hod: 'Prof. Ananya Roy', hodEmail: 'ananya.roy@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-3', schoolId: 'sch-1', code: 'IT', name: 'Department of Information Technology', hod: 'Dr. Vikram Joshi', hodEmail: 'vikram.joshi@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-4', schoolId: 'sch-2', code: 'MGMT', name: 'Department of Management Studies', hod: 'Dr. Sameer Khan', hodEmail: 'sameer.khan@dypiu.ac.in', status: 'ACTIVE' },
];

// Centralized Master Programmes Database (Director sets Programme Duration in Years)
export const INITIAL_MASTER_PROGRAMMES_LIST = [
  { id: 'prog-1', departmentId: 'dept-1', code: 'BE-COMP', name: 'B.Tech Computer Science & Engineering', durationYears: 4, department: 'Department of Computer Science & Engineering', coordinator: 'Dr. A. K. Sharma', status: 'ACTIVE' },
  { id: 'prog-2', departmentId: 'dept-1', code: 'BE-AI', name: 'B.Tech AI & Data Science', durationYears: 4, department: 'Department of Computer Science & Engineering', coordinator: 'Prof. R. V. Patel', status: 'ACTIVE' },
  { id: 'prog-3', departmentId: 'dept-4', code: 'MBA', name: 'Master of Business Administration', durationYears: 2, department: 'Department of Management Studies', coordinator: 'Dr. S. N. Deshmukh', status: 'ACTIVE' },
  { id: 'prog-4', departmentId: 'dept-2', code: 'BE-ENTC', name: 'B.Tech Electronics & Telecommunication', durationYears: 4, department: 'Department of Electronics & Telecommunication', coordinator: 'Prof. Ananya Roy', status: 'ACTIVE' },
  { id: 'prog-5', departmentId: 'dept-1', code: 'ME-COMP', name: 'M.Tech Computer Science & Engineering', durationYears: 2, department: 'Department of Computer Science & Engineering', coordinator: 'Dr. Vikram Joshi', status: 'ACTIVE' },
];

// Centralized Director Approvals Database
export const INITIAL_DIRECTOR_APPROVALS_LIST = [
  {
    id: 'app-1',
    schoolId: 'sch-1',
    title: 'B.Tech Computer Science & Engineering — PO & PSO Outcome Framework',
    programme: 'B.Tech CSE',
    programmeId: 'prog-1',
    submittedBy: 'Dr. Raj Shaikh (HOD - CSE)',
    submittedAt: '2026-08-05',
    type: 'PO_PSO_FRAMEWORK',
    status: 'PENDING',
    details: '12 Program Outcomes (POs), 3 Program Specific Outcomes (PSOs), and 4 PEOs submitted for Director approval.',
  },
  {
    id: 'app-2',
    schoolId: 'sch-1',
    title: 'B.Tech AI & Data Science — Annual Programme Action Taken Report (ATR)',
    programme: 'B.Tech AI & DS',
    programmeId: 'prog-2',
    submittedBy: 'Prof. Ananya Roy (HOD - ENTC & AI)',
    submittedAt: '2026-08-06',
    type: 'PROGRAMME_ATR',
    status: 'PENDING',
    details: 'Batch 2024-28 continuous improvement action plan and gap observations submitted for Director review.',
  },
  {
    id: 'app-3',
    schoolId: 'sch-2',
    title: 'Master of Business Administration — Program Outcomes Setup',
    programme: 'MBA',
    programmeId: 'prog-3',
    submittedBy: 'Dr. Sameer Khan (HOD - SOM)',
    submittedAt: '2026-08-02',
    type: 'PO_PSO_FRAMEWORK',
    status: 'APPROVED',
    approvedBy: 'Dr. R. K. Deshmukh (Director)',
    approvedAt: '2026-08-03',
    details: '3 POs and 1 PSO framework verified and approved.',
  },
];

// Centralized Master Programmes Database
export const MASTER_PROGRAMMES = INITIAL_MASTER_PROGRAMMES_LIST;

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

// Centralized Master PEOs Database for HOD
export const INITIAL_PEO_OUTCOMES = {
  'prog-1': [
    { code: 'PEO1', statement: 'Graduates will establish successful careers in software engineering, technology consulting, and research.' },
    { code: 'PEO2', statement: 'Graduates will pursue higher studies and continuous professional learning in advanced computing domains.' },
    { code: 'PEO3', statement: 'Graduates will demonstrate leadership, teamwork, ethical values, and societal responsibility in corporate environments.' },
  ],
  'prog-2': [
    { code: 'PEO1', statement: 'Graduates will deploy ethical AI, data analytics, and machine learning solutions across industries.' },
    { code: 'PEO2', statement: 'Graduates will engage in innovation, research, and entrepreneurship in data science.' },
  ],
  'prog-3': [
    { code: 'PEO1', statement: 'Graduates will lead business enterprises, strategic management initiatives, and corporate operations.' },
  ],
};

export const INITIAL_PROGRAMME_ATR_LIST = {
  'prog-1': {
    status: 'SUBMITTED_FOR_APPROVAL',
    submittedBy: 'Dr. A. K. Sharma (Programme Coordinator)',
    submittedAt: '2026-08-06',
    observations: [
      {
        target: 'PO1 & PO2 (Engineering Knowledge & Problem Analysis)',
        gap: 'Direct assessment target achieved at 84%. Gap identified in advanced data structures problem formulation.',
        actionPlan: 'Introduce mandatory tutorial lab sessions with HackerRank/LeetCode competitive programming modules.',
      },
      {
        target: 'PO3 & PO5 (Design & Modern Tool Usage)',
        gap: 'Cloud deployment and DevOps tool usage showed minor deficit in 2024-25 batch.',
        actionPlan: 'Organize 2-day hands-on AWS & Docker containerization workshop before Sem VI.',
      },
      {
        target: 'PSO1 (Software System Development)',
        gap: 'Full-stack web framework implementation targets met successfully at 108%.',
        actionPlan: 'Maintain current project-based learning model and integrate microservices architecture topics.',
      },
    ],
  },
};

// Centralized HOD Approvals Database
export const INITIAL_HOD_APPROVALS_LIST = [
  {
    id: 'hod-app-1',
    programmeId: 'prog-1',
    programme: 'B.Tech CSE',
    title: 'Course Outcomes & Attainment Weightages Submission — CS301 (Data Structures)',
    submittedBy: 'Dr. Raj Shaikh (Course Coordinator)',
    submittedAt: '2026-08-07',
    type: 'COURSE_CO_WEIGHTAGES',
    status: 'PENDING',
    details: '6 Course Outcomes (C321.1 - C321.6) and Direct (80%) / Indirect (20%) weightages submitted for HOD verification.',
  },
  {
    id: 'hod-app-2',
    programmeId: 'prog-1',
    title: 'Programme Target Levels Setup — Batch 2025-29',
    programme: 'B.Tech CSE',
    submittedBy: 'Dr. A. K. Sharma (Programme Coordinator)',
    submittedAt: '2026-08-06',
    type: 'PROGRAMME_TARGETS',
    status: 'PENDING',
    details: 'Target levels (1.0 to 3.0 scale) set for 12 POs and 3 PSOs submitted for HOD verification.',
  },
  {
    id: 'hod-app-4',
    programmeId: 'prog-1',
    title: 'Course Roster & Course Coordinator Allocation — BE-COMP',
    programme: 'B.Tech CSE',
    submittedBy: 'Dr. A. K. Sharma (Programme Coordinator)',
    submittedAt: '2026-08-08',
    type: 'COURSE_ALLOCATION',
    status: 'PENDING',
    details: 'Course list and senior faculty Course Coordinator allocations submitted for HOD verification and approval.',
  },
  {
    id: 'hod-app-3',
    programmeId: 'prog-2',
    title: 'Course Action Taken Report (ATR) — AI201 (Machine Learning)',
    programme: 'B.Tech AI & DS',
    submittedBy: 'Prof. Ananya Roy (Course Coordinator)',
    submittedAt: '2026-08-04',
    type: 'COURSE_ATR',
    status: 'APPROVED',
    approvedBy: 'Dr. Raj Shaikh (HOD - CSE)',
    approvedAt: '2026-08-05',
    details: 'Course ATR gap analysis and remedial actions approved.',
  },
];

export const INITIAL_COURSES = [
  {
    id: 'crs-1',
    code: '310244',
    name: 'Computer Network and Security',
    programmeId: 'prog-1',
    semester: 'Sem I',
    faculty: 'Dr. Raj Shaikh / Prof. XYZ',
    assignedFaculty: ['Dr. Raj Shaikh', 'Prof. XYZ'],
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
    faculty: 'Dr. Raj Shaikh / Prof. Ananya Roy',
    assignedFaculty: ['Dr. Raj Shaikh', 'Prof. Ananya Roy'],
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
    assignedFaculty: ['Dr. Vikram Joshi'],
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
    assignedFaculty: ['Dr. Sameer Khan'],
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
  const { role, user } = useAuth();

  // Centralized Master Stores
  const [departmentsStore, setDepartmentsStore] = useState(INITIAL_DEPARTMENTS);
  const [masterProgrammesStore, setMasterProgrammesStore] = useState(INITIAL_MASTER_PROGRAMMES_LIST);

  // Centralized Scoped Programmes according to Role
  const currentHodDepartment = departmentsStore.find(
    (d) => d.hod === user?.name || d.hodEmail === user?.email
  ) || departmentsStore[0];

  const masterProgrammes = masterProgrammesStore.filter((p) => {
    if (role === 'DIRECTOR') return true;
    if (role === 'HOD') {
      return p.departmentId === currentHodDepartment.id || p.department === currentHodDepartment.name;
    }
    if (role === 'PROGRAMME_COORDINATOR') {
      const pcProg = masterProgrammesStore.find(
        (p) => p.coordinator === user?.name || p.coordinatorEmail === user?.email
      ) || masterProgrammesStore[0];
      return p.id === pcProg.id || p.coordinator === user?.name;
    }
    return true;
  });

  // Step 1: Batch Initialization State
  const [batches, setBatches] = useState(MASTER_BATCHES);
  const [batchId, setBatchId] = useState('batch-2025-29');
  const selectedBatch = batches.find((b) => b.id === batchId) || batches[0];

  const addBatch = (newBatch) => {
    setBatches((prev) => [...prev, newBatch]);
  };

  const updateBatch = (targetBatchId, updatedFields) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === targetBatchId ? { ...b, ...updatedFields } : b))
    );
  };

  const deleteBatch = (targetBatchId) => {
    setBatches((prev) => prev.filter((b) => b.id !== targetBatchId));
  };

  const toggleBatchActiveStatus = (targetBatchId) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === targetBatchId
          ? { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : b
      )
    );
  };

  const [academicYear, setAcademicYear] = useState('2025-26');
  const availableYears = ['2024-25', '2025-26', '2026-27'];

  const availableProgrammes = masterProgrammes;

  const [programmeId, setProgrammeIdState] = useState('prog-1');

  // Step 5: Programme PO & PSO Target Levels (Set by Programme Coordinator on 1.0 - 3.0 scale)
  const [poPsoTargets, setPoPsoTargets] = useState({
    'prog-1': {
      poTargets: { PO1: 2.50, PO2: 2.50, PO3: 2.20, PO4: 2.20, PO5: 2.00, PO6: 2.00, PO7: 2.00, PO8: 2.50, PO9: 2.50, PO10: 2.50, PO11: 2.00, PO12: 2.00 },
      psoTargets: { PSO1: 2.50, PSO2: 2.20, PSO3: 2.00 },
    },
    'prog-2': {
      poTargets: { PO1: 2.50, PO2: 2.50, PO3: 2.20, PO4: 2.00 },
      psoTargets: { PSO1: 2.50, PSO2: 2.20 },
    },
    'prog-3': {
      poTargets: { PO1: 2.50, PO2: 2.50, PO3: 2.00 },
      psoTargets: { PSO1: 2.50 },
    },
  });

  const updatePoPsoTargets = (targetProgId, newPoTargets, newPsoTargets) => {
    setPoPsoTargets((prev) => ({
      ...prev,
      [targetProgId]: {
        poTargets: { ...(prev[targetProgId]?.poTargets || {}), ...newPoTargets },
        psoTargets: { ...(prev[targetProgId]?.psoTargets || {}), ...newPsoTargets },
      },
    }));
  };

  // Step 6: Course CO Target Levels (Set by Course Coordinator / Faculty on 1.0 - 3.0 scale)
  const [coTargets, setCoTargets] = useState({
    'crs-1': { 'C321.1': 2.50, 'C321.2': 2.50, 'C321.3': 2.20, 'C321.4': 2.50, 'C321.5': 2.00, 'C321.6': 2.50 },
    'crs-2': { 'CS301.1': 2.50, 'CS301.2': 2.50, 'CS301.3': 2.20, 'CS301.4': 2.00 },
    'crs-3': { 'AI201.1': 2.50, 'AI201.2': 2.50, 'AI201.3': 2.20 },
    'crs-4': { 'MBA101.1': 2.50, 'MBA101.2': 2.50 },
  });

  const updateCourseCoTargets = (targetCourseId, newCoTargets) => {
    setCoTargets((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || {}),
        ...newCoTargets,
      },
    }));
  };

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
  const defaultLevels = {
    directLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
    indirectLevels: [
      { level: 1, minPercentage: 0, maxPercentage: 50 },
      { level: 2, minPercentage: 50, maxPercentage: 70 },
      { level: 3, minPercentage: 70, maxPercentage: 100 },
    ],
  };

  const [attainmentConfigs, setAttainmentConfigs] = useState({
    'crs-1': {
      courseCode: '310244',
      courseName: 'Computer Network and Security',
      directWeight: 80,
      indirectWeight: 20,
      directWeightage: 80.00,
      indirectWeightage: 20.00,
      directThreshold: 60,
      indirectThreshold: 60.00,
      thresholdPct: '60%',
      calculationRunId: 'calc-run-202526-crs1',
      ...defaultLevels,
      status: 'VERIFIED',
      submittedBy: 'Dr. Raj Shaikh',
      submittedAt: '2026-08-05',
    },
    'crs-2': {
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      directWeight: 85,
      indirectWeight: 15,
      directWeightage: 85.00,
      indirectWeightage: 15.00,
      directThreshold: 65,
      indirectThreshold: 60.00,
      thresholdPct: '65%',
      calculationRunId: 'calc-run-202526-crs2',
      ...defaultLevels,
      status: 'SUBMITTED',
      submittedBy: 'Prof. Ananya Roy',
      submittedAt: '2026-08-06',
    },
    'crs-3': {
      courseCode: 'AI201',
      courseName: 'Machine Learning Fundamentals',
      directWeight: 80,
      indirectWeight: 20,
      directWeightage: 80.00,
      indirectWeightage: 20.00,
      directThreshold: 60,
      indirectThreshold: 60.00,
      thresholdPct: '60%',
      calculationRunId: 'calc-run-202526-crs3',
      ...defaultLevels,
      status: 'SUBMITTED',
      submittedBy: 'Dr. Vikram Joshi',
      submittedAt: '2026-08-06',
    },
    'crs-4': {
      courseCode: 'MBA101',
      courseName: 'Organizational Behavior',
      directWeight: 80,
      indirectWeight: 20,
      directThreshold: 60,
      thresholdPct: '60%',
      ...defaultLevels,
      status: 'DRAFT',
      submittedBy: 'Dr. Sameer Khan',
      submittedAt: '2026-08-07',
    },
  });

  const updateCourseAttainmentConfig = (targetCourseId, newConfig) => {
    setAttainmentConfigs((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || defaultLevels),
        ...newConfig,
        thresholdPct: `${newConfig.directThreshold || 60}%`,
      },
    }));
  };

  const poStore = poStoreByYear[academicYear] || INITIAL_PROGRAMME_OUTCOMES;
  const psoStore = psoStoreByYear[academicYear] || INITIAL_PSO_OUTCOMES;
  const coursesStore = coursesStoreByYear[academicYear] || INITIAL_COURSES;
  const yearMetrics = YEAR_ATTAINMENT_METRICS[academicYear] || YEAR_ATTAINMENT_METRICS['2025-26'];

  // Faculty Allocation Filter: If Faculty role, filter courses allocated to this faculty member
  const availableCourses = coursesStore.filter((c) => {
    if (c.programmeId !== programmeId) return false;
    if (role === 'FACULTY') {
      const facultyName = user?.name || 'Dr. Raj Shaikh';
      const assigned = c.assignedFaculty || [];
      return (
        assigned.length === 0 ||
        assigned.some(
          (f) =>
            f.toLowerCase().includes(facultyName.toLowerCase()) ||
            facultyName.toLowerCase().includes(f.toLowerCase())
        )
      );
    }
    return true;
  });

  const setProgrammeId = (newProgId) => {
    if (role === 'PROGRAMME_COORDINATOR' && newProgId !== 'prog-1') {
      return; // Lock Programme Coordinator to prog-1
    }
    setProgrammeIdState(newProgId);
    const newAvail = coursesStore.filter((c) => c.programmeId === newProgId);
    if (newAvail.length > 0) {
      setCourseId(newAvail[0].id);
    }
  };

  // Active Course ID
  const [courseId, setCourseId] = useState('crs-1');

  // Active Objects
  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || MASTER_PROGRAMMES[0];
  const selectedCourse =
    coursesStore.find((c) => c.id === courseId) ||
    availableCourses.find((c) => c.id === courseId) ||
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
  const [workflowProgressStore, setWorkflowProgressStore] = useState({
    'crs-1': { '/outcomes': true, '/co-targets': true },
  });

  const markWorkflowStepComplete = (targetCourseId, path) => {
    const cid = targetCourseId || selectedCourse?.id || 'crs-1';
    setWorkflowProgressStore((prev) => ({
      ...prev,
      [cid]: {
        ...(prev[cid] || {}),
        [path]: true,
      },
    }));
  };

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

  // Faculty Course Allocation Action by Programme Coordinator
  const updateCourseFacultyAllocation = (targetCourseId, assignedFacultyArray) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: (prev[academicYear] || []).map((c) =>
        c.id === targetCourseId
          ? {
              ...c,
              assignedFaculty: assignedFacultyArray,
              faculty: assignedFacultyArray.join(' / '),
            }
          : c
      ),
    }));
  };

  // Course-wise Verification Status Store (Two-way sync between Course Coordinator & Programme Coordinator)
  const [courseVerificationStore, setCourseVerificationStore] = useState({
    'crs-1': {
      configStatus: 'VERIFIED',
      coStatus: 'APPROVED',
      coRemarks: "All 6 Course Outcomes (C321.1 to C321.6) align with Bloom's Taxonomy action verbs and are approved for OBE attainment calculation.",
      atrStatus: 'SUBMITTED',
      verifiedBy: 'Dr. Raj Shaikh (Programme Coordinator)',
    },
    'crs-2': {
      configStatus: 'SUBMITTED',
      coStatus: 'REVISION_REQUESTED',
      coRemarks: 'Please revise CO3 statement to explicitly specify linear data structures implementation and ensure measurable action verbs.',
      atrStatus: 'DRAFT',
      verifiedBy: 'Dr. Raj Shaikh (Programme Coordinator)',
    },
    'crs-3': {
      configStatus: 'SUBMITTED',
      coStatus: 'PENDING_APPROVAL',
      coRemarks: 'Course Outcomes submitted for Programme Coordinator verification. Review in progress.',
      atrStatus: 'DRAFT',
      verifiedBy: 'Dr. Raj Shaikh (Programme Coordinator)',
    },
    'crs-4': {
      configStatus: 'DRAFT',
      coStatus: 'PENDING_APPROVAL',
      coRemarks: 'Course Outcomes draft submitted for coordinator verification.',
      atrStatus: 'DRAFT',
      verifiedBy: null,
    },
  });

  const updateCourseVerificationStatus = (targetCourseId, statusType, statusValue, remarksValue = '', verifierName = null) => {
    const remarkKey = statusType.replace('Status', 'Remarks');
    setCourseVerificationStore((prev) => ({
      ...prev,
      [targetCourseId]: {
        ...(prev[targetCourseId] || {
          configStatus: 'DRAFT',
          coStatus: 'PENDING_APPROVAL',
          atrStatus: 'DRAFT',
          programmeAtrStatus: 'DRAFT',
        }),
        [statusType]: statusValue,
        [remarkKey]: remarksValue,
        verifiedBy: verifierName || user?.name || 'Programme Coordinator',
        verifiedAt: new Date().toISOString().split('T')[0],
      },
    }));
  };

  // Course-wise Action Taken Reports (ATR Data Store filled by Course Coordinator)
  const [courseAtrStore, setCourseAtrStore] = useState({
    'crs-1': [
      { code: 'C321.1', title: 'CO1: Fundamental Concepts', target: 2.50, actual: 2.80, pctAchieved: 112.0, status: 'Target Achieved', statement: 'Interpret fundamental concepts of Computer Networks, architectures, protocols and technologies.', actions: ['Hands-on Wireshark packet capture lab demonstrations conducted.', 'Interactive quiz sessions held to reinforce OSI vs TCP/IP layer concepts.'] },
      { code: 'C321.2', title: 'CO2: Data Link Layer', target: 2.50, actual: 2.70, pctAchieved: 108.0, status: 'Target Achieved', statement: 'Demonstrate the working and functions of data link layer for flow and error control.', actions: ['CRC error detection numerical problem sheets assigned to students.'] },
      { code: 'C321.3', title: 'CO3: Routing Protocols', target: 2.50, actual: 2.10, pctAchieved: 84.0, status: 'Target Not Achieved', statement: 'Analyze the working of different routing protocols and mechanisms for transmission of data.', actions: ['Additional remedial tutorial sessions arranged for Distance Vector vs Link State routing algorithms.', 'Packet Tracer simulation lab assigned as a mandatory group assignment.'] },
      { code: 'C321.4', title: 'CO4: Client-Server Sockets', target: 2.50, actual: 2.90, pctAchieved: 116.0, status: 'Target Achieved', statement: 'Implement client-server applications using socket programming principles.', actions: ['Python TCP/UDP socket programming lab assignments submitted successfully.'] },
      { code: 'C321.5', title: 'CO5: Application Layer', target: 2.50, actual: 2.20, pctAchieved: 88.0, status: 'Target Not Achieved', statement: 'Analyze role of application layer with its protocols and client-server architectures.', actions: ['Organize live HTTP/DNS/DHCP protocol dissection workshops before mid-term exams.'] },
      { code: 'C321.6', title: 'CO6: Network Security', target: 2.50, actual: 2.75, pctAchieved: 110.0, status: 'Target Achieved', statement: 'Interpret the basics of Network Security for secured communication.', actions: ['Demonstration of SSL/TLS encryption and RSA public key cryptography.'] },
    ],
    'crs-2': [
      { code: 'CS301.1', title: 'CO1: Complexity Analysis', target: 2.50, actual: 2.60, pctAchieved: 104.0, status: 'Target Achieved', statement: 'Analyze time and space complexity of sorting and searching algorithms', actions: ['Asymptotic notation problem sets assigned in tutorials.'] },
      { code: 'CS301.2', title: 'CO2: Linear Data Structures', target: 2.50, actual: 2.40, pctAchieved: 96.0, status: 'Target Not Achieved', statement: 'Implement linear data structures (stacks, queues, linked lists)', actions: ['Extra coding lab for stack/queue implementations.'] },
      { code: 'CS301.3', title: 'CO3: Graph Algorithms', target: 2.50, actual: 2.55, pctAchieved: 102.0, status: 'Target Achieved', statement: 'Apply non-linear graph algorithms (BFS, DFS, Dijkstra)', actions: ['Graph traversal visualization tool integrated in lab sessions.'] },
      { code: 'CS301.4', title: 'CO4: Dynamic Programming', target: 2.50, actual: 2.15, pctAchieved: 86.0, status: 'Target Not Achieved', statement: 'Design dynamic programming and greedy algorithm solutions', actions: ['Mandatory coding assignments on LeetCode/HackerRank platform.'] },
    ],
    'crs-3': [
      { code: 'AI201.1', title: 'CO1: Supervised Learning', target: 2.50, actual: 2.70, pctAchieved: 108.0, status: 'Target Achieved', statement: 'Understand supervised and unsupervised learning algorithms', actions: ['Scikit-learn hands-on Jupyter notebook lab sessions held.'] },
      { code: 'AI201.2', title: 'CO2: Regression Models', target: 2.50, actual: 2.30, pctAchieved: 92.0, status: 'Target Not Achieved', statement: 'Implement linear and logistic regression models', actions: ['Remedial sessions on gradient descent mathematics.'] },
    ],
    'crs-4': [
      { code: 'MBA101.1', title: 'CO1: Organizational Dynamics', target: 2.50, actual: 2.65, pctAchieved: 106.0, status: 'Target Achieved', statement: 'Analyze individual and group dynamics in corporate organizations', actions: ['Corporate case study analysis assignments presented by student teams.'] },
    ],
  });

  const updateCourseAtrData = (targetCourseId, newAtrList) => {
    setCourseAtrStore((prev) => ({
      ...prev,
      [targetCourseId]: newAtrList,
    }));
  };

  // Centralized Director Data State Stores & Action Handlers
  const [schoolsStore, setSchoolsStore] = useState(INITIAL_SCHOOLS);
  const [selectedSchoolId, setSelectedSchoolId] = useState('sch-1');
  const selectedSchool = schoolsStore.find((s) => s.id === selectedSchoolId) || schoolsStore[0];

  const updateSchoolInfo = (schoolId, updatedFields) => {
    setSchoolsStore((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, ...updatedFields } : s))
    );
  };

  const addDepartment = (newDept) => {
    setDepartmentsStore((prev) => [...prev, newDept]);
  };

  const updateDepartment = (deptId, updatedFields) => {
    setDepartmentsStore((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, ...updatedFields } : d))
    );
  };

  const deleteDepartment = (deptId) => {
    setDepartmentsStore((prev) => prev.filter((d) => d.id !== deptId));
  };

  const addProgramme = (newProg) => {
    const formattedProg = {
      ...newProg,
      coordinator: newProg.coordinator && newProg.coordinator !== 'Pending HOD Assignment' ? newProg.coordinator : 'No coordinator assigned yet',
    };
    setMasterProgrammesStore((prev) => [...prev, formattedProg]);
  };

  const updateProgramme = (progId, updatedFields) => {
    setMasterProgrammesStore((prev) =>
      prev.map((p) => (p.id === progId ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProgramme = (progId) => {
    setMasterProgrammesStore((prev) => prev.filter((p) => p.id !== progId));
  };

  const [directorApprovalsStore, setDirectorApprovalsStore] = useState(INITIAL_DIRECTOR_APPROVALS_LIST);

  const approveDirectorSubmission = (appId, directorName) => {
    setDirectorApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: directorName || 'School Director',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
  };

  const rejectDirectorSubmission = (appId, remarks) => {
    setDirectorApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEEDS_REVISION',
              remarks: remarks || 'Review and resubmit.',
            }
          : a
      )
    );
  };

  // Centralized HOD Data State Stores & Action Handlers
  const [peoStoreByYear, setPeoStoreByYear] = useState({
    '2024-25': INITIAL_PEO_OUTCOMES,
    '2025-26': INITIAL_PEO_OUTCOMES,
    '2026-27': INITIAL_PEO_OUTCOMES,
  });

  const activePEOs = (peoStoreByYear[academicYear] || {})[programmeId] || INITIAL_PEO_OUTCOMES['prog-1'];

  const updateProgrammePEOs = (targetProgId, newPeos) => {
    setPeoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...(prev[academicYear] || {}),
        [targetProgId]: newPeos,
      },
    }));
  };

  const [hodApprovalsStore, setHodApprovalsStore] = useState(INITIAL_HOD_APPROVALS_LIST);

  const approveHodSubmission = (appId, hodName) => {
    setHodApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: hodName || 'Head of Department (HOD)',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
  };

  const rejectHodSubmission = (appId, remarks) => {
    setHodApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEEDS_REVISION',
              remarks: remarks || 'Review and resubmit.',
            }
          : a
      )
    );
  };

  const assignCourseCoordinator = (targetCourseId, facultyName) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: (prev[academicYear] || []).map((c) =>
        c.id === targetCourseId
          ? {
              ...c,
              coordinator: facultyName,
              faculty: facultyName,
            }
          : c
      ),
    }));
  };

  const addCourse = (newCourse) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: [...(prev[academicYear] || INITIAL_COURSES), newCourse],
    }));
  };

  const updateCourse = (targetCourseId, updatedFields) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: (prev[academicYear] || []).map((c) =>
        c.id === targetCourseId ? { ...c, ...updatedFields } : c
      ),
    }));
  };

  const deleteCourse = (targetCourseId) => {
    setCoursesStoreByYear((prev) => ({
      ...prev,
      [academicYear]: (prev[academicYear] || []).filter((c) => c.id !== targetCourseId),
    }));
  };

  const [programmeAtrStore, setProgrammeAtrStore] = useState(INITIAL_PROGRAMME_ATR_LIST);

  const approveProgrammeAtr = (targetProgId, hodName) => {
    setProgrammeAtrStore((prev) => ({
      ...prev,
      [targetProgId]: {
        ...(prev[targetProgId] || INITIAL_PROGRAMME_ATR_LIST['prog-1']),
        status: 'APPROVED',
        approvedBy: hodName || 'Head of Department (HOD)',
        approvedAt: new Date().toISOString().split('T')[0],
      },
    }));
  };

  const updateProgrammeAtrObservations = (targetProgId, newObservations) => {
    setProgrammeAtrStore((prev) => ({
      ...prev,
      [targetProgId]: {
        ...(prev[targetProgId] || INITIAL_PROGRAMME_ATR_LIST['prog-1']),
        observations: newObservations,
      },
    }));
  };
  // ── Centralized Batch Students Store & APIs ──────────────────────
  const [batchStudentsStore, setBatchStudentsStore] = useState({
    'batch-comp-2025-29': [
      { id: 'std-1', prn: '1032250101', name: 'Aarav Sharma', email: 'aarav.sharma@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-2', prn: '1032250102', name: 'Ananya Deshmukh', email: 'ananya.d@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-3', prn: '1032250103', name: 'Rohan Patel', email: 'rohan.patel@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-4', prn: '1032250104', name: 'Sneha Kulkarni', email: 'sneha.k@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-5', prn: '1032250105', name: 'Aditya Verma', email: 'aditya.v@dypiu.edu.in', status: 'ENROLLED' },
    ],
    'batch-ai-2025-29': [
      { id: 'std-10', prn: '1032250201', name: 'Priya Joshi', email: 'priya.j@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-11', prn: '1032250202', name: 'Vikram Singh', email: 'vikram.s@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-12', prn: '1032250203', name: 'Neha Kapoor', email: 'neha.k@dypiu.edu.in', status: 'ENROLLED' },
    ],
  });

  const getStudentsByBatch = (targetBatchId) => {
    return batchStudentsStore[targetBatchId] || [
      { id: 'std-1', prn: '1032250101', name: 'Aarav Sharma', email: 'aarav.sharma@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-2', prn: '1032250102', name: 'Ananya Deshmukh', email: 'ananya.d@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-3', prn: '1032250103', name: 'Rohan Patel', email: 'rohan.patel@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-4', prn: '1032250104', name: 'Sneha Kulkarni', email: 'sneha.k@dypiu.edu.in', status: 'ENROLLED' },
      { id: 'std-5', prn: '1032250105', name: 'Aditya Verma', email: 'aditya.v@dypiu.edu.in', status: 'ENROLLED' },
    ];
  };

  const addStudentToBatch = (targetBatchId, studentData) => {
    const newStudent = {
      id: `std-${Date.now()}`,
      prn: studentData.prn || `1032250${Math.floor(100 + Math.random() * 900)}`,
      name: studentData.name || 'New Student',
      email: studentData.email || `${(studentData.name || 'student').toLowerCase().replace(/\s+/g, '.')}@dypiu.edu.in`,
      status: 'ENROLLED',
    };
    setBatchStudentsStore((prev) => ({
      ...prev,
      [targetBatchId]: [...(prev[targetBatchId] || []), newStudent],
    }));
  };

  const updateStudentInBatch = (targetBatchId, studentId, updatedFields) => {
    setBatchStudentsStore((prev) => ({
      ...prev,
      [targetBatchId]: (prev[targetBatchId] || []).map((s) => (s.id === studentId ? { ...s, ...updatedFields } : s)),
    }));
  };

  const deleteStudentFromBatch = (targetBatchId, studentId) => {
    setBatchStudentsStore((prev) => ({
      ...prev,
      [targetBatchId]: (prev[targetBatchId] || []).filter((s) => s.id !== studentId),
    }));
  };

  return (
    <AcademicContext.Provider
      value={{
        batches,
        batchId,
        setBatchId,
        selectedBatch,
        addBatch,
        updateBatch,
        deleteBatch,
        toggleBatchActiveStatus,
        academicYear,
        setAcademicYear,
        availableYears,
        yearMetrics,
        programmes: availableProgrammes,
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
        poPsoTargets,
        updatePoPsoTargets,
        coTargets,
        updateCourseCoTargets,
        updateCourseAttainmentConfig,
        updateProgrammePOs,
        updateProgrammePSOs,
        updateCourseCOs,
        updateCourseFacultyAllocation,
        courseVerificationStore,
        updateCourseVerificationStatus,
        courseAtrStore,
        updateCourseAtrData,
        // Centralized Director Data Stores & APIs
        schools: schoolsStore,
        selectedSchool,
        setSelectedSchoolId,
        updateSchoolInfo,
        departments: departmentsStore,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        masterProgrammes,
        allMasterProgrammes: masterProgrammesStore,
        addProgramme,
        updateProgramme,
        deleteProgramme,
        directorApprovals: directorApprovalsStore,
        approveDirectorSubmission,
        rejectDirectorSubmission,
        // Centralized HOD Data Stores & APIs
        activePEOs,
        updateProgrammePEOs,
        hodApprovals: hodApprovalsStore,
        approveHodSubmission,
        rejectHodSubmission,
        assignCourseCoordinator,
        addCourse,
        updateCourse,
        deleteCourse,
        programmeAtrStore,
        approveProgrammeAtr,
        updateProgrammeAtrObservations,
        workflowProgressStore,
        markWorkflowStepComplete,
        // Batch Students Store & APIs
        batchStudentsStore,
        getStudentsByBatch,
        addStudentToBatch,
        updateStudentInBatch,
        deleteStudentFromBatch,
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
