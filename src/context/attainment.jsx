import { createContext, useContext, useState, useEffect } from 'react';
import { useAcademic } from './academic';

export const AttainmentContext = createContext(null);

export const defaultLevels = {
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

export const YEAR_ATTAINMENT_METRICS = {
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

export const INITIAL_ATTAINMENT_CONFIGS = {
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
    status: 'DRAFT',
    submittedBy: null,
    submittedAt: null,
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
    status: 'DRAFT',
    submittedBy: null,
    submittedAt: null,
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
    status: 'DRAFT',
    submittedBy: null,
    submittedAt: null,
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
    submittedBy: null,
    submittedAt: null,
  },
};

export const INITIAL_PROGRAMME_ATR_LIST = {
  'prog-1': {
    status: 'DRAFT',
    submittedBy: null,
    submittedAt: null,
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

export const INITIAL_COURSE_ATR_STORE = {
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
};

export function AttainmentProvider({ children }) {
  const { selectedCourse, academicYear } = useAcademic();

  const [attainmentConfigs, setAttainmentConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_attainment_configs');
      return saved ? JSON.parse(saved) : INITIAL_ATTAINMENT_CONFIGS;
    } catch {
      return INITIAL_ATTAINMENT_CONFIGS;
    }
  });

  const [courseAtrStore, setCourseAtrStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_course_atr_store');
      return saved ? JSON.parse(saved) : INITIAL_COURSE_ATR_STORE;
    } catch {
      return INITIAL_COURSE_ATR_STORE;
    }
  });

  const [programmeAtrStore, setProgrammeAtrStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_programme_atr_store');
      return saved ? JSON.parse(saved) : INITIAL_PROGRAMME_ATR_LIST;
    } catch {
      return INITIAL_PROGRAMME_ATR_LIST;
    }
  });

  // Cross-tab synchronization via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'dypiu_attainment_configs' && e.newValue) {
          setAttainmentConfigs(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_course_atr_store' && e.newValue) {
          setCourseAtrStore(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_programme_atr_store' && e.newValue) {
          setProgrammeAtrStore(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error in AttainmentContext:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [courseAttainmentStore, setCourseAttainmentStore] = useState({
    'crs-1': {
      directAttainment: 2.80,
      indirectAttainment: 2.50,
      overallCOAttainment: 2.74,
      coDetails: [
        { coCode: 'C321.1', target: 2.50, direct: 2.85, indirect: 2.60, overall: 2.80, status: 'Achieved' },
        { coCode: 'C321.2', target: 2.50, direct: 2.75, indirect: 2.50, overall: 2.70, status: 'Achieved' },
        { coCode: 'C321.3', target: 2.50, direct: 2.10, indirect: 2.10, overall: 2.10, status: 'Not Achieved' },
        { coCode: 'C321.4', target: 2.50, direct: 2.95, indirect: 2.70, overall: 2.90, status: 'Achieved' },
        { coCode: 'C321.5', target: 2.50, direct: 2.20, indirect: 2.20, overall: 2.20, status: 'Not Achieved' },
        { coCode: 'C321.6', target: 2.50, direct: 2.80, indirect: 2.55, overall: 2.75, status: 'Achieved' },
      ],
    },
    'crs-2': {
      directAttainment: 2.45,
      indirectAttainment: 2.40,
      overallCOAttainment: 2.44,
    },
  });

  const activeAttainmentConfig = attainmentConfigs[selectedCourse?.id || 'crs-1'] || {
    directWeight: 80,
    indirectWeight: 20,
    directThreshold: 60,
    thresholdPct: '60%',
    ...defaultLevels,
  };

  const updateCourseAttainmentConfig = (targetCourseId, newConfig) => {
    setAttainmentConfigs((prev) => {
      const updated = {
        ...prev,
        [targetCourseId]: {
          ...(prev[targetCourseId] || defaultLevels),
          ...newConfig,
          thresholdPct: `${newConfig.directThreshold || 60}%`,
        },
      };
      try { localStorage.setItem('dypiu_attainment_configs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateCourseAtrData = (targetCourseId, newAtrList) => {
    setCourseAtrStore((prev) => {
      const updated = {
        ...prev,
        [targetCourseId]: newAtrList,
      };
      try { localStorage.setItem('dypiu_course_atr_store', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const approveProgrammeAtr = (targetProgId, hodName) => {
    setProgrammeAtrStore((prev) => {
      const updated = {
        ...prev,
        [targetProgId]: {
          ...(prev[targetProgId] || INITIAL_PROGRAMME_ATR_LIST['prog-1']),
          status: 'APPROVED',
          approvedBy: hodName || 'Head of Department (HOD)',
          approvedAt: new Date().toISOString().split('T')[0],
        },
      };
      try { localStorage.setItem('dypiu_programme_atr_store', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateProgrammeAtrObservations = (targetProgId, newObservations) => {
    setProgrammeAtrStore((prev) => {
      const updated = {
        ...prev,
        [targetProgId]: {
          ...(prev[targetProgId] || INITIAL_PROGRAMME_ATR_LIST['prog-1']),
          observations: newObservations,
        },
      };
      try { localStorage.setItem('dypiu_programme_atr_store', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateCourseAttainment = (courseId, attainmentData) => {
    setCourseAttainmentStore((prev) => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        ...attainmentData,
      },
    }));
  };

  const yearMetrics = YEAR_ATTAINMENT_METRICS[academicYear] || YEAR_ATTAINMENT_METRICS['2025-26'];

  return (
    <AttainmentContext.Provider
      value={{
        attainmentConfigs,
        activeAttainmentConfig,
        updateCourseAttainmentConfig,
        defaultLevels,
        yearMetrics,
        YEAR_ATTAINMENT_METRICS,
        courseAttainmentStore,
        updateCourseAttainment,
        courseAtrStore,
        updateCourseAtrData,
        programmeAtrStore,
        approveProgrammeAtr,
        updateProgrammeAtrObservations,
      }}
    >
      {children}
    </AttainmentContext.Provider>
  );
}

export function useAttainment() {
  const context = useContext(AttainmentContext);
  if (!context) {
    throw new Error('useAttainment must be used within an AttainmentProvider');
  }
  return context;
}
