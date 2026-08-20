import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useAuth } from './auth';
import apiClient from '../api/client';

export const ApprovalContext =
  createContext(null);

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const unwrapResponse = (response) => {
  if (response == null) {
    return null;
  }

  if (
    response?.data?.data !== undefined
  ) {
    return response.data.data;
  }

  if (
    response?.data !== undefined
  ) {
    return response.data;
  }

  return response;
};

const unwrapList = (response) => {
  const value =
    unwrapResponse(response);

  return Array.isArray(value)
    ? value
    : [];
};

const normalizeApproval = (
  approval
) => {
  if (!approval) {
    return null;
  }

  return {
    ...approval,

    id:
      approval.id ??
      approval.approvalId ??
      null,

    status:
      approval.status ??
      null,

    courseOfferingId:
      approval.courseOfferingId ??
      null,

    programmeId:
      approval.programmeId ??
      null,

    batchId:
      approval.batchId ??
      null,

    courseId:
      approval.courseId ??
      null,

    type:
      approval.type ??
      null,

    resourceId:
      approval.resourceId ??
      null,

    submittedBy:
      approval.submittedBy ??
      null,

    submittedAt:
      approval.submittedAt ??
      null,

    approvedBy:
      approval.approvedBy ??
      null,

    approvedAt:
      approval.approvedAt ??
      null,

    revisionRequestedBy:
      approval.revisionRequestedBy ??
      null,

    revisionRequestedAt:
      approval.revisionRequestedAt ??
      null,

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

export function ApprovalProvider({
  children,
}) {
  const {
    user,
    role,
  } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    directorApprovals,
    setDirectorApprovals,
  ] = useState([]);

  const [
    hodApprovals,
    setHodApprovals,
  ] = useState([]);

  /*
   * Component verification state indexed
   * by CourseOffering ID.
   *
   * Example:
   *
   * {
   *   "offering-101": {
   *      key: "offering-101",
   *      courseOutcomeStatus: "PENDING",
   *      attainmentSettingsStatus: "APPROVED",
   *      courseAtrStatus: "REVISION_REQUESTED",
   *      remarks: "..."
   *   }
   * }
   */
  const [
    courseVerificationStore,
    setCourseVerificationStore,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* ======================================================================== */
  /* Director Approvals                                                       */
  /* ======================================================================== */

  const loadDirectorApprovals =
    useCallback(
      async (
        schoolId = null
      ) => {
        if (
          role !== 'DIRECTOR' &&
          role !== 'ADMIN'
        ) {
          return [];
        }

        const params = {};

        if (schoolId) {
          params.schoolId =
            schoolId;
        }

        const response =
          await apiClient.get(
            '/approvals/director',
            { params }
          );

        const list =
          unwrapList(response);

        const normalized =
          list
            .map(normalizeApproval)
            .filter(Boolean);

        setDirectorApprovals(
          normalized
        );

        return normalized;
      },
      [role]
    );

  /* ======================================================================== */
  /* HOD Approvals                                                            */
  /* ======================================================================== */

  const loadHodApprovals =
    useCallback(
      async (
        programmeId = null
      ) => {
        if (role !== 'HOD') {
          return [];
        }

        const params = {};

        if (programmeId) {
          params.programmeId =
            programmeId;
        }

        const response =
          await apiClient.get(
            '/approvals/hod',
            { params }
          );

        const list =
          unwrapList(response);

        const normalized =
          list
            .map(normalizeApproval)
            .filter(Boolean);

        setHodApprovals(
          normalized
        );

        return normalized;
      },
      [role]
    );

  /* ======================================================================== */
  /* Initial role-specific approval load                                      */
  /* ======================================================================== */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * Do not make up schoolId/programmeId.
         * Existing screens can call the explicit
         * loading functions with their selected scope.
         */
        if (
          role !== 'DIRECTOR' &&
          role !== 'ADMIN' &&
          role !== 'HOD'
        ) {
          return;
        }

        /*
         * No unscoped approval fetch here.
         *
         * Director/HOD approval screens should
         * call the scoped methods explicitly.
         */
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data
              ?.message ??
              err?.response?.data
                ?.error ??
              err?.message ??
              'Failed to load approvals.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [role]);

  /* ======================================================================== */
  /* Verification Status                                                      */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * GET /approvals/verification-status?key=...
   *
   * `key` is the CourseOffering-scoped
   * verification key used by the backend.
   *
   * For course-level workflow we pass the
   * actual CourseOffering ID.
   */

  const getCourseVerification =
    useCallback(
      async (
        courseOfferingId
      ) => {
        if (
          !courseOfferingId
        ) {
          throw new Error(
            'courseOfferingId is required'
          );
        }

        const response =
          await apiClient.get(
            '/approvals/verification-status',
            {
              params: {
                key:
                  courseOfferingId,
              },
            }
          );

        const data =
          unwrapResponse(response);

        if (data) {
          setCourseVerificationStore(
            (previous) => ({
              ...previous,

              [courseOfferingId]: {
                ...(previous[
                  courseOfferingId
                ] || {}),

                ...data,

                key:
                  data.key ??
                  courseOfferingId,

                courseOfferingId,
              },
            })
          );
        }

        return data;
      },
      []
    );

  /* ======================================================================== */
  /* Course Coordinator -> Submit                                             */
  /* ======================================================================== */

  /*
   * Formal approval submission:
   *
   * POST /approvals/submit
   *
   * We do not manufacture the ApprovalRequest
   * DTO. The caller supplies the backend payload.
   *
   * The only invariant we enforce here is that
   * courseOfferingId must be present.
   */

  const submitCourseVerification =
    useCallback(
      async ({
        courseOfferingId,
        ...approvalRequest
      }) => {
        if (
          !courseOfferingId
        ) {
          throw new Error(
            'courseOfferingId is required'
          );
        }

        const response =
          await apiClient.post(
            '/approvals/submit',
            {
              ...approvalRequest,
              courseOfferingId,
            }
          );

        const data =
          unwrapResponse(response);

        const result =
          normalizeApproval(data);

        /*
         * Only update local React state after
         * a successful backend response.
         */
        if (result) {
          setCourseVerificationStore(
            (previous) => ({
              ...previous,

              [courseOfferingId]: {
                ...(previous[
                  courseOfferingId
                ] || {}),

                ...result,

                courseOfferingId,
              },
            })
          );
        }

        return result ?? data;
      },
      []
    );

  /* ======================================================================== */
  /* Component Verification                                                   */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * PUT/POST /approvals/verify
   *
   * {
   *   key,
   *   statusType,
   *   statusValue,
   *   remarksValue,
   *   verifierName
   * }
   */

  const verifyStatus =
    useCallback(
      async ({
        courseOfferingId,
        statusType,
        statusValue,
        remarksValue = '',
        verifierName,
      }) => {
        if (
          !courseOfferingId
        ) {
          throw new Error(
            'courseOfferingId is required'
          );
        }

        if (!statusType) {
          throw new Error(
            'statusType is required'
          );
        }

        if (
          statusValue !==
            'APPROVED' &&
          statusValue !==
            'REVISION_REQUESTED'
        ) {
          throw new Error(
            'statusValue must be APPROVED or REVISION_REQUESTED'
          );
        }

        const response =
          await apiClient.put(
            '/approvals/verify',
            {
              key:
                courseOfferingId,

              statusType,

              statusValue,

              remarksValue,

              verifierName:
                verifierName ??
                user?.name ??
                user?.username ??
                user?.email ??
                null,
            }
          );

        const data =
          unwrapResponse(response);

        setCourseVerificationStore(
          (previous) => ({
            ...previous,

            [courseOfferingId]: {
              ...(previous[
                courseOfferingId
              ] || {}),

              ...(data || {}),

              key:
                data?.key ??
                courseOfferingId,

              courseOfferingId,
            },
          })
        );

        return data;
      },
      [user]
    );

  /* ======================================================================== */
  /* Request Revision                                                         */
  /* ======================================================================== */

  /*
   * Backend exposes a separate revision
   * endpoint. No REJECTED state is introduced.
   */

  const requestRevision =
    useCallback(
      async ({
        courseOfferingId,
        statusType,
        remarksValue = '',
        verifierName,
      }) => {
        if (
          !courseOfferingId
        ) {
          throw new Error(
            'courseOfferingId is required'
          );
        }

        if (!statusType) {
          throw new Error(
            'statusType is required'
          );
        }

        const response =
          await apiClient.put(
            '/approvals/request-revision',
            {
              key:
                courseOfferingId,

              statusType,

              statusValue:
                'REVISION_REQUESTED',

              remarksValue,

              verifierName:
                verifierName ??
                user?.name ??
                user?.username ??
                user?.email ??
                null,
            }
          );

        const data =
          unwrapResponse(response);

        setCourseVerificationStore(
          (previous) => ({
            ...previous,

            [courseOfferingId]: {
              ...(previous[
                courseOfferingId
              ] || {}),

              ...(data || {}),

              key:
                data?.key ??
                courseOfferingId,

              courseOfferingId,
            },
          })
        );

        return data;
      },
      [user]
    );

  /* ======================================================================== */
  /* Compatibility helper                                                     */
  /* ======================================================================== */

  /*
   * Existing screens can continue calling:
   *
   * updateCourseVerificationStatus(
   *   courseOfferingId,
   *   statusType,
   *   statusValue,
   *   remarksValue,
   *   verifierName
   * )
   *
   * APPROVED and REVISION_REQUESTED only.
   */

  const updateCourseVerificationStatus =
    useCallback(
      async (
        courseOfferingId,
        statusType,
        statusValue,
        remarksValue = '',
        verifierName = null
      ) => {
        if (
          statusValue ===
          'REVISION_REQUESTED'
        ) {
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
      [
        verifyStatus,
        requestRevision,
      ]
    );

  /* ======================================================================== */
  /* Director Formal Approval                                                 */
  /* ======================================================================== */

  const approveDirectorSubmission =
    useCallback(
      async (
        approvalId,
        actorName
      ) => {
        if (!approvalId) {
          throw new Error(
            'approvalId is required'
          );
        }

        const response =
          await apiClient.post(
            `/approvals/${approvalId}/approve`,
            {
              actorName:
                actorName ??
                user?.name ??
                user?.username ??
                user?.email ??
                '',

              actorRole:
                role ??
                'DIRECTOR',
            }
          );

        const data =
          unwrapResponse(response);

        /*
         * Refresh actual backend state.
         */
        await loadDirectorApprovals();

        return data;
      },
      [
        user,
        role,
        loadDirectorApprovals,
      ]
    );

  /* ======================================================================== */
  /* HOD Formal Approval                                                      */
  /* ======================================================================== */

  const approveHodSubmission =
    useCallback(
      async (
        approvalId,
        actorName
      ) => {
        if (!approvalId) {
          throw new Error(
            'approvalId is required'
          );
        }

        const response =
          await apiClient.post(
            `/approvals/${approvalId}/approve`,
            {
              actorName:
                actorName ??
                user?.name ??
                user?.username ??
                user?.email ??
                '',

              actorRole:
                role ??
                'HOD',
            }
          );

        const data =
          unwrapResponse(response);

        await loadHodApprovals();

        return data;
      },
      [
        user,
        role,
        loadHodApprovals,
      ]
    );

  /* ======================================================================== */
  /* Action Approval                                                          */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * POST /approvals/{id}/action
   *
   * {
   *   action,
   *   comments,
   *   actorName,
   *   actorRole
   * }
   *
   * We do not introduce REJECTED here.
   * Caller should use the backend-supported
   * action value for the intended workflow.
   */

  const actionApproval =
    useCallback(
      async ({
        approvalId,
        action,
        comments = '',
        actorName,
        actorRole,
      }) => {
        if (!approvalId) {
          throw new Error(
            'approvalId is required'
          );
        }

        if (!action) {
          throw new Error(
            'action is required'
          );
        }

        const response =
          await apiClient.post(
            `/approvals/${approvalId}/action`,
            {
              action,

              comments,

              actorName:
                actorName ??
                user?.name ??
                user?.username ??
                user?.email ??
                '',

              actorRole:
                actorRole ??
                role ??
                '',
            }
          );

        const data =
          unwrapResponse(response);

        /*
         * Refresh the appropriate approval
         * queue after action.
         */
        if (
          role === 'HOD'
        ) {
          await loadHodApprovals();
        }

        if (
          role === 'DIRECTOR' ||
          role === 'ADMIN'
        ) {
          await loadDirectorApprovals();
        }

        return data;
      },
      [
        user,
        role,
        loadDirectorApprovals,
        loadHodApprovals,
      ]
    );

  /* ======================================================================== */
  /* General Approval Fetch                                                   */
  /* ======================================================================== */

  const getApprovals =
    useCallback(
      async (
        params = {}
      ) => {
        const response =
          await apiClient.get(
            '/approvals',
            {
              params,
            }
          );

        return unwrapList(
          response
        );
      },
      []
    );

  /* ======================================================================== */
  /* Approval By ID                                                           */
  /* ======================================================================== */

  const getApprovalById =
    useCallback(
      async (
        approvalId
      ) => {
        if (!approvalId) {
          throw new Error(
            'approvalId is required'
          );
        }

        const response =
          await apiClient.get(
            `/approvals/${approvalId}`
          );

        return unwrapResponse(
          response
        );
      },
      []
    );

  /* ======================================================================== */
  /* Approval History                                                         */
  /* ======================================================================== */

  const getApprovalHistory =
    useCallback(
      async (
        approvalId
      ) => {
        if (!approvalId) {
          throw new Error(
            'approvalId is required'
          );
        }

        const response =
          await apiClient.get(
            `/approvals/${approvalId}/history`
          );

        return unwrapList(
          response
        );
      },
      []
    );

  /* ======================================================================== */
  /* Pending Verification Count                                               */
  /* ======================================================================== */

  const getPendingVerificationsCount =
    useCallback(
      () => {
        return Object.values(
          courseVerificationStore
        ).reduce(
          (
            count,
            record
          ) => {
            if (!record) {
              return count;
            }

            const hasPending =
              Object.entries(
                record
              ).some(
                ([
                  key,
                  value,
                ]) => {
                  if (
                    key ===
                    'key' ||
                    key ===
                    'courseOfferingId'
                  ) {
                    return false;
                  }

                  return (
                    value ===
                    'PENDING'
                  );
                }
              );

            return hasPending
              ? count + 1
              : count;
          },
          0
        );
      },
      [
        courseVerificationStore,
      ]
    );

  /* ======================================================================== */
  /* Refresh                                                                  */
  /* ======================================================================== */

  const refreshApprovals =
    useCallback(
      async ({
        schoolId = null,
        programmeId = null,
      } = {}) => {
        setLoading(true);
        setError(null);

        try {
          if (
            role ===
              'DIRECTOR' ||
            role === 'ADMIN'
          ) {
            return await loadDirectorApprovals(
              schoolId
            );
          }

          if (
            role === 'HOD'
          ) {
            return await loadHodApprovals(
              programmeId
            );
          }

          return [];
        } catch (err) {
          setError(
            err?.response?.data
              ?.message ??
              err?.response?.data
                ?.error ??
              err?.message ??
              'Failed to refresh approvals.'
          );

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [
        role,
        loadDirectorApprovals,
        loadHodApprovals,
      ]
    );

  /* ======================================================================== */
  /* Provider                                                                 */
  /* ======================================================================== */

  return (
    <ApprovalContext.Provider
      value={{
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

        /* Scoped approval queues */
        loadDirectorApprovals,

        loadHodApprovals,

        /* Formal approval actions */
        approveDirectorSubmission,

        approveHodSubmission,

        actionApproval,

        /* CourseOffering verification */
        getCourseVerification,

        submitCourseVerification,

        verifyStatus,

        requestRevision,

        updateCourseVerificationStatus,

        getPendingVerificationsCount,

        refreshApprovals,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useApproval() {
  const context =
    useContext(
      ApprovalContext
    );

  if (!context) {
    throw new Error(
      'useApproval must be used within an ApprovalProvider'
    );
  }

  return context;
}

export default useApproval;