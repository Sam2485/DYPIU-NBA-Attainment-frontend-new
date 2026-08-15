import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const AcademicContext = createContext(null);

// Master Batches
export const MASTER_BATCHES = [];

// Master Faculty Members Roster
export const MASTER_FACULTY_LIST = [];

// Centralized Master Schools Database
export const INITIAL_SCHOOLS = [];

// Centralized Master Departments Database
export const INITIAL_DEPARTMENTS = [];

// Centralized Master Programmes Database (Director sets Programme Duration in Years)
export const INITIAL_MASTER_PROGRAMMES_LIST = [];

// Centralized Director Approvals Database
export const INITIAL_DIRECTOR_APPROVALS_LIST = [];

// Centralized Master Programmes Database
export const MASTER_PROGRAMMES = INITIAL_MASTER_PROGRAMMES_LIST;

export const INITIAL_PROGRAMME_OUTCOMES = {};
export const INITIAL_PSO_OUTCOMES = {};
export const INITIAL_PEO_OUTCOMES = {};
export const INITIAL_PROGRAMME_ATR_LIST = {};

// Centralized HOD Approvals Database
export const INITIAL_HOD_APPROVALS_LIST = [];

export const INITIAL_COURSES = [];

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
