import apiClient from './client';

export const academicApi = {
  // =========================
  // Schools
  // =========================
  getSchools: () =>
    apiClient.get('/academic/schools'),

  createSchool: (data) =>
    apiClient.post('/academic/schools', data),

  updateSchool: (id, data) =>
    apiClient.put(`/academic/schools/${id}`, data),


  // =========================
  // Departments
  // =========================
  getDepartments: (schoolId) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;

    return apiClient.get('/academic/departments', { params });
  },

  createDepartment: (data) =>
    apiClient.post('/academic/departments', data),

  updateDepartment: (id, data) =>
    apiClient.put(`/academic/departments/${id}`, data),

  deleteDepartment: (id) =>
    apiClient.delete(`/academic/departments/${id}`),


  // =========================
  // Programmes
  // =========================
  getProgrammes: (departmentId) => {
    const params = {};
    if (departmentId) params.departmentId = departmentId;

    return apiClient.get('/academic/programmes', { params });
  },

  createProgramme: (data) =>
    apiClient.post('/academic/programmes', data),

  updateProgramme: (id, data) =>
    apiClient.put(`/academic/programmes/${id}`, data),

  updateProgrammeCoordinator: (id, data) =>
    apiClient.put(
      `/academic/programmes/${id}/coordinator`,
      data
    ),

  deleteProgramme: (id) =>
    apiClient.delete(`/academic/programmes/${id}`),


  // =========================
  // Batches
  // =========================
  getBatches: ({ programmeId, userEmail, role } = {}) => {
    const params = {};

    if (programmeId) params.programmeId = programmeId;
    if (userEmail) params.userEmail = userEmail;
    if (role) params.role = role;

    return apiClient.get('/academic/batches', { params });
  },

  createBatch: (data) =>
    apiClient.post('/academic/batches', data),

  getBatchById: (id) =>
    apiClient.get(`/academic/batches/${id}`),

  updateBatch: (id, data) =>
    apiClient.put(`/academic/batches/${id}`, data),

  deleteBatch: (id) =>
    apiClient.delete(`/academic/batches/${id}`),

  getBatchContext: (batchId) =>
    apiClient.get(`/academic/batches/${batchId}/context`),

  getStudents: (batchId) =>
    apiClient.get(`/academic/batches/${batchId}/students`),

  createStudent: (batchId, data) =>
    apiClient.post(
      `/academic/batches/${batchId}/students`,
      data
    ),

  deleteStudent: (id) =>
    apiClient.delete(`/academic/students/${id}`),


  // =========================
  // Courses
  // =========================
  getCourses: (programmeId, batchId) => {
    const params = {};

    if (programmeId) params.programmeId = programmeId;
    if (batchId) params.batchId = batchId;

    return apiClient.get('/academic/courses', { params });
  },

  createCourse: (data) =>
    apiClient.post('/academic/courses', data),

  getCourseById: (id) =>
    apiClient.get(`/academic/courses/${id}`),

  updateCourse: (id, data) =>
    apiClient.put(`/academic/courses/${id}`, data),

  deleteCourse: (id) =>
    apiClient.delete(`/academic/courses/${id}`),


  // =========================
  // Course Offerings
  // =========================
  getCourseOfferings: (batchId) => {
    const params = batchId ? { batchId } : {};

    return apiClient.get(
      '/academic/course-offerings',
      { params }
    );
  },

  getCourseOfferingById: (offeringId) =>
    apiClient.get(
      `/academic/course-offerings/${offeringId}`
    ),

  createCourseOffering: (data) =>
    apiClient.post(
      '/academic/course-offerings',
      data
    ),

  updateCourseOffering: (id, data) =>
    apiClient.put(
      `/academic/course-offerings/${id}`,
      data
    ),

  deleteCourseOffering: (id) =>
    apiClient.delete(
      `/academic/course-offerings/${id}`
    ),


  // =========================
  // Course Offering Outcomes
  // =========================
  getCourseOutcomes: (offeringId) =>
    apiClient.get(
      `/academic/course-offerings/${offeringId}/outcomes`
    ),

  saveCourseOutcomes: (offeringId, data) =>
    apiClient.post(
      `/academic/course-offerings/${offeringId}/outcomes`,
      data
    ),


  // =========================
  // Course Offering Mapping
  // =========================
  getCourseMapping: (offeringId) =>
    apiClient.get(
      `/academic/course-offerings/${offeringId}/mappings`
    ),

  saveCourseMapping: (offeringId, data) =>
    apiClient.put(
      `/academic/course-offerings/${offeringId}/mappings`,
      data
    ),


  // =========================
  // HOD / PC Assignment
  // =========================
  getHodCoordinators: (departmentId) => {
    const params = departmentId
      ? { departmentId }
      : {};

    return apiClient.get(
      '/academic/hod/coordinators',
      { params }
    );
  },

  assignHodCoordinator: (data) =>
    apiClient.put(
      '/academic/hod/coordinators',
      data
    ),


  // =========================
  // Course Allocation
  // =========================
  allocateCourses: (data) =>
    apiClient.post(
      '/academic/courses/allocate',
      data
    ),


  // =========================
  // Role Directories
  // =========================
  getFaculty: () =>
    apiClient.get('/academic/faculty'),

  getProgrammeCoordinators: () =>
    apiClient.get('/academic/programme-coordinators'),

  getHods: () =>
    apiClient.get('/academic/hods'),

  getDirectors: () =>
    apiClient.get('/academic/directors'),
};

export default academicApi;