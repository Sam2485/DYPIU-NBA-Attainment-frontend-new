import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import apiClient from '../api/client';

export const AcademicContext = createContext(null);

// Master Batches
export const MASTER_BATCHES = [
  { id: 'batch-comp-2025-29', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2025-29 (BE-COMP) — AY 2025-26 to 2028-29', startYear: '2025-26', endYear: '2028-29', yearLevel: 'Year 1 (Freshmen)', status: 'ACTIVE' },
  { id: 'batch-comp-2024-28', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2024-28 (BE-COMP) — AY 2024-25 to 2027-28', startYear: '2024-25', endYear: '2027-28', yearLevel: 'Year 2 (Sophomores)', status: 'ACTIVE' },
  { id: 'batch-comp-2023-27', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2023-27 (BE-COMP) — AY 2023-24 to 2026-27', startYear: '2023-24', endYear: '2026-27', yearLevel: 'Year 3 (Juniors)', status: 'ACTIVE' },
  { id: 'batch-comp-2022-26', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2022-26 (BE-COMP) — AY 2022-23 to 2025-26', startYear: '2022-23', endYear: '2025-26', yearLevel: 'Year 4 (Seniors / Final Year)', status: 'ACTIVE' },
  { id: 'batch-comp-2026-30', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2026-30 (BE-COMP) — AY 2026-27 to 2029-30', startYear: '2026-27', endYear: '2029-30', yearLevel: 'Upcoming Batch', status: 'INITIALIZED' },
  { id: 'batch-comp-2021-25', programmeId: 'prog-1', programmeCode: 'BE-COMP', programmeName: 'B.Tech Computer Science & Engineering', durationYears: 4, name: 'Batch 2021-25 (BE-COMP) — AY 2021-22 to 2024-25', startYear: '2021-22', endYear: '2024-25', yearLevel: 'Graduated Alumni', status: 'GRADUATED' },
  { id: 'batch-mba-2025-27', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2025-27 (MBA) — AY 2025-26 to 2026-27', startYear: '2025-26', endYear: '2026-27', yearLevel: 'Year 1 (Junior Batch)', status: 'ACTIVE' },
  { id: 'batch-mba-2024-26', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2024-26 (MBA) — AY 2024-25 to 2025-26', startYear: '2024-25', endYear: '2025-26', yearLevel: 'Year 2 (Senior Batch)', status: 'ACTIVE' },
  { id: 'batch-mba-2026-28', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2026-28 (MBA) — AY 2026-27 to 2027-28', startYear: '2026-27', endYear: '2027-28', yearLevel: 'Upcoming Batch', status: 'INITIALIZED' },
  { id: 'batch-mba-2023-25', programmeId: 'prog-3', programmeCode: 'MBA', programmeName: 'Master of Business Administration', durationYears: 2, name: 'Batch 2023-25 (MBA) — AY 2023-24 to 2024-25', startYear: '2023-24', endYear: '2024-25', yearLevel: 'Graduated Alumni', status: 'GRADUATED' },
];

export const INITIAL_SCHOOLS = [
  { id: 'sch-1', code: 'SET', name: 'School of Engineering & Technology', dean: 'Dr. R. K. Deshmukh', estYear: '2019', email: 'set.director@dypiu.ac.in' },
  { id: 'sch-2', code: 'SOM', name: 'School of Management Studies', dean: 'Dr. P. S. Mehta', estYear: '2020', email: 'som.director@dypiu.ac.in' },
];

export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', schoolId: 'sch-1', code: 'CSE', name: 'Department of Computer Science & Engineering', hod: 'Dr. Raj Shaikh', hodEmail: 'raj.shaikh@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-2', schoolId: 'sch-1', code: 'ENTC', name: 'Department of Electronics & Telecommunication', hod: 'Prof. Ananya Roy', hodEmail: 'ananya.roy@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-3', schoolId: 'sch-1', code: 'IT', name: 'Department of Information Technology', hod: 'Dr. Vikram Joshi', hodEmail: 'vikram.joshi@dypiu.ac.in', status: 'ACTIVE' },
  { id: 'dept-4', schoolId: 'sch-2', code: 'MGMT', name: 'Department of Management Studies', hod: 'Dr. Sameer Khan', hodEmail: 'sameer.khan@dypiu.ac.in', status: 'ACTIVE' },
];

export const INITIAL_MASTER_PROGRAMMES_LIST = [
  { id: 'prog-1', departmentId: 'dept-1', code: 'BE-COMP', name: 'B.Tech Computer Science & Engineering', durationYears: 4, department: 'Department of Computer Science & Engineering', coordinator: 'Dr. A. K. Sharma', status: 'ACTIVE' },
  { id: 'prog-2', departmentId: 'dept-1', code: 'BE-AI', name: 'B.Tech AI & Data Science', durationYears: 4, department: 'Department of Computer Science & Engineering', coordinator: 'Prof. R. V. Patel', status: 'ACTIVE' },
  { id: 'prog-3', departmentId: 'dept-4', code: 'MBA', name: 'Master of Business Administration', durationYears: 2, department: 'Department of Management Studies', coordinator: 'Dr. S. N. Deshmukh', status: 'ACTIVE' },
  { id: 'prog-4', departmentId: 'dept-2', code: 'BE-ENTC', name: 'B.Tech Electronics & Telecommunication', durationYears: 4, department: 'Department of Electronics & Telecommunication', coordinator: 'Prof. Ananya Roy', status: 'ACTIVE' },
  { id: 'prog-5', departmentId: 'dept-1', code: 'ME-COMP', name: 'M.Tech Computer Science & Engineering', durationYears: 2, department: 'Department of Computer Science & Engineering', coordinator: 'Dr. Vikram Joshi', status: 'ACTIVE' },
];

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

export function AcademicProvider({ children }) {
  const { role, user } = useAuth();

  // Master Stores
  const [departmentsStore, setDepartmentsStore] = useState(INITIAL_DEPARTMENTS);
  const [masterProgrammesStore, setMasterProgrammesStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_master_programmes');
      return saved ? JSON.parse(saved) : INITIAL_MASTER_PROGRAMMES_LIST;
    } catch {
      return INITIAL_MASTER_PROGRAMMES_LIST;
    }
  });
  const [schoolsStore, setSchoolsStore] = useState(INITIAL_SCHOOLS);
  const [selectedSchoolId, setSelectedSchoolId] = useState('sch-1');
  const selectedSchool = schoolsStore.find((s) => s.id === selectedSchoolId) || schoolsStore[0];

  const currentHodDepartment = departmentsStore.find(
    (d) => d.hod === user?.name || d.hodEmail === user?.email
  ) || departmentsStore[0];

  const masterProgrammes = masterProgrammesStore.filter((p) => {
    if (role === 'DIRECTOR') return true;
    if (role === 'HOD') {
      return p.departmentId === currentHodDepartment?.id || p.department === currentHodDepartment?.name;
    }
    if (role === 'PROGRAMME_COORDINATOR') {
      const pcProg = masterProgrammesStore.find(
        (p) => p.coordinator === user?.name || p.coordinatorEmail === user?.email
      ) || masterProgrammesStore[0];
      return p.id === pcProg.id || p.coordinator === user?.name;
    }
    return true;
  });

  // Batches
  const [batches, setBatches] = useState(MASTER_BATCHES);
  const [batchId, setBatchId] = useState('batch-comp-2025-29');
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

  // Academic Year
  const [academicYear, setAcademicYear] = useState('2025-26');
  const availableYears = ['2024-25', '2025-26', '2026-27'];
  const [programmeId, setProgrammeIdState] = useState('prog-1');

  // PO & PSO Targets
  const [poPsoTargets, setPoPsoTargets] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_po_pso_targets');
      return saved ? JSON.parse(saved) : {
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
      };
    } catch {
      return {
        'prog-1': {
          poTargets: { PO1: 2.50, PO2: 2.50, PO3: 2.20, PO4: 2.20, PO5: 2.00, PO6: 2.00, PO7: 2.00, PO8: 2.50, PO9: 2.50, PO10: 2.50, PO11: 2.00, PO12: 2.00 },
          psoTargets: { PSO1: 2.50, PSO2: 2.20, PSO3: 2.00 },
        },
      };
    }
  });

  const updatePoPsoTargets = (targetProgId, newPoTargets, newPsoTargets) => {
    setPoPsoTargets((prev) => {
      const updated = {
        ...prev,
        [targetProgId]: {
          poTargets: { ...(prev[targetProgId]?.poTargets || {}), ...newPoTargets },
          psoTargets: { ...(prev[targetProgId]?.psoTargets || {}), ...newPsoTargets },
        },
      };
      try { localStorage.setItem('dypiu_po_pso_targets', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // Course CO Targets
  const [coTargets, setCoTargets] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_co_targets');
      return saved ? JSON.parse(saved) : {
        'crs-1': { 'C321.1': 2.50, 'C321.2': 2.50, 'C321.3': 2.20, 'C321.4': 2.50, 'C321.5': 2.00, 'C321.6': 2.50 },
        'crs-2': { 'CS301.1': 2.50, 'CS301.2': 2.50, 'CS301.3': 2.20, 'CS301.4': 2.00 },
        'crs-3': { 'AI201.1': 2.50, 'AI201.2': 2.50, 'AI201.3': 2.20 },
        'crs-4': { 'MBA101.1': 2.50, 'MBA101.2': 2.50 },
      };
    } catch {
      return {
        'crs-1': { 'C321.1': 2.50, 'C321.2': 2.50, 'C321.3': 2.20, 'C321.4': 2.50, 'C321.5': 2.00, 'C321.6': 2.50 },
      };
    }
  });

  const updateCourseCoTargets = (targetCourseId, newCoTargets) => {
    setCoTargets((prev) => {
      const updated = {
        ...prev,
        [targetCourseId]: {
          ...(prev[targetCourseId] || {}),
          ...newCoTargets,
        },
      };
      try { localStorage.setItem('dypiu_co_targets', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // Year-keyed stores
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

  const [peoStoreByYear, setPeoStoreByYear] = useState({
    '2024-25': INITIAL_PEO_OUTCOMES,
    '2025-26': INITIAL_PEO_OUTCOMES,
    '2026-27': INITIAL_PEO_OUTCOMES,
  });

  const [coursesStoreByYear, setCoursesStoreByYear] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_courses_by_year');
      return saved ? JSON.parse(saved) : {
        '2024-25': INITIAL_COURSES,
        '2025-26': INITIAL_COURSES,
        '2026-27': INITIAL_COURSES,
      };
    } catch {
      return {
        '2024-25': INITIAL_COURSES,
        '2025-26': INITIAL_COURSES,
        '2026-27': INITIAL_COURSES,
      };
    }
  });

  // Cross-tab synchronization via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'dypiu_courses_by_year' && e.newValue) {
          setCoursesStoreByYear(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_master_programmes' && e.newValue) {
          setMasterProgrammesStore(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_po_pso_targets' && e.newValue) {
          setPoPsoTargets(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_co_targets' && e.newValue) {
          setCoTargets(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error in AcademicContext:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real Backend Data Loader
  useEffect(() => {
    let isMounted = true;
    const loadBackendAcademicData = async () => {
      try {
        const [schoolsRes, deptsRes, progsRes, batchesRes, coursesRes] = await Promise.allSettled([
          apiClient.get('/academic/schools'),
          apiClient.get('/academic/departments'),
          apiClient.get('/academic/programmes'),
          apiClient.get('/academic/batches'),
          apiClient.get('/academic/courses'),
        ]);

        if (!isMounted) return;

        if (schoolsRes.status === 'fulfilled' && schoolsRes.value) {
          const list = schoolsRes.value?.data || schoolsRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((s) => ({
              id: s.id,
              code: s.code,
              name: s.name,
              dean: s.directorName || s.director || 'Dr. R. K. Deshmukh',
              director: s.directorName || s.director || 'Dr. R. K. Deshmukh',
              directorEmail: s.directorEmail || s.email,
              estYear: s.estYear || '2019',
              email: s.directorEmail || s.email || 'director@dypiu.ac.in',
            }));
            setSchoolsStore(mapped);
            if (!mapped.some((s) => s.id === selectedSchoolId)) {
              setSelectedSchoolId(mapped[0].id);
            }
          }
        }

        if (deptsRes.status === 'fulfilled' && deptsRes.value) {
          const list = deptsRes.value?.data || deptsRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((d) => ({
              id: d.id,
              schoolId: d.schoolId || 'sch-1',
              code: d.code,
              name: d.name,
              hod: d.hod || 'Dr. Raj Shaikh',
              hodEmail: d.hodEmail || 'hod@gmail.com',
              status: d.status || 'ACTIVE',
            }));
            setDepartmentsStore(mapped);
          }
        }

        if (progsRes.status === 'fulfilled' && progsRes.value) {
          const list = progsRes.value?.data || progsRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((p) => ({
              id: p.id,
              departmentId: p.departmentId || 'dept-1',
              code: p.code,
              name: p.name,
              durationYears: p.durationYears || 4,
              department: p.departmentName || p.department || 'Department of Computer Science & Engineering',
              coordinator: p.coordinator || 'Dr. A. K. Sharma',
              coordinatorEmail: p.coordinatorEmail || 'pc@gmail.com',
              status: p.status || 'ACTIVE',
            }));
            setMasterProgrammesStore(mapped);
          }
        }

        if (batchesRes.status === 'fulfilled' && batchesRes.value) {
          const list = batchesRes.value?.data || batchesRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((b) => ({
              id: b.id,
              programmeId: b.programmeId || 'prog-1',
              programmeCode: b.programmeCode || 'BE-COMP',
              programmeName: b.programmeName || 'B.Tech Computer Science & Engineering',
              durationYears: b.durationYears || 4,
              name: b.name || `Batch ${b.startYear || '2025'}-${b.endYear || '29'}`,
              startYear: b.startYear || '2025-26',
              endYear: b.endYear || '2028-29',
              yearLevel: b.yearLevel || b.currentYear || 'Year 1 (Freshmen)',
              status: b.status || 'ACTIVE',
            }));
            setBatches(mapped);
          }
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value) {
          const list = coursesRes.value?.data || coursesRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((c) => ({
              id: c.id,
              code: c.code,
              name: c.name,
              programmeId: c.programmeId || 'prog-1',
              semester: c.semester || 'Sem I',
              faculty: c.coordinatorName || c.faculty || 'Dr. Raj Shaikh',
              assignedFaculty: c.assignedFaculty || (c.coordinatorName ? [c.coordinatorName] : ['Dr. Raj Shaikh']),
              coordinator: c.coordinatorName || c.coordinator || 'Dr. Raj Shaikh',
              courseOutcomes: c.courseOutcomes || [],
            }));
            setCoursesStoreByYear((prev) => ({
              ...prev,
              [academicYear]: mapped,
            }));
          }
        }
      } catch (err) {
        console.warn('Backend initial academic data load warning:', err);
      }
    };

    loadBackendAcademicData();
    return () => { isMounted = false; };
  }, [academicYear]);

  // Load Outcomes for selected programme
  useEffect(() => {
    if (!programmeId) return;
    let isMounted = true;
    const loadOutcomes = async () => {
      try {
        const [posRes, psosRes, peosRes, targetsRes] = await Promise.allSettled([
          apiClient.get(`/outcomes/programmes/${programmeId}/pos`),
          apiClient.get(`/outcomes/programmes/${programmeId}/psos`),
          apiClient.get(`/outcomes/programmes/${programmeId}/peos`),
          apiClient.get(`/outcomes/programmes/${programmeId}/targets`),
        ]);

        if (!isMounted) return;

        if (posRes.status === 'fulfilled' && posRes.value) {
          const pos = posRes.value?.data || posRes.value;
          if (Array.isArray(pos) && pos.length > 0) {
            setPoStoreByYear((prev) => ({
              ...prev,
              [academicYear]: {
                ...(prev[academicYear] || {}),
                [programmeId]: pos,
              },
            }));
          }
        }

        if (psosRes.status === 'fulfilled' && psosRes.value) {
          const psos = psosRes.value?.data || psosRes.value;
          if (Array.isArray(psos) && psos.length > 0) {
            setPsoStoreByYear((prev) => ({
              ...prev,
              [academicYear]: {
                ...(prev[academicYear] || {}),
                [programmeId]: psos,
              },
            }));
          }
        }

        if (peosRes.status === 'fulfilled' && peosRes.value) {
          const peos = peosRes.value?.data || peosRes.value;
          if (Array.isArray(peos) && peos.length > 0) {
            setPeoStoreByYear((prev) => ({
              ...prev,
              [academicYear]: {
                ...(prev[academicYear] || {}),
                [programmeId]: peos,
              },
            }));
          }
        }

        if (targetsRes.status === 'fulfilled' && targetsRes.value) {
          const tg = targetsRes.value?.data || targetsRes.value;
          if (tg && (tg.poTargets || tg.psoTargets)) {
            setPoPsoTargets((prev) => ({
              ...prev,
              [programmeId]: {
                poTargets: tg.poTargets || prev[programmeId]?.poTargets || {},
                psoTargets: tg.psoTargets || prev[programmeId]?.psoTargets || {},
              },
            }));
          }
        }
      } catch (err) {
        console.warn('Backend load outcomes warning:', err);
      }
    };

    loadOutcomes();
    return () => { isMounted = false; };
  }, [programmeId, academicYear]);

  // Load Course Outcomes for selected course
  useEffect(() => {
    const currentCid = selectedCourse?.id || courseId;
    if (!currentCid) return;
    let isMounted = true;
    const loadCos = async () => {
      try {
        const res = await apiClient.get(`/outcomes/courses/${currentCid}/cos`);
        if (!isMounted) return;
        const cos = res?.data || res;
        if (Array.isArray(cos) && cos.length > 0) {
          setCoursesStoreByYear((prev) => ({
            ...prev,
            [academicYear]: (prev[academicYear] || []).map((c) =>
              c.id === currentCid ? { ...c, courseOutcomes: cos } : c
            ),
          }));
        }
      } catch (err) {
        // quiet fallback
      }
    };
    loadCos();
    return () => { isMounted = false; };
  }, [courseId, selectedCourse?.id, academicYear]);

  const poStore = poStoreByYear[academicYear] || INITIAL_PROGRAMME_OUTCOMES;
  const psoStore = psoStoreByYear[academicYear] || INITIAL_PSO_OUTCOMES;
  const coursesStore = coursesStoreByYear[academicYear] || INITIAL_COURSES;
  const activePEOs = (peoStoreByYear[academicYear] || {})[programmeId] || INITIAL_PEO_OUTCOMES['prog-1'];

  // Course Filter
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

  const [courseId, setCourseId] = useState('crs-1');

  const setProgrammeId = (newProgId) => {
    if (role === 'PROGRAMME_COORDINATOR' && newProgId !== 'prog-1') {
      return;
    }
    setProgrammeIdState(newProgId);
    const newAvail = coursesStore.filter((c) => c.programmeId === newProgId);
    if (newAvail.length > 0) {
      setCourseId(newAvail[0].id);
    }
  };

  const selectedProgramme =
    masterProgrammes.find((p) => p.id === programmeId) || masterProgrammes[0] || MASTER_PROGRAMMES[0];
  const selectedCourse =
    coursesStore.find((c) => c.id === courseId) ||
    availableCourses.find((c) => c.id === courseId) ||
    availableCourses[0] ||
    coursesStore[0];

  const activePOs = poStore[programmeId] || [];
  const activePSOs = psoStore[programmeId] || [];
  const activeCOs = selectedCourse ? selectedCourse.courseOutcomes || [] : [];

  // Update handlers
  const updateSchoolInfo = async (schoolId, updatedFields) => {
    setSchoolsStore((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, ...updatedFields } : s))
    );
    try {
      await apiClient.put(`/academic/schools/${schoolId}`, updatedFields);
    } catch (err) {
      console.warn('Backend update school warning:', err);
    }
  };

  const addDepartment = async (newDept) => {
    setDepartmentsStore((prev) => [...prev, newDept]);
    try {
      const payload = {
        id: newDept.id || `dept-${Date.now()}`,
        schoolId: newDept.schoolId || selectedSchoolId,
        code: newDept.code,
        name: newDept.name,
        hod: newDept.hod,
        hodEmail: newDept.hodEmail,
        status: newDept.status || 'ACTIVE',
      };
      await apiClient.post('/academic/departments', payload);
    } catch (err) {
      console.warn('Backend add department warning:', err);
    }
  };

  const updateDepartment = async (deptId, updatedFields) => {
    setDepartmentsStore((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, ...updatedFields } : d))
    );
    try {
      await apiClient.put(`/academic/departments/${deptId}`, updatedFields);
    } catch (err) {
      console.warn('Backend update department warning:', err);
    }
  };

  const deleteDepartment = async (deptId) => {
    setDepartmentsStore((prev) => prev.filter((d) => d.id !== deptId));
    try {
      await apiClient.delete(`/academic/departments/${deptId}`);
    } catch (err) {
      console.warn('Backend delete department warning:', err);
    }
  };

  const addProgramme = async (newProg) => {
    const formattedProg = {
      ...newProg,
      coordinator: newProg.coordinator && newProg.coordinator !== 'Pending HOD Assignment' ? newProg.coordinator : 'No coordinator assigned yet',
    };
    setMasterProgrammesStore((prev) => {
      const updated = [...prev, formattedProg];
      try { localStorage.setItem('dypiu_master_programmes', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      const payload = {
        id: newProg.id || `prog-${Date.now()}`,
        departmentId: newProg.departmentId || departmentsStore[0]?.id || 'dept-1',
        code: newProg.code,
        name: newProg.name,
        durationYears: parseInt(newProg.durationYears || 4, 10),
        coordinator: newProg.coordinator,
        coordinatorEmail: newProg.coordinatorEmail,
        status: newProg.status || 'ACTIVE',
      };
      await apiClient.post('/academic/programmes', payload);
    } catch (err) {
      console.warn('Backend add programme warning:', err);
    }
  };

  const updateProgramme = async (progId, updatedFields) => {
    setMasterProgrammesStore((prev) => {
      const updated = prev.map((p) => (p.id === progId ? { ...p, ...updatedFields } : p));
      try { localStorage.setItem('dypiu_master_programmes', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.put(`/academic/programmes/${progId}`, updatedFields);
    } catch (err) {
      console.warn('Backend update programme warning:', err);
    }
  };

  const deleteProgramme = async (progId) => {
    setMasterProgrammesStore((prev) => {
      const updated = prev.filter((p) => p.id !== progId);
      try { localStorage.setItem('dypiu_master_programmes', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.delete(`/academic/programmes/${progId}`);
    } catch (err) {
      console.warn('Backend delete programme warning:', err);
    }
  };

  const updateProgrammePOs = async (progId, newPOs) => {
    setPoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...prev[academicYear],
        [progId]: newPOs,
      },
    }));
    try {
      await apiClient.post(`/outcomes/programmes/${progId}/pos`, newPOs);
    } catch (err) {
      console.warn('Backend update POs warning:', err);
    }
  };

  const updateProgrammePSOs = async (progId, newPSOs) => {
    setPsoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...prev[academicYear],
        [progId]: newPSOs,
      },
    }));
    try {
      await apiClient.post(`/outcomes/programmes/${progId}/psos`, newPSOs);
    } catch (err) {
      console.warn('Backend update PSOs warning:', err);
    }
  };

  const updateProgrammePEOs = async (targetProgId, newPeos) => {
    setPeoStoreByYear((prev) => ({
      ...prev,
      [academicYear]: {
        ...(prev[academicYear] || {}),
        [targetProgId]: newPeos,
      },
    }));
    try {
      await apiClient.post(`/outcomes/programmes/${targetProgId}/peos`, newPeos);
    } catch (err) {
      console.warn('Backend update PEOs warning:', err);
    }
  };

  const updateCourseCOs = async (targetCourseId, newCOs) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
        ...prev,
        [academicYear]: (prev[academicYear] || []).map((c) =>
          c.id === targetCourseId ? { ...c, courseOutcomes: newCOs } : c
        ),
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.post(`/outcomes/courses/${targetCourseId}/cos`, newCOs);
    } catch (err) {
      console.warn('Backend update COs warning:', err);
    }
  };

  const updateCourseFacultyAllocation = async (targetCourseId, assignedFacultyArray) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
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
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.put(`/academic/courses/${targetCourseId}`, {
        coordinatorName: assignedFacultyArray.join(' / '),
        faculty: assignedFacultyArray.join(' / '),
      });
    } catch (err) {
      console.warn('Backend update faculty allocation warning:', err);
    }
  };

  const assignCourseCoordinator = async (targetCourseId, facultyName) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
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
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.put(`/academic/courses/${targetCourseId}`, {
        coordinatorName: facultyName,
        coordinator: facultyName,
      });
    } catch (err) {
      console.warn('Backend assign coordinator warning:', err);
    }
  };

  const addCourse = async (newCourse) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
        ...prev,
        [academicYear]: [...(prev[academicYear] || INITIAL_COURSES), newCourse],
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      const payload = {
        id: newCourse.id || `crs-${Date.now()}`,
        code: newCourse.code,
        name: newCourse.name,
        programmeId: newCourse.programmeId || programmeId,
        semester: newCourse.semester || 'Sem I',
        status: 'ACTIVE',
      };
      await apiClient.post('/academic/courses', payload);
    } catch (err) {
      console.warn('Backend add course warning:', err);
    }
  };

  const updateCourse = async (targetCourseId, updatedFields) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
        ...prev,
        [academicYear]: (prev[academicYear] || []).map((c) =>
          c.id === targetCourseId ? { ...c, ...updatedFields } : c
        ),
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.put(`/academic/courses/${targetCourseId}`, updatedFields);
    } catch (err) {
      console.warn('Backend update course warning:', err);
    }
  };

  const deleteCourse = async (targetCourseId) => {
    setCoursesStoreByYear((prev) => {
      const updated = {
        ...prev,
        [academicYear]: (prev[academicYear] || []).filter((c) => c.id !== targetCourseId),
      };
      try { localStorage.setItem('dypiu_courses_by_year', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await apiClient.delete(`/academic/courses/${targetCourseId}`);
    } catch (err) {
      console.warn('Backend delete course warning:', err);
    }
  };

  // Batch Students Store
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
        // Schools & Departments
        schools: schoolsStore,
        selectedSchool,
        setSelectedSchoolId,
        updateSchoolInfo,
        departments: departmentsStore,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        // Programmes
        masterProgrammes,
        allMasterProgrammes: masterProgrammesStore,
        programmes: masterProgrammes,
        programmeId,
        selectedProgramme,
        setProgrammeId,
        addProgramme,
        updateProgramme,
        deleteProgramme,
        // Batches
        batches,
        batchId,
        setBatchId,
        selectedBatch,
        addBatch,
        updateBatch,
        deleteBatch,
        toggleBatchActiveStatus,
        // Academic Years
        academicYear,
        setAcademicYear,
        availableYears,
        // Courses
        courses: coursesStore,
        availableCourses,
        courseId: selectedCourse ? selectedCourse.id : 'crs-1',
        selectedCourse,
        setCourseId,
        addCourse,
        updateCourse,
        deleteCourse,
        assignCourseCoordinator,
        updateCourseFacultyAllocation,
        updateCourseCOs,
        // Outcomes & Targets
        activePOs,
        activePSOs,
        activeCOs,
        activePEOs,
        poPsoTargets,
        updatePoPsoTargets,
        coTargets,
        updateCourseCoTargets,
        updateProgrammePOs,
        updateProgrammePSOs,
        updateProgrammePEOs,
        // Students
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
