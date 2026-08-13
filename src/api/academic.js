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

export const getDirectorSetupProgress = async (schoolId = 'sch-1') => {
  try {
    const response = await apiClient.get('/academic/director/setup-progress', {
      params: { schoolId },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch director setup progress:', error);
    throw error;
  }
};

export const updateDirectorSetupProgress = async (schoolId = 'sch-1', currentStep = 1) => {
  try {
    const response = await apiClient.post('/academic/director/setup-progress', null, {
      params: { schoolId, currentStep },
    });
    return response;
  } catch (error) {
    console.error('Failed to update director setup progress:', error);
    throw error;
  }
};

export const getDirectorSchoolSummary = async (schoolId = '', deanEmail = '', deanName = '') => {
  try {
    const response = await apiClient.get('/academic/director/school-summary', {
      params: { schoolId, deanEmail, deanName },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch director school summary:', error);
    throw error;
  }
};

export const getDepartmentSummary = async (schoolId = 'sch-1') => {
  try {
    const response = await apiClient.get('/academic/director/department-summary', {
      params: { schoolId },
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch department summary:', error);
    throw error;
  }
};
