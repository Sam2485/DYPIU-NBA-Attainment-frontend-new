import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
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

  // Axios returns the API body directly. A few validation endpoints can
  // still report success:false in a 2xx response; turn that into a rejected
  // operation so upload screens show the backend's precise validation text.
  const envelope = response?.data?.success !== undefined ? response.data : response;
  if (envelope?.success === false) {
    const message = envelope.message || envelope.error || 'The uploaded file could not be processed.';
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.customMessage = error.message;
    throw error;
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
  const programmeAtrRequestsRef = useRef(new Map());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* 1. Attainment Configuration Loaders & Mutators                           */
  /* ======================================================================== */

  const loadAttainmentConfig = useCallback(
    async (targetOfferingId = courseOfferingId, submittedBy) => {
      if (!targetOfferingId) {
        setAttainmentConfigs(null);
        return null;
      }
      try {
        setError(null);
        // Do not show the previous course's settings while the selected
        // offering's configuration is being fetched.
        setAttainmentConfigs(null);
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
        programmeBatchCourseId: targetOfferingId,
        directWeight: newConfig.directWeight ?? 80.0,
        indirectWeight: newConfig.indirectWeight ?? 20.0,
        directThreshold: newConfig.directThreshold ?? 60.0,
        indirectThreshold: newConfig.indirectThreshold ?? 60.0,
        directLevels: newConfig.directLevels ?? [],
        indirectLevels: newConfig.indirectLevels ?? [],
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
          programmeBatchCourseId: targetOfferingId,
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
    }) => {
      if (!offeringId) throw new Error('courseOfferingId is required');
      if (!file) throw new Error('Excel file is required');

      const formData = new FormData();
      formData.append('file', file);

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

  const deleteExaminationMarks = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) throw new Error('programmeBatchCourseId is required');
      try {
        setError(null);
        await attainmentApi.deleteExaminationMarks(targetOfferingId);
        setExaminationData(null);
      } catch (err) {
        console.warn(`deleteExaminationMarks(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to remove examination marks');
        throw err;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 3. Indirect Survey Assessment Loaders & Mutators                         */
  /* ======================================================================== */

  const loadSurveyData = useCallback(
    async (programmeBatchCourseId = courseOfferingId) => {
      if (!programmeBatchCourseId) return null;
      try {
        setError(null);
        const response = await attainmentApi.getSurveyAttainment(programmeBatchCourseId);
        const data = unwrapResponse(response);
        setSurveyData(data);
        return data;
      } catch (err) {
        console.warn(`loadSurveyData(${programmeBatchCourseId}) failed:`, err);
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
          programmeBatchCourseId: targetOfferingId,
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
    }) => {
      if (!offeringId) throw new Error('courseOfferingId is required');
      if (!file) throw new Error('Excel file is required');

      const formData = new FormData();
      formData.append('file', file);

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

  const deleteSurveyData = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) throw new Error('programmeBatchCourseId is required');
      try {
        setError(null);
        await attainmentApi.deleteSurveyData(targetOfferingId);
        setSurveyData(null);
      } catch (err) {
        console.warn(`deleteSurveyData(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to remove survey data');
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

  const loadPreviousYearCourseAtr = useCallback(
    async (targetOfferingId = courseOfferingId) => {
      if (!targetOfferingId) return null;
      try {
        setError(null);
        const response = await reportsApi.getPreviousYearCourseAtr(targetOfferingId);
        const data = unwrapResponse(response);
        if (!data) return null;
        return {
          ...data,
          outcomes: (data.outcomes ?? []).map((outcome) => ({
            ...outcome,
            outcomeStatement: outcome.outcomeStatement ?? outcome.statement,
            targetLevel: outcome.targetLevel ?? outcome.target,
            attainmentLevel: outcome.attainmentLevel ?? outcome.attainment,
            actions: outcome.actions ?? (outcome.actionTaken ? [outcome.actionTaken] : []),
          })),
        };
      } catch (err) {
        console.warn(`loadPreviousYearCourseAtr(${targetOfferingId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load the previous-year course ATR');
        return null;
      }
    },
    [courseOfferingId]
  );

  const updateCourseAtrData = useCallback(
    async (targetProgrammeBatchCourseId = courseOfferingId, newAtrData = {}) => {
      if (!targetProgrammeBatchCourseId) {
        throw new Error('programmeBatchCourseId is required');
      }
      try {
        setError(null);
        const response = await reportsApi.saveCourseAtr(targetProgrammeBatchCourseId, newAtrData);
        const data = unwrapResponse(response);
        setCourseAtrStore(data);
        return data;
      } catch (err) {
        console.warn('updateCourseAtrData failed:', err);
        setError(err?.customMessage || err?.message || 'Failed to save course ATR');
        throw err;
      }
    },
    [courseOfferingId]
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
    async (targetBatchId = batchId) => {
      if (!targetBatchId) {
        setProgrammeAtrStore(null);
        return null;
      }
      const requestKey = String(targetBatchId);
      const inFlightRequest = programmeAtrRequestsRef.current.get(requestKey);
      if (inFlightRequest) return inFlightRequest;

      const request = (async () => {
        try {
          setError(null);
          const response = await apiClient.get(`/academic/programme-batches/${targetBatchId}/atr`);
          const data = unwrapResponse(response);
          setProgrammeAtrStore(data);
          return data;
        } catch (err) {
          console.warn(`loadProgrammeAtr(${targetBatchId}) failed:`, err);
          setError(err?.customMessage || err?.message || 'Failed to load programme ATR');
          return null;
        }
      })();
      programmeAtrRequestsRef.current.set(requestKey, request);
      try {
        return await request;
      } finally {
        if (programmeAtrRequestsRef.current.get(requestKey) === request) {
          programmeAtrRequestsRef.current.delete(requestKey);
        }
      }
    },
    [batchId]
  );

  const loadPreviousYearProgrammeAtr = useCallback(
    async (targetBatchId = batchId) => {
      if (!targetBatchId) return null;

      try {
        setError(null);
        const response = await reportsApi.getPreviousYearProgrammeAtr(targetBatchId);
        return unwrapResponse(response);
      } catch (err) {
        console.warn(`loadPreviousYearProgrammeAtr(${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to load the previous-year programme ATR');
        return null;
      }
    },
    [batchId]
  );

  const updateProgrammeAtr = useCallback(
    async (targetBatchId = batchId, programmeAtrData = {}) => {
      if (!targetBatchId) {
        throw new Error('programmeBatchId is required');
      }

      try {
        setError(null);
        const response = await apiClient.put(
          `/academic/programme-batches/${targetBatchId}/atr`,
          programmeAtrData
        );
        const data = unwrapResponse(response);
        setProgrammeAtrStore(data);
        return data;
      } catch (err) {
        console.warn(`updateProgrammeAtr(${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to save programme ATR');
        throw err;
      }
    },
    [batchId]
  );

  const submitProgrammeAtr = useCallback(
    async (targetBatchId = batchId) => {
      if (!targetBatchId) {
        throw new Error('programmeBatchId is required');
      }

      try {
        setError(null);
        const response = await apiClient.post(`/academic/programme-batches/${targetBatchId}/atr/submit`);
        const data = unwrapResponse(response);
        setProgrammeAtrStore((previous) => ({ ...previous, ...data }));
        return data;
      } catch (err) {
        console.warn(`submitProgrammeAtr(${targetBatchId}) failed:`, err);
        setError(err?.customMessage || err?.message || 'Failed to submit programme ATR');
        throw err;
      }
    },
    [batchId]
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

  const loadProgrammeIndirectAttainment = useCallback(async (targetBatchId = batchId) => {
    if (!targetBatchId) {
      setProgrammeSurveyData(null);
      return null;
    }
    try {
      setError(null);
      setProgrammeSurveyData(null);
      const response = await attainmentApi.getProgrammeIndirectAttainment(targetBatchId);
      const data = unwrapResponse(response);
      setProgrammeSurveyData(data);
      return data;
    } catch (err) {
      console.warn(`loadProgrammeIndirectAttainment(${targetBatchId}) failed:`, err);
      setError(err?.customMessage || err?.message || 'Failed to load programme indirect attainment');
      return null;
    }
  }, [batchId]);

  const saveProgrammeIndirectAttainment = useCallback(async (targetBatchId = batchId, payload = {}) => {
    if (!targetBatchId) throw new Error('programmeBatchId is required');
    try {
      setError(null);
      const response = await attainmentApi.saveProgrammeIndirectAttainment(targetBatchId, payload);
      const data = unwrapResponse(response);
      setProgrammeSurveyData(data);
      return data;
    } catch (err) {
      setError(err?.customMessage || err?.message || 'Failed to save programme indirect attainment');
      throw err;
    }
  }, [batchId]);

  const uploadProgrammeExitSurvey = useCallback(async ({
    targetBatchId = batchId,
    file,
    uploadedBy,
  }) => {
    if (!targetBatchId) throw new Error('programmeBatchId is required');
    if (!file) throw new Error('Excel file is required');
    const formData = new FormData();
    formData.append('file', file);
    if (uploadedBy) formData.append('uploadedBy', uploadedBy);
    try {
      setError(null);
      const response = await attainmentApi.uploadProgrammeExitSurvey(targetBatchId, formData);
      const data = unwrapResponse(response);
      setProgrammeSurveyData(data);
      return data;
    } catch (err) {
      setError(err?.customMessage || err?.message || 'Failed to upload programme exit survey');
      throw err;
    }
  }, [batchId]);

  const deleteProgrammeIndirectAttainment = useCallback(async (targetBatchId = batchId) => {
    if (!targetBatchId) throw new Error('programmeBatchId is required');
    try {
      setError(null);
      await attainmentApi.deleteProgrammeIndirectAttainment(targetBatchId);
      setProgrammeSurveyData(null);
    } catch (err) {
      setError(err?.customMessage || err?.message || 'Failed to remove programme indirect attainment');
      throw err;
    }
  }, [batchId]);

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
    deleteExaminationMarks,
    deleteDirectAssessment: deleteExaminationMarks,
    deleteExamination: deleteExaminationMarks,

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
    deleteSurveyData,
    deleteIndirectAssessment: deleteSurveyData,
    deleteSurvey: deleteSurveyData,

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
    loadPreviousYearCourseAtr,
    loadPreviousYearCourseATR: loadPreviousYearCourseAtr,
    updateCourseAtrData,
    saveCourseATR: updateCourseAtrData,
    submitCourseAtr,
    submitCourseATR: submitCourseAtr,

    /* 6. Programme ATR */
    programmeAtrStore,
    programmeATR: programmeAtrStore,
    loadProgrammeAtr,
    loadProgrammeATR: loadProgrammeAtr,
    loadPreviousYearProgrammeAtr,
    loadPreviousYearProgrammeATR: loadPreviousYearProgrammeAtr,
    updateProgrammeAtr,
    saveProgrammeATR: updateProgrammeAtr,
    submitProgrammeAtr,
    submitProgrammeATR: submitProgrammeAtr,

    /* 7. Programme Attainment */
    programmeAttainmentStore,
    loadProgrammeAttainment,
    programmeSurveyData,
    loadProgrammeIndirectAttainment,
    saveProgrammeIndirectAttainment,
    uploadProgrammeExitSurvey,
    deleteProgrammeIndirectAttainment,
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
