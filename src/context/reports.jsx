import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { useAcademic } from './academic';
import { reportsApi } from '../api/reports';

export const ReportsContext =
  createContext(null);

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const unwrap = (response) => {
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

const unwrapList = (response) => {
  const data = unwrap(response);

  return Array.isArray(data)
    ? data
    : [];
};

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function ReportsProvider({
  children,
}) {
  const {
    selectedCourse,
    selectedCourseOffering,
    courseOfferingId,
    courseId,
    batchId,
    selectedProgramme,
    programmeId,
    academicYear,
  } = useAcademic();

  const [
    activeReportTab,
    setActiveReportTab,
  ] = useState('co-attainment');

  const [
    filterYear,
    setFilterYear,
  ] = useState(
    academicYear ?? null
  );

  /* ------------------------------------------------------------------------ */
  /* Backend report state                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    reportFilters,
    setReportFilters,
  ] = useState(null);

  const [
    reportsSummary,
    setReportsSummary,
  ] = useState(null);

  const [
    courseReports,
    setCourseReports,
  ] = useState([]);

  const [
    programmeReports,
    setProgrammeReports,
  ] = useState([]);

  const [
    selectedCourseAtr,
    setSelectedCourseAtr,
  ] = useState(null);

  const [
    selectedProgrammeAtr,
    setSelectedProgrammeAtr,
  ] = useState(null);

  const [
    courseAttainmentReport,
    setCourseAttainmentReport,
  ] = useState(null);

  const [
    programmeAttainmentReport,
    setProgrammeAttainmentReport,
  ] = useState(null);

  const [
    batchComparison,
    setBatchComparison,
  ] = useState(null);

  const [
    batchSummary,
    setBatchSummary,
  ] = useState(null);

  const [
    historicalTrends,
    setHistoricalTrends,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* ======================================================================== */
  /* Report Filters                                                           */
  /* ======================================================================== */

  const loadReportFilters =
    useCallback(
      async () => {
        try {
          const response =
            await reportsApi.getFilters();

          const data =
            unwrap(response);

          setReportFilters(
            data
          );

          return data;
        } catch (err) {
          console.error(
            'Failed to load report filters:',
            err
          );

          throw err;
        }
      },
      []
    );

  /* ======================================================================== */
  /* Reports Summary                                                          */
  /* ======================================================================== */

  const loadReportsSummary =
    useCallback(
      async ({
        targetProgrammeId =
          programmeId,
        targetCourseId =
          courseId,
        targetBatchId =
          batchId,
      } = {}) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        if (
          targetCourseId
        ) {
          params.courseId =
            targetCourseId;
        }

        if (
          targetBatchId
        ) {
          params.batchId =
            targetBatchId;
        }

        const response =
          await reportsApi.getReportsSummary(
            params
          );

        const data =
          unwrap(response);

        setReportsSummary(
          data
        );

        return data;
      },
      [
        programmeId,
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Course ATR List                                                          */
  /* ======================================================================== */

  const loadCourseAtrReports =
    useCallback(
      async ({
        targetProgrammeId =
          programmeId,
        targetCourseId =
          courseId,
        targetBatchId =
          batchId,
      } = {}) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        if (
          targetCourseId
        ) {
          params.courseId =
            targetCourseId;
        }

        if (
          targetBatchId
        ) {
          params.batchId =
            targetBatchId;
        }

        const response =
          await reportsApi.getCourseAtrs(
            params
          );

        const data =
          unwrapList(response);

        setCourseReports(
          data
        );

        return data;
      },
      [
        programmeId,
        courseId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Programme ATR List                                                       */
  /* ======================================================================== */

  const loadProgrammeAtrReports =
    useCallback(
      async ({
        targetProgrammeId =
          programmeId,
        targetBatchId =
          batchId,
      } = {}) => {
        const params = {};

        if (
          targetProgrammeId
        ) {
          params.programmeId =
            targetProgrammeId;
        }

        if (
          targetBatchId
        ) {
          params.batchId =
            targetBatchId;
        }

        const response =
          await reportsApi.getProgrammeAtrs(
            params
          );

        const data =
          unwrapList(response);

        setProgrammeReports(
          data
        );

        return data;
      },
      [
        programmeId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Selected Course ATR                                                      */
  /* ======================================================================== */

  const loadSelectedCourseAtr =
    useCallback(
      async (
        targetCourseOfferingId =
          courseOfferingId
      ) => {
        if (
          !targetCourseOfferingId
        ) {
          setSelectedCourseAtr(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getCourseAtr(
            targetCourseOfferingId
          );

        const data =
          unwrap(response);

        setSelectedCourseAtr(
          data
        );

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* Selected Programme ATR                                                   */
  /* ======================================================================== */

  const loadSelectedProgrammeAtr =
    useCallback(
      async (
        targetProgrammeId =
          programmeId,
        targetBatchId =
          batchId
      ) => {
        if (
          !targetProgrammeId ||
          !targetBatchId
        ) {
          setSelectedProgrammeAtr(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getProgrammeAtr(
            targetProgrammeId,
            targetBatchId
          );

        const data =
          unwrap(response);

        setSelectedProgrammeAtr(
          data
        );

        return data;
      },
      [
        programmeId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Course Attainment                                                        */
  /* ======================================================================== */

  const loadCourseAttainmentReport =
    useCallback(
      async (
        targetCourseOfferingId =
          courseOfferingId
      ) => {
        if (
          !targetCourseOfferingId
        ) {
          setCourseAttainmentReport(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getCourseAttainment(
            targetCourseOfferingId
          );

        const data =
          unwrap(response);

        setCourseAttainmentReport(
          data
        );

        return data;
      },
      [courseOfferingId]
    );

  /* ======================================================================== */
  /* Programme Attainment                                                     */
  /* ======================================================================== */

  const loadProgrammeAttainmentReport =
    useCallback(
      async (
        targetProgrammeId =
          programmeId,
        targetBatchId =
          batchId
      ) => {
        if (
          !targetProgrammeId ||
          !targetBatchId
        ) {
          setProgrammeAttainmentReport(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getProgrammeAttainment(
            targetProgrammeId,
            targetBatchId
          );

        const data =
          unwrap(response);

        setProgrammeAttainmentReport(
          data
        );

        return data;
      },
      [
        programmeId,
        batchId,
      ]
    );

  /* ======================================================================== */
  /* Batch Summary                                                            */
  /* ======================================================================== */

  const loadBatchSummary =
    useCallback(
      async (
        targetBatchId =
          batchId
      ) => {
        if (!targetBatchId) {
          setBatchSummary(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getBatchSummary(
            targetBatchId
          );

        const data =
          unwrap(response);

        setBatchSummary(
          data
        );

        return data;
      },
      [batchId]
    );

  /* ======================================================================== */
  /* Batch Comparison                                                         */
  /* ======================================================================== */

  const loadBatchComparison =
    useCallback(
      async (
        targetProgrammeId =
          programmeId,
        targetBatchIds = []
      ) => {
        if (
          !targetProgrammeId ||
          !Array.isArray(
            targetBatchIds
          ) ||
          targetBatchIds.length === 0
        ) {
          setBatchComparison(
            null
          );

          return null;
        }

        const response =
          await reportsApi.getBatchComparison(
            targetProgrammeId,
            targetBatchIds
          );

        const data =
          unwrap(response);

        setBatchComparison(
          data
        );

        return data;
      },
      [programmeId]
    );

  /* ======================================================================== */
  /* Historical / Trend Data                                                  */
  /* ======================================================================== */

  /*
   * Do not generate historical values locally.
   *
   * Only accept data explicitly returned by the
   * backend report API.
   *
   * Since the catalog does not define a dedicated
   * historical-trend endpoint, we expose the
   * backend report response where applicable.
   */

  const loadHistoricalReports =
    useCallback(
      async ({
        targetProgrammeId =
          programmeId,
        targetCourseId =
          courseId,
        targetBatchId =
          batchId,
      } = {}) => {
        const summary =
          await loadReportsSummary({
            targetProgrammeId,
            targetCourseId,
            targetBatchId,
          });

        let history = [];

        if (
          Array.isArray(
            summary?.historicalTrends
          )
        ) {
          history =
            summary.historicalTrends;
        } else if (
          Array.isArray(
            summary?.historical
          )
        ) {
          history =
            summary.historical;
        }

        setHistoricalTrends(
          history
        );

        return history;
      },
      [
        programmeId,
        courseId,
        batchId,
        loadReportsSummary,
      ]
    );

  /* ======================================================================== */
  /* Automatic hydration                                                      */
  /* ======================================================================== */

  useEffect(() => {
    let mounted = true;

    const loadSelectedReports =
      async () => {
        setLoading(true);
        setError(null);

        try {
          await Promise.allSettled([
            loadReportFilters(),

            loadReportsSummary(),

            loadCourseAtrReports(),

            loadProgrammeAtrReports(),

            loadSelectedCourseAtr(),

            loadSelectedProgrammeAtr(),

            loadCourseAttainmentReport(),

            loadProgrammeAttainmentReport(),

            loadBatchSummary(),

            loadHistoricalReports(),
          ]);
        } catch (err) {
          if (mounted) {
            setError(
              err?.customMessage ??
              err?.message ??
              'Failed to load reports.'
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadSelectedReports();

    return () => {
      mounted = false;
    };
  }, [
    programmeId,
    batchId,
    courseId,
    courseOfferingId,
    loadReportFilters,
    loadReportsSummary,
    loadCourseAtrReports,
    loadProgrammeAtrReports,
    loadSelectedCourseAtr,
    loadSelectedProgrammeAtr,
    loadCourseAttainmentReport,
    loadProgrammeAttainmentReport,
    loadBatchSummary,
    loadHistoricalReports,
  ]);

  /* ======================================================================== */
  /* Backend-driven Course Summary                                            */
  /* ======================================================================== */

  const courseAttainmentSummary =
    useMemo(() => {
      /*
       * When the backend returns a selected
       * CourseOffering report, expose it directly.
       */
      if (
        selectedCourseOffering &&
        courseAttainmentReport
      ) {
        return [
          {
            ...courseAttainmentReport,

            courseOfferingId:
              courseOfferingId,

            courseId:
              courseId,

            batchId:
              batchId,
          },
        ];
      }

      /*
       * Aggregate report endpoint is already
       * authoritative. Do not calculate values.
       */
      return Array.isArray(
        courseReports
      )
        ? courseReports
        : [];
    }, [
      selectedCourseOffering,
      courseAttainmentReport,
      courseOfferingId,
      courseId,
      batchId,
      courseReports,
    ]);

  /* ======================================================================== */
  /* Programme PO / PSO Reports                                               */
  /* ======================================================================== */

  const programmeAttainmentSummary =
    useMemo(() => {
      if (
        !programmeAttainmentReport
      ) {
        return [];
      }

      /*
       * Do not manufacture PO values.
       *
       * Return the backend's actual PO dataset
       * whenever the response contains it.
       */
      if (
        Array.isArray(
          programmeAttainmentReport
            ?.poAttainment
        )
      ) {
        return programmeAttainmentReport
          .poAttainment;
      }

      if (
        Array.isArray(
          programmeAttainmentReport
            ?.poAttainmentSummary
        )
      ) {
        return programmeAttainmentReport
          .poAttainmentSummary;
      }

      if (
        Array.isArray(
          programmeAttainmentReport
            ?.programOutcomeAttainment
        )
      ) {
        return programmeAttainmentReport
          .programOutcomeAttainment;
      }

      return [];
    }, [
      programmeAttainmentReport,
    ]);

  const programmePSOAttainmentSummary =
    useMemo(() => {
      if (
        !programmeAttainmentReport
      ) {
        return [];
      }

      if (
        Array.isArray(
          programmeAttainmentReport
            ?.psoAttainment
        )
      ) {
        return programmeAttainmentReport
          .psoAttainment;
      }

      if (
        Array.isArray(
          programmeAttainmentReport
            ?.psoAttainmentSummary
        )
      ) {
        return programmeAttainmentReport
          .psoAttainmentSummary;
      }

      if (
        Array.isArray(
          programmeAttainmentReport
            ?.programSpecificOutcomeAttainment
        )
      ) {
        return programmeAttainmentReport
          .programSpecificOutcomeAttainment;
      }

      return [];
    }, [
      programmeAttainmentReport,
    ]);

  /* ======================================================================== */
  /* CSV Export                                                               */
  /* ======================================================================== */

  const exportReportAsCSV =
    async (
      reportType = 'course'
    ) => {
      const params = {};

      if (programmeId) {
        params.programmeId =
          programmeId;
      }

      if (courseId) {
        params.courseId =
          courseId;
      }

      if (batchId) {
        params.batchId =
          batchId;
      }

      params.reportType =
        reportType;

      const response =
        await reportsApi.exportExcel(
          params
        );

      /*
       * Binary response.
       *
       * Do not pass the Blob through the
       * normal JSON unwrapping logic.
       */
      const blob =
        response?.data ??
        response;

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          'a'
        );

      link.href =
        url;

      link.download =
        `OBE_${reportType}_Report_${academicYear || 'report'}.xlsx`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      return blob;
    };

  /* ======================================================================== */
  /* PDF Export                                                               */
  /* ======================================================================== */

  const exportReportAsPDF =
    async (
      reportType = 'course'
    ) => {
      const params = {};

      if (programmeId) {
        params.programmeId =
          programmeId;
      }

      if (courseId) {
        params.courseId =
          courseId;
      }

      if (batchId) {
        params.batchId =
          batchId;
      }

      params.reportType =
        reportType;

      const response =
        await reportsApi.exportPdf(
          params
        );

      const blob =
        response?.data ??
        response;

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          'a'
        );

      link.href =
        url;

      link.download =
        `OBE_${reportType}_Report_${academicYear || 'report'}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      return blob;
    };

  /* ======================================================================== */
  /* Print                                                                    */
  /* ======================================================================== */

  const printReport =
    () => {
      window.print();
    };

  /* ======================================================================== */
  /* Provider                                                                 */
  /* ======================================================================== */

  return (
    <ReportsContext.Provider
      value={{
        /* UI state */
        activeReportTab,

        setActiveReportTab,

        filterYear,

        setFilterYear,

        availableYears:
          reportFilters
            ?.years ??
          [],

        /* Backend report responses */
        reportFilters,

        reportsSummary,

        courseReports,

        programmeReports,

        selectedCourseAtr,

        selectedProgrammeAtr,

        courseAttainmentReport,

        programmeAttainmentReport,

        batchComparison,

        batchSummary,

        historicalTrends,

        /* Derived report collections */
        courseAttainmentSummary,

        programmeAttainmentSummary,

        programmePSOAttainmentSummary,

        /* Current selections */
        selectedCourse,

        selectedCourseOffering,

        courseOfferingId,

        selectedProgramme,

        academicYear,

        programmeId,

        courseId,

        batchId,

        /* Loading/error */
        loading,

        error,

        /* Loaders */
        loadReportFilters,

        loadReportsSummary,

        loadCourseAtrReports,

        loadProgrammeAtrReports,

        loadSelectedCourseAtr,

        loadSelectedProgrammeAtr,

        loadCourseAttainmentReport,

        loadProgrammeAttainmentReport,

        loadBatchSummary,

        loadBatchComparison,

        loadHistoricalReports,

        /* Export / print */
        exportReportAsCSV,

        exportReportAsPDF,

        printReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useReports() {
  const context =
    useContext(
      ReportsContext
    );

  if (!context) {
    throw new Error(
      'useReports must be used within a ReportsProvider'
    );
  }

  return context;
}

export default useReports;