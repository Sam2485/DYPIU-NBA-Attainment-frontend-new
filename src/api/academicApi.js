import apiClient from './client';
import { MASTER_MOCK_DATA, wrapApiResponse } from './masterContractMockData';

/**
 * ====================================================================
 * ACADEMIC API SERVICE (Master Backend Contract Aligned)
 * ====================================================================
 * Hierarchy: School -> Department -> Programme -> Batch -> CourseOffering
 * Integrates live backend endpoints with strict Master Contract fallbacks.
 */

// ── 1. SCHOOLS ─────────────────────────────────────────────────────────────
export const getSchools = async (directorEmail) => {
  const url = directorEmail ? `/academic/schools?directorEmail=${encodeURIComponent(directorEmail)}` : '/academic/schools';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.schools) || res.data?.schools)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getSchools offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ schools: MASTER_MOCK_DATA.schools });
};

export const getSchool = async (schoolId) => {
  try {
    const res = await apiClient.get(`/academic/schools/${schoolId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getSchool offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleSchool);
};

export const createSchool = async (data) => {
  try {
    return await apiClient.post('/academic/schools', data);
  } catch (err) {
    console.warn('[academicApi] createSchool offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `school-${Date.now()}`, ...data });
  }
};

export const updateSchool = async (schoolId, data) => {
  try {
    return await apiClient.put(`/academic/schools/${schoolId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateSchool offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: schoolId, ...data });
  }
};

// ── 2. DEPARTMENTS ─────────────────────────────────────────────────────────
export const getDepartments = async (schoolId) => {
  const url = schoolId ? `/academic/departments?schoolId=${schoolId}` : '/academic/departments';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.departments) || res.data?.departments)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getDepartments offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ schoolId: schoolId || 'school-1', departments: MASTER_MOCK_DATA.departments });
};

export const getDepartment = async (departmentId) => {
  try {
    const res = await apiClient.get(`/academic/departments/${departmentId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getDepartment offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleDepartment);
};

export const createDepartment = async (data) => {
  try {
    return await apiClient.post('/academic/departments', data);
  } catch (err) {
    console.warn('[academicApi] createDepartment offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `dept-${Date.now()}`, ...data });
  }
};

export const updateDepartment = async (departmentId, data) => {
  try {
    return await apiClient.put(`/academic/departments/${departmentId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateDepartment offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: departmentId, ...data });
  }
};

// ── 3. PROGRAMMES ──────────────────────────────────────────────────────────
export const getProgrammes = async (arg1, arg2, arg3) => {
  let params = new URLSearchParams();
  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.departmentId) params.append('departmentId', arg1.departmentId);
    if (arg1.schoolId) params.append('schoolId', arg1.schoolId);
    if (arg1.directorEmail) params.append('directorEmail', arg1.directorEmail);
    if (arg1.coordinatorEmail) params.append('coordinatorEmail', arg1.coordinatorEmail);
    if (arg1.email) params.append('email', arg1.email);
  } else {
    const deptId = typeof arg1 === 'string' && arg1 && !arg1.includes('@') && !arg1.startsWith('sch-')
      ? arg1
      : (typeof arg2 === 'string' && arg2 && !arg2.includes('@') && !arg2.startsWith('sch-') ? arg2 : '');
    const schoolId = typeof arg1 === 'string' && arg1.startsWith('sch-')
      ? arg1
      : (typeof arg2 === 'string' && arg2.startsWith('sch-') ? arg2 : '');
    const email = typeof arg3 === 'string' && arg3
      ? arg3
      : (typeof arg1 === 'string' && arg1.includes('@') ? arg1 : (typeof arg2 === 'string' && arg2.includes('@') ? arg2 : ''));

    if (deptId && deptId !== 'ALL') params.append('departmentId', deptId);
    if (schoolId) params.append('schoolId', schoolId);
    if (email) params.append('email', email);
  }
  const queryString = params.toString();
  const url = queryString ? `/academic/programmes?${queryString}` : '/academic/programmes';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.programmes) || res.data?.programmes)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getProgrammes offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ departmentId: 'dept-1', programmes: MASTER_MOCK_DATA.programmes });
};

export const getProgramme = async (programmeId) => {
  try {
    const res = await apiClient.get(`/academic/programmes/${programmeId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getProgramme offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleProgramme);
};

export const createProgramme = async (data) => {
  try {
    return await apiClient.post('/academic/programmes', data);
  } catch (err) {
    console.warn('[academicApi] createProgramme offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `prog-${Date.now()}`, ...data });
  }
};

export const updateProgramme = async (programmeId, data) => {
  try {
    return await apiClient.put(`/academic/programmes/${programmeId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateProgramme offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: programmeId, ...data });
  }
};

// ── 4. BATCHES (Central Cohort Context) ────────────────────────────────────
export const getBatches = async (programmeId) => {
  const url = programmeId ? `/academic/batches?programmeId=${programmeId}` : '/academic/batches';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.batches) || res.data?.batches)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getBatches offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ programmeId: programmeId || 'prog-1', batches: MASTER_MOCK_DATA.batches });
};

export const getBatch = async (batchId) => {
  try {
    const res = await apiClient.get(`/academic/batches/${batchId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getBatch offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleBatch);
};

export const getBatchContext = async (batchId) => {
  try {
    const res = await apiClient.get(`/academic/batches/${batchId}/context`);
    if (res && (res.data || res.batch)) return res;
  } catch (err) {
    console.warn('[academicApi] getBatchContext offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.batchContext);
};

export const createBatch = async (data) => {
  try {
    return await apiClient.post('/academic/batches', data);
  } catch (err) {
    console.warn('[academicApi] createBatch offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `batch-${Date.now()}`, ...data });
  }
};

export const updateBatch = async (batchId, data) => {
  try {
    return await apiClient.put(`/academic/batches/${batchId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateBatch offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: batchId, ...data });
  }
};

// ── 5. MASTER COURSES (Curriculum Templates) ───────────────────────────────
export const getCourses = async (programmeId) => {
  const url = programmeId ? `/academic/courses?programmeId=${programmeId}` : '/academic/courses';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.courses) || res.data?.courses)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getCourses offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ courses: MASTER_MOCK_DATA.courses });
};

export const getCourse = async (courseId) => {
  try {
    const res = await apiClient.get(`/academic/courses/${courseId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getCourse offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.courses[0]);
};

export const createCourse = async (data) => {
  try {
    return await apiClient.post('/academic/courses', data);
  } catch (err) {
    console.warn('[academicApi] createCourse offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `course-${Date.now()}`, ...data });
  }
};

export const updateCourse = async (courseId, data) => {
  try {
    return await apiClient.put(`/academic/courses/${courseId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateCourse offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: courseId, ...data });
  }
};

// ── 6. COURSE OFFERINGS (Batch-Specific Course Instances) ───────────────────
export const getCourseOfferings = async (batchId) => {
  const url = batchId ? `/academic/course-offerings?batchId=${batchId}` : '/academic/course-offerings';
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.courseOfferings) || res.data?.courseOfferings)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getCourseOfferings offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ batchId: batchId || 'batch-2025-29', courseOfferings: MASTER_MOCK_DATA.courseOfferings });
};

export const getCourseOffering = async (offeringId) => {
  try {
    const res = await apiClient.get(`/academic/course-offerings/${offeringId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getCourseOffering offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleCourseOffering);
};

export const createCourseOffering = async (data) => {
  try {
    return await apiClient.post('/academic/course-offerings', data);
  } catch (err) {
    console.warn('[academicApi] createCourseOffering offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `offering-${Date.now()}`, ...data });
  }
};

export const updateCourseOffering = async (offeringId, data) => {
  try {
    return await apiClient.put(`/academic/course-offerings/${offeringId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateCourseOffering offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: offeringId, ...data });
  }
};

// ── 7. USERS / ROLES / COORDINATORS ─────────────────────────────────────────
export const extractUserList = (res) => {
  if (!res) return [];
  let raw = [];
  if (Array.isArray(res)) raw = res;
  else if (Array.isArray(res.data)) raw = res.data;
  else if (Array.isArray(res.data?.data)) raw = res.data.data;
  else if (Array.isArray(res.data?.content)) raw = res.data.content;
  else if (Array.isArray(res.data?.data?.content)) raw = res.data.data.content;
  else if (Array.isArray(res.data?.users)) raw = res.data.users;
  else if (Array.isArray(res.data?.data?.users)) raw = res.data.data.users;
  else if (Array.isArray(res.content)) raw = res.content;
  else if (Array.isArray(res.users)) raw = res.users;

  return raw
    .map((u, idx) => {
      if (!u) return null;
      if (typeof u === 'string') {
        return {
          id: `u-${idx}`,
          name: u,
          email: `${u.toLowerCase().replace(/[^a-z0-9]/g, '')}@dypiu.ac.in`,
          role: 'HOD',
        };
      }
      const name =
        u.name ||
        u.fullName ||
        u.displayName ||
        (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : '') ||
        u.username ||
        u.email ||
        `User ${idx + 1}`;

      const email = u.email || (u.username && u.username.includes('@') ? u.username : '');
      let role = u.role || u.userRole || '';
      if (Array.isArray(u.roles)) {
        role = u.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role || '')).join(',');
      }
      return {
        id: u.id || u.userId || email || name,
        name,
        email,
        role: String(role).toUpperCase(),
        department: u.department || u.departmentName || '',
      };
    })
    .filter(Boolean);
};

export const getUsers = async (params = {}) => {
  let queryObj = {};
  if (typeof params === 'string') {
    queryObj = { role: params };
  } else if (typeof params === 'object' && params !== null) {
    queryObj = { ...params };
  }
  const query = new URLSearchParams(queryObj).toString();
  const qs = query ? `?${query}` : '';

  try {
    const res = await apiClient.get(`/academic/users${qs}`);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.users) || res.data?.users)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getUsers offline/mock fallback:', err?.message);
  }

  const role = String(queryObj.role || '').toUpperCase();
  if (role === 'PROGRAMME_COORDINATOR') {
    return wrapApiResponse({ users: MASTER_MOCK_DATA.programmeCoordinators });
  } else if (role === 'FACULTY') {
    return wrapApiResponse({ users: MASTER_MOCK_DATA.facultyUsers });
  }
  return wrapApiResponse({ users: MASTER_MOCK_DATA.allUsers });
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
  try {
    const res = await apiClient.get(url);
    if (res && (Array.isArray(res) || Array.isArray(res.data) || Array.isArray(res.students) || res.data?.students)) {
      return res;
    }
  } catch (err) {
    console.warn('[academicApi] getStudents offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.studentsResponse);
};

export const getStudent = async (studentId) => {
  try {
    const res = await apiClient.get(`/academic/students/${studentId}`);
    if (res && (res.data || res.id)) return res;
  } catch (err) {
    console.warn('[academicApi] getStudent offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleStudent);
};

export const createStudent = async (data) => {
  try {
    return await apiClient.post('/academic/students', data);
  } catch (err) {
    console.warn('[academicApi] createStudent offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: data.id || `student-${Date.now()}`, ...data });
  }
};

export const updateStudent = async (studentId, data) => {
  try {
    return await apiClient.put(`/academic/students/${studentId}`, data);
  } catch (err) {
    console.warn('[academicApi] updateStudent offline/mock fallback:', err?.message);
    return wrapApiResponse({ id: studentId, ...data });
  }
};

export const importStudents = async (batchId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  if (batchId) formData.append('batchId', batchId);
  try {
    return await apiClient.post('/academic/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) {
    console.warn('[academicApi] importStudents offline/mock fallback:', err?.message);
    return wrapApiResponse({
      batchId: batchId || 'batch-2025-29',
      recordsProcessed: 120,
      recordsCreated: 118,
      recordsUpdated: 2,
      errors: [],
    });
  }
};

// ── 9. PROGRAMME OUTCOMES (PEO, PO, PSO) & TARGETS ─────────────────────────
export const getProgrammeOutcomes = async (programmeId) => {
  try {
    const res = await apiClient.get(`/academic/programmes/${programmeId}/outcomes`);
    if (res && (res.data || res.pos || res.data?.pos)) return res;
  } catch (err) {
    console.warn('[academicApi] getProgrammeOutcomes offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ programmeId: programmeId || 'prog-1', ...MASTER_MOCK_DATA.programmeOutcomes });
};

export const saveProgrammeOutcomes = async (programmeId, data) => {
  try {
    return await apiClient.put(`/academic/programmes/${programmeId}/outcomes`, data);
  } catch (err) {
    console.warn('[academicApi] saveProgrammeOutcomes offline/mock fallback:', err?.message);
    return wrapApiResponse({ programmeId, ...data, status: 'SAVED' });
  }
};

export const getProgrammeTargets = async (programmeId) => {
  try {
    const res = await apiClient.get(`/academic/programmes/${programmeId}/targets`);
    if (res && (res.data || res.targets || res.data?.targets)) return res;
  } catch (err) {
    console.warn('[academicApi] getProgrammeTargets offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ programmeId: programmeId || 'prog-1', ...MASTER_MOCK_DATA.programmeTargets });
};

export const saveProgrammeTargets = async (programmeId, data) => {
  try {
    return await apiClient.put(`/academic/programmes/${programmeId}/targets`, data);
  } catch (err) {
    console.warn('[academicApi] saveProgrammeTargets offline/mock fallback:', err?.message);
    return wrapApiResponse({ programmeId, ...data, status: 'SAVED' });
  }
};

// ── 10. COURSE OUTCOMES (COs) & MAPPINGS (Course Offering Scoped) ───────────
export const getCourseOutcomes = async (offeringId) => {
  try {
    const res = await apiClient.get(`/academic/course-offerings/${offeringId}/outcomes`);
    if (res && (res.data || res.outcomes || res.data?.outcomes)) return res;
  } catch (err) {
    console.warn('[academicApi] getCourseOutcomes offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ courseOfferingId: offeringId || 'offering-1', ...MASTER_MOCK_DATA.courseOutcomesResponse });
};

export const saveCourseOutcomes = async (offeringId, data) => {
  try {
    return await apiClient.post(`/academic/course-offerings/${offeringId}/outcomes`, data);
  } catch (err) {
    console.warn('[academicApi] saveCourseOutcomes offline/mock fallback:', err?.message);
    return wrapApiResponse({ courseOfferingId: offeringId, ...data, status: 'SAVED' });
  }
};

export const getCOPOMappings = async (offeringId) => {
  try {
    const res = await apiClient.get(`/academic/course-offerings/${offeringId}/mappings`);
    if (res && (res.data || res.mappings || res.data?.mappings)) return res;
  } catch (err) {
    console.warn('[academicApi] getCOPOMappings offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ courseOfferingId: offeringId || 'offering-1', ...MASTER_MOCK_DATA.coMappingsResponse });
};

export const saveCOPOMappings = async (offeringId, data) => {
  try {
    return await apiClient.put(`/academic/course-offerings/${offeringId}/mappings`, data);
  } catch (err) {
    console.warn('[academicApi] saveCOPOMappings offline/mock fallback:', err?.message);
    return wrapApiResponse({ courseOfferingId: offeringId, ...data, status: 'SAVED' });
  }
};

// ── 11. ATTAINMENT CONFIGURATION (Master Course Level) ──────────────────────
export const getAttainmentConfiguration = async (courseId) => {
  try {
    const res = await apiClient.get(`/academic/courses/${courseId}/attainment-configuration`);
    if (res && (res.data || res.directWeight !== undefined)) return res;
  } catch (err) {
    console.warn('[academicApi] getAttainmentConfiguration offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ courseId: courseId || 'course-1', ...MASTER_MOCK_DATA.attainmentConfiguration });
};

export const saveAttainmentConfiguration = async (courseId, data) => {
  try {
    return await apiClient.put(`/academic/courses/${courseId}/attainment-configuration`, data);
  } catch (err) {
    console.warn('[academicApi] saveAttainmentConfiguration offline/mock fallback:', err?.message);
    return wrapApiResponse({ courseId, ...data, status: 'SAVED' });
  }
};

// ── 12. EVIDENCE UPLOADS (Marks & Surveys) ──────────────────────────────────
export const uploadCourseMarks = async (offeringId, file, thresholdPercentage = 45) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('thresholdPercentage', thresholdPercentage);
  try {
    return await apiClient.post(`/academic/course-offerings/${offeringId}/marks/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) {
    console.warn('[academicApi] uploadCourseMarks offline/mock fallback:', err?.message);
    return wrapApiResponse(MASTER_MOCK_DATA.marksUploadResponse);
  }
};

export const uploadCourseSurvey = async (offeringId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    return await apiClient.post(`/academic/course-offerings/${offeringId}/survey/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (err) {
    console.warn('[academicApi] uploadCourseSurvey offline/mock fallback:', err?.message);
    return wrapApiResponse(MASTER_MOCK_DATA.surveyUploadResponse);
  }
};

export const uploadProgrammeSurvey = async (programmeId, batchId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    return await apiClient.post(
      `/academic/programmes/${programmeId}/batches/${batchId}/programme-survey/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  } catch (err) {
    console.warn('[academicApi] uploadProgrammeSurvey offline/mock fallback:', err?.message);
    return wrapApiResponse(MASTER_MOCK_DATA.programmeSurveyResponse);
  }
};

// ── 13. DIRECTOR SUMMARY & SETUP PROGRESS ──────────────────────────────────
export const getDirectorSchoolSummaryApi = async (directorEmail) => {
  const url = directorEmail
    ? `/academic/director/school-summary?directorEmail=${encodeURIComponent(directorEmail)}`
    : '/academic/director/school-summary';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.schoolName || res.code)) return res;
  } catch (err) {
    console.warn('[academicApi] getDirectorSchoolSummaryApi offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.singleSchool);
};

export const getDepartmentSummaryApi = async (schoolId, directorEmail) => {
  const params = [];
  if (schoolId) params.push(`schoolId=${encodeURIComponent(schoolId)}`);
  if (directorEmail) params.push(`directorEmail=${encodeURIComponent(directorEmail)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  try {
    const res = await apiClient.get(`/academic/director/department-summary${qs}`);
    if (res && (res.data || Array.isArray(res))) return res;
  } catch (err) {
    console.warn('[academicApi] getDepartmentSummaryApi offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ schoolId: schoolId || 'school-1', departments: MASTER_MOCK_DATA.departments });
};

export const getDirectorSetupProgressApi = async (schoolId, directorEmail) => {
  const params = [];
  if (schoolId) params.push(`schoolId=${encodeURIComponent(schoolId)}`);
  if (directorEmail) params.push(`directorEmail=${encodeURIComponent(directorEmail)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  try {
    const res = await apiClient.get(`/academic/director/setup-progress${qs}`);
    if (res && (res.data || res.currentStep !== undefined)) return res;
  } catch (err) {
    console.warn('[academicApi] getDirectorSetupProgressApi offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.directorSetupProgress);
};

export const updateDirectorSetupProgressApi = async (schoolId, currentStep) => {
  const sId = schoolId || '';
  const step = currentStep || 1;
  try {
    return await apiClient.post(`/academic/director/setup-progress?schoolId=${encodeURIComponent(sId)}&currentStep=${step}`);
  } catch (err) {
    console.warn('[academicApi] updateDirectorSetupProgressApi offline/mock fallback:', err?.message);
    return wrapApiResponse({ ...MASTER_MOCK_DATA.directorSetupProgress, currentStep: step });
  }
};

// ── 14. HOD SUMMARY & SETUP PROGRESS ───────────────────────────────────────
export const getHodDepartmentSummaryApi = async (hodEmail) => {
  const url = hodEmail
    ? `/academic/hod/department-summary?hodEmail=${encodeURIComponent(hodEmail)}`
    : '/academic/hod/department-summary';
  try {
    const res = await apiClient.get(url);
    if (res && (res.data || res.deptName || res.deptId)) return res;
  } catch (err) {
    console.warn('[academicApi] getHodDepartmentSummaryApi offline/mock fallback:', err?.message);
  }
  return wrapApiResponse({ deptId: 'dept-1', deptName: 'Computer Engineering', hodEmail: hodEmail || 'hod@example.com', hodName: 'HOD Name' });
};

export const getHodSetupProgressApi = async (departmentId, hodEmail) => {
  const params = [];
  if (departmentId) params.push(`departmentId=${encodeURIComponent(departmentId)}`);
  if (hodEmail) params.push(`hodEmail=${encodeURIComponent(hodEmail)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  try {
    const res = await apiClient.get(`/academic/hod/setup-progress${qs}`);
    if (res && (res.data || res.currentStep !== undefined)) return res;
  } catch (err) {
    console.warn('[academicApi] getHodSetupProgressApi offline/mock fallback:', err?.message);
  }
  return wrapApiResponse(MASTER_MOCK_DATA.hodSetupProgress);
};

export const updateHodSetupProgressApi = async (departmentId, currentStep, hodEmail) => {
  const params = [];
  if (departmentId) params.push(`departmentId=${encodeURIComponent(departmentId)}`);
  if (currentStep) params.push(`currentStep=${currentStep}`);
  if (hodEmail) params.push(`hodEmail=${encodeURIComponent(hodEmail)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  try {
    return await apiClient.put(`/academic/hod/setup-progress${qs}`);
  } catch (err) {
    console.warn('[academicApi] updateHodSetupProgressApi offline/mock fallback:', err?.message);
    return wrapApiResponse({ ...MASTER_MOCK_DATA.hodSetupProgress, currentStep: currentStep || 1 });
  }
};

export const completeHodSetupApi = async (departmentId, hodEmail) => {
  const params = [];
  if (departmentId) params.push(`departmentId=${encodeURIComponent(departmentId)}`);
  if (hodEmail) params.push(`hodEmail=${encodeURIComponent(hodEmail)}`);
  const qs = params.length > 0 ? `?${params.join('&')}` : '';
  try {
    return await apiClient.post(`/academic/hod/setup-progress/complete${qs}`);
  } catch (err) {
    console.warn('[academicApi] completeHodSetupApi offline/mock fallback:', err?.message);
    return wrapApiResponse({ ...MASTER_MOCK_DATA.hodSetupProgress, currentStep: 4, overallStatus: 'COMPLETED' });
  }
};
