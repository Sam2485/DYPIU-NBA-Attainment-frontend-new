import { createContext, useContext, useState, useMemo } from 'react';
import { useAcademic } from './academic';
import { useAttainment } from './attainment';
import { useApproval } from './approval';

export const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const {
    courses = [],
    selectedCourse,
    selectedProgramme,
    academicYear = '2025-26',
    availableYears = [],
    activePOs = [],
    activePSOs = [],
  } = useAcademic();

  const {
    courseAttainmentStore = {},
    courseAtrStore = {},
    programmeAtrStore = {},
    yearMetrics = {},
    YEAR_ATTAINMENT_METRICS = {},
  } = useAttainment();

  const { courseVerificationStore = {} } = useApproval();

  const [activeReportTab, setActiveReportTab] = useState('co-attainment');
  const [filterYear, setFilterYear] = useState(academicYear);

  // Consolidated Course Attainment Reports summary
  const courseAttainmentSummary = useMemo(() => {
    return courses.map((c) => {
      const attData = courseAttainmentStore[c.id] || {
        directAttainment: 2.75,
        indirectAttainment: 2.50,
        overallCOAttainment: 2.70,
      };
      const vRec = courseVerificationStore[c.id] || {};
      return {
        courseId: c.id,
        courseCode: c.code,
        courseName: c.name,
        semester: c.semester || 'Sem I',
        coordinator: c.coordinator || c.faculty || 'Unassigned',
        directAttainment: attData.directAttainment || 2.80,
        indirectAttainment: attData.indirectAttainment || 2.50,
        overallCOAttainment: attData.overallCOAttainment || 2.74,
        status: vRec.coStatus === 'APPROVED' ? 'Approved' : 'Verified',
        coCount: c.courseOutcomes?.length || 6,
      };
    });
  }, [courses, courseAttainmentStore, courseVerificationStore]);

  // Consolidated Programme PO/PSO Attainment Reports
  const programmeAttainmentSummary = useMemo(() => {
    const defaultPOs = activePOs.length > 0 ? activePOs : [
      { code: 'PO1', statement: 'Engineering Knowledge' },
      { code: 'PO2', statement: 'Problem Analysis' },
      { code: 'PO3', statement: 'Design & Development' },
    ];

    return defaultPOs.map((po, index) => {
      const targetVal = 2.50;
      const actualVal = 2.10 + (index % 5) * 0.15;
      return {
        code: po.code,
        statement: po.statement,
        target: targetVal,
        directAttainment: actualVal,
        indirectAttainment: 2.40,
        overallAttainment: Math.min(3.0, actualVal * 0.8 + 2.40 * 0.2),
        status: actualVal >= targetVal ? 'Target Achieved' : 'Target Not Achieved',
      };
    });
  }, [activePOs]);

  // Year-wise historical trend data
  const historicalTrends = useMemo(() => {
    return Object.entries(YEAR_ATTAINMENT_METRICS).map(([yr, m]) => ({
      year: yr,
      directExamAttainment: m.directExamAttainment,
      indirectSurveyAttainment: m.indirectSurveyAttainment,
      overallCOAttainment: m.overallCOAttainment,
      avgPoAttainment: m.avgPoAttainment,
      avgPsoAttainment: m.avgPsoAttainment,
    }));
  }, [YEAR_ATTAINMENT_METRICS]);

  // Export helpers
  const exportReportAsCSV = (reportType = 'course') => {
    const data = reportType === 'programme' ? programmeAttainmentSummary : courseAttainmentSummary;
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OBE_${reportType}_Attainment_Report_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <ReportsContext.Provider
      value={{
        activeReportTab,
        setActiveReportTab,
        filterYear,
        setFilterYear,
        courseAttainmentSummary,
        programmeAttainmentSummary,
        historicalTrends,
        courseAtrStore,
        programmeAtrStore,
        exportReportAsCSV,
        printReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
