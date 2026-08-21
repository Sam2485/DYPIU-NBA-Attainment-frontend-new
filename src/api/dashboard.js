import apiClient from './client';

export const dashboardApi = {
  getDirectorDashboard: (schoolId) => {
    const params = {};

    if (schoolId) {
      params.schoolId = schoolId;
    }

    return apiClient.get(
      '/dashboard/director',
      { params }
    );
  },

  getHodDashboard: (departmentId) => {
    const params = {};

    if (departmentId) {
      params.departmentId =
        departmentId;
    }

    return apiClient.get(
      '/dashboard/hod',
      { params }
    );
  },

  getProgrammeCoordinatorDashboard: (
    programmeId
  ) => {
    const params = {};

    if (programmeId) {
      params.programmeId =
        programmeId;
    }

    return apiClient.get(
      '/dashboard/programme-coordinator',
      { params }
    );
  },

  getCourseCoordinatorDashboard: (
    courseId,
    batchId
  ) => {
    const params = {};

    if (courseId) {
      params.courseId = courseId;
    }

    if (batchId) {
      params.batchId = batchId;
    }

    return apiClient.get(
      '/dashboard/course-coordinator',
      { params }
    );
  },
};

export default dashboardApi;
