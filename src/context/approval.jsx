import {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import { useAuth } from './auth';
import apiClient from '../api/client';

export const ApprovalContext = createContext(null);

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const unwrapResponse = (response) => {
  if (response == null) {
    return null;
  }

  if (response?.data?.data !== undefined) {
    return response.data.data;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

const unwrapList = (response) => {
  const value = unwrapResponse(response);
  return Array.isArray(value) ? value : [];
};

const normalizeApproval = (approval) => {
  if (!approval) {
    return null;
  }

  return {
    ...approval,
    id: approval.id ?? approval.approvalId ?? null,
    status: approval.status ?? null,
    courseOfferingId: approval.courseOfferingId ?? null,
    programmeId: approval.programmeId ?? null,
    batchId: approval.batchId ?? null,
    courseId: approval.courseId ?? null,
    type: approval.type ?? null,
    resourceId: approval.resourceId ?? null,
    submittedBy: approval.submittedBy ?? null,
    submittedAt: approval.submittedAt ?? null,
    approvedBy: approval.approvedBy ?? null,
    approvedAt: approval.approvedAt ?? null,
    revisionRequestedBy: approval.revisionRequestedBy ?? null,
    revisionRequestedAt: approval.revisionRequestedAt ?? null,
    remarks:
      approval.remarks ??
      approval.message ??
      approval.comments ??
      null,
  };
};

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function ApprovalProvider({ children }) {
  const { user, role } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [directorApprovals, setDirectorApprovals] = useState([]);
  const [hodApprovals, setHodApprovals] = useState([]);

  /*
   * Component verification state indexed by CourseOffering ID / key.
   * Example:
   * {
   *   "offering-101": {
   *      key: "offering-101",
   *      courseOfferingId: "offering-101",
   *      courseOutcomeStatus: "PENDING",
   *      attainmentSettingsStatus: "APPROVED",
   *      courseAtrStatus: "REVISION_REQUESTED",
   *      remarks: "..."
   *   }
   * }
   */
  const [courseVerificationStore, setCourseVerificationStore] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* 1. Director Approvals Loader                                             */
  /* ======================================================================== */

  const loadDirectorApprovals = useCallback(
    async (schoolId = null) => {
      try {
        setError(null);
        const params = {};
        if (schoolId) {
          params.schoolId = schoolId;
        }

        const response = await apiClient.get('/approvals/director', { params });
        const list = unwrapList(response);
        const normalized = list.map(normalizeApproval).filter(Boolean);

        setDirectorApprovals(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadDirectorApprovals failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load director approvals.');
        return [];
      }
    },
    []
  );

  /* ======================================================================== */
  /* 2. HOD Approvals Loader                                                  */
  /* ======================================================================== */

  const loadHodApprovals = useCallback(
    async (programmeId = null, departmentId = null) => {
      try {
        setError(null);
        const params = {};
        if (programmeId) {
          params.programmeId = programmeId;
        }
        if (departmentId) {
          params.departmentId = departmentId;
        }

        const response = await apiClient.get('/approvals/hod', { params });
        const list = unwrapList(response);
        const normalized = list.map(normalizeApproval).filter(Boolean);

        setHodApprovals(normalized);
        return normalized;
      } catch (err) {
        console.warn('loadHodApprovals failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load HOD approvals.');
        return [];
      }
    },
    []
  );

  /* ======================================================================== */
  /* 3. Verification Status Loader                                            */
  /* ======================================================================== */

  const getCourseVerification = useCallback(
    async (courseOfferingId) => {
      if (!courseOfferingId) {
        return null;
      }

      try {
        setError(null);
        const response = await apiClient.get('/approvals/verification-status', {
          params: {
            key: courseOfferingId,
          },
        });

        const data = unwrapResponse(response);

        if (data) {
          setCourseVerificationStore((previous) => ({
            ...previous,
            [courseOfferingId]: {
              ...(previous[courseOfferingId] || {}),
              ...data,
              key: data.key ?? courseOfferingId,
              courseOfferingId,
            },
          }));
        }

        return data;
      } catch (err) {
        console.warn(`getCourseVerification(${courseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load verification status.');
        return null;
      }
    },
    []
  );

  /* ======================================================================== */
  /* 4. Formal Approval Submission                                            */
  /* ======================================================================== */

  const submitCourseVerification = useCallback(
    async ({ courseOfferingId, ...approvalRequest }) => {
      if (!courseOfferingId) {
        throw new Error('courseOfferingId is required');
      }

      try {
        setError(null);
        const response = await apiClient.post('/approvals/submit', {
          ...approvalRequest,
          courseOfferingId,
        });

        const data = unwrapResponse(response);
        const result = normalizeApproval(data);

        if (result) {
          setCourseVerificationStore((previous) => ({
            ...previous,
            [courseOfferingId]: {
              ...(previous[courseOfferingId] || {}),
              ...result,
              courseOfferingId,
            },
          }));
        }

        return result ?? data;
      } catch (err) {
        console.warn(`submitCourseVerification(${courseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to submit approval.');
        throw err;
      }
    },
    []
  );

  /* ======================================================================== */
  /* 5. Component Verification (Verify / Approve)                             */
  /* ======================================================================== */

  const verifyStatus = useCallback(
    async ({
      courseOfferingId,
      statusType,
      statusValue = 'APPROVED',
      remarksValue = '',
      verifierName,
    }) => {
      if (!courseOfferingId) {
        throw new Error('courseOfferingId is required');
      }

      if (!statusType) {
        throw new Error('statusType is required');
      }

      if (
        statusValue !== 'APPROVED' &&
        statusValue !== 'REVISION_REQUESTED' &&
        statusValue !== 'PENDING'
      ) {
        throw new Error('statusValue must be APPROVED, REVISION_REQUESTED, or PENDING');
      }

      try {
        setError(null);
        const payload = {
          key: courseOfferingId,
          statusType,
          statusValue,
          remarksValue,
          verifierName:
            verifierName ??
            user?.name ??
            user?.username ??
            user?.email ??
            null,
        };

        const response = await apiClient.put('/approvals/verify', payload);
        const data = unwrapResponse(response);

        setCourseVerificationStore((previous) => ({
          ...previous,
          [courseOfferingId]: {
            ...(previous[courseOfferingId] || {}),
            ...(data || {}),
            key: data?.key ?? courseOfferingId,
            courseOfferingId,
          },
        }));

        return data;
      } catch (err) {
        console.warn(`verifyStatus(${courseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to verify status.');
        throw err;
      }
    },
    [user]
  );

  /* ======================================================================== */
  /* 6. Request Revision                                                      */
  /* ======================================================================== */

  const requestRevision = useCallback(
    async ({
      courseOfferingId,
      statusType,
      remarksValue = '',
      verifierName,
    }) => {
      if (!courseOfferingId) {
        throw new Error('courseOfferingId is required');
      }

      if (!statusType) {
        throw new Error('statusType is required');
      }

      try {
        setError(null);
        const payload = {
          key: courseOfferingId,
          statusType,
          statusValue: 'REVISION_REQUESTED',
          remarksValue,
          verifierName:
            verifierName ??
            user?.name ??
            user?.username ??
            user?.email ??
            null,
        };

        const response = await apiClient.post('/approvals/request-revision', payload);
        const data = unwrapResponse(response);

        setCourseVerificationStore((previous) => ({
          ...previous,
          [courseOfferingId]: {
            ...(previous[courseOfferingId] || {}),
            ...(data || {}),
            key: data?.key ?? courseOfferingId,
            courseOfferingId,
          },
        }));

        return data;
      } catch (err) {
        console.warn(`requestRevision(${courseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to request revision.');
        throw err;
      }
    },
    [user]
  );

  /* ======================================================================== */
  /* 7. Verification Status Dispatcher / Compatibility Helper                 */
  /* ======================================================================== */

  const updateCourseVerificationStatus = useCallback(
    async (
      courseOfferingId,
      statusType,
      statusValue,
      remarksValue = '',
      verifierName = null
    ) => {
      if (statusValue === 'REVISION_REQUESTED') {
        return requestRevision({
          courseOfferingId,
          statusType,
          remarksValue,
          verifierName,
        });
      }

      return verifyStatus({
        courseOfferingId,
        statusType,
        statusValue,
        remarksValue,
        verifierName,
      });
    },
    [verifyStatus, requestRevision]
  );

  /* ======================================================================== */
  /* 8. Director Formal Approval Action                                       */
  /* ======================================================================== */

  const approveDirectorSubmission = useCallback(
    async (approvalId, actorName) => {
      if (!approvalId) {
        throw new Error('approvalId is required');
      }

      try {
        setError(null);
        const response = await apiClient.post(`/approvals/${approvalId}/approve`, {
          actorName:
            actorName ??
            user?.name ??
            user?.username ??
            user?.email ??
            '',
          actorRole: role ?? 'DIRECTOR',
        });

        const data = unwrapResponse(response);
        await loadDirectorApprovals();
        return data;
      } catch (err) {
        console.warn(`approveDirectorSubmission(${approvalId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to approve director submission.');
        throw err;
      }
    },
    [user, role, loadDirectorApprovals]
  );

  /* ======================================================================== */
  /* 9. HOD Formal Approval Action                                            */
  /* ======================================================================== */

  const approveHodSubmission = useCallback(
    async (approvalId, actorName) => {
      if (!approvalId) {
        throw new Error('approvalId is required');
      }

      try {
        setError(null);
        const response = await apiClient.post(`/approvals/${approvalId}/approve`, {
          actorName:
            actorName ??
            user?.name ??
            user?.username ??
            user?.email ??
            '',
          actorRole: role ?? 'HOD',
        });

        const data = unwrapResponse(response);
        await loadHodApprovals();
        return data;
      } catch (err) {
        console.warn(`approveHodSubmission(${approvalId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to approve HOD submission.');
        throw err;
      }
    },
    [user, role, loadHodApprovals]
  );

  /* ======================================================================== */
  /* 10. General Action Approval                                              */
  /* ======================================================================== */

  const actionApproval = useCallback(
    async ({
      approvalId,
      action,
      comments = '',
      actorName,
      actorRole,
    }) => {
      if (!approvalId) {
        throw new Error('approvalId is required');
      }

      if (!action) {
        throw new Error('action is required');
      }

      try {
        setError(null);
        const response = await apiClient.post(`/approvals/${approvalId}/action`, {
          action,
          comments,
          actorName:
            actorName ??
            user?.name ??
            user?.username ??
            user?.email ??
            '',
          actorRole: actorRole ?? role ?? '',
        });

        const data = unwrapResponse(response);

        if (role === 'HOD') {
          await loadHodApprovals();
        } else if (role === 'DIRECTOR' || role === 'ADMIN') {
          await loadDirectorApprovals();
        }

        return data;
      } catch (err) {
        console.warn(`actionApproval(${approvalId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to action approval.');
        throw err;
      }
    },
    [user, role, loadDirectorApprovals, loadHodApprovals]
  );

  /* ======================================================================== */
  /* 11. General Approval Loaders                                             */
  /* ======================================================================== */

  const getApprovals = useCallback(
    async (params = {}) => {
      try {
        setError(null);
        const response = await apiClient.get('/approvals', { params });
        return unwrapList(response);
      } catch (err) {
        console.warn('getApprovals failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to get approvals.');
        return [];
      }
    },
    []
  );

  const getApprovalById = useCallback(
    async (approvalId) => {
      if (!approvalId) {
        return null;
      }

      try {
        setError(null);
        const response = await apiClient.get(`/approvals/${approvalId}`);
        return unwrapResponse(response);
      } catch (err) {
        console.warn(`getApprovalById(${approvalId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to get approval.');
        return null;
      }
    },
    []
  );

  const getApprovalHistory = useCallback(
    async (approvalId) => {
      if (!approvalId) {
        return [];
      }

      try {
        setError(null);
        const response = await apiClient.get(`/approvals/${approvalId}/history`);
        return unwrapList(response);
      } catch (err) {
        console.warn(`getApprovalHistory(${approvalId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to get approval history.');
        return [];
      }
    },
    []
  );

  /* ======================================================================== */
  /* 12. Pending Verification Count                                           */
  /* ======================================================================== */

  const getPendingVerificationsCount = useCallback(() => {
    return Object.values(courseVerificationStore ?? {}).reduce((count, record) => {
      if (!record) {
        return count;
      }

      const hasPending = Object.entries(record).some(([key, value]) => {
        if (key === 'key' || key === 'courseOfferingId') {
          return false;
        }
        return value === 'PENDING';
      });

      return hasPending ? count + 1 : count;
    }, 0);
  }, [courseVerificationStore]);

  /* ======================================================================== */
  /* 13. Explicit Refresh Function                                            */
  /* ======================================================================== */

  const refreshApprovals = useCallback(
    async ({ schoolId = null, programmeId = null, departmentId = null } = {}) => {
      setLoading(true);
      setError(null);

      try {
        if (role === 'DIRECTOR' || role === 'ADMIN') {
          return await loadDirectorApprovals(schoolId);
        }

        if (role === 'HOD') {
          return await loadHodApprovals(programmeId, departmentId);
        }

        return [];
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Failed to refresh approvals.'
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [role, loadDirectorApprovals, loadHodApprovals]
  );

  /* ======================================================================== */
  /* Context value                                                            */
  /* ======================================================================== */

  const value = {
    /* State */
    directorApprovals,
    hodApprovals,
    courseVerificationStore,
    loading,
    error,

    /* General approval APIs */
    getApprovals,
    getApprovalById,
    getApprovalHistory,
    submitApproval: submitCourseVerification,

    /* Scoped approval queues */
    loadDirectorApprovals,
    loadHodApprovals,

    /* Formal approval actions */
    approveDirectorSubmission,
    approveHodSubmission,
    actionApproval,

    /* CourseOffering verification */
    getCourseVerification,
    getVerificationStatus: getCourseVerification,
    submitCourseVerification,
    verifyStatus,
    requestRevision,
    reviewCourseVerification: updateCourseVerificationStatus,
    updateCourseVerificationStatus,
    getPendingVerificationsCount,
    refreshApprovals,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
}

export default useApproval;
