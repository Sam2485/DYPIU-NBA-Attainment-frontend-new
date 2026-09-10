import apiClient from './client';

export const attainmentApi = {
  // ---------------------------------------------------------------------------
  // Attainment Configuration (Offering Scoped)
  // ---------------------------------------------------------------------------
  getConfig: (programmeBatchCourseId) =>
    apiClient.get(`/attainment/config/${programmeBatchCourseId}`),

  saveConfig: (programmeBatchCourseId, config) =>
    apiClient.put(`/attainment/config/${programmeBatchCourseId}`, config),

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

  // ---------------------------------------------------------------------------
  // Programme Batch Indirect Attainment (Programme Exit Survey)
  // ---------------------------------------------------------------------------
  getProgrammeIndirectAttainment: (programmeBatchId) =>
    apiClient.get(`/programme-batches/${programmeBatchId}/survey`),

  saveProgrammeIndirectAttainment: (programmeBatchId, payload) =>
    apiClient.post(`/programme-batches/${programmeBatchId}/survey`, payload),

  uploadProgrammeExitSurvey: (programmeBatchId, formData) =>
    apiClient.post(
      `/programme-batches/${programmeBatchId}/survey/upload`,
      formData
    ),

  deleteProgrammeIndirectAttainment: (programmeBatchId) =>
    apiClient.delete(`/programme-batches/${programmeBatchId}/survey`),

  // ---------------------------------------------------------------------------
  // Surveys & Co-Curricular Events (Indirect Assessments)
  // ---------------------------------------------------------------------------
  getIndirectAssessments: (programmeBatchId) =>
    apiClient.get(`/programme-batches/${programmeBatchId}/indirect-assessments`),

  getIndirectAssessmentById: (programmeBatchId, id) =>
    apiClient.get(`/programme-batches/${programmeBatchId}/indirect-assessments/${id}`),

  createIndirectAssessment: (programmeBatchId, payload) =>
    apiClient.post(`/programme-batches/${programmeBatchId}/indirect-assessments`, payload),

  updateIndirectAssessment: (programmeBatchId, id, payload) =>
    apiClient.put(`/programme-batches/${programmeBatchId}/indirect-assessments/${id}`, payload),

  deleteIndirectAssessment: (programmeBatchId, id) =>
    apiClient.delete(`/programme-batches/${programmeBatchId}/indirect-assessments/${id}`),

  getConsolidatedIndirectAttainment: (programmeBatchId) =>
    apiClient.get(`/programme-batches/${programmeBatchId}/indirect-assessments/consolidated`),
};

export default attainmentApi;
