import apiClient from './client';
import { MASTER_MOCK_DATA, wrapApiResponse } from './masterContractMockData';

/**
 * ====================================================================
 * DASHBOARDS & PROGRESS API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Fallbacks strictly aligned with Master Backend API Contract
 */

// ── 1. ROLE-SPECIFIC DASHBOARDS ─────────────────────────────────────────────
export const getDirectorDashboard = async (directorEmail) => {
  const url = directorEmail ? `/dashboard/director?directorEmail=${encodeURIComponent(directorEmail)}` : '/dashboard/director';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.school || res.statistics)) return res;
  } catch (err) {
    console.warn('[dashboardApi] getDirectorDashboard offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.directorDashboard);
};

export const getHodDashboard = async (deptIdOrParams, optionalEmail) => {
  let params = new URLSearchParams();
  if (typeof deptIdOrParams === 'object' && deptIdOrParams !== null) {
    if (deptIdOrParams.departmentId) params.append('departmentId', deptIdOrParams.departmentId);
    if (deptIdOrParams.email) params.append('email', deptIdOrParams.email);
    if (deptIdOrParams.hodEmail) params.append('hodEmail', deptIdOrParams.hodEmail);
  } else if (typeof deptIdOrParams === 'string' && deptIdOrParams) {
    if (deptIdOrParams.includes('@')) {
      params.append('email', deptIdOrParams);
    } else {
      params.append('departmentId', deptIdOrParams);
    }
  }
  if (optionalEmail && typeof optionalEmail === 'string') {
    params.append('email', optionalEmail);
  }
  const queryString = params.toString();
  const url = queryString ? `/dashboard/hod?${queryString}` : '/dashboard/hod';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.department || res.statistics)) return res;
  } catch (err) {
    console.warn('[dashboardApi] getHodDashboard offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.hodDashboard);
};

export const getProgrammeCoordinatorDashboard = async (programmeId) => {
  const url = programmeId ? `/dashboard/programme-coordinator?programmeId=${programmeId}` : '/dashboard/programme-coordinator';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.programme || res.statistics)) return res;
  } catch (err) {
    console.warn('[dashboardApi] getProgrammeCoordinatorDashboard offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.programmeCoordinatorDashboard);
};

export const getCourseCoordinatorDashboard = async (courseOfferingId) => {
  const url = courseOfferingId ? `/dashboard/course-coordinator?courseOfferingId=${courseOfferingId}` : '/dashboard/course-coordinator';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.assignedCourseOfferings || res.statistics)) return res;
  } catch (err) {
    console.warn('[dashboardApi] getCourseCoordinatorDashboard offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courseCoordinatorDashboard);
};

// ── 2. GUIDED SETUP PROGRESS ────────────────────────────────────────────────
export const getRoleSetupProgress = async (role, identifier) => {
  const endpointRole = String(role || '').toLowerCase().replace(/_/g, '-');
  const url = identifier
    ? `/academic/${endpointRole}/setup-progress?id=${identifier}`
    : `/academic/${endpointRole}/setup-progress`;
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.currentStep !== undefined)) return res;
  } catch (err) {
    console.warn('[dashboardApi] getRoleSetupProgress offline/mock fallback:', err?.message);
  }

  if (endpointRole.includes('director')) {
    return wrapApiResponse(MASTER_MOCK_DATA.directorSetupProgress);
  } else if (endpointRole.includes('hod')) {
    return wrapApiResponse(MASTER_MOCK_DATA.hodSetupProgress);
  } else if (endpointRole.includes('coordinator')) {
    return wrapApiResponse(MASTER_MOCK_DATA.programmeCoordinatorSetupProgress);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.directorSetupProgress);
};

export const updateRoleSetupProgress = async (role, identifier, step) => {
  const endpointRole = String(role || '').toLowerCase().replace(/_/g, '-');
  try {
    return await apiClient.post(`/academic/${endpointRole}/setup-progress`, {
      identifier,
      step,
    });
  } catch (err) {
    console.warn('[dashboardApi] updateRoleSetupProgress offline/mock fallback:', err?.message);
    const mock = endpointRole.includes('hod')
      ? MASTER_MOCK_DATA.hodSetupProgress
      : endpointRole.includes('coordinator')
      ? MASTER_MOCK_DATA.programmeCoordinatorSetupProgress
      : MASTER_MOCK_DATA.directorSetupProgress;

    return wrapApiResponse({ ...mock, currentStep: step || 1 });
  }
};
