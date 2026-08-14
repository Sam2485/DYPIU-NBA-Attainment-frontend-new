import apiClient from './client';

export const getSchools = async () => {
  try {
    const response = await apiClient.get('/academic/schools');
    return response;
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    throw error;
  }
};

export const getSchoolById = async (id) => {
  try {
    const response = await apiClient.get(`/academic/schools/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch school ${id}:`, error);
    throw error;
  }
};

export const createSchool = async (schoolData) => {
  try {
    const response = await apiClient.post('/academic/schools', schoolData);
    return response;
  } catch (error) {
    console.error('Failed to create school:', error);
    throw error;
  }
};

export const updateSchool = async (id, schoolData) => {
  try {
    const response = await apiClient.put(`/academic/schools/${id}`, schoolData);
    return response;
  } catch (error) {
    console.error(`Failed to update school ${id}:`, error);
    throw error;
  }
};

export const saveSchoolInfo = async (schoolData) => {
  if (schoolData.id) {
    return await updateSchool(schoolData.id, schoolData);
  } else {
    return await createSchool(schoolData);
  }
};

export const getDirectorSetupProgress = async (schoolId , directorEmail ) => {
  try {
    const response = await apiClient.get('/academic/director/setup-progress', {
      params: { schoolId, directorEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch director setup progress:', error);
    throw error;
  }
};

export const updateDirectorSetupProgress = async (schoolId, currentStep, directorEmail = '') => {
  try {
    const response = await apiClient.post('/academic/director/setup-progress', null, {
      params: { schoolId, currentStep, ...(directorEmail ? { directorEmail } : {}) },
    });
    return response;
  } catch (error) {
    console.error('Failed to update director setup progress:', error);
    throw error;
  }
};

export const getDirectorSchoolSummary = async (schoolId = '', directorEmail = '', directorName = '') => {
  try {
    const response = await apiClient.get('/academic/director/school-summary', {
      params: {directorEmail},
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch director school summary:', error);
    throw error;
  }
};

export const getDepartmentSummary = async (schoolId = '', directorEmail = '') => {
  try {
    const response = await apiClient.get('/academic/director/department-summary', {
      params: { schoolId, directorEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch department summary:', error);
    throw error;
  }
};

export const getDepartments = async (schoolId = '') => {
  try {
    const response = await apiClient.get('/academic/departments', {
      params: schoolId ? { schoolId } : {},
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw error;
  }
};

export const saveDepartment = async (deptData) => {
  try {
    const response = await apiClient.post('/academic/departments', deptData);
    return response;
  } catch (error) {
    console.error('Failed to save department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await apiClient.delete(`/academic/departments/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete department ${id}:`, error);
    throw error;
  }
};

export const getProgrammes = async (schoolId = '', departmentId = '') => {
  try {
    const params = {};
    if (departmentId) params.departmentId = departmentId;
    if (schoolId) params.schoolId = schoolId;
    const response = await apiClient.get('/academic/programmes', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch programmes:', error);
    throw error;
  }
};

export const saveProgramme = async (progData) => {
  try {
    const response = await apiClient.post('/academic/programmes', progData);
    return response;
  } catch (error) {
    console.error('Failed to save programme:', error);
    throw error;
  }
};

export const deleteProgramme = async (id) => {
  try {
    const response = await apiClient.delete(`/academic/programmes/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete programme ${id}:`, error);
    throw error;
  }
};

export const getUsersByRole = async (role = 'HOD') => {
  try {
    const response = await apiClient.get('/academic/users', { params: { role } });
    return response;
  } catch (error) {
    console.error(`Failed to fetch users by role ${role}:`, error);
    throw error;
  }
};

export const getHodDepartmentSummary = async (hodEmail = '') => {
  try {
    const response = await apiClient.get('/academic/hod/department-summary', {
      params: { hodEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch HOD department summary:', error);
    throw error;
  }
};

export const getHodSetupProgress = async (departmentId = '', hodEmail = '') => {
  try {
    const response = await apiClient.get('/academic/hod/setup-progress', {
      params: { departmentId, hodEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch HOD setup progress:', error);
    throw error;
  }
};

export const updateHodSetupProgress = async (departmentId = '', currentStep = 1, hodEmail = '') => {
  try {
    const response = await apiClient.put('/academic/hod/setup-progress', null, {
      params: { departmentId, currentStep, hodEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to update HOD setup progress:', error);
    throw error;
  }
};

export const completeHodSetup = async (departmentId = '', hodEmail = '') => {
  try {
    const response = await apiClient.post('/academic/hod/setup-progress/complete', null, {
      params: { departmentId, hodEmail },
    });
    return response;
  } catch (error) {
    console.error('Failed to complete HOD setup progress:', error);
    throw error;
  }
};

export const getBatches = async (programmeId = '') => {
  try {
    const params = programmeId ? { programmeId } : {};
    const response = await apiClient.get('/academic/batches', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch batches:', error);
    throw error;
  }
};

export const saveBatch = async (batchData) => {
  try {
    const response = await apiClient.post('/academic/batches', batchData);
    return response;
  } catch (error) {
    console.error('Failed to save batch:', error);
    throw error;
  }
};

export const deleteBatch = async (id) => {
  try {
    const response = await apiClient.delete(`/academic/batches/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete batch ${id}:`, error);
    throw error;
  }
};

export const getProgrammePOs = async (programmeId) => {
  try {
    const response = await apiClient.get(`/outcomes/programmes/${programmeId}/pos`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch POs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const saveProgrammePOs = async (programmeId, pos) => {
  try {
    const response = await apiClient.post(`/outcomes/programmes/${programmeId}/pos`, pos);
    return response;
  } catch (error) {
    console.error(`Failed to save POs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const getProgrammePSOs = async (programmeId) => {
  try {
    const response = await apiClient.get(`/outcomes/programmes/${programmeId}/psos`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch PSOs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const saveProgrammePSOs = async (programmeId, psos) => {
  try {
    const response = await apiClient.post(`/outcomes/programmes/${programmeId}/psos`, psos);
    return response;
  } catch (error) {
    console.error(`Failed to save PSOs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const getProgrammePEOs = async (programmeId) => {
  try {
    const response = await apiClient.get(`/outcomes/programmes/${programmeId}/peos`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch PEOs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const saveProgrammePEOs = async (programmeId, peos) => {
  try {
    const response = await apiClient.post(`/outcomes/programmes/${programmeId}/peos`, peos);
    return response;
  } catch (error) {
    console.error(`Failed to save PEOs for programme ${programmeId}:`, error);
    throw error;
  }
};

export const getStudentsByBatch = async (batchId) => {
  try {
    const response = await apiClient.get('/academic/students', { params: { batchId } });
    return response;
  } catch (error) {
    console.error(`Failed to fetch students for batch ${batchId}:`, error);
    throw error;
  }
};

export const saveStudent = async (studentData) => {
  try {
    const response = await apiClient.post('/academic/students', studentData);
    return response;
  } catch (error) {
    console.error('Failed to save student:', error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await apiClient.delete(`/academic/students/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete student ${id}:`, error);
    throw error;
  }
};
