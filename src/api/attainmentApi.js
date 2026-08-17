import apiClient from './client';
import { MASTER_MOCK_DATA, wrapApiResponse } from './masterContractMockData';

/**
 * ====================================================================
 * ATTAINMENT API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Single Source of Truth for Attainment Calculations
 * Fallbacks strictly aligned with Master Backend API Contract
 */

// ── 1. COURSE-LEVEL ATTAINMENT (By Course Offering) ─────────────────────────
export const getCourseAttainment = async (courseOfferingId) => {
  try {
    const res = await apiClient.get(`/attainment/course/${courseOfferingId}`);
    if (res && (res.data || res.outcomes || res.courseOffering)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getCourseAttainment offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courseAttainment);
};

// ── 2. PROGRAMME & BATCH-LEVEL ATTAINMENT (Cohort Scoped) ───────────────────
export const getProgrammeBatchAttainment = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}`);
    if (res && (res.data || res.overallAttainment || res.programme)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeBatchAttainment offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.programmeAttainment);
};

export const getProgrammeBatchDataset = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/dataset`);
    if (res && (res.data || res.overallAttainment || res.averageMapping)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeBatchDataset offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.attainmentDataset);
};

export const getProgrammeAverageMapping = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/average-mapping`);
    if (res && (res.data || res.rows)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeAverageMapping offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({
    programmeId: programmeId || 'prog-1',
    batchId: batchId || 'batch-2025-29',
    rows: MASTER_MOCK_DATA.attainmentDataset.averageMapping.rows,
  });
};

export const getProgrammeAverageDirect = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/average-direct`);
    if (res && (res.data || res.rows || res.overall)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeAverageDirect offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({
    programmeId: programmeId || 'prog-1',
    batchId: batchId || 'batch-2025-29',
    rows: MASTER_MOCK_DATA.attainmentDataset.averageDirectAttainment.rows,
    overall: { PO1: 2.30, PO2: 2.20, PO3: 2.40, PSO1: 2.10 },
  });
};

export const getProgrammeAverageIndirect = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/average-indirect`);
    if (res && (res.data || res.PO1 !== undefined)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeAverageIndirect offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({
    programmeId: programmeId || 'prog-1',
    batchId: batchId || 'batch-2025-29',
    ...MASTER_MOCK_DATA.attainmentDataset.averageIndirectAttainment,
  });
};

export const getProgrammeOverallAttainment = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/overall`);
    if (res && (res.data || res.PO1 !== undefined)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeOverallAttainment offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({
    programmeId: programmeId || 'prog-1',
    batchId: batchId || 'batch-2025-29',
    ...MASTER_MOCK_DATA.programmeAttainment.overallAttainment,
  });
};

export const getProgrammeSemestersAttainment = async (programmeId, batchId) => {
  try {
    const res = await apiClient.get(`/attainment/programme/${programmeId}/batch/${batchId}/semesters`);
    if (res && (res.data || res.semesters)) return res;
  } catch (err) {
    console.warn('[attainmentApi] getProgrammeSemestersAttainment offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.semestersAttainment);
};
