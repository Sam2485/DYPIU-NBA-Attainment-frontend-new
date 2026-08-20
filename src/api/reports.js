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

  getCourseAtr: (courseOfferingId) =>
    apiClient.get(
      `/reports/course-atr/${courseOfferingId}`
    ),

  saveCourseAtr: (data) =>
    apiClient.post(
      '/reports/course-atr',
      data
    ),

  submitCourseAtr: (courseOfferingId) =>
    apiClient.post(
      `/reports/course-atr/${courseOfferingId}/submit`
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
      `/reports/programme-atr/${programmeId}/batch/${batchId}`
    ),

  saveProgrammeAtr: (data) =>
    apiClient.post(
      '/reports/programme-atr',
      data
    ),

  submitProgrammeAtr: (
    programmeId,
    batchId
  ) =>
    apiClient.post(
      `/reports/programme-atr/${programmeId}/batch/${batchId}/submit`
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
    courseOfferingId
  ) =>
    apiClient.get(
      `/reports/attainment-main/course/${courseOfferingId}`
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