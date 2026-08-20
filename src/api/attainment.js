import apiClient from './client';

export const attainmentApi = {
  // ---------------------------------------------------------------------------
  // Attainment Configuration (Offering Scoped)
  // ---------------------------------------------------------------------------
  getConfig: (courseOfferingId) =>
    apiClient.get(`/attainment/config/${courseOfferingId}`),

  saveConfig: (courseOfferingId, config) =>
    apiClient.put(`/attainment/config/${courseOfferingId}`, config),

  // ---------------------------------------------------------------------------
  // Direct Assessment (Examination) - Sheet 2
  // ---------------------------------------------------------------------------
  getExaminationAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/examination/${courseOfferingId}`),

  saveExaminationMarks: (courseOfferingId, payload) =>
    apiClient.post(`/attainment/examination/${courseOfferingId}`, payload),

  uploadExaminationSheet: (courseOfferingId, formData) =>
    apiClient.post(`/attainment/examination/${courseOfferingId}/upload`, formData),

  // ---------------------------------------------------------------------------
  // Indirect Assessment (Course End Survey) - Sheet 3
  // ---------------------------------------------------------------------------
  getSurveyAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/survey/${courseOfferingId}`),

  saveSurveyResponses: (courseOfferingId, payload) =>
    apiClient.post(`/attainment/survey/${courseOfferingId}`, payload),

  uploadSurveySheet: (courseOfferingId, formData) =>
    apiClient.post(`/attainment/survey/${courseOfferingId}/upload`, formData),

  // ---------------------------------------------------------------------------
  // CO Attainment Calculation
  // ---------------------------------------------------------------------------
  calculateCourseCoAttainment: (courseOfferingId) =>
    apiClient.get(`/attainment/course/${courseOfferingId}`),

  // ---------------------------------------------------------------------------
  // Programme Attainment (Batch Scoped)
  // ---------------------------------------------------------------------------
  getProgrammeAttainment: (programmeId, batchId) =>
    apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}`),

  getProgrammeAttainmentDataset: (programmeId, batchId) =>
    apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/dataset`),

  uploadProgrammeExitSurvey: (programmeId, batchId, formData) =>
    apiClient.post(
      `/attainment/programmes/${programmeId}/batches/${batchId}/programme-survey/upload`,
      formData
    ),
};

export default attainmentApi;
