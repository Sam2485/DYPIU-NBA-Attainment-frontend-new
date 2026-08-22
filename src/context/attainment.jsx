import {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import { useAcademic } from './academic';
import { attainmentApi } from '../api/attainment';
import { reportsApi } from '../api/reports';
import apiClient from '../api/client';

export const AttainmentContext = createContext(null);

export const defaultLevels = [
  { level: 1, minPercentage: 0, maxPercentage: 50 },
  { level: 2, minPercentage: 50, maxPercentage: 70 },
  { level: 3, minPercentage: 70, maxPercentage: 100 },
];

/* ========================================================================== */
/* Response helpers                                                           */
/* ========================================================================== */

const unwrapResponse = (response) => {
  if (response == null) {
    return null;
  }

  if (response?.data?.data !== undefined) {
    return response.data.data;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function AttainmentProvider({ children }) {
  const {
    selectedCourseOffering,
    courseOfferingId,
    courseId,
    batchId,
    programmeId,
    selectedProgramme,
  } = useAcademic();

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [attainmentConfigs, setAttainmentConfigs] = useState(null);
  const [examinationData, setExaminationData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [courseAttainmentStore, setCourseAttainmentStore] = useState(null);
  const [courseAtrStore, setCourseAtrStore] = useState(null);
  const [programmeAtrStore, setProgrammeAtrStore] = useState(null);
  const [programmeAttainmentStore, setProgrammeAttainmentStore] = useState(null);
  const [programmeSurveyData, setProgrammeSurveyData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* 1. Attainment Configuration Loaders & Mutators                           */
  /* ======================================================================== */

  const loadAttainmentConfig = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await attainmentApi.getConfig(targetOfferingId);
        const data = unwrapResponse(response);
        setAttainmentConfigs(data);
        return data;
      } catch (err) {
        console.warn(`loadAttainmentConfig(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load attainment config');
        return null;
      }
    },
    [courseOfferingId]
  );

  const updateCourseAttainmentConfig = useCallback(
    async (newConfig, targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        throw new Error('courseOfferingId is required to save attainment config');
      }

      const payload = {
        courseOfferingId: targetOfferingId,
        directWeight: newConfig.directWeight ?? 80.0,
        indirectWeight: newConfig.indirectWeight ?? 20.0,
        internalWeight: newConfig.internalWeight ?? 30.0,
        externalWeight: newConfig.externalWeight ?? 70.0,
        targetThresholdPercentage:
          newConfig.targetThresholdPercentage ?? newConfig.directThreshold ?? 60.0,
        status: newConfig.status ?? 'DRAFT',
        directLevelsJson:
          newConfig.directLevelsJson ??
          (newConfig.directLevels ? JSON.stringify(newConfig.directLevels) : null),
        indirectLevelsJson:
          newConfig.indirectLevelsJson ??
          (newConfig.indirectLevels ? JSON.stringify(newConfig.indirectLevels) : null),
      };

      try {
        setError(null);
        const response = await attainmentApi.saveConfig(targetOfferingId, payload);
        const data = unwrapResponse(response);
        setAttainmentConfigs(data);
        return data;
      } catch (err) {
        console.warn(`updateCourseAttainmentConfig(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to save attainment config');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 2. Direct Examination Assessment Loaders & Mutators                      */
  /* ======================================================================== */

  const loadExaminationData = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await attainmentApi.getExaminationAttainment(targetOfferingId);
        const data = unwrapResponse(response);
        setExaminationData(data);
        return data;
      } catch (err) {
        console.warn(`loadExaminationData(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load examination data');
        return null;
      }
    },
    [courseOfferingId]
  );

  const saveExaminationMarks = useCallback(
    async (payload, targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        throw new Error('courseOfferingId is required');
      }
      try {
        setError(null);
        const response = await attainmentApi.saveExaminationMarks(targetOfferingId, {
          courseOfferingId: targetOfferingId,
          ...payload,
        });
        const data = unwrapResponse(response);
        setExaminationData(data);
        return data;
      } catch (err) {
        console.warn(`saveExaminationMarks(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to save examination marks');
        throw err;
      }
    },
    [courseOfferingId]
  );

  const uploadEndSemMarks = useCallback(
    async ({
      offeringId = courseOfferingId,
      file,
      thresholdPercentage = 60.0,
      uploadedBy = 'Course Coordinator',
    }) => {
      if (!offeringId) throw new Error('courseOfferingId is required');
      if (!file) throw new Error('Excel file is required');

      const formData = new FormData();
      formData.append('file', file);
      if (thresholdPercentage != null) {
        formData.append('thresholdPercentage', String(thresholdPercentage));
      }
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }

      try {
        setError(null);
        const response = await attainmentApi.uploadExaminationSheet(offeringId, formData);
        const data = unwrapResponse(response);
        setExaminationData(data);
        return data;
      } catch (err) {
        console.warn(`uploadEndSemMarks(${offeringId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to upload examination sheet');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 3. Indirect Survey Assessment Loaders & Mutators                         */
  /* ======================================================================== */

  const loadSurveyData = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await attainmentApi.getSurveyAttainment(targetOfferingId);
        const data = unwrapResponse(response);
        setSurveyData(data);
        return data;
      } catch (err) {
        console.warn(`loadSurveyData(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load survey data');
        return null;
      }
    },
    [courseOfferingId]
  );

  const saveSurveyResponses = useCallback(
    async (payload, targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        throw new Error('courseOfferingId is required');
      }
      try {
        setError(null);
        const response = await attainmentApi.saveSurveyResponses(targetOfferingId, {
          courseOfferingId: targetOfferingId,
          ...payload,
        });
        const data = unwrapResponse(response);
        setSurveyData(data);
        return data;
      } catch (err) {
        console.warn(`saveSurveyResponses(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to save survey responses');
        throw err;
      }
    },
    [courseOfferingId]
  );

  const uploadCourseSurvey = useCallback(
    async ({
      offeringId = courseOfferingId,
      file,
      thresholdPercentage = 60.0,
      uploadedBy = 'Course Coordinator',
    }) => {
      if (!offeringId) throw new Error('courseOfferingId is required');
      if (!file) throw new Error('Excel file is required');

      const formData = new FormData();
      formData.append('file', file);
      if (thresholdPercentage != null) {
        formData.append('thresholdPercentage', String(thresholdPercentage));
      }
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }

      try {
        setError(null);
        const response = await attainmentApi.uploadSurveySheet(offeringId, formData);
        const data = unwrapResponse(response);
        setSurveyData(data);
        return data;
      } catch (err) {
        console.warn(`uploadCourseSurvey(${offeringId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to upload survey sheet');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 4. CO Attainment Loader & Calculator                                     */
  /* ======================================================================== */

  const loadCourseCoAttainment = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await reportsApi.getCourseAttainment(targetOfferingId);
        const data = unwrapResponse(response);
        setCourseAttainmentStore(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseCoAttainment(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load course CO attainment');
        return null;
      }
    },
    [courseOfferingId]
  );

  const calculateCourseCoAttainment = useCallback(
    async (offeringId = courseOfferingId) => {
      if (!offeringId) {
        throw new Error('courseOfferingId is required');
      }
      try {
        setError(null);
        const response = await reportsApi.getCourseAttainment(offeringId);
        const data = unwrapResponse(response);
        if (data) {
          setCourseAttainmentStore(data);
        }
        return data;
      } catch (err) {
        console.warn(`calculateCourseCoAttainment(${offeringId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to calculate course CO attainment');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 5. Course ATR Loaders & Mutators                                         */
  /* ======================================================================== */

  const loadCourseAtr = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await reportsApi.getCourseAtr(targetOfferingId);
        const data = unwrapResponse(response);
        setCourseAtrStore(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseAtr(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load course ATR');
        return null;
      }
    },
    [courseOfferingId]
  );

  const updateCourseAtrData = useCallback(
    async (newAtrData) => {
      try {
        setError(null);
        const response = await reportsApi.saveCourseAtr(newAtrData);
        const data = unwrapResponse(response);
        setCourseAtrStore(data);
        return data;
      } catch (err) {
        console.warn('updateCourseAtrData failed:', err);
        setError(err?.customMessage || err?.message || 'Failed to save course ATR');
        throw err;
      }
    },
    []
  );

  const submitCourseAtr = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) {
        throw new Error('courseOfferingId is required');
      }

      try {
        setError(null);
        const response = await reportsApi.submitCourseAtr(targetOfferingId);
        const data = unwrapResponse(response);

        const refreshed = await reportsApi.getCourseAtr(targetOfferingId);
        setCourseAtrStore(unwrapResponse(refreshed));

        return data;
      } catch (err) {
        console.warn(`submitCourseAtr(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to submit course ATR');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 6. Programme ATR Loaders & Mutators                                      */
  /* ======================================================================== */

  const loadProgrammeAtr = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        setProgrammeAtrStore(null);
        return null;
      }
      try {
        setError(null);
        const response = await apiClient.get(`/atr/programme/${targetProgrammeId}`, {
          params: { batchId: targetBatchId },
        });
        const data = unwrapResponse(response);
        setProgrammeAtrStore(data);
        return data;
      } catch (err) {
        console.warn(`loadProgrammeAtr(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load programme ATR');
        return null;
      }
    },
    [programmeId, batchId]
  );

  const updateProgrammeAtr = useCallback(
    async (targetProgrammeId = programmeId, programmeAtrData = {}) => {
      if (!targetProgrammeId) {
        throw new Error('programmeId is required');
      }

      try {
        setError(null);
        const response = await reportsApi.saveProgrammeAtr(programmeAtrData);
        const data = unwrapResponse(response);
        setProgrammeAtrStore(data);
        return data;
      } catch (err) {
        console.warn(`updateProgrammeAtr(${targetProgrammeId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to save programme ATR');
        throw err;
      }
    },
    [programmeId]
  );

  const submitProgrammeAtr = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        throw new Error('programmeId and batchId are required');
      }

      try {
        setError(null);
        const response = await reportsApi.submitProgrammeAtr(targetProgrammeId, targetBatchId);
        const data = unwrapResponse(response);
        await loadProgrammeAtr(targetProgrammeId, targetBatchId);
        return data;
      } catch (err) {
        console.warn(`submitProgrammeAtr(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to submit programme ATR');
        throw err;
      }
    },
    [programmeId, batchId, loadProgrammeAtr]
  );

  /* ======================================================================== */
  /* 7. Programme Attainment Loader                                           */
  /* ======================================================================== */

  const loadProgrammeAttainment = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        setProgrammeAttainmentStore(null);
        return null;
      }
      try {
        setError(null);
        const response = await attainmentApi.getProgrammeAttainment(
          targetProgrammeId,
          targetBatchId
        );
        const data = unwrapResponse(response);
        setProgrammeAttainmentStore(data);
        return data;
      } catch (err) {
        console.warn(`loadProgrammeAttainment(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load programme attainment');
        return null;
      }
    },
    [programmeId, batchId]
  );

  const uploadProgrammeExitSurvey = useCallback(async ({
    targetProgrammeId = programmeId,
    targetBatchId = batchId,
    file,
  }) => {
    if (!targetProgrammeId || !targetBatchId) throw new Error('programmeId and batchId are required');
    if (!file) throw new Error('Excel file is required');
    const formData = new FormData();
    formData.append('file', file);
    try {
      setError(null);
      const response = await apiClient.post('/attainment/programme-survey/upload', formData, {
        params: { programmeId: targetProgrammeId, batchId: targetBatchId },
      });
      const data = unwrapResponse(response);
      setProgrammeSurveyData(data);
      return data;
    } catch (err) {
      setError(err?.customMessage || err?.message || 'Failed to upload programme exit survey');
      throw err;
    }
  }, [programmeId, batchId]);

  /* ======================================================================== */
  /* Context value with aliases for 100% backward compatibility               */
  /* ======================================================================== */

  const value = {
    loading,
    error,

    courseOfferingId,
    selectedCourseOffering,
    courseId,
    batchId,
    programmeId,
    selectedProgramme,

    /* 1. Attainment Settings */
    attainmentConfigs,
    activeAttainmentConfig: attainmentConfigs,
    attainmentSettings: attainmentConfigs,
    loadAttainmentConfig,
    loadAttainmentSettings: loadAttainmentConfig,
    updateCourseAttainmentConfig,
    saveAttainmentSettings: updateCourseAttainmentConfig,

    /* 2. Direct Assessment */
    examinationData,
    directAssessmentData: examinationData,
    loadExaminationData,
    loadDirectAssessment: loadExaminationData,
    loadExamination: loadExaminationData,
    saveExaminationMarks,
    saveDirectAssessment: saveExaminationMarks,
    saveExamination: saveExaminationMarks,
    uploadEndSemMarks,
    uploadDirectAssessment: uploadEndSemMarks,
    uploadExamination: uploadEndSemMarks,

    /* 3. Indirect Assessment */
    surveyData,
    indirectAssessmentData: surveyData,
    loadSurveyData,
    loadIndirectAssessment: loadSurveyData,
    loadSurvey: loadSurveyData,
    saveSurveyResponses,
    saveIndirectAssessment: saveSurveyResponses,
    saveSurvey: saveSurveyResponses,
    uploadCourseSurvey,
    uploadIndirectAssessment: uploadCourseSurvey,
    uploadSurvey: uploadCourseSurvey,

    /* 4. CO Attainment */
    courseAttainmentStore,
    coAttainment: courseAttainmentStore,
    loadCourseCoAttainment,
    loadCOAttainment: loadCourseCoAttainment,
    calculateCourseCoAttainment,

    /* 5. Course ATR */
    courseAtrStore,
    courseATR: courseAtrStore,
    loadCourseAtr,
    loadCourseATR: loadCourseAtr,
    updateCourseAtrData,
    saveCourseATR: updateCourseAtrData,
    submitCourseAtr,
    submitCourseATR: submitCourseAtr,

    /* 6. Programme ATR */
    programmeAtrStore,
    programmeATR: programmeAtrStore,
    loadProgrammeAtr,
    loadProgrammeATR: loadProgrammeAtr,
    updateProgrammeAtr,
    saveProgrammeATR: updateProgrammeAtr,
    submitProgrammeAtr,
    submitProgrammeATR: submitProgrammeAtr,

    /* 7. Programme Attainment */
    programmeAttainmentStore,
    loadProgrammeAttainment,
    programmeSurveyData,
    uploadProgrammeExitSurvey,
  };

  return (
    <AttainmentContext.Provider value={value}>
      {children}
    </AttainmentContext.Provider>
  );
}

export function useAttainment() {
  const context = useContext(AttainmentContext);
  if (!context) {
    throw new Error('useAttainment must be used within an AttainmentProvider');
  }
  return context;
}

export default useAttainment;
