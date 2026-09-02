import apiClient from './client';

export const reportsApi = {
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
