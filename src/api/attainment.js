import apiClient from './client';

export const attainmentApi = {
  // ---------------------------------------------------------------------------
  // Attainment Configuration (Offering Scoped)
  // ---------------------------------------------------------------------------
  getConfig: (courseOfferingId) =>
    apiClient.get(`/attainment/configurations/${courseOfferingId}`),

  saveConfig: (config) =>
    apiClient.post('/attainment/configurations/save', config),

  updateConfig: (configId, config) =>
    apiClient.put(`/attainment/configurations/${configId}`, config),

  submitConfig: (courseOfferingId, submittedBy) =>
    apiClient.post('/attainment/configurations/submit', null, {
      params: { courseOfferingId, submittedBy },
    }),

  // ---------------------------------------------------------------------------
  // Direct Assessment (Examination) - Sheet 2
  // ---------------------------------------------------------------------------
  getExaminationAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/examination/${courseOfferingId}`),

  saveExaminationMarks: (courseOfferingId, payload) =>
    apiClient.post(`/attainment/examination/${courseOfferingId}`, payload),

  uploadExaminationSheet: (courseOfferingId, formData) =>
    apiClient.post(
      `/attainment/course-offerings/${courseOfferingId}/examination/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  // ---------------------------------------------------------------------------
  // Indirect Assessment (Course End Survey) - Sheet 3
  // ---------------------------------------------------------------------------
  getSurveyAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/survey/${courseOfferingId}`),

  saveSurveyResponses: (courseOfferingId, payload) =>
    apiClient.post(`/attainment/survey/${courseOfferingId}`, payload),

  uploadSurveySheet: (programmeBatchCourseId, formData) =>
    apiClient.post(
      `/programme-batch-courses/${programmeBatchCourseId}/survey/upload`,
      formData
    ),

  // ---------------------------------------------------------------------------
  // CO Attainment Calculation
  // ---------------------------------------------------------------------------
  calculateCourseCoAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/course-offerings/${courseOfferingId}`),

  // ---------------------------------------------------------------------------
  // Programme Attainment (Batch Scoped)
  // ---------------------------------------------------------------------------
  getProgrammeAttainment: (programmeId, batchId) =>
    apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}`),

  getProgrammeAttainmentDataset: (programmeId, batchId) =>
    apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/dataset`),

  uploadProgrammeExitSurvey: (batchId, formData) =>
    apiClient.post(
      `/programme-batches/${batchId}/survey/upload`,
      formData
    ),
};

export default attainmentApi;
