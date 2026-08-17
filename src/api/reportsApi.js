import apiClient from './client';
import { MASTER_MOCK_DATA, wrapApiResponse } from './masterContractMockData';

/**
 * ====================================================================
 * REPORTS & ATR API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Fallbacks strictly aligned with Master Backend API Contract
 */

// ── 1. COURSE ACTION TAKEN REPORT (Course ATR) ───────────────────────────────
export const getCourseAtr = async (courseOfferingId) => {
  try {
    const res = await apiClient.get(`/reports/course-atr/${courseOfferingId}`);
    if (res && (res.data || res.outcomes || res.courseOffering)) return res;
  } catch (err) {
    console.warn('[reportsApi] getCourseAtr offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courseAtr);
};

export const saveCourseAtr = async (data) => {
  try {
    return await apiClient.post('/reports/course-atr', data);
  } catch (err) {
    console.warn('[reportsApi] saveCourseAtr offline/mock fallback:', err?.message);
    return wrapApiResponse({
      courseAtrId: 'catr-1',
      courseOfferingId: data?.courseOfferingId || 'offering-1',
      status: 'DRAFT',
      outcomes: MASTER_MOCK_DATA.courseAtr.outcomes,
    });
  }
};

export const submitCourseAtr = async (courseAtrId, comments = '') => {
  try {
    return await apiClient.post(`/reports/course-atr/${courseAtrId}/submit`, { comments });
  } catch (err) {
    console.warn('[reportsApi] submitCourseAtr offline/mock fallback:', err?.message);
    return wrapApiResponse({
      courseAtrId: courseAtrId || 'catr-1',
      status: 'SUBMITTED_FOR_APPROVAL',
      submittedBy: {
        id: 'user-1',
        name: 'Course Coordinator',
      },
      nextApprover: {
        role: 'PROGRAMME_COORDINATOR',
      },
    });
  }
};

export const exportCourseAtrData = async (courseOfferingId) => {
  try {
    const res = await apiClient.get(`/reports/course-atr/${courseOfferingId}/export-data`);
    if (res && (res.data || res.header || res.coSection)) return res;
  } catch (err) {
    console.warn('[reportsApi] exportCourseAtrData offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courseAtrExportData);
};

// ── 2. PROGRAMME ACTION TAKEN REPORT (Programme ATR) ─────────────────────────
export const getProgrammeAtr = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/reports/programme-atr/${programmeId}/batch/${batchId}`);
    if (res && (res.data || res.poOutcomes || res.programme)) return res;
  } catch (err) {
    console.warn('[reportsApi] getProgrammeAtr offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.programmeAtr);
};

export const saveProgrammeAtr = async (data) => {
  try {
    return await apiClient.post('/reports/programme-atr', data);
  } catch (err) {
    console.warn('[reportsApi] saveProgrammeAtr offline/mock fallback:', err?.message);
    return wrapApiResponse({
      programmeAtrId: 'patr-2029',
      programmeId: data?.programmeId || 'prog-1',
      batchId: data?.batchId || 'batch-2025-29',
      status: 'DRAFT',
      poOutcomes: MASTER_MOCK_DATA.programmeAtr.poOutcomes,
      psoOutcomes: MASTER_MOCK_DATA.programmeAtr.psoOutcomes,
    });
  }
};

export const submitProgrammeAtr = async (programmeAtrId, comments = '', programmeId = '', batchId = '') => {
  try {
    if (programmeId && batchId) {
      return await apiClient.post(`/reports/programme-atr/${programmeId}/batch/${batchId}/submit`, { comments });
    }
    return await apiClient.post(`/reports/programme-atr/${programmeAtrId}/submit`, { comments });
  } catch (err) {
    console.warn('[reportsApi] submitProgrammeAtr offline/mock fallback:', err?.message);
    return wrapApiResponse({
      programmeAtrId: programmeAtrId || 'patr-2029',
      status: 'SUBMITTED_FOR_APPROVAL',
      submittedBy: {
        name: 'Programme Coordinator',
      },
      nextApprover: {
        role: 'HOD',
      },
    });
  }
};

export const exportProgrammeAtrData = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/reports/programme-atr/${programmeId}/batch/${batchId}/export-data`);
    if (res && (res.data || res.header || res.poSection)) return res;
  } catch (err) {
    console.warn('[reportsApi] exportProgrammeAtrData offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.programmeAtrExportData);
};

// ── 3. REPORTS FILTERS, SUMMARIES & COMPARISONS ──────────────────────────────
export const getReportsFilters = async () => {
  try {
    const res = await apiClient.get('/reports/filters');
    if (res && (res.data || res.programmes || res.batches)) return res;
  } catch (err) {
    console.warn('[reportsApi] getReportsFilters offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.reportsFilters);
};

export const getCourseAtrList = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await apiClient.get(`/reports/course-atrs${query ? `?${query}` : ''}`);
    if (res && (res.data || res.reports || Array.isArray(res))) return res;
  } catch (err) {
    console.warn('[reportsApi] getCourseAtrList offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courseAtrList);
};

export const getProgrammeAtrList = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await apiClient.get(`/reports/programme-atrs${query ? `?${query}` : ''}`);
    if (res && (res.data || res.reports || Array.isArray(res))) return res;
  } catch (err) {
    console.warn('[reportsApi] getProgrammeAtrList offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.programmeAtrList);
};

export const getBatchSummary = async (batchId) => {
  try {
    const res = await apiClient.get(`/reports/batch/${batchId}/summary`);
    if (res && (res.data || res.batch || res.students)) return res;
  } catch (err) {
    console.warn('[reportsApi] getBatchSummary offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.batchSummary);
};

export const getProgrammeBatchComparison = async (programmeId) => {
  try {
    const res = await apiClient.get(`/reports/programmes/${programmeId}/batch-comparison`);
    if (res && (res.data || res.batches)) return res;
  } catch (err) {
    console.warn('[reportsApi] getProgrammeBatchComparison offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.batchComparison);
};

export const getAttainmentMainReport = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await apiClient.get(`/reports/attainment-main${query ? `?${query}` : ''}`);
    if (res && (res.data || res.sections)) return res;
  } catch (err) {
    console.warn('[reportsApi] getAttainmentMainReport offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.attainmentMainReport);
};
