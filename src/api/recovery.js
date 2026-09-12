import apiClient from './client';

export const recoveryApi = {
  getDeletedItems: (params = {}) => {
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }
    return apiClient.get('/recovery/deleted-items', { params: cleanParams });
  },

  getSummary: () => apiClient.get('/recovery/summary'),

  restoreItem: (resourceType, id, reason) =>
    apiClient.post(`/recovery/${resourceType}/${id}/restore`, { reason }),
};

export default recoveryApi;
