import apiClient from './client';

export const academicApi = {
  // =========================
  // Schools
  // =========================
  getSchools: () =>
    apiClient.get('/academic/schools'),

  getSchoolById: (id) =>
    apiClient.get(`/academic/schools/${id}`),

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

  getProgrammeById: (id) =>
    apiClient.get(`/academic/programmes/${id}`),

  createProgramme: (data) =>
    apiClient.post('/academic/programmes', data),

  updateProgramme: (id, data) =>
    apiClient.put(`/academic/programmes/${id}`, data),

  updateProgrammeCoordinator: (id, data) =>
    apiClient.put(`/academic/programmes/${id}/coordinator`, data),

  deleteProgramme: (id) =>
    apiClient.delete(`/academic/programmes/${id}`),

  // =========================
  // Master Programmes (authoritative hierarchy API)
  // =========================
  getMasterProgrammes: () =>
    apiClient.get('/master-programmes'),

  createMasterProgramme: (data) =>
    apiClient.post('/master-programmes', data),

  updateMasterProgramme: (masterProgrammeId, data) =>
    apiClient.put(`/master-programmes/${masterProgrammeId}`, data),

  deleteMasterProgramme: (masterProgrammeId) =>
    apiClient.delete(`/master-programmes/${masterProgrammeId}`),

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

  // =========================
  // Programme Batches
  // =========================
  getProgrammeBatches: (masterProgrammeId) => {
    const params = {};
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    return apiClient.get('/programme-batches', { params });
  },

  createProgrammeBatch: (data) =>
    apiClient.post('/programme-batches', data),

  updateProgrammeBatch: (id, data) =>
    apiClient.put(`/programme-batches/${id}`, data),

  deleteProgrammeBatch: (id) =>
    apiClient.delete(`/programme-batches/${id}`),

  updateProgrammeBatchStatus: (id, data) =>
    apiClient.post(`/programme-batches/${id}/status`, data),

  getBatchContext: (batchId) =>
    apiClient.get(`/academic/batches/${batchId}/context`),

  getStudents: (batchId) =>
    apiClient.get(`/academic/batches/${batchId}/students`),

  createStudent: (batchId, data) =>
    apiClient.post(`/academic/batches/${batchId}/students`, data),

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
  // Master Courses
  // =========================
  getMasterCourses: ({ masterProgrammeId, programmeBatchId } = {}) => {
    const params = {};
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;
    return apiClient.get('/academic/master-courses', { params });
  },

  createMasterCourse: (data) =>
    apiClient.post('/academic/master-courses', data),

  updateMasterCourse: (id, data) =>
    apiClient.put(`/academic/master-courses/${id}`, data),

  deleteMasterCourse: (id) =>
    apiClient.delete(`/academic/master-courses/${id}`),

  // =========================
  // Course Offerings
  // =========================
  getCourseOfferings: (batchId) => {
    const params = batchId ? { programmeBatchId: batchId } : {};

    return apiClient.get('/academic/course-offerings', { params });
  },

  getCourseOfferingById: (offeringId) =>
    apiClient.get(`/academic/course-offerings/${offeringId}`),

  createCourseOffering: (data) =>
    apiClient.post('/academic/course-offerings', data),

  updateCourseOffering: (id, data) =>
    apiClient.put(`/academic/course-offerings/${id}`, data),

  deleteCourseOffering: (id) =>
    apiClient.delete(`/academic/course-offerings/${id}`),

  // =========================
  // Course Offering Outcomes
  // =========================
  getCourseOutcomes: (offeringId) =>
    apiClient.get(`/programme-batch-courses/${offeringId}/course-outcomes`),

  saveCourseOutcomes: (offeringId, data) =>
    apiClient.post(`/programme-batch-courses/${offeringId}/course-outcomes`, data),

  // =========================
  // Course Offering Mapping
  // =========================
  getCourseMapping: (offeringId) =>
    apiClient.get(`/programme-batch-courses/${offeringId}/co-po-pso-mappings`),

  saveCourseMapping: (offeringId, data) =>
    apiClient.put(`/programme-batch-courses/${offeringId}/co-po-pso-mappings`, data),

  // =========================
  // Programme Targets
  // =========================
  getProgrammeTargets: (programmeId, batchId) => {
    const params = batchId ? { batchId } : {};
    return apiClient.get(`/academic/programmes/${programmeId}/targets`, { params });
  },

  saveProgrammeTargets: (programmeId, data) =>
    apiClient.post(`/academic/programmes/${programmeId}/targets`, data),

  // =========================
  // Programme Competencies
  // =========================
  getProgrammeCompetencies: (programmeId) =>
    apiClient.get(`/academic/programmes/${programmeId}/competencies`),

  saveProgrammeCompetencies: (programmeId, data) =>
    apiClient.post(`/academic/programmes/${programmeId}/competencies`, data),

  // =========================
  // Setup Progress
  // =========================
  getDirectorSetupProgress: (params) =>
    apiClient.get('/academic/director/setup-progress', { params }),

  updateDirectorSetupProgress: (data) =>
    apiClient.post('/academic/director/setup-progress', data),

  getHodSetupProgress: (params) =>
    apiClient.get('/academic/hod/setup-progress', { params }),

  updateHodSetupProgress: (data) =>
    apiClient.post('/academic/hod/setup-progress', data),

  getPcSetupProgress: (params) =>
    apiClient.get('/academic/coordinator/setup-progress', { params }),

  updatePcSetupProgress: (data) =>
    apiClient.post('/academic/coordinator/setup-progress', data),

  getCcSetupProgress: (params) =>
    apiClient.get('/academic/course-coordinator/setup-progress', { params }),

  updateCcSetupProgress: (data) =>
    apiClient.post('/academic/course-coordinator/setup-progress', data),

  // =========================
  // HOD / PC Assignment
  // =========================
  getHodCoordinators: (departmentId) => {
    const params = departmentId ? { departmentId } : {};
    return apiClient.get('/academic/hod/coordinators', { params });
  },

  assignHodCoordinator: (data) =>
    apiClient.put('/academic/hod/coordinators', data),

  // =========================
  // Course Allocation
  // =========================
  allocateCourses: (data) =>
    apiClient.post('/academic/courses/allocate', data),

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
