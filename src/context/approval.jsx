import { createContext, useContext, useState } from 'react';
import { useAuth } from './auth';

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
};

export function ApprovalProvider({ children }) {
  const { user } = useAuth();

  const [directorApprovalsStore, setDirectorApprovalsStore] = useState(INITIAL_DIRECTOR_APPROVALS_LIST);
  const [hodApprovalsStore, setHodApprovalsStore] = useState(INITIAL_HOD_APPROVALS_LIST);
  const [courseVerificationStore, setCourseVerificationStore] = useState(INITIAL_COURSE_VERIFICATION_STORE);

  const approveDirectorSubmission = (appId, directorName) => {
    setDirectorApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: directorName || user?.name || 'School Director',
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

  const approveHodSubmission = (appId, hodName) => {
    setHodApprovalsStore((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: hodName || user?.name || 'Head of Department (HOD)',
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
