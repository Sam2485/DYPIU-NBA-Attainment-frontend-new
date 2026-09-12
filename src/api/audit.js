import apiClient from './client';

export const auditApi = {
  getAuditLogs: (params = {}) => {
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }
    return apiClient.get('/audit-logs', { params: cleanParams });
  },

  getAuditLogById: (id) => apiClient.get(`/audit-logs/${id}`),
};

export default auditApi;
