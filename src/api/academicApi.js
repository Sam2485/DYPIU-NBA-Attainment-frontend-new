import apiClient from './client';

/**
 * ====================================================================
 * ACADEMIC API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Hierarchy: School -> Department -> Programme -> Batch -> CourseOffering
 */

// ── 1. SCHOOLS ─────────────────────────────────────────────────────────────
export const getSchools = async () => {
  return apiClient.get('/academic/schools');
};

export const getSchool = async (schoolId) => {
  return apiClient.get(`/academic/schools/${schoolId}`);
};

export const createSchool = async (data) => {
  return apiClient.post('/academic/schools', data);
};

export const updateSchool = async (schoolId, data) => {
  return apiClient.put(`/academic/schools/${schoolId}`, data);
};

// ── 2. DEPARTMENTS ─────────────────────────────────────────────────────────
export const getDepartments = async (schoolId) => {
  const url = schoolId ? `/academic/departments?schoolId=${schoolId}` : '/academic/departments';
  return apiClient.get(url);
};

export const getDepartment = async (departmentId) => {
  return apiClient.get(`/academic/departments/${departmentId}`);
};

export const createDepartment = async (data) => {
  return apiClient.post('/academic/departments', data);
};

export const updateDepartment = async (departmentId, data) => {
  return apiClient.put(`/academic/departments/${departmentId}`, data);
};

// ── 3. PROGRAMMES ──────────────────────────────────────────────────────────
export const getProgrammes = async (departmentId) => {
  const url = departmentId ? `/academic/programmes?departmentId=${departmentId}` : '/academic/programmes';
  return apiClient.get(url);
};

export const getProgramme = async (programmeId) => {
  return apiClient.get(`/academic/programmes/${programmeId}`);
};

export const createProgramme = async (data) => {
  return apiClient.post('/academic/programmes', data);
};

export const updateProgramme = async (programmeId, data) => {
  return apiClient.put(`/academic/programmes/${programmeId}`, data);
};

// ── 4. BATCHES (Central Cohort Context) ────────────────────────────────────
export const getBatches = async (programmeId) => {
  const url = programmeId ? `/academic/batches?programmeId=${programmeId}` : '/academic/batches';
  return apiClient.get(url);
};

export const getBatch = async (batchId) => {
  return apiClient.get(`/academic/batches/${batchId}`);
};

export const getBatchContext = async (batchId) => {
  return apiClient.get(`/academic/batches/${batchId}/context`);
};

export const createBatch = async (data) => {
  return apiClient.post('/academic/batches', data);
};

export const updateBatch = async (batchId, data) => {
  return apiClient.put(`/academic/batches/${batchId}`, data);
};

// ── 5. MASTER COURSES (Curriculum Templates) ───────────────────────────────
export const getCourses = async (programmeId) => {
  const url = programmeId ? `/academic/courses?programmeId=${programmeId}` : '/academic/courses';
  return apiClient.get(url);
};

export const getCourse = async (courseId) => {
  return apiClient.get(`/academic/courses/${courseId}`);
};

export const createCourse = async (data) => {
  return apiClient.post('/academic/courses', data);
};

export const updateCourse = async (courseId, data) => {
  return apiClient.put(`/academic/courses/${courseId}`, data);
};

// ── 6. COURSE OFFERINGS (Batch-Specific Course Instances) ───────────────────
export const getCourseOfferings = async (batchId) => {
  const url = batchId ? `/academic/course-offerings?batchId=${batchId}` : '/academic/course-offerings';
  return apiClient.get(url);
};

export const getCourseOffering = async (offeringId) => {
  return apiClient.get(`/academic/course-offerings/${offeringId}`);
};

export const createCourseOffering = async (data) => {
  return apiClient.post('/academic/course-offerings', data);
};

export const updateCourseOffering = async (offeringId, data) => {
  return apiClient.put(`/academic/course-offerings/${offeringId}`, data);
};

// ── 7. USERS / ROLES / COORDINATORS ─────────────────────────────────────────
export const getUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`/users${query ? `?${query}` : ''}`);
};

export const getFaculty = async () => {
  return getUsers({ role: 'FACULTY' });
};

export const getProgrammeCoordinators = async (programmeId) => {
  const params = { role: 'PROGRAMME_COORDINATOR' };
  if (programmeId) params.programmeId = programmeId;
  return getUsers(params);
};

// ── 8. STUDENTS (Cohort-Scoped) ────────────────────────────────────────────
export const getStudents = async (batchId) => {
  const url = batchId ? `/academic/students?batchId=${batchId}` : '/academic/students';
  return apiClient.get(url);
};

export const getStudent = async (studentId) => {
  return apiClient.get(`/academic/students/${studentId}`);
};

export const createStudent = async (data) => {
  return apiClient.post('/academic/students', data);
};

export const updateStudent = async (studentId, data) => {
  return apiClient.put(`/academic/students/${studentId}`, data);
};

export const importStudents = async (batchId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  if (batchId) formData.append('batchId', batchId);
  return apiClient.post('/academic/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── 9. PROGRAMME OUTCOMES (PEO, PO, PSO) & TARGETS ─────────────────────────
export const getProgrammeOutcomes = async (programmeId) => {
  return apiClient.get(`/academic/programmes/${programmeId}/outcomes`);
};

export const saveProgrammeOutcomes = async (programmeId, data) => {
  return apiClient.put(`/academic/programmes/${programmeId}/outcomes`, data);
};

export const getProgrammeTargets = async (programmeId) => {
  return apiClient.get(`/academic/programmes/${programmeId}/targets`);
};

export const saveProgrammeTargets = async (programmeId, data) => {
  return apiClient.put(`/academic/programmes/${programmeId}/targets`, data);
};

// ── 10. COURSE OUTCOMES (COs) & MAPPINGS (Course Offering Scoped) ───────────
export const getCourseOutcomes = async (offeringId) => {
  return apiClient.get(`/academic/course-offerings/${offeringId}/outcomes`);
};

export const saveCourseOutcomes = async (offeringId, data) => {
  return apiClient.post(`/academic/course-offerings/${offeringId}/outcomes`, data);
};

export const getCOPOMappings = async (offeringId) => {
  return apiClient.get(`/academic/course-offerings/${offeringId}/mappings`);
};

export const saveCOPOMappings = async (offeringId, data) => {
  return apiClient.put(`/academic/course-offerings/${offeringId}/mappings`, data);
};

// ── 11. ATTAINMENT CONFIGURATION (Master Course Level) ──────────────────────
export const getAttainmentConfiguration = async (courseId) => {
  return apiClient.get(`/academic/courses/${courseId}/attainment-configuration`);
};

export const saveAttainmentConfiguration = async (courseId, data) => {
  return apiClient.put(`/academic/courses/${courseId}/attainment-configuration`, data);
};

// ── 12. EVIDENCE UPLOADS (Marks & Surveys) ──────────────────────────────────
export const uploadCourseMarks = async (offeringId, file, thresholdPercentage = 45) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('thresholdPercentage', thresholdPercentage);
  return apiClient.post(`/academic/course-offerings/${offeringId}/marks/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadCourseSurvey = async (offeringId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/academic/course-offerings/${offeringId}/survey/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadProgrammeSurvey = async (programmeId, batchId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(
    `/academic/programmes/${programmeId}/batches/${batchId}/programme-survey/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};
