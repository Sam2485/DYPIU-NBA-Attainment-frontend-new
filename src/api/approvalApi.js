import apiClient from './client';

/**
 * ====================================================================
 * APPROVALS API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 */

export const getPendingApprovals = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/approvals/pending${query ? `?${query}` : ''}`);
};

export const getApprovalDetails = async (approvalId) => {
  return apiClient.get(`/approvals/${approvalId}`);
};

export const approveItem = async (approvalId, comments = '') => {
  return apiClient.post(`/approvals/${approvalId}/approve`, { comments });
};

export const requestRevision = async (approvalId, remarks = '') => {
  return apiClient.post(`/approvals/${approvalId}/request-revision`, { remarks });
};

export const getApprovalHistory = async (approvalId) => {
  return apiClient.get(`/approvals/${approvalId}/history`);
};
