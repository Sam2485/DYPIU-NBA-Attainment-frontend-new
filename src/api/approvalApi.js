import apiClient from './client';
import { MASTER_MOCK_DATA, wrapApiResponse } from './masterContractMockData';

/**
 * ====================================================================
 * APPROVALS API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Fallbacks strictly aligned with Master Backend API Contract
 */

export const getPendingApprovals = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await apiClient.get(`/approvals/pending${query ? `?${query}` : ''}`);
    if (res && (res.data || res.approvals || Array.isArray(res))) return res;
  } catch (err) {
    console.warn('[approvalApi] getPendingApprovals offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.pendingApprovals);
};

export const getApprovalDetails = async (approvalId) => {
  try {
    const res = await apiClient.get(`/approvals/${approvalId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[approvalApi] getApprovalDetails offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.approvalDetails);
};

export const approveItem = async (approvalId, comments = '') => {
  try {
    return await apiClient.post(`/approvals/${approvalId}/approve`, { comments });
  } catch (err) {
    console.warn('[approvalApi] approveItem offline/mock fallback:', err?.message);
    return wrapApiResponse({
      approvalId: approvalId || 'approval-1',
      status: 'APPROVED',
      approvedBy: {
        name: 'Programme Coordinator',
        role: 'PROGRAMME_COORDINATOR',
      },
      approvedAt: new Date().toISOString(),
    });
  }
};

export const requestRevision = async (approvalId, remarks = '') => {
  try {
    return await apiClient.post(`/approvals/${approvalId}/request-revision`, { remarks, comments: remarks });
  } catch (err) {
    console.warn('[approvalApi] requestRevision offline/mock fallback:', err?.message);
    return wrapApiResponse({
      approvalId: approvalId || 'approval-1',
      status: 'NEEDS_REVISION',
      comments: remarks || 'Please review action plan.',
    });
  }
};

export const getApprovalHistory = async (approvalId) => {
  try {
    const res = await apiClient.get(`/approvals/${approvalId}/history`);
    if (res && (res.data || res.history || Array.isArray(res))) return res;
  } catch (err) {
    console.warn('[approvalApi] getApprovalHistory offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.approvalHistory);
};
