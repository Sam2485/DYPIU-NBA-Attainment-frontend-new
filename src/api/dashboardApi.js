import apiClient from './client';

/**
 * ====================================================================
 * DASHBOARDS & PROGRESS API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 */

// ── 1. ROLE-SPECIFIC DASHBOARDS ─────────────────────────────────────────────
export const getDirectorDashboard = async () => {
  return apiClient.get('/dashboard/director');
};

export const getHodDashboard = async (departmentId) => {
  const url = departmentId ? `/dashboard/hod?departmentId=${departmentId}` : '/dashboard/hod';
  return apiClient.get(url);
};

export const getProgrammeCoordinatorDashboard = async (programmeId) => {
  const url = programmeId ? `/dashboard/programme-coordinator?programmeId=${programmeId}` : '/dashboard/programme-coordinator';
  return apiClient.get(url);
};

export const getCourseCoordinatorDashboard = async (courseOfferingId) => {
  const url = courseOfferingId ? `/dashboard/course-coordinator?courseOfferingId=${courseOfferingId}` : '/dashboard/course-coordinator';
  return apiClient.get(url);
};

// ── 2. GUIDED SETUP PROGRESS ────────────────────────────────────────────────
export const getRoleSetupProgress = async (role, identifier) => {
  const endpointRole = role.toLowerCase().replace(/_/g, '-');
  const url = identifier
    ? `/academic/${endpointRole}/setup-progress?id=${identifier}`
    : `/academic/${endpointRole}/setup-progress`;
  return apiClient.get(url);
};

export const updateRoleSetupProgress = async (role, identifier, step) => {
  const endpointRole = role.toLowerCase().replace(/_/g, '-');
  return apiClient.post(`/academic/${endpointRole}/setup-progress`, {
    identifier,
    step,
  });
};
