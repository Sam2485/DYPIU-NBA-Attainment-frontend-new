import apiClient from './client';

export const reportsApi = {
  // -----------------------------------------------------------------------
  // IQAC institutional report template
  // -----------------------------------------------------------------------
  getInstitutionTemplate: (institutionId = 'DYPIU') =>
    apiClient.get('/reports/template', { params: { institutionId } }),

  saveInstitutionTemplate: (template) =>
    apiClient.put('/reports/template', template),

  saveHeaderConfig: (headerConfig) =>
    apiClient.put('/reports/template/header', headerConfig),

  // -----------------------------------------------------------------------
  // Generated report history and persisted artifacts
  // -----------------------------------------------------------------------
  listGeneratedReports: (params = {}) =>
    apiClient.get('/reports', { params }),

  getGeneratedReport: (reportId) =>
    apiClient.get(`/reports/${reportId}`),

  downloadArtifact: (artifactId) =>
    apiClient.get(`/reports/artifacts/${artifactId}/download`, { responseType: 'blob' }),

  verifyArtifact: ({ reportId, artifactType, file }) => {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('artifactType', artifactType);
    formData.append('file', file);
    return apiClient.post('/reports/verify', formData);
  },

  // -----------------------------------------------------------------------
  // Authoritative report-generation downloads
  // -----------------------------------------------------------------------
  downloadProgrammeAttainmentMasterPdf: (programmeBatchId, masterProgrammeId = null) =>
    apiClient.get(`/reports/programme-attainment/${programmeBatchId}/master/pdf`, { params: masterProgrammeId ? { masterProgrammeId } : {}, responseType: 'blob' }),
  downloadProgrammeAttainmentMasterExcel: (programmeBatchId, masterProgrammeId = null) =>
    apiClient.get(`/reports/programme-attainment/${programmeBatchId}/master/excel`, { params: masterProgrammeId ? { masterProgrammeId } : {}, responseType: 'blob' }),
  downloadProgrammeAttainmentSectionPdf: (programmeBatchId, section) =>
    apiClient.get(`/reports/programme-attainment/${programmeBatchId}/section/${section}/pdf`, { responseType: 'blob' }),
  downloadProgrammeAttainmentSectionExcel: (programmeBatchId, section) =>
    apiClient.get(`/reports/programme-attainment/${programmeBatchId}/section/${section}/excel`, { responseType: 'blob' }),
  downloadCourseAttainmentPdf: (programmeBatchCourseId) =>
    apiClient.get(`/reports/course-attainment/${programmeBatchCourseId}/pdf`, { responseType: 'blob' }),
  downloadCourseAttainmentExcel: (programmeBatchCourseId) =>
    apiClient.get(`/reports/course-attainment/${programmeBatchCourseId}/excel`, { responseType: 'blob' }),
  downloadProgrammeAtrPdf: (programmeBatchId) =>
    apiClient.get(`/reports/programme-atr/${programmeBatchId}/pdf`, { responseType: 'blob' }),
  downloadProgrammeAtrExcel: (programmeBatchId) =>
    apiClient.get(`/reports/programme-atr/${programmeBatchId}/excel`, { responseType: 'blob' }),
  downloadCourseAtrPdf: (programmeBatchCourseId) =>
    apiClient.get(`/reports/course-atr/${programmeBatchCourseId}/pdf`, { responseType: 'blob' }),
  downloadCourseAtrExcel: (programmeBatchCourseId) =>
    apiClient.get(`/reports/course-atr/${programmeBatchCourseId}/excel`, { responseType: 'blob' }),
  // -----------------------------------------------------------------------
  // Report Filters
  // -----------------------------------------------------------------------

  getFilters: () =>
    apiClient.get('/reports/filters'),

  // HOD report filter hierarchy
  getMasterProgrammesByDepartment: (departmentId) =>
    apiClient.get('/master-programmes', {
      params: departmentId ? { departmentId } : {},
    }),

  // Director report filter hierarchy
  getMasterProgrammesBySchool: (schoolId) =>
    apiClient.get('/master-programmes', {
      // The Director token also scopes this endpoint to their school when no
      // school ID is present in the current user payload.
      params: schoolId ? { schoolId } : {},
    }),

  getProgrammeBatchesByMasterProgramme: (masterProgrammeId) =>
    apiClient.get(`/master-programmes/${masterProgrammeId}/programme-batches`),

  // -----------------------------------------------------------------------
  // General Reports Summary
  // -----------------------------------------------------------------------

  getReportsSummary: (params = {}) =>
    apiClient.get('/reports/summary', {
      params,
    }),

  // -----------------------------------------------------------------------
  // Course ATR
  // -----------------------------------------------------------------------

  getCourseAtr: (programmeBatchCourseId) =>
    apiClient.get(
      `/programme-batch-courses/${programmeBatchCourseId}/atr`
    ),

  saveCourseAtr: (programmeBatchCourseId, data) =>
    apiClient.put(
      `/programme-batch-courses/${programmeBatchCourseId}/atr`,
      data
    ),

  submitCourseAtr: (programmeBatchCourseId) =>
    apiClient.post(
      `/programme-batch-courses/${programmeBatchCourseId}/atr/submit`
    ),

  getPreviousYearCourseAtr: (programmeBatchCourseId) =>
    apiClient.get(
      `/academic/programme-batch-courses/${programmeBatchCourseId}/previous-year-atr`
    ),

  getCourseAtrs: (params = {}) =>
    apiClient.get(
      '/reports/course-atrs',
      { params }
    ),

  // -----------------------------------------------------------------------
  // Programme ATR
  // -----------------------------------------------------------------------

  getProgrammeAtr: (programmeBatchId) =>
    apiClient.get(
      `/academic/programme-batches/${programmeBatchId}/atr`
    ),

  getProgrammeBatchApprovalWorkspace: (programmeBatchId) =>
    apiClient.get(
      `/approvals/programme-batches/${programmeBatchId}`
    ),

  getPreviousYearProgrammeAtr: (programmeBatchId) =>
    apiClient.get(
      `/atr/master-programmes/previous-year/${programmeBatchId}`
    ),

  saveProgrammeAtr: (programmeBatchId, data) =>
    apiClient.put(
      `/academic/programme-batches/${programmeBatchId}/atr`,
      data
    ),

  submitProgrammeAtr: (programmeBatchId) =>
    apiClient.post(
      `/academic/programme-batches/${programmeBatchId}/atr/submit`
    ),

  getProgrammeAtrs: (params = {}) =>
    apiClient.get(
      '/reports/programme-atrs',
      { params }
    ),

  // -----------------------------------------------------------------------
  // Attainment Reports
  // -----------------------------------------------------------------------

  getProgrammeAttainment: (
    masterProgrammeId,
    programmeBatchId
  ) =>
    apiClient.get(
      '/reports/attainment-main',
      {
        params: {
          masterProgrammeId,
          programmeBatchId,
        },
      }
    ),

  getAverageMapping: (programmeBatchId) =>
    apiClient.get(
      `/attainment/programme-batch/${programmeBatchId}/average-mapping`
    ),

  getAverageDirectAttainment: (programmeBatchId) =>
    apiClient.get(
      `/attainment/programme-batch/${programmeBatchId}/average-direct`
    ),

  getAverageIndirectAttainment: (programmeBatchId) =>
    apiClient.get(
      `/attainment/programme-batch/${programmeBatchId}/average-indirect`
    ),

  getCourseAttainment: (
    programmeBatchCourseId
  ) =>
    apiClient.get(
      `/programme-batch-courses/${programmeBatchCourseId}/co-attainment`
    ),

  // -----------------------------------------------------------------------
  // Batch / Programme Comparison
  // -----------------------------------------------------------------------

  getBatchComparison: (
    masterProgrammeId,
    programmeBatchIds
  ) =>
    apiClient.get(
      `/reports/master-programmes/${masterProgrammeId}/batch-comparison`,
      {
        params: {
          programmeBatchIds,
        },
      }
    ),

  getBatchSummary: (
    programmeBatchId
  ) =>
    apiClient.get(
      `/reports/programme-batches/${programmeBatchId}/summary`
    ),

  // -----------------------------------------------------------------------
  // Export
  // -----------------------------------------------------------------------

  exportExcel: (
    params = {}
  ) =>
    apiClient.get(
      '/reports/export/excel',
      {
        params,
        responseType: 'blob',
      }
    ),

  exportPdf: (
    params = {}
  ) =>
    apiClient.get(
      '/reports/export/pdf',
      {
        params,
        responseType: 'blob',
      }
    ),
};

export default reportsApi;
