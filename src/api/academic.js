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
  // Master Programmes
  // =========================
  getProgrammes: (departmentId) => {
    const params = {};
    if (departmentId) params.departmentId = departmentId;

    return apiClient.get('/academic/master-programmes', { params });
  },

  getProgrammeById: (id) =>
    apiClient.get(`/academic/master-programmes/${id}`),

  createProgramme: (data) =>
    apiClient.post('/academic/master-programmes', data),

  updateProgramme: (id, data) =>
    apiClient.put(`/academic/master-programmes/${id}`, data),

  updateProgrammeCoordinator: (id, data) =>
    apiClient.put(`/academic/master-programmes/${id}/coordinator`, data),

  deleteProgramme: (id) =>
    apiClient.delete(`/academic/master-programmes/${id}`),

  // =========================
  // Master Programmes (authoritative hierarchy API)
  // =========================
  getMasterProgrammes: () =>
    apiClient.get('/academic/master-programmes'),

  createMasterProgramme: (data) =>
    apiClient.post('/academic/master-programmes', data),

  updateMasterProgramme: (masterProgrammeId, data) =>
    apiClient.put(`/academic/master-programmes/${masterProgrammeId}`, data),

  deleteMasterProgramme: (masterProgrammeId) =>
    apiClient.delete(`/academic/master-programmes/${masterProgrammeId}`),

  // =========================
  // Programme Batches
  // =========================
  getBatches: ({ masterProgrammeId, userEmail, role } = {}) => {
    const params = {};
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (userEmail) params.userEmail = userEmail;
    if (role) params.role = role;

    return apiClient.get('/academic/programme-batches', { params });
  },

  createBatch: (data) =>
    apiClient.post('/academic/programme-batches', data),

  getBatchById: (id) =>
    apiClient.get(`/academic/programme-batches/${id}`),

  updateBatch: (id, data) =>
    apiClient.put(`/academic/programme-batches/${id}`, data),

  deleteBatch: (id) =>
    apiClient.delete(`/academic/programme-batches/${id}`),

  // =========================
  // Programme Batches
  // =========================
  getProgrammeBatches: (masterProgrammeId) => {
    const params = {};
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    return apiClient.get('/academic/programme-batches', { params });
  },

  createProgrammeBatch: (data) =>
    apiClient.post('/academic/programme-batches', data),

  updateProgrammeBatch: (id, data) =>
    apiClient.put(`/academic/programme-batches/${id}`, data),

  deleteProgrammeBatch: (id) =>
    apiClient.delete(`/academic/programme-batches/${id}`),

  updateProgrammeBatchStatus: (id, data) =>
    apiClient.post(`/academic/programme-batches/${id}/status`, data),

  getBatchContext: (programmeBatchId) =>
    apiClient.get(`/academic/programme-batches/${programmeBatchId}/context`),

  getStudents: (programmeBatchId) =>
    apiClient.get(`/academic/programme-batches/${programmeBatchId}/students`),

  createStudent: (programmeBatchId, data) =>
    apiClient.post(`/academic/programme-batches/${programmeBatchId}/students`, data),

  deleteStudent: (id) =>
    apiClient.delete(`/academic/students/${id}`),

  // =========================
  // Master Courses
  // =========================
  getCourses: (masterProgrammeId, programmeBatchId) => {
    const params = {};
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;

    return apiClient.get('/academic/master-courses', { params });
  },

  createCourse: (data) =>
    apiClient.post('/academic/master-courses', data),

  getCourseById: (id) =>
    apiClient.get(`/academic/master-courses/${id}`),

  updateCourse: (id, data) =>
    apiClient.put(`/academic/master-courses/${id}`, data),

  deleteCourse: (id) =>
    apiClient.delete(`/academic/master-courses/${id}`),

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
  // Programme-Batch Courses
  // =========================
  getCourseOfferings: (programmeBatchId) =>
    apiClient.get(`/academic/programme-batches/${programmeBatchId}/courses`),

  getCourseOfferingById: (programmeBatchCourseId) =>
    apiClient.get(`/academic/programme-batch-courses/${programmeBatchCourseId}`),

  createCourseOffering: (data) => {
    const programmeBatchId = data.programmeBatchId ?? data.batchId;
    const { programmeBatchId: _programmeBatchId, batchId: _batchId, ...course } = data;
    return apiClient.post(`/academic/programme-batches/${programmeBatchId}/courses`, course);
  },

  updateCourseOffering: (id, data) =>
    apiClient.put(`/academic/programme-batch-courses/${id}`, data),

  deleteCourseOffering: (id) =>
    apiClient.delete(`/academic/programme-batch-courses/${id}`),

  // =========================
  // Course Offering Outcomes
  // =========================
  getCourseOutcomes: (offeringId) =>
    apiClient.get(`/academic/programme-batch-courses/${offeringId}/course-outcomes`),

  saveCourseOutcomes: (offeringId, data) =>
    apiClient.post(`/academic/programme-batch-courses/${offeringId}/course-outcomes`, data),

  // =========================
  // Course Offering Mapping
  // =========================
  getCourseMapping: (offeringId) =>
    apiClient.get(`/academic/programme-batch-courses/${offeringId}/co-po-pso-mappings`),

  saveCourseMapping: (offeringId, data) =>
    apiClient.put(`/academic/programme-batch-courses/${offeringId}/co-po-pso-mappings`, data),

  // =========================
  // Programme Targets
  // =========================
  getProgrammeTargets: (masterProgrammeId, programmeBatchId) => {
    const params = programmeBatchId ? { programmeBatchId } : {};
    return apiClient.get(`/academic/master-programmes/${masterProgrammeId}/targets`, { params });
  },

  saveProgrammeTargets: (masterProgrammeId, data) =>
    apiClient.post(`/academic/master-programmes/${masterProgrammeId}/targets`, data),

  // =========================
  // Programme Competencies
  // =========================
  getProgrammeCompetencies: (masterProgrammeId) =>
    apiClient.get(`/academic/master-programmes/${masterProgrammeId}/competencies`),

  saveProgrammeCompetencies: (masterProgrammeId, data) =>
    apiClient.post(`/academic/master-programmes/${masterProgrammeId}/competencies`, data),

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
    apiClient.post('/academic/master-courses/allocate', data),

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
