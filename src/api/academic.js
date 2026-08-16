/**
 * ====================================================================
 * UNIFIED ACADEMIC API EXPORT & ADAPTER (Master Contract Aligned)
 * ====================================================================
 * Re-exports all modular API functions for full contract compliance
 * and provides robust compatibility adapters for all existing modules.
 */

export * from './academicApi';
export * from './attainmentApi';
export * from './reportsApi';
export * from './approvalApi';
export * from './dashboardApi';

import apiClient from './client';

import {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  getProgrammes,
  getProgramme,
  createProgramme,
  updateProgramme,
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  getCourseOfferings,
  getCourseOffering,
  createCourseOffering,
  updateCourseOffering,
  getUsers,
  getFaculty,
  getProgrammeCoordinators,
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  importStudents,
  getProgrammeOutcomes,
  saveProgrammeOutcomes,
  getProgrammeTargets,
  saveProgrammeTargets,
  getCourseOutcomes,
  saveCourseOutcomes,
  getCOPOMappings,
  saveCOPOMappings,
  getAttainmentConfiguration,
  saveAttainmentConfiguration,
  uploadCourseMarks,
  uploadCourseSurvey,
  uploadProgrammeSurvey,
} from './academicApi';

import {
  getCourseAttainment,
  getProgrammeBatchAttainment,
  getProgrammeBatchDataset,
  getProgrammeAverageMapping,
  getProgrammeAverageDirect,
  getProgrammeAverageIndirect,
  getProgrammeOverallAttainment,
} from './attainmentApi';

import {
  getCourseAtr,
  saveCourseAtr,
  submitCourseAtr,
  getProgrammeAtr,
  saveProgrammeAtr,
  submitProgrammeAtr,
} from './reportsApi';

import {
  getDirectorDashboard,
  getHodDashboard,
  getProgrammeCoordinatorDashboard,
  getCourseCoordinatorDashboard,
  getRoleSetupProgress,
  updateRoleSetupProgress,
} from './dashboardApi';

// ── Role User Helpers ───────────────────────────────────────────────────────
export const getUsersByRole = (role) => getUsers({ role });

// ── Course & Outcome Helpers ────────────────────────────────────────────────
export const getCourseCOs = (offeringOrCourseId) => getCourseOutcomes(offeringOrCourseId);
export const saveCourseCOs = (offeringOrCourseId, data) => saveCourseOutcomes(offeringOrCourseId, data);

export const getCOMatrix = (offeringOrCourseId) => getCOPOMappings(offeringOrCourseId);
export const saveCOMatrix = (offeringOrCourseId, data) => saveCOPOMappings(offeringOrCourseId, data);
export const getCourseMappings = (offeringOrCourseId) => getCOPOMappings(offeringOrCourseId);
export const saveCourseMappings = (offeringOrCourseId, data) => saveCOPOMappings(offeringOrCourseId, data);

export const saveCourse = (data) => (data?.id ? updateCourse(data.id, data) : createCourse(data));
export const deleteCourse = (courseId) => apiClient.delete(`/academic/courses/${courseId}`);

export const getProgrammePOs = async (programmeId) => {
  const res = await getProgrammeOutcomes(programmeId);
  return { data: res?.data?.pos || res?.pos || [] };
};

export const getProgrammePSOs = async (programmeId) => {
  const res = await getProgrammeOutcomes(programmeId);
  return { data: res?.data?.psos || res?.psos || [] };
};

export const getProgrammePEOs = async (programmeId) => {
  const res = await getProgrammeOutcomes(programmeId);
  return { data: res?.data?.peos || res?.peos || [] };
};

// ── School & Department Setup Helpers ───────────────────────────────────────
export const saveSchoolInfo = (data) => (data?.id ? updateSchool(data.id, data) : createSchool(data));
export const saveDepartment = (data) => (data?.id ? updateDepartment(data.id, data) : createDepartment(data));
export const deleteDepartment = (departmentId) => apiClient.delete(`/academic/departments/${departmentId}`);
export const saveProgramme = (data) => (data?.id ? updateProgramme(data.id, data) : createProgramme(data));
export const deleteProgramme = (programmeId) => apiClient.delete(`/academic/programmes/${programmeId}`);

// ── Evidence & Attainment Upload Helpers ────────────────────────────────────
export const getExaminationAttainment = (offeringId) => getCourseAttainment(offeringId);
export const saveExaminationAttainment = (offeringId, data) => saveCourseOutcomes(offeringId, data);
export const uploadExaminationFile = (offeringId, file, threshold) => uploadCourseMarks(offeringId, file, threshold);
export const getUploadedDocuments = (offeringId) => apiClient.get(`/academic/course-offerings/${offeringId}/documents`);

export const getSurveyAttainment = (offeringId) => getCourseAttainment(offeringId);
export const saveSurveyAttainment = (offeringId, data) => saveCourseOutcomes(offeringId, data);
export const uploadSurveyFile = (offeringId, file) => uploadCourseSurvey(offeringId, file);

// ── Batch & Student Helpers ────────────────────────────────────────────────
export const saveBatch = (data) => (data?.id ? updateBatch(data.id, data) : createBatch(data));
export const deleteBatch = (batchId) => apiClient.delete(`/academic/batches/${batchId}`);
export const getStudentsByBatch = (batchId) => getStudents(batchId);
export const saveStudent = (data) => (data?.id ? updateStudent(data.id, data) : createStudent(data));
export const deleteStudent = (studentId) => apiClient.delete(`/academic/students/${studentId}`);

// ── Coordinator & Target Helpers ───────────────────────────────────────────
export const saveProgrammeCoordinator = (progId, coordId) =>
  apiClient.put(`/academic/programmes/${progId}/coordinator`, { coordinatorId: coordId });
export const saveProgrammePOs = (progId, pos) => saveProgrammeOutcomes(progId, { pos });
export const saveProgrammePSOs = (progId, psos) => saveProgrammeOutcomes(progId, { psos });
export const saveProgrammePEOs = (progId, peos) => saveProgrammeOutcomes(progId, { peos });
export const saveProgrammeTargetLevels = (progId, data) => saveProgrammeTargets(progId, data);
export const getProgrammeTargetLevels = (progId) => getProgrammeTargets(progId);

export const getCourseCombinedAttainment = (offeringId) => getCourseAttainment(offeringId);
export const saveCourseCombinedAttainment = (offeringId, data) => saveCourseAtr(data);

// ── ATR Helpers ─────────────────────────────────────────────────────────────
export const getCourseAtrData = (offeringId) => getCourseAtr(offeringId);
export const saveCourseAtrData = (offeringId, data) => saveCourseAtr(data);
export const submitCourseAtrForApproval = (atrId, comments) => submitCourseAtr(atrId, comments);

export const getProgrammeAtrData = (programmeId, batchId) => getProgrammeAtr(programmeId, batchId);
export const saveProgrammeAtrData = (programmeId, batchId, data) => saveProgrammeAtr(data);
export const submitProgrammeAtrForApproval = (atrId, comments) => submitProgrammeAtr(atrId, comments);
export const getPreviousBatchProgrammeAtr = (programmeId, batchId) => getProgrammeAtr(programmeId, batchId);

// ── Dashboard & Summary Helpers ─────────────────────────────────────────────
export const getDirectorSchoolSummary = () => getDirectorDashboard();
export const getDepartmentSummary = (deptId) => getHodDashboard(deptId);
export const getHodDepartmentSummary = (deptId) => getHodDashboard(deptId);
export const getProgrammeCoordinatorSummary = (progId) => getProgrammeCoordinatorDashboard(progId);
export const getCourseCoordinatorSummary = (offeringId) => getCourseCoordinatorDashboard(offeringId);

// ── Setup Progress Helpers ──────────────────────────────────────────────────
export const getDirectorSetupProgress = (email, id) => getRoleSetupProgress('DIRECTOR', id);
export const updateDirectorSetupProgress = (email, id, step) => updateRoleSetupProgress('DIRECTOR', id, step);

export const getHodSetupProgress = (email, id) => getRoleSetupProgress('HOD', id);
export const updateHodSetupProgress = (email, id, step) => updateRoleSetupProgress('HOD', id, step);
export const completeHodSetup = (email, id) => updateRoleSetupProgress('HOD', id, 6);

export const getProgrammeCoordinatorSetupProgress = (email, id) => getRoleSetupProgress('PROGRAMME_COORDINATOR', id);
export const updateProgrammeCoordinatorSetupProgress = (email, id, step) => updateRoleSetupProgress('PROGRAMME_COORDINATOR', id, step);
export const completeProgrammeCoordinatorSetup = (email, id) => updateRoleSetupProgress('PROGRAMME_COORDINATOR', id, 6);

export const getCourseCoordinatorSetupProgress = (email, id) => getRoleSetupProgress('COURSE_COORDINATOR', id);
export const updateCourseCoordinatorSetupProgress = (email, id, step) => updateRoleSetupProgress('COURSE_COORDINATOR', id, step);
export const completeCourseCoordinatorSetup = (email, id) => updateRoleSetupProgress('COURSE_COORDINATOR', id, 6);

// ── Export Download Helpers ─────────────────────────────────────────────────
export const downloadAttainmentExcel = (courseOfferingId, batchId) => {
  const url = `/api/v1/reports/course-atr/${courseOfferingId}/export-data?format=excel`;
  window.open(url, '_blank');
  return Promise.resolve();
};

export const downloadAttainmentPdf = (courseOfferingId, batchId) => {
  const url = `/api/v1/reports/course-atr/${courseOfferingId}/export-data?format=pdf`;
  window.open(url, '_blank');
  return Promise.resolve();
};
