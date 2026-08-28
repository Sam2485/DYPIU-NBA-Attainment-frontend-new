import apiClient from './client';

export const attainmentApi = {
  // ---------------------------------------------------------------------------
  // Attainment Configuration (Offering Scoped)
  // ---------------------------------------------------------------------------
  getConfig: (programmeBatchCourseId) =>
    apiClient.get(`/attainment/configurations/${programmeBatchCourseId}`),

  saveConfig: (config) =>
    apiClient.post('/attainment/configurations/save', config),

  updateConfig: (configId, config) =>
    apiClient.put(`/attainment/configurations/${configId}`, config),

  submitConfig: (programmeBatchCourseId, submittedBy) =>
    apiClient.post('/attainment/configurations/submit', null, {
      params: { programmeBatchCourseId, submittedBy },
    }),

  // ---------------------------------------------------------------------------
  // Direct Assessment (Examination) - Sheet 2
  // ---------------------------------------------------------------------------
  getExaminationAttainment: (programmeBatchCourseId) =>
    apiClient.get(`/attainment/examination/${programmeBatchCourseId}`),

  saveExaminationMarks: (programmeBatchCourseId, payload) =>
    apiClient.post(`/attainment/examination/${programmeBatchCourseId}`, payload),

  uploadExaminationSheet: (programmeBatchCourseId, formData) =>
    apiClient.post(
      `/attainment/examination/${programmeBatchCourseId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  deleteExaminationMarks: (programmeBatchCourseId) =>
    apiClient.delete(`/attainment/examination/${programmeBatchCourseId}`),

  // ---------------------------------------------------------------------------
  // Indirect Assessment (Course End Survey) - Sheet 3
  // ---------------------------------------------------------------------------
  getSurveyAttainment: (programmeBatchCourseId) =>
    apiClient.get(`/attainment/survey/${programmeBatchCourseId}`),

  saveSurveyResponses: (programmeBatchCourseId, payload) =>
    apiClient.post(`/attainment/survey/${programmeBatchCourseId}`, payload),

  uploadSurveySheet: (programmeBatchCourseId, formData) =>
    apiClient.post(
      `/attainment/survey/${programmeBatchCourseId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  deleteSurveyData: (programmeBatchCourseId) =>
    apiClient.delete(`/attainment/survey/${programmeBatchCourseId}`),

  // ---------------------------------------------------------------------------
  // CO Attainment Calculation
  // ---------------------------------------------------------------------------
  calculateCourseCoAttainment: (programmeBatchCourseId) =>
    apiClient.get(`/attainment/programme-batch-courses/${programmeBatchCourseId}`),

  // ---------------------------------------------------------------------------
  // Programme Attainment (Batch Scoped)
  // ---------------------------------------------------------------------------
  getProgrammeAttainment: (masterProgrammeId, programmeBatchId) =>
    apiClient.get(`/attainment/master-programmes/${masterProgrammeId}/programme-batches/${programmeBatchId}`),

  getProgrammeAttainmentDataset: (masterProgrammeId, programmeBatchId) =>
    apiClient.get(`/attainment/master-programmes/${masterProgrammeId}/programme-batches/${programmeBatchId}/dataset`),

  uploadProgrammeExitSurvey: (programmeBatchId, formData) =>
    apiClient.post(
      `/academic/programme-batches/${programmeBatchId}/survey/upload`,
      formData
    ),
};

export default attainmentApi;
