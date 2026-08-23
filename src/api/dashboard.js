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

  getHodDashboard: (departmentId, hodEmail) => {
    const params = {};

    if (departmentId) {
      params.departmentId =
        departmentId;
    }

    if (hodEmail) {
      params.hodEmail = hodEmail;
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

  getCourseCoordinatorDashboard: ({ courseOfferingId, coordinatorEmail } = {}) => {
    const params = {};
    if (courseOfferingId) params.courseOfferingId = courseOfferingId;
    if (coordinatorEmail) params.coordinatorEmail = coordinatorEmail;

    return apiClient.get('/academic/course-coordinator/summary', { params });
  },
};

export default dashboardApi;
