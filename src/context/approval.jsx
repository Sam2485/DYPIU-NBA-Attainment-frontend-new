import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import apiClient from '../api/client';

export const ApprovalContext = createContext(null);

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

export const INITIAL_COURSE_VERIFICATION_STORE = {
  'crs-1': {
    configStatus: 'DRAFT',
    coStatus: 'DRAFT',
    atrStatus: 'DRAFT',
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'crs-2': {
    configStatus: 'DRAFT',
    coStatus: 'DRAFT',
    atrStatus: 'DRAFT',
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'crs-3': {
    configStatus: 'DRAFT',
    coStatus: 'DRAFT',
    atrStatus: 'DRAFT',
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'crs-4': {
    configStatus: 'DRAFT',
    coStatus: 'DRAFT',
    atrStatus: 'DRAFT',
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'allocation-prog-1': {
    allocationStatus: 'DRAFT',
    verifiedBy: null,
  },
  'allocation-prog-2': {
    allocationStatus: 'DRAFT',
    verifiedBy: null,
  },
  'allocation-prog-3': {
    allocationStatus: 'DRAFT',
    verifiedBy: null,
  },
  'allocation-prog-4': {
    allocationStatus: 'DRAFT',
    verifiedBy: null,
  },
  'allocation-prog-5': {
    allocationStatus: 'DRAFT',
    verifiedBy: null,
  },
  'targets-prog-1': {
    poPsoTargetsStatus: 'DRAFT',
    verifiedBy: null,
  },
  'targets-prog-2': {
    poPsoTargetsStatus: 'DRAFT',
    verifiedBy: null,
  },
  'targets-prog-3': {
    poPsoTargetsStatus: 'DRAFT',
    verifiedBy: null,
  },
  'targets-prog-4': {
    poPsoTargetsStatus: 'DRAFT',
    verifiedBy: null,
  },
  'targets-prog-5': {
    poPsoTargetsStatus: 'DRAFT',
    verifiedBy: null,
  },
  'prog-atr-prog-1': {
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'prog-atr-prog-2': {
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'prog-atr-prog-3': {
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'prog-atr-prog-4': {
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
  'prog-atr-prog-5': {
    programmeAtrStatus: 'DRAFT',
    verifiedBy: null,
  },
};

export function ApprovalProvider({ children }) {
  const { user, role } = useAuth();

  const [directorApprovalsStore, setDirectorApprovalsStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_director_approvals');
      return saved ? JSON.parse(saved) : INITIAL_DIRECTOR_APPROVALS_LIST;
    } catch {
      return INITIAL_DIRECTOR_APPROVALS_LIST;
    }
  });

  const [hodApprovalsStore, setHodApprovalsStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_hod_approvals');
      return saved ? JSON.parse(saved) : INITIAL_HOD_APPROVALS_LIST;
    } catch {
      return INITIAL_HOD_APPROVALS_LIST;
    }
  });

  const [courseVerificationStore, setCourseVerificationStore] = useState(() => {
    try {
      const saved = localStorage.getItem('dypiu_course_verification');
      return saved ? JSON.parse(saved) : INITIAL_COURSE_VERIFICATION_STORE;
    } catch {
      return INITIAL_COURSE_VERIFICATION_STORE;
    }
  });

  // Cross-tab synchronization via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'dypiu_course_verification' && e.newValue) {
          setCourseVerificationStore(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_hod_approvals' && e.newValue) {
          setHodApprovalsStore(JSON.parse(e.newValue));
        } else if (e.key === 'dypiu_director_approvals' && e.newValue) {
          setDirectorApprovalsStore(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error in ApprovalContext:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real backend loader for Approvals
  useEffect(() => {
    let isMounted = true;
    const loadApprovals = async () => {
      try {
        if (role === 'DIRECTOR' || role === 'ADMIN') {
          const res = await apiClient.get('/approvals/director');
          const data = res?.data || res;
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setDirectorApprovalsStore(data);
          }
        } else if (role === 'HOD') {
          const res = await apiClient.get('/approvals/hod');
          const data = res?.data || res;
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setHodApprovalsStore(data);
          }
        }
      } catch (err) {
        console.warn('Backend load approvals warning:', err);
      }
    };
    loadApprovals();
    return () => { isMounted = false; };
  }, [role]);

  const approveDirectorSubmission = async (appId, directorName) => {
    setDirectorApprovalsStore((prev) => {
      const updated = prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: directorName || user?.name || 'School Director',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : a
      );
      try { localStorage.setItem('dypiu_director_approvals', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await apiClient.post(`/approvals/${appId}/approve`, {
        approvedBy: directorName || user?.name || 'School Director',
      });
    } catch (err) {
      console.warn('Backend approve director submission warning:', err);
    }
  };

  const rejectDirectorSubmission = async (appId, remarks) => {
    setDirectorApprovalsStore((prev) => {
      const updated = prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEEDS_REVISION',
              remarks: remarks || 'Review and resubmit.',
            }
          : a
      );
      try { localStorage.setItem('dypiu_director_approvals', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await apiClient.post(`/approvals/${appId}/reject`, {
        remarks: remarks || 'Review and resubmit.',
      });
    } catch (err) {
      console.warn('Backend reject director submission warning:', err);
    }
  };

  const approveHodSubmission = async (appId, hodName) => {
    setHodApprovalsStore((prev) => {
      const updated = prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: hodName || user?.name || 'Head of Department (HOD)',
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : a
      );
      try { localStorage.setItem('dypiu_hod_approvals', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await apiClient.post(`/approvals/${appId}/approve`, {
        approvedBy: hodName || user?.name || 'Head of Department (HOD)',
      });
    } catch (err) {
      console.warn('Backend approve HOD submission warning:', err);
    }
  };

  const rejectHodSubmission = async (appId, remarks) => {
    setHodApprovalsStore((prev) => {
      const updated = prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'NEEDS_REVISION',
              remarks: remarks || 'Review and resubmit.',
            }
          : a
      );
      try { localStorage.setItem('dypiu_hod_approvals', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await apiClient.post(`/approvals/${appId}/reject`, {
        remarks: remarks || 'Review and resubmit.',
      });
    } catch (err) {
      console.warn('Backend reject HOD submission warning:', err);
    }
  };

  const updateCourseVerificationStatus = async (targetCourseId, statusType, statusValue, remarksValue = '', verifierName = null) => {
    const remarkKey = statusType.replace('Status', 'Remarks');
    setCourseVerificationStore((prev) => {
      const updated = {
        ...prev,
        [targetCourseId]: {
          ...(prev[targetCourseId] || {
            configStatus: 'DRAFT',
            coStatus: 'DRAFT',
            atrStatus: 'DRAFT',
            programmeAtrStatus: 'DRAFT',
            allocationStatus: 'DRAFT',
            poPsoTargetsStatus: 'DRAFT',
          }),
          [statusType]: statusValue,
          [remarkKey]: remarksValue,
          verifiedBy: verifierName || user?.name || 'Programme Coordinator',
          verifiedAt: new Date().toISOString().split('T')[0],
        },
      };
      try { localStorage.setItem('dypiu_course_verification', JSON.stringify(updated)); } catch {}
      return updated;
    });

    try {
      await apiClient.post('/approvals/verify', {
        courseOfferingId: targetCourseId,
        verificationType: statusType,
        status: statusValue,
        remarks: remarksValue,
        verifiedBy: verifierName || user?.name,
      });
    } catch (err) {
      console.warn('Backend update course verification warning:', err);
    }
  };

  const getPendingVerificationsCount = () => {
    return Object.values(courseVerificationStore).filter((rec) => {
      return (
        rec.configStatus === 'SUBMITTED' ||
        rec.coStatus === 'PENDING_APPROVAL' ||
        rec.coStatus === 'SUBMITTED' ||
        rec.atrStatus === 'SUBMITTED' ||
        rec.programmeAtrStatus === 'SUBMITTED'
      );
    }).length;
  };

  return (
    <ApprovalContext.Provider
      value={{
        directorApprovals: directorApprovalsStore,
        approveDirectorSubmission,
        rejectDirectorSubmission,
        hodApprovals: hodApprovalsStore,
        approveHodSubmission,
        rejectHodSubmission,
        courseVerificationStore,
        updateCourseVerificationStatus,
        getPendingVerificationsCount,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
}

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
}
