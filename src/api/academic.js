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

export const getProgrammes = async (schoolId = '') => {
  try {
    const response = await apiClient.get('/academic/programmes', {
      params: schoolId ? { schoolId } : {},
    });
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
