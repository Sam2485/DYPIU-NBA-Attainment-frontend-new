import apiClient from './client';

export const reportsApi = {
  // -----------------------------------------------------------------------
  // Report Filters
  // -----------------------------------------------------------------------

  getFilters: () =>
    apiClient.get('/reports/filters'),

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

  getCourseAtrs: (params = {}) =>
    apiClient.get(
      '/reports/course-atrs',
      { params }
    ),

  // -----------------------------------------------------------------------
  // Programme ATR
  // -----------------------------------------------------------------------

  getProgrammeAtr: (
    programmeId,
    batchId
  ) =>
    apiClient.get(
      `/reports/programmes/${programmeId}/batches/${batchId}/programme-atr`
    ),

  getPreviousYearProgrammeAtr: (programmeBatchId) =>
    apiClient.get(
      `/atr/programme/previous-year/${programmeBatchId}`
    ),

  saveProgrammeAtr: (data) =>
    apiClient.post(
      '/reports/programmes/programme-atr',
      data
    ),

  submitProgrammeAtr: (
    programmeId,
    batchId
  ) =>
    apiClient.post(
      `/reports/programmes/${programmeId}/batches/${batchId}/programme-atr/submit`
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
    programmeId,
    batchId
  ) =>
    apiClient.get(
      '/reports/attainment-main',
      {
        params: {
          programmeId,
          batchId,
        },
      }
    ),

  getCourseAttainment: (
    programmeBatchCourseId
  ) =>
    apiClient.get(
      `/programme-batch-courses/${programmeBatchCourseId}/attainment-main`
    ),

  // -----------------------------------------------------------------------
  // Batch / Programme Comparison
  // -----------------------------------------------------------------------

  getBatchComparison: (
    programmeId,
    batchIds
  ) =>
    apiClient.get(
      `/reports/programmes/${programmeId}/batch-comparison`,
      {
        params: {
          batchIds,
        },
      }
    ),

  getBatchSummary: (
    batchId
  ) =>
    apiClient.get(
      `/reports/batch/${batchId}/summary`
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
