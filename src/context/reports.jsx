import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

import { useAcademic } from './academic';
import { reportsApi } from '../api/reports';

export const ReportsContext = createContext(null);

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

const unwrap = (response) => {
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

const unwrapList = (response) => {
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
};

/* ========================================================================== */
/* Provider                                                                   */
/* ========================================================================== */

export function ReportsProvider({ children }) {
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

  const [activeReportTab, setActiveReportTab] = useState('co-attainment');
  const [filterYear, setFilterYear] = useState(academicYear ?? null);

  /* ------------------------------------------------------------------------ */
  /* Backend report state                                                     */
  /* ------------------------------------------------------------------------ */

  const [reportFilters, setReportFilters] = useState(null);
  const [reportsSummary, setReportsSummary] = useState(null);
  const [courseReports, setCourseReports] = useState([]);
  const [programmeReports, setProgrammeReports] = useState([]);
  const [selectedCourseAtr, setSelectedCourseAtr] = useState(null);
  const [selectedProgrammeAtr, setSelectedProgrammeAtr] = useState(null);
  const [courseAttainmentReport, setCourseAttainmentReport] = useState(null);
  const [programmeAttainmentReport, setProgrammeAttainmentReport] = useState(null);
  const [batchComparison, setBatchComparison] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [historicalTrends, setHistoricalTrends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================================== */
  /* 1. Report Filters Loader                                                 */
  /* ======================================================================== */

  const loadReportFilters = useCallback(async () => {
    try {
      setError(null);
      const response = await reportsApi.getFilters();
      const data = unwrap(response);
      setReportFilters(data);
      return data;
    } catch (err) {
      console.warn('loadReportFilters failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load report filters.');
      return null;
    }
  }, []);

  /* ======================================================================== */
  /* 2. Reports Summary Loader                                                */
  /* ======================================================================== */

  const loadReportsSummary = useCallback(
    async ({
      targetProgrammeId = programmeId,
      targetCourseId = courseId,
      targetBatchId = batchId,
    } = {}) => {
      try {
        setError(null);
        const params = {};
        if (targetProgrammeId) params.masterProgrammeId = targetProgrammeId;
        if (targetCourseId) params.masterCourseId = targetCourseId;
        if (targetBatchId) params.programmeBatchId = targetBatchId;

        const response = await reportsApi.getReportsSummary(params);
        const data = unwrap(response);
        setReportsSummary(data);
        return data;
      } catch (err) {
        console.warn('loadReportsSummary failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load reports summary.');
        return null;
      }
    },
    [programmeId, courseId, batchId]
  );

  /* ======================================================================== */
  /* 3. Course ATR List Loader                                                */
  /* ======================================================================== */

  const loadCourseAtrReports = useCallback(
    async ({
      targetProgrammeId = programmeId,
      targetCourseId = courseId,
      targetBatchId = batchId,
    } = {}) => {
      try {
        setError(null);
        const params = {};
        if (targetProgrammeId) params.masterProgrammeId = targetProgrammeId;
        if (targetCourseId) params.masterCourseId = targetCourseId;
        if (targetBatchId) params.programmeBatchId = targetBatchId;

        const response = await reportsApi.getCourseAtrs(params);
        const data = unwrapList(response);
        setCourseReports(data);
        return data;
      } catch (err) {
        console.warn('loadCourseAtrReports failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load course ATR reports.');
        return [];
      }
    },
    [programmeId, courseId, batchId]
  );

  /* ======================================================================== */
  /* 4. Programme ATR List Loader                                             */
  /* ======================================================================== */

  const loadProgrammeAtrReports = useCallback(
    async ({
      targetProgrammeId = programmeId,
      targetBatchId = batchId,
    } = {}) => {
      try {
        setError(null);
        const params = {};
        if (targetProgrammeId) params.masterProgrammeId = targetProgrammeId;
        if (targetBatchId) params.programmeBatchId = targetBatchId;

        const response = await reportsApi.getProgrammeAtrs(params);
        const data = unwrapList(response);
        setProgrammeReports(data);
        return data;
      } catch (err) {
        console.warn('loadProgrammeAtrReports failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load programme ATR reports.');
        return [];
      }
    },
    [programmeId, batchId]
  );

  /* ======================================================================== */
  /* 5. Selected Course ATR Loader                                            */
  /* ======================================================================== */

  const loadSelectedCourseAtr = useCallback(
    async (targetCourseOfferingId = courseOfferingId) => {
      if (!targetCourseOfferingId) {
        setSelectedCourseAtr(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getCourseAtr(targetCourseOfferingId);
        const data = unwrap(response);
        setSelectedCourseAtr(data);
        return data;
      } catch (err) {
        console.warn(`loadSelectedCourseAtr(${targetCourseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load course ATR.');
        return null;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 6. Selected Programme ATR Loader                                         */
  /* ======================================================================== */

  const loadSelectedProgrammeAtr = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        setSelectedProgrammeAtr(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getProgrammeAtr(targetProgrammeId, targetBatchId);
        const data = unwrap(response);
        setSelectedProgrammeAtr(data);
        return data;
      } catch (err) {
        console.warn(`loadSelectedProgrammeAtr(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load programme ATR.');
        return null;
      }
    },
    [programmeId, batchId]
  );

  /* ======================================================================== */
  /* 7. Course Attainment Report Loader                                       */
  /* ======================================================================== */

  const loadCourseAttainmentReport = useCallback(
    async (targetCourseOfferingId = courseOfferingId) => {
      if (!targetCourseOfferingId) {
        setCourseAttainmentReport(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getCourseAttainment(targetCourseOfferingId);
        const data = unwrap(response);
        setCourseAttainmentReport(data);
        return data;
      } catch (err) {
        console.warn(`loadCourseAttainmentReport(${targetCourseOfferingId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load course attainment report.');
        return null;
      }
    },
    [courseOfferingId]
  );

  /* ======================================================================== */
  /* 8. Programme Attainment Report Loader                                     */
  /* ======================================================================== */

  const loadProgrammeAttainmentReport = useCallback(
    async (targetProgrammeId = programmeId, targetBatchId = batchId) => {
      if (!targetProgrammeId || !targetBatchId) {
        setProgrammeAttainmentReport(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getProgrammeAttainment(
          targetProgrammeId,
          targetBatchId
        );
        const data = unwrap(response);
        setProgrammeAttainmentReport(data);
        return data;
      } catch (err) {
        console.warn(`loadProgrammeAttainmentReport(${targetProgrammeId}, ${targetBatchId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load programme attainment report.');
        return null;
      }
    },
    [programmeId, batchId]
  );

  /* ======================================================================== */
  /* 9. Batch Summary Loader                                                  */
  /* ======================================================================== */

  const loadBatchSummary = useCallback(
    async (targetBatchId = batchId) => {
      if (!targetBatchId) {
        setBatchSummary(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getBatchSummary(targetBatchId);
        const data = unwrap(response);
        setBatchSummary(data);
        return data;
      } catch (err) {
        console.warn(`loadBatchSummary(${targetBatchId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load batch summary.');
        return null;
      }
    },
    [batchId]
  );

  /* ======================================================================== */
  /* 10. Batch Comparison Loader                                              */
  /* ======================================================================== */

  const loadBatchComparison = useCallback(
    async (targetProgrammeId = programmeId, targetBatchIds = []) => {
      if (!targetProgrammeId || !Array.isArray(targetBatchIds) || targetBatchIds.length === 0) {
        setBatchComparison(null);
        return null;
      }

      try {
        setError(null);
        const response = await reportsApi.getBatchComparison(
          targetProgrammeId,
          targetBatchIds
        );
        const data = unwrap(response);
        setBatchComparison(data);
        return data;
      } catch (err) {
        console.warn(`loadBatchComparison(${targetProgrammeId}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load batch comparison.');
        return null;
      }
    },
    [programmeId]
  );

  /* ======================================================================== */
  /* 11. Historical / Trend Data Loader                                       */
  /* ======================================================================== */

  const loadHistoricalReports = useCallback(
    async ({
      targetProgrammeId = programmeId,
      targetCourseId = courseId,
      targetBatchId = batchId,
    } = {}) => {
      try {
        setError(null);
        const summary = await loadReportsSummary({
          targetProgrammeId,
          targetCourseId,
          targetBatchId,
        });

        let history = [];
        if (Array.isArray(summary?.historicalTrends)) {
          history = summary.historicalTrends;
        } else if (Array.isArray(summary?.historical)) {
          history = summary.historical;
        }

        setHistoricalTrends(history);
        return history;
      } catch (err) {
        console.warn('loadHistoricalReports failed:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load historical reports.');
        return [];
      }
    },
    [programmeId, courseId, batchId, loadReportsSummary]
  );

  /* ======================================================================== */
  /* Derived Reports Data                                                     */
  /* ======================================================================== */

  const courseAttainmentSummary = useMemo(() => {
    if (selectedCourseOffering && courseAttainmentReport) {
      return [
        {
          ...courseAttainmentReport,
          courseOfferingId,
          courseId,
          batchId,
        },
      ];
    }
    return Array.isArray(courseReports) ? courseReports : [];
  }, [
    selectedCourseOffering,
    courseAttainmentReport,
    courseOfferingId,
    courseId,
    batchId,
    courseReports,
  ]);

  const programmeAttainmentSummary = useMemo(() => {
    if (!programmeAttainmentReport) {
      return [];
    }

    if (Array.isArray(programmeAttainmentReport?.poAttainment)) {
      return programmeAttainmentReport.poAttainment;
    }

    if (Array.isArray(programmeAttainmentReport?.poAttainmentSummary)) {
      return programmeAttainmentReport.poAttainmentSummary;
    }

    if (Array.isArray(programmeAttainmentReport?.programOutcomeAttainment)) {
      return programmeAttainmentReport.programOutcomeAttainment;
    }

    return [];
  }, [programmeAttainmentReport]);

  const programmePSOAttainmentSummary = useMemo(() => {
    if (!programmeAttainmentReport) {
      return [];
    }

    if (Array.isArray(programmeAttainmentReport?.psoAttainment)) {
      return programmeAttainmentReport.psoAttainment;
    }

    if (Array.isArray(programmeAttainmentReport?.psoAttainmentSummary)) {
      return programmeAttainmentReport.psoAttainmentSummary;
    }

    if (Array.isArray(programmeAttainmentReport?.programSpecificOutcomeAttainment)) {
      return programmeAttainmentReport.programSpecificOutcomeAttainment;
    }

    return [];
  }, [programmeAttainmentReport]);

  /* ======================================================================== */
  /* 12. Export & Print                                                       */
  /* ======================================================================== */

  const exportReportAsCSV = useCallback(
    async (reportType = 'course') => {
      try {
        const params = {};
        if (programmeId) params.masterProgrammeId = programmeId;
        if (courseId) params.masterCourseId = courseId;
        if (batchId) params.programmeBatchId = batchId;
        params.reportType = reportType;

        const response = await reportsApi.exportExcel(params);
        const blob = response?.data ?? response;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OBE_${reportType}_Report_${academicYear || 'report'}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return blob;
      } catch (err) {
        console.warn(`exportReportAsCSV(${reportType}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to export CSV report.');
        throw err;
      }
    },
    [programmeId, courseId, batchId, academicYear]
  );

  const exportReportAsPDF = useCallback(
    async (reportType = 'course') => {
      try {
        const params = {};
        if (programmeId) params.masterProgrammeId = programmeId;
        if (courseId) params.masterCourseId = courseId;
        if (batchId) params.programmeBatchId = batchId;
        params.reportType = reportType;

        const response = await reportsApi.exportPdf(params);
        const blob = response?.data ?? response;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OBE_${reportType}_Report_${academicYear || 'report'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return blob;
      } catch (err) {
        console.warn(`exportReportAsPDF(${reportType}) failed:`, err);
        setError(err?.response?.data?.message || err?.message || 'Failed to export PDF report.');
        throw err;
      }
    },
    [programmeId, courseId, batchId, academicYear]
  );

  const printReport = useCallback(() => {
    window.print();
  }, []);

  /* ======================================================================== */
  /* Context Value                                                            */
  /* ======================================================================== */

  const value = {
    /* UI state */
    activeReportTab,
    setActiveReportTab,
    filterYear,
    setFilterYear,
    availableYears: reportFilters?.years ?? [],

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

    /* Loading / Error */
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

    /* Export / Print */
    exportReportAsCSV,
    exportReportAsPDF,
    printReport,
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}

/* ========================================================================== */
/* Hook                                                                       */
/* ========================================================================== */

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}

export default useReports;
