import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { useAcademic } from './academic';
import apiClient from '../api/client';

export const AttainmentContext =
  createContext(null);

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const unwrapResponse = (response) => {
  if (response == null) {
    return null;
  }

  if (
    response?.data?.data !== undefined
  ) {
    return response.data.data;
  }

  if (
    response?.data !== undefined
  ) {
    return response.data;
  }

  return response;
};

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function AttainmentProvider({
  children,
}) {
  const {
    selectedCourseOffering,
    courseOfferingId,
    courseId,
    batchId,
    programmeId,
    selectedProgramme,
  } = useAcademic();

  /* ------------------------------------------------------------------------ */
  /* Backend state                                                             */
  /* ------------------------------------------------------------------------ */

  const [
    attainmentConfigs,
    setAttainmentConfigs,
  ] = useState(null);

  const [
    courseAtrStore,
    setCourseAtrStore,
  ] = useState(null);

  const [
    programmeAtrStore,
    setProgrammeAtrStore,
  ] = useState(null);

  const [
    courseAttainmentStore,
    setCourseAttainmentStore,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ======================================================================== */
  /* Course Offering Data                                                     */
  /* ======================================================================== */

  useEffect(() => {
    if (!courseOfferingId) {
      setAttainmentConfigs(null);
      setCourseAtrStore(null);
      setCourseAttainmentStore(null);
      return;
    }

    let mounted = true;

    const loadOfferingData =
      async () => {
        setLoading(true);

        try {
          const [
            configRes,
            atrRes,
            attainmentRes,
          ] =
            await Promise.allSettled([
              /*
               * Backend contract:
               *
               * GET /attainment/config/{courseId}
               * Query: batchId
               *
               * IMPORTANT:
               * This API is documented using courseId +
               * batchId, not courseOfferingId.
               */
              apiClient.get(
                `/attainment/config/${courseId}`,
                {
                  params: {
                    batchId,
                  },
                }
              ),

              /*
               * Course ATR is explicitly
               * CourseOffering scoped.
               */
              apiClient.get(
                `/reports/course-atr/${courseOfferingId}`
              ),

              /*
               * Overall CO attainment is explicitly
               * CourseOffering scoped.
               */
              apiClient.get(
                `/reports/attainment-main/course/${courseOfferingId}`
              ),
            ]);

          if (!mounted) {
            return;
          }

          /* -------------------------------------------------------------- */
          /* Attainment Settings                                            */
          /* -------------------------------------------------------------- */

          if (
            configRes.status ===
            'fulfilled'
          ) {
            setAttainmentConfigs(
              unwrapResponse(
                configRes.value
              )
            );
          } else {
            setAttainmentConfigs(
              null
            );

            console.warn(
              'Failed to load attainment settings:',
              configRes.reason
            );
          }

          /* -------------------------------------------------------------- */
          /* Course ATR                                                     */
          /* -------------------------------------------------------------- */

          if (
            atrRes.status ===
            'fulfilled'
          ) {
            setCourseAtrStore(
              unwrapResponse(
                atrRes.value
              )
            );
          } else {
            setCourseAtrStore(
              null
            );

            console.warn(
              'Failed to load Course ATR:',
              atrRes.reason
            );
          }

          /* -------------------------------------------------------------- */
          /* CO Attainment                                                  */
          /* -------------------------------------------------------------- */

          if (
            attainmentRes.status ===
            'fulfilled'
          ) {
            setCourseAttainmentStore(
              unwrapResponse(
                attainmentRes.value
              )
            );
          } else {
            setCourseAttainmentStore(
              null
            );

            console.warn(
              'Failed to load CO attainment:',
              attainmentRes.reason
            );
          }
        } catch (error) {
          console.error(
            'Failed to load CourseOffering attainment data:',
            error
          );

          if (mounted) {
            setAttainmentConfigs(null);
            setCourseAtrStore(null);
            setCourseAttainmentStore(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadOfferingData();

    return () => {
      mounted = false;
    };
  }, [
    courseOfferingId,
    courseId,
    batchId,
  ]);

  /* ======================================================================== */
  /* Attainment Settings                                                      */
  /* ======================================================================== */

  const updateCourseAttainmentConfig =
    async (
      newConfig
    ) => {
      if (!courseId) {
        throw new Error(
          'courseId is required'
        );
      }

      if (!batchId) {
        throw new Error(
          'batchId is required'
        );
      }

      /*
       * Backend contract:
       *
       * POST/PUT /attainment/config/{courseId}
       * Body: AttainmentConfiguration
       *
       * The endpoint is courseId + batchId scoped.
       */
      const payload = {
        ...newConfig,
        batchId,
      };

      const response =
        await apiClient.put(
          `/attainment/config/${courseId}`,
          payload
        );

      const data =
        unwrapResponse(response);

      setAttainmentConfigs(data);

      return data;
    };

  /* ======================================================================== */
  /* Course ATR                                                               */
  /* ======================================================================== */

  /*
   * Backend exposes:
   *
   * GET
   * /reports/course-atr/{courseOfferingId}
   *
   * POST
   * /reports/course-atr
   *
   * POST
   * /reports/course-atr/{courseOfferingId}/submit
   */

  const updateCourseAtrData =
    async (
      newAtrData
    ) => {
      if (!courseOfferingId) {
        throw new Error(
          'courseOfferingId is required'
        );
      }

      const response =
        await apiClient.post(
          '/reports/course-atr',
          newAtrData
        );

      const data =
        unwrapResponse(response);

      setCourseAtrStore(data);

      return data;
    };

  const submitCourseAtr =
    async () => {
      if (!courseOfferingId) {
        throw new Error(
          'courseOfferingId is required'
        );
      }

      const response =
        await apiClient.post(
          `/reports/course-atr/${courseOfferingId}/submit`
        );

      const data =
        unwrapResponse(response);

      /*
       * Refresh the authoritative Course ATR
       * after submission.
       */
      const refreshed =
        await apiClient.get(
          `/reports/course-atr/${courseOfferingId}`
        );

      setCourseAtrStore(
        unwrapResponse(
          refreshed
        )
      );

      return data;
    };

  /* ======================================================================== */
  /* Programme ATR                                                            */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * GET
   * /atr/programme/{programmeId}?batchId=...
   *
   * POST/PUT
   * /atr/programme/{programmeId}
   */

  const loadProgrammeAtr =
    async (
      targetProgrammeId =
        programmeId,
      targetBatchId =
        batchId
    ) => {
      if (!targetProgrammeId) {
        setProgrammeAtrStore(
          null
        );

        return null;
      }

      const params = {};

      if (targetBatchId) {
        params.batchId =
          targetBatchId;
      }

      const response =
        await apiClient.get(
          `/atr/programme/${targetProgrammeId}`,
          { params }
        );

      const data =
        unwrapResponse(response);

      setProgrammeAtrStore(
        data
      );

      return data;
    };

  const updateProgrammeAtr =
    async (
      targetProgrammeId,
      programmeAtrData
    ) => {
      if (!targetProgrammeId) {
        throw new Error(
          'programmeId is required'
        );
      }

      const response =
        await apiClient.put(
          `/atr/programme/${targetProgrammeId}`,
          programmeAtrData
        );

      const data =
        unwrapResponse(response);

      setProgrammeAtrStore(
        data
      );

      return data;
    };

  /*
   * Keep these aliases for existing screens,
   * but do not simulate approval locally.
   *
   * Approval itself should use ApprovalContext.
   */
  const approveProgrammeAtr =
    async (
      targetProgrammeId,
      approvalPayload
    ) => {
      return updateProgrammeAtr(
        targetProgrammeId,
        approvalPayload
      );
    };

  const updateProgrammeAtrObservations =
    async (
      targetProgrammeId,
      observationsData
    ) => {
      return updateProgrammeAtr(
        targetProgrammeId,
        observationsData
      );
    };

  /* ======================================================================== */
  /* CO Attainment                                                            */
  /* ======================================================================== */

  const updateCourseAttainment =
    (
      offeringId,
      attainmentData
    ) => {
      if (!offeringId) {
        return;
      }

      setCourseAttainmentStore(
        attainmentData
      );
    };

  const calculateCourseCoAttainment =
    async (
      offeringId =
        courseOfferingId
    ) => {
      if (!offeringId) {
        throw new Error(
          'courseOfferingId is required'
        );
      }

      const response =
        await apiClient.get(
          `/reports/attainment-main/course/${offeringId}`
        );

      const data =
        unwrapResponse(response);

      if (data) {
        updateCourseAttainment(
          offeringId,
          data
        );
      }

      return data;
    };

  /* ======================================================================== */
  /* Direct Assessment Excel Upload                                           */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * POST /attainment/assessment/direct/upload
   *
   * Multipart:
   *   file
   *   courseId
   *   courseOfferingId
   *   batchId
   *   assessmentType
   *   toolType
   */

  const uploadEndSemMarks =
    async ({
      offeringId =
        courseOfferingId,
      file,
      assessmentType,
      toolType,
    }) => {
      if (!offeringId) {
        throw new Error(
          'courseOfferingId is required'
        );
      }

      if (!courseId) {
        throw new Error(
          'courseId is required'
        );
      }

      if (!batchId) {
        throw new Error(
          'batchId is required'
        );
      }

      if (!file) {
        throw new Error(
          'Excel file is required'
        );
      }

      const formData =
        new FormData();

      formData.append(
        'file',
        file
      );

      formData.append(
        'courseId',
        courseId
      );

      formData.append(
        'courseOfferingId',
        offeringId
      );

      formData.append(
        'batchId',
        batchId
      );

      if (
        assessmentType !==
        undefined &&
        assessmentType !==
        null
      ) {
        formData.append(
          'assessmentType',
          assessmentType
        );
      }

      if (
        toolType !==
        undefined &&
        toolType !==
        null
      ) {
        formData.append(
          'toolType',
          toolType
        );
      }

      const response =
        await apiClient.post(
          '/attainment/assessment/direct/upload',
          formData
        );

      const data =
        unwrapResponse(response);

      setCourseAttainmentStore(
        data
      );

      return data;
    };

  /* ======================================================================== */
  /* Indirect Assessment Excel Upload                                         */
  /* ======================================================================== */

  /*
   * Backend contract:
   *
   * POST /attainment/assessment/indirect/upload
   *
   * Multipart:
   *   file
   *   courseId
   *   courseOfferingId
   *   batchId
   */

  const uploadCourseSurvey =
    async ({
      offeringId =
        courseOfferingId,
      file,
    }) => {
      if (!offeringId) {
        throw new Error(
          'courseOfferingId is required'
        );
      }

      if (!courseId) {
        throw new Error(
          'courseId is required'
        );
      }

      if (!batchId) {
        throw new Error(
          'batchId is required'
        );
      }

      if (!file) {
        throw new Error(
          'Excel file is required'
        );
      }

      const formData =
        new FormData();

      formData.append(
        'file',
        file
      );

      formData.append(
        'courseId',
        courseId
      );

      formData.append(
        'courseOfferingId',
        offeringId
      );

      formData.append(
        'batchId',
        batchId
      );

      const response =
        await apiClient.post(
          '/attainment/assessment/indirect/upload',
          formData
        );

      const data =
        unwrapResponse(response);

      setCourseAttainmentStore(
        data
      );

      return data;
    };

  /* ======================================================================== */
  /* Context Value                                                            */
  /* ======================================================================== */

  return (
    <AttainmentContext.Provider
      value={{
        loading,

        courseOfferingId,

        selectedCourseOffering,

        courseId,

        batchId,

        programmeId,

        selectedProgramme,

        /* Attainment Settings */
        attainmentConfigs,

        activeAttainmentConfig:
          attainmentConfigs,

        updateCourseAttainmentConfig,

        /* CO Attainment */
        courseAttainmentStore,

        updateCourseAttainment,

        calculateCourseCoAttainment,

        /* Direct Assessment */
        uploadEndSemMarks,

        /* Indirect Assessment */
        uploadCourseSurvey,

        /* Course ATR */
        courseAtrStore,

        updateCourseAtrData,

        submitCourseAtr,

        /* Programme ATR */
        programmeAtrStore,

        loadProgrammeAtr,

        updateProgrammeAtr,

        approveProgrammeAtr,

        updateProgrammeAtrObservations,
      }}
    >
      {children}
    </AttainmentContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useAttainment() {
  const context =
    useContext(
      AttainmentContext
    );

  if (!context) {
    throw new Error(
      'useAttainment must be used within an AttainmentProvider'
    );
  }

  return context;
}

export default useAttainment;