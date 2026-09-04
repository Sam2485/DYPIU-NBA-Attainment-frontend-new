import apiClient from './client';

/** Uploads a report branding asset. The backend owns validation and storage. */
export const reportAssetsApi = {
  upload: (file, assetType, institutionId = 'DYPIU') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);
    formData.append('institutionId', institutionId);
    return apiClient.post('/reports/assets/upload', formData);
  },
  list: (institutionId = 'DYPIU') => apiClient.get('/reports/assets', { params: { institutionId } }),
  get: (assetId) => apiClient.get(`/reports/assets/${assetId}`),
  getRaw: (assetId) => apiClient.get(`/reports/assets/${assetId}/raw`, { responseType: 'blob' }),
  delete: (assetId) => apiClient.delete(`/reports/assets/${assetId}`),
};

export default reportAssetsApi;
