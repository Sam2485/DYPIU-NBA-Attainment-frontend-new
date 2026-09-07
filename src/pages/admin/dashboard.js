import apiClient from './client';

export const dashboardApi = {
  getDirectorDashboard: (schoolId) => {
    const params = schoolId ? { schoolId } : {};
    return apiClient.get('/dashboard/director', { params });
  },
  getHodDashboard: (departmentId) => {
    const params = departmentId ? { departmentId } : {};
    return apiClient.get('/dashboard/hod', { params });
  },
  getProgrammeCoordinatorDashboard: (masterProgrammeId) => {
    const params = masterProgrammeId ? { masterProgrammeId } : {};
    return apiClient.get('/dashboard/programme-coordinator', { params });
  },
  getCourseCoordinatorDashboard: (programmeBatchCourseId, programmeBatchId) => {
    const params = {};
    if (programmeBatchCourseId) params.programmeBatchCourseId = programmeBatchCourseId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;
    return apiClient.get('/dashboard/course-coordinator', { params });
  },
};
