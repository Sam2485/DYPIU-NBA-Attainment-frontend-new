import apiClient from './client';

/**
 * ====================================================================
 * REPORTS & ATR API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 */

// ── 1. COURSE ACTION TAKEN REPORT (Course ATR) ───────────────────────────────
export const getCourseAtr = async (courseOfferingId) => {
  return apiClient.get(`/reports/course-atr/${courseOfferingId}`);
};

export const saveCourseAtr = async (data) => {
  return apiClient.post('/reports/course-atr', data);
};

export const submitCourseAtr = async (courseAtrId, comments = '') => {
  return apiClient.post(`/reports/course-atr/${courseAtrId}/submit`, { comments });
};

export const exportCourseAtrData = async (courseOfferingId) => {
  return apiClient.get(`/reports/course-atr/${courseOfferingId}/export-data`);
};

// ── 2. PROGRAMME ACTION TAKEN REPORT (Programme ATR) ─────────────────────────
export const getProgrammeAtr = async (programmeId, batchId) => {
  return apiClient.get(`/reports/programme-atr/${programmeId}/batch/${batchId}`);
};

export const saveProgrammeAtr = async (data) => {
  return apiClient.post('/reports/programme-atr', data);
};

export const submitProgrammeAtr = async (programmeAtrId, comments = '') => {
  return apiClient.post(`/reports/programme-atr/${programmeAtrId}/submit`, { comments });
};

export const exportProgrammeAtrData = async (programmeId, batchId) => {
  return apiClient.get(`/reports/programme-atr/${programmeId}/batch/${batchId}/export-data`);
};

// ── 3. REPORTS FILTERS, SUMMARIES & COMPARISONS ──────────────────────────────
export const getReportsFilters = async () => {
  return apiClient.get('/reports/filters');
};

export const getCourseAtrList = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/reports/course-atrs${query ? `?${query}` : ''}`);
};

export const getProgrammeAtrList = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/reports/programme-atrs${query ? `?${query}` : ''}`);
};

export const getBatchSummary = async (batchId) => {
  return apiClient.get(`/reports/batch/${batchId}/summary`);
};

export const getProgrammeBatchComparison = async (programmeId) => {
  return apiClient.get(`/reports/programmes/${programmeId}/batch-comparison`);
};

export const getAttainmentMainReport = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/reports/attainment-main${query ? `?${query}` : ''}`);
};
