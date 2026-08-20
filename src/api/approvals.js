import apiClient from './client';

export const approvalsApi = {
  // Formal Approval Requests
  getApprovals: (params = {}) => apiClient.get('/approvals', { params }),
  getApprovalById: (id) => apiClient.get(`/approvals/${id}`),
  submitApproval: (data) => apiClient.post('/approvals/submit', data),
  actionApproval: (id, data) => apiClient.post(`/approvals/${id}/action`, data),

  // Multi-Tier Verification Status & Actions
  getVerificationStatus: (key) => apiClient.get('/approvals/verification-status', { params: { key } }),
  verifyStatus: (data) => apiClient.put('/approvals/verify', data),
  requestRevision: (data) => apiClient.put('/approvals/request-revision', data),
};
