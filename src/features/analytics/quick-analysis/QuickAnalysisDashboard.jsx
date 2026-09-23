import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAcademic } from '../../../context/AcademicContext';
import { analyticsApi, academicApi } from '../../../api';
import { toPng } from 'html-to-image';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Layers,
  BarChart3,
  FileText,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Target,
  Clock,
  PieChart as PieChartIcon,
  Lightbulb,
  X,
  User,
  Building,
  School,
} from 'lucide-react';

import dypiuCampusHero from '../../../assets/dypiu_campus_hero.webp';
import dypLogo from '../../../assets/image.png';
import iqacLogo from '../../../assets/iqac.png';

// Custom tick renderer for PO/PSO outcomes: POs in dark slate, PSOs in vibrant green
function CustomOutcomeTick({ x, y, payload }) {
  const code = payload?.value || '';
  const isPso = code.startsWith('PSO');
  return (
    <text
      x={x}
      y={y + 13}
      textAnchor="middle"
      fill={isPso ? '#16a34a' : '#334155'}
      fontSize={9.5}
      fontWeight={800}
    >
      {code}
    </text>
  );
}

// Custom tooltip for grouped comparison bars
function GroupedTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
        fontSize: 11.5,
        minWidth: 150,
      }}
    >
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{label}</div>
      {payload.map((item) => (
        <div
          key={item.name}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: item.color, fontWeight: 700 }}
        >
          <span>{item.name}:</span>
          <span style={{ color: '#0f172a' }}>
            {item.value !== null && item.value !== undefined ? Number(item.value).toFixed(2) : '—'}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function QuickAnalysisDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();
  const reportRef = useRef(null);

  const isIqac = role === 'IQAC';
  const isDirector = role === 'DIRECTOR';
  const isHod = role === 'HOD';
  const isProgrammeCoordinator = role === 'PROGRAMME_COORDINATOR';

  // Academic metadata
  const {
    departments = [],
    masterProgrammes = [],
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    loadCoordinatorMasterProgrammes = () => Promise.resolve([]),
  } = useAcademic();

  const [coordinatorProgrammes, setCoordinatorProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Selected State
  const initialProgId = searchParams.get('masterProgrammeId') || '';
  const initialBatchId = searchParams.get('programmeBatchId') || '';

  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState(initialProgId);
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState(initialBatchId);

  // Data States
  const [batchOverview, setBatchOverview] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Modal State for "View all courses"
  const [showAllCoursesModal, setShowAllCoursesModal] = useState(false);

  // 1. Load Role-Scoped Metadata
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        await Promise.allSettled([loadDepartments(), loadMasterProgrammes()]);
        if (isProgrammeCoordinator && user?.email) {
          const progs = await loadCoordinatorMasterProgrammes(user.email);
          if (isMounted && Array.isArray(progs) && progs.length > 0) {
            setCoordinatorProgrammes(progs);
          }
        }
      } catch (err) {
        console.error('[QuickAnalysis] Error loading metadata:', err);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [isProgrammeCoordinator, user?.email]);

  // 2. Filter programmes by userScope
  const availableProgrammes = useMemo(() => {
    if (isIqac) {
      return masterProgrammes || [];
    }
    if (isDirector) {
      const directorSchoolId = String(user?.schoolId || '');
      if (!directorSchoolId) return masterProgrammes || [];
      const schoolDeptIds = new Set(
        (departments || [])
          .filter((d) => String(d.schoolId || d.school_id) === directorSchoolId)
          .map((d) => String(d.id || d.departmentId))
      );
      return (masterProgrammes || []).filter((p) => {
        if (p.schoolId && String(p.schoolId) === directorSchoolId) return true;
        if (p.departmentId && schoolDeptIds.has(String(p.departmentId))) return true;
        return false;
      });
    }
    if (isHod) {
      const hodDeptId = String(user?.departmentId || '');
      if (!hodDeptId) return masterProgrammes || [];
      return (masterProgrammes || []).filter(
        (p) => String(p.departmentId || p.department_id) === hodDeptId
      );
    }
    if (isProgrammeCoordinator) {
      if (coordinatorProgrammes.length > 0) return coordinatorProgrammes;
      const pcProgId = String(user?.masterProgrammeId || '');
      if (pcProgId) {
        return (masterProgrammes || []).filter(
          (p) => String(p.id || p.masterProgrammeId) === pcProgId
        );
      }
      return masterProgrammes || [];
    }
    return masterProgrammes || [];
  }, [isIqac, isDirector, isHod, isProgrammeCoordinator, user, departments, masterProgrammes, coordinatorProgrammes]);

  // Auto-select first programme if none selected
  useEffect(() => {
    if (!selectedMasterProgrammeId && availableProgrammes.length > 0) {
      setSelectedMasterProgrammeId(availableProgrammes[0].id || availableProgrammes[0].masterProgrammeId || '');
    }
  }, [availableProgrammes, selectedMasterProgrammeId]);

  // 3. Load Batches for Selected Programme
  useEffect(() => {
    let isMounted = true;
    if (!selectedMasterProgrammeId) {
      setBatches([]);
      setSelectedProgrammeBatchId('');
      return;
    }

    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const res = await academicApi.getBatches({
          masterProgrammeId: selectedMasterProgrammeId,
        });
        const batchList = res?.data?.data || res?.data || [];
        const sorted = Array.isArray(batchList)
          ? [...batchList].sort((a, b) => (b.startYear || 0) - (a.startYear || 0))
          : [];
        if (isMounted) {
          setBatches(sorted);
          if (!selectedProgrammeBatchId && sorted.length > 0) {
            setSelectedProgrammeBatchId(sorted[0].id || sorted[0].programmeBatchId || '');
          } else if (sorted.length > 0 && !sorted.some((b) => (b.id || b.programmeBatchId) === selectedProgrammeBatchId)) {
            setSelectedProgrammeBatchId(sorted[0].id || sorted[0].programmeBatchId || '');
          }
        }
      } catch (err) {
        console.error('[QuickAnalysis] Error loading batches:', err);
        if (isMounted) setBatches([]);
      } finally {
        if (isMounted) setIsLoadingBatches(false);
      }
    };

    fetchBatches();
    return () => {
      isMounted = false;
    };
  }, [selectedMasterProgrammeId]);

  // Update query params when selection changes
  useEffect(() => {
    const params = {};
    if (selectedMasterProgrammeId) params.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) params.programmeBatchId = selectedProgrammeBatchId;
    setSearchParams(params, { replace: true });
  }, [selectedMasterProgrammeId, selectedProgrammeBatchId, setSearchParams]);

  // 4. Fetch Report Data: Overview + Comparative Previous Batch Data
  const loadReportData = useCallback(async () => {
    if (!selectedProgrammeBatchId) return;

    setIsLoadingReport(true);
    setReportError(null);

    try {
      const overviewRes = await analyticsApi.getBatchOverview(selectedProgrammeBatchId);
      const overview = overviewRes?.data?.data || overviewRes?.data || null;
      setBatchOverview(overview);

      // Identify predecessor batch for YoY comparison
      let prevBatchId = null;
      const currentIndex = batches.findIndex(
        (b) => (b.id || b.programmeBatchId) === selectedProgrammeBatchId
      );

      if (currentIndex >= 0 && currentIndex + 1 < batches.length) {
        prevBatchId = batches[currentIndex + 1].id || batches[currentIndex + 1].programmeBatchId;
      }

      if (prevBatchId) {
        try {
          const compRes = await analyticsApi.compareBatches({
            programmeBatchId1: prevBatchId,
            programmeBatchId2: selectedProgrammeBatchId,
          });
          const comp = compRes?.data?.data || compRes?.data || null;
          setComparisonData(comp);
        } catch (compErr) {
          console.warn('[QuickAnalysis] Could not load batch comparison:', compErr);
          setComparisonData(null);
        }
      } else {
        setComparisonData(null);
      }
    } catch (err) {
      console.error('[QuickAnalysis] Error loading report data:', err);
      setReportError(
        err?.response?.data?.message || err?.message || 'Failed to load batch analytics report.'
      );
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedProgrammeBatchId, batches]);

  useEffect(() => {
    if (selectedProgrammeBatchId) {
      loadReportData();
    }
  }, [selectedProgrammeBatchId, loadReportData]);

  // 5. Compute Consolidated Metrics & Longitudinal Chart Data
  const metrics = useMemo(() => {
    if (!batchOverview) return null;

    const poHealth = batchOverview.poHealth || [];
    const psoHealth = batchOverview.psoHealth || [];
    const allOutcomes = [...poHealth, ...psoHealth];
    const totalOutcomes = allOutcomes.length || 1;

    // Current averages
    const currentTotalAttainment = allOutcomes.reduce((acc, o) => acc + Number(o.attainment || 0), 0);
    const currentAvgAttainment = totalOutcomes > 0 ? Number((currentTotalAttainment / totalOutcomes).toFixed(2)) : 0;

    const currentPoTotal = poHealth.reduce((acc, o) => acc + Number(o.attainment || 0), 0);
    const currentPoAvg = poHealth.length > 0 ? Number((currentPoTotal / poHealth.length).toFixed(2)) : 0;

    const currentPsoTotal = psoHealth.reduce((acc, o) => acc + Number(o.attainment || 0), 0);
    const currentPsoAvg = psoHealth.length > 0 ? Number((currentPsoTotal / psoHealth.length).toFixed(2)) : 0;

    const currentDirectAttainment = allOutcomes.reduce((acc, o) => acc + Number(o.directAttainment || 0), 0);
    const currentAvgDirect = totalOutcomes > 0 ? Number((currentDirectAttainment / totalOutcomes).toFixed(2)) : 0;

    const currentIndirectAttainment = allOutcomes.reduce((acc, o) => acc + Number(o.indirectAttainment || 0), 0);
    const currentAvgIndirect = totalOutcomes > 0 ? Number((currentIndirectAttainment / totalOutcomes).toFixed(2)) : 0;

    const posMet = poHealth.filter((p) => p.targetMet).length;
    const posUnmet = poHealth.length - posMet;
    const psosMet = psoHealth.filter((p) => p.targetMet).length;
    const psosUnmet = psoHealth.length - psosMet;
    const totalMet = posMet + psosMet;
    const totalUnmet = posUnmet + psosUnmet;

    // Benchmark Target (average target configured across outcomes)
    const avgTargetVal = Number(
      (allOutcomes.reduce((acc, o) => acc + Number(o.target || 2.5), 0) / totalOutcomes).toFixed(2)
    ) || 2.5;

    // Predecessor batch comparisons: strictly check if comparisonData is valid
    const hasPreviousBatch = Boolean(
      comparisonData &&
      comparisonData.batch1 &&
      Array.isArray(comparisonData.outcomes) &&
      comparisonData.outcomes.length > 0 &&
      comparisonData.outcomes.some((co) => co.batch1 && co.batch1.finalAttainment !== null && co.batch1.finalAttainment !== undefined)
    );

    let prevAvgAttainment = null;
    let prevPoAvg = null;
    let prevPsoAvg = null;
    let prevAvgDirect = null;
    let prevAvgIndirect = null;
    let poGrowthPercentage = null;
    let psoGrowthPercentage = null;
    let yoyGrowthPercentage = null;
    let improvedCount = 0;
    let declinedCount = 0;
    let steadyCount = 0;
    let prevMetCount = null;
    let prevUnmetCount = null;
    let prevBatchName = hasPreviousBatch ? (comparisonData?.batch1?.batchName || 'Previous Batch') : null;

    if (hasPreviousBatch) {
      const compOutcomes = comparisonData.outcomes;
      let prevTotal = 0;
      let prevCount = 0;
      let prevPoSum = 0;
      let prevPoCount = 0;
      let prevPsoSum = 0;
      let prevPsoCount = 0;
      let prevDirectSum = 0;
      let prevIndirectSum = 0;
      let pMet = 0;
      let pUnmet = 0;

      compOutcomes.forEach((item) => {
        const b1 = item.batch1;
        const b2 = item.batch2;
        const code = item.outcomeCode || '';

        if (b1 && b1.finalAttainment !== null && b1.finalAttainment !== undefined) {
          const val = Number(b1.finalAttainment);
          prevTotal += val;
          prevCount += 1;
          if (b1.targetMet) pMet += 1;
          else pUnmet += 1;

          if (code.startsWith('PO') && !code.startsWith('PSO')) {
            prevPoSum += val;
            prevPoCount += 1;
          } else if (code.startsWith('PSO')) {
            prevPsoSum += val;
            prevPsoCount += 1;
          }

          if (b1.directAttainment != null) prevDirectSum += Number(b1.directAttainment);
          if (b1.indirectAttainment != null) prevIndirectSum += Number(b1.indirectAttainment);
        }

        if (b1 && b2 && b1.finalAttainment !== null && b2.finalAttainment !== null) {
          const diff = Number(b2.finalAttainment) - Number(b1.finalAttainment);
          if (diff > 0.02) improvedCount += 1;
          else if (diff < -0.02) declinedCount += 1;
          else steadyCount += 1;
        }
      });

      if (prevCount > 0) {
        prevAvgAttainment = Number((prevTotal / prevCount).toFixed(2));
        prevMetCount = pMet;
        prevUnmetCount = pUnmet;
        if (prevPoCount > 0) prevPoAvg = Number((prevPoSum / prevPoCount).toFixed(2));
        if (prevPsoCount > 0) prevPsoAvg = Number((prevPsoSum / prevPsoCount).toFixed(2));
        prevAvgDirect = Number((prevDirectSum / prevCount).toFixed(2));
        prevAvgIndirect = Number((prevIndirectSum / prevCount).toFixed(2));

        if (prevAvgAttainment > 0) {
          yoyGrowthPercentage = Number(
            (((currentAvgAttainment - prevAvgAttainment) / prevAvgAttainment) * 100).toFixed(2)
          );
        }
        if (prevPoAvg && prevPoAvg > 0) {
          poGrowthPercentage = Number((((currentPoAvg - prevPoAvg) / prevPoAvg) * 100).toFixed(2));
        }
        if (prevPsoAvg && prevPsoAvg > 0) {
          psoGrowthPercentage = Number((((currentPsoAvg - prevPsoAvg) / prevPsoAvg) * 100).toFixed(2));
        }
      }
    }

    // Direct / Indirect Weights (as per configuration)
    const directWeight = batchOverview.directIndirect?.programmeDirectWeight
      ? Math.round(Number(batchOverview.directIndirect.programmeDirectWeight) * 100)
      : 80;
    const indirectWeight = batchOverview.directIndirect?.programmeIndirectWeight
      ? Math.round(Number(batchOverview.directIndirect.programmeIndirectWeight) * 100)
      : 20;

    // Course Contributions (curricular order or descending direct attainment)
    const rawContributions = batchOverview.courseContributions || [];
    const courseContributions = [...rawContributions]
      .filter((c) => c && (c.courseName || c.courseCode))
      .slice(0, 6);

    // Deficit / Attention Areas (outcomes where attainment < target)
    const attentionList = allOutcomes.filter((o) => !o.targetMet || Number(o.attainment) < Number(o.target || 2.5));

    // Section 2 Grouped Chart Data (PO1..PO12, PSO1..PSO3)
    // Only supply previous value if a real predecessor batch exists!
    const poPsoChartData = allOutcomes.map((item) => {
      const code = item.poCode || item.psoCode || '';
      const compItem = comparisonData?.outcomes?.find((co) => co.outcomeCode === code);
      const prevVal = (hasPreviousBatch && compItem?.batch1?.finalAttainment != null)
        ? Number(Number(compItem.batch1.finalAttainment).toFixed(2))
        : null;

      return {
        code,
        current: Number(Number(item.attainment || 0).toFixed(2)),
        previous: prevVal,
        target: Number(Number(item.target || 2.5).toFixed(2)),
      };
    });

    // Section 3: PO & PSO Attainment Growth Mini-Charts Data
    const poGrowthData = hasPreviousBatch
      ? [
          { name: `Previous`, value: prevPoAvg },
          { name: `Current`, value: currentPoAvg },
        ]
      : [
          { name: `Current`, value: currentPoAvg },
        ];

    const psoGrowthData = hasPreviousBatch
      ? [
          { name: `Previous`, value: prevPsoAvg },
          { name: `Current`, value: currentPsoAvg },
        ]
      : [
          { name: `Current`, value: currentPsoAvg },
        ];

    // Section 4: Target Status 100% Stacked Bar Data
    const curTotalOutcomes = totalMet + totalUnmet || totalOutcomes;
    const currentStatusEntry = {
      batch: batchOverview?.batch?.batchName || 'Current Batch',
      metCount: totalMet,
      belowCount: totalUnmet,
      metPct: Number(((totalMet / curTotalOutcomes) * 100).toFixed(1)),
      belowPct: Number(((totalUnmet / curTotalOutcomes) * 100).toFixed(1)),
    };

    let targetStatusData = [currentStatusEntry];
    if (hasPreviousBatch && prevMetCount !== null) {
      const prevTotalOutcomes = (prevMetCount || 0) + (prevUnmetCount || 0) || totalOutcomes;
      targetStatusData = [
        {
          batch: prevBatchName || 'Previous Batch',
          metCount: prevMetCount,
          belowCount: prevUnmetCount,
          metPct: Number(((prevMetCount / prevTotalOutcomes) * 100).toFixed(1)),
          belowPct: Number(((prevUnmetCount / prevTotalOutcomes) * 100).toFixed(1)),
        },
        currentStatusEntry,
      ];
    }

    // Section 5: Direct vs Indirect Attainment Grouped Bars Data
    const directIndirectData = [
      {
        category: 'Direct Attainment',
        previous: hasPreviousBatch ? prevAvgDirect : null,
        current: currentAvgDirect,
      },
      {
        category: 'Indirect Attainment',
        previous: hasPreviousBatch ? prevAvgIndirect : null,
        current: currentAvgIndirect,
      },
    ];

    // Section 6: Outcome Progression Bars Data (only populated when previous batch exists)
    const progressionData = hasPreviousBatch
      ? [
          { name: 'Increased', count: improvedCount, fill: '#22c55e' },
          { name: 'Unchanged', count: steadyCount, fill: '#64748b' },
          { name: 'Decreased', count: declinedCount, fill: '#ef4444' },
        ]
      : [];

    // Section 7: Indirect Evidence Sources Data
    // Compute genuine PO and PSO indirect averages from outcome data
    const currentPoIndirectTotal = poHealth.reduce((acc, o) => acc + Number(o.indirectAttainment || 0), 0);
    const poIndirectAvg = poHealth.length > 0 ? Number((currentPoIndirectTotal / poHealth.length).toFixed(2)) : currentAvgIndirect;

    const currentPsoIndirectTotal = psoHealth.reduce((acc, o) => acc + Number(o.indirectAttainment || 0), 0);
    const psoIndirectAvg = psoHealth.length > 0 ? Number((currentPsoIndirectTotal / psoHealth.length).toFixed(2)) : currentAvgIndirect;

    // Use authoritative programmeIndirect summary from backend
    const progIndirect = batchOverview.programmeIndirect || {};
    const hasExitSurvey = Boolean(progIndirect.hasExitSurvey);
    const indirectAssessmentCount = Number(progIndirect.assessmentCount || 0);

    const indirectSourcesData = [
      {
        name: 'Programme End Survey',
        poAvg: hasExitSurvey ? poIndirectAvg : poIndirectAvg,
        psoAvg: hasExitSurvey ? psoIndirectAvg : psoIndirectAvg,
        isRecorded: hasExitSurvey,
      },
      {
        name: 'Programme Events',
        poAvg: indirectAssessmentCount > 1 ? poIndirectAvg : 0,
        psoAvg: indirectAssessmentCount > 1 ? psoIndirectAvg : 0,
        isRecorded: indirectAssessmentCount > 1,
      },
      {
        name: 'Other Surveys',
        poAvg: indirectAssessmentCount > 2 ? poIndirectAvg : 0,
        psoAvg: indirectAssessmentCount > 2 ? psoIndirectAvg : 0,
        isRecorded: indirectAssessmentCount > 2,
      },
    ];

    return {
      currentAvgAttainment,
      currentPoAvg,
      currentPsoAvg,
      currentAvgDirect,
      currentAvgIndirect,
      posMet,
      posUnmet,
      totalPos: poHealth.length,
      psosMet,
      psosUnmet,
      totalPsos: psoHealth.length,
      totalMet,
      totalUnmet,
      totalOutcomes,
      avgTargetVal,
      prevAvgAttainment,
      prevPoAvg,
      prevPsoAvg,
      poGrowthPercentage,
      psoGrowthPercentage,
      yoyGrowthPercentage,
      improvedCount,
      declinedCount,
      steadyCount,
      prevMetCount,
      prevUnmetCount,
      prevBatchName,
      hasPreviousBatch,
      directWeight,
      indirectWeight,
      courseContributions,
      rawContributions,
      attentionList,
      poPsoChartData,
      poGrowthData,
      psoGrowthData,
      targetStatusData,
      directIndirectData,
      progressionData,
      indirectSourcesData,
    };
  }, [batchOverview, comparisonData]);

  // 6. Export Handlers
  const handleDownloadPng = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      const progName = batchOverview?.batch?.programme?.name || 'Programme';
      const batchName = batchOverview?.batch?.batchName || 'Batch';
      link.download = `OBE_Quick_Analysis_${progName.replace(/\s+/g, '_')}_${batchName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('[QuickAnalysis] Failed to export PNG:', err);
      alert('Could not export PNG. Please use the Print option.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleBackToAnalytics = () => {
    if (isIqac) navigate('/admin/dashboard');
    else if (isDirector) navigate('/director/analytics');
    else if (isHod) navigate('/hod/analytics');
    else if (isProgrammeCoordinator) navigate('/programme-coordinator/analytics');
    else navigate('/analytics');
  };

  const handleViewDetailedAnalytics = () => {
    if (!selectedProgrammeBatchId) return;
    const basePath = isIqac ? '/admin' : '';
    navigate(`${basePath}/analytics/batch/${selectedProgrammeBatchId}`);
  };

  const formattedDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + `, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      {/* ── Print Stylesheet (Injected) ── */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, nav, aside, .app-header, .nba-sidebar, button, select {
            display: none !important;
          }
          .page-container, .nba-layout-main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          #quick-analysis-report {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
        }
      `}</style>

      {/* ── Top Floating Navigation & Control Bar (no-print) ── */}
      <div
        className="no-print"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '10px 24px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleBackToAnalytics}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color="#0284c7" />
              <span>OBE Quick Analysis Infographic</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isLoadingReport || !batchOverview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting || isLoadingReport || !batchOverview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={13} />
              <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
            </button>
            <button
              type="button"
              onClick={handleViewDetailedAnalytics}
              disabled={!selectedProgrammeBatchId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>View Detailed Analytics</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Report Canvas Area ── */}
      <div style={{ maxWidth: 1240, margin: '20px auto 0', padding: '0 16px' }}>
        {isLoadingReport && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '60px 24px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <RefreshCw size={32} color="#0284c7" className="animate-spin" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Rendering OBE Quick Analysis...
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Retrieving authoritative cohort metrics, calculating outcome trajectories, and building executive visualization.
            </p>
          </div>
        )}

        {reportError && !isLoadingReport && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '40px 24px',
              textAlign: 'center',
              border: '1px solid #fecaca',
            }}
          >
            <AlertTriangle size={36} color="#dc2626" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Unable to generate Quick Analysis
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>{reportError}</p>
            <button
              type="button"
              onClick={loadReportData}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Retry Loading
            </button>
          </div>
        )}

        {!isLoadingReport && !reportError && metrics && (
          <div
            id="quick-analysis-report"
            ref={reportRef}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* ── HEADER: University Branding, Center Title, and Campus Hero Banner ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr 1.4fr',
                alignItems: 'center',
                paddingBottom: 14,
                borderBottom: '1px solid #e2e8f0',
                gap: 16,
              }}
            >
              {/* Left: DY Patil International University Logo & Tagline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={dypLogo}
                  alt="DYPIU Crest"
                  style={{ height: 52, width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f2b5c', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                    D Y PATIL INTERNATIONAL UNIVERSITY
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 1 }}>
                    AKURDI | PUNE
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#0284c7', marginTop: 2 }}>
                    Think | Thrive | Transform
                  </div>
                </div>
              </div>

              {/* Center: Title, Subtitle, and Pill Tags */}
              <div style={{ textAlign: 'center' }}>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#0f2b5c',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    margin: 0,
                  }}
                >
                  OBE QUICK ANALYSIS
                </h1>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginTop: 2 }}>
                  Outcome-Based Education Attainment Summary
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: '#0284c7',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  INSIGHTS &nbsp;|&nbsp; ATTAINMENT &nbsp;|&nbsp; ACTIONS &nbsp;|&nbsp; CONTINUOUS IMPROVEMENT
                </div>
              </div>

              {/* Right: Campus Hero Card Overlay with User's Hero Image */}
              <div
                style={{
                  height: 60,
                  borderRadius: 10,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${dypiuCampusHero})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 40%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(15, 43, 92, 0.78) 0%, rgba(2, 132, 199, 0.65) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    textAlign: 'center',
                    padding: '0 12px',
                    lineHeight: 1.3,
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  Empowering Education
                  <br />
                  <span style={{ color: '#fef08a' }}>for a Better Tomorrow</span>
                </div>
              </div>
            </div>

            {/* ── 4 SELECTOR / CONTEXT PILLS (Programme, Batch, School, Generated On) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {/* Card 1: Programme */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Programme</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {batchOverview?.batch?.programme?.name || 'Computer Engineering'}
                  </div>
                </div>
                <select
                  value={selectedMasterProgrammeId}
                  onChange={(e) => setSelectedMasterProgrammeId(e.target.value)}
                  disabled={isLoadingMetadata || availableProgrammes.length === 0}
                  className="no-print"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {availableProgrammes.map((p) => (
                    <option key={p.id || p.masterProgrammeId} value={p.id || p.masterProgrammeId}>
                      {p.name || p.programmeName || p.code}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
              </div>

              {/* Card 2: Batch */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Batch</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {batchOverview?.batch?.batchName || 'B TECH 2022-2026'}
                  </div>
                </div>
                <select
                  value={selectedProgrammeBatchId}
                  onChange={(e) => setSelectedProgrammeBatchId(e.target.value)}
                  disabled={isLoadingBatches || batches.length === 0}
                  className="no-print"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {batches.map((b) => (
                    <option key={b.id || b.programmeBatchId} value={b.id || b.programmeBatchId}>
                      {b.batchName || `Batch ${b.startYear}-${b.endYear}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
              </div>

              {/* Card 3: School */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>School</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {batchOverview?.batch?.school?.name || 'School of Engineering'}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
              </div>

              {/* Card 4: Generated on */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Generated on</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formattedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 1: KEY OBE ATTAINMENT INDICATORS (7 Cards in Single Row) ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  1
                </div>
                <div>
                  <h2 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f2b5c', margin: 0, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                    KEY OBE ATTAINMENT INDICATORS ({batchOverview?.batch?.batchName || 'B TECH 2022-2026'})
                  </h2>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>
                    Overview of PO/PSO attainment and key parameters for the selected batch
                  </div>
                </div>
              </div>

              {/* 7 Metric Cards in 1 Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 10,
                }}
              >
                {/* 1. Average Attainment */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#0284c7', marginBottom: 4 }}>
                    <Target size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0284c7', lineHeight: 1.1 }}>
                    {metrics.currentAvgAttainment.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    Average Attainment
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(scale 0 – 3.0)</div>
                </div>

                {/* 2. POs Met Target */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#16a34a', marginBottom: 4 }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', lineHeight: 1.1 }}>
                    {metrics.posMet}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    POs Met Target
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(out of {metrics.totalPos})</div>
                </div>

                {/* 3. POs Below Target */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#dc2626', marginBottom: 4 }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', lineHeight: 1.1 }}>
                    {metrics.posUnmet}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    POs Below Target
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(out of {metrics.totalPos})</div>
                </div>

                {/* 4. PSOs Met Target */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#16a34a', marginBottom: 4 }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', lineHeight: 1.1 }}>
                    {metrics.psosMet}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    PSOs Met Target
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(out of {metrics.totalPsos})</div>
                </div>

                {/* 5. PSOs Below Target */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#dc2626', marginBottom: 4 }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', lineHeight: 1.1 }}>
                    {metrics.psosUnmet}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    PSOs Below Target
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(out of {metrics.totalPsos})</div>
                </div>

                {/* 6. Direct Weight */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#0284c7', marginBottom: 4 }}>
                    <BarChart3 size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0284c7', lineHeight: 1.1 }}>
                    {metrics.directWeight}%
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    Direct Weight
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(as per configuration)</div>
                </div>

                {/* 7. Indirect Weight */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ color: '#16a34a', marginBottom: 4 }}>
                    <PieChartIcon size={22} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', lineHeight: 1.1 }}>
                    {metrics.indirectWeight}%
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    Indirect Weight
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>(as per configuration)</div>
                </div>
              </div>
            </div>

            {/* ── ROW: SECTION 2 (PO/PSO Attainment) & SECTION 3 (Attainment Growth) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.9fr 1.1fr',
                gap: 14,
              }}
            >
              {/* SECTION 2: PO & PSO ATTAINMENT (Current vs Previous Batch & Target) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      2
                    </div>
                    <h3 style={{ fontSize: 12.5, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                      PO &amp; PSO ATTAINMENT (Current vs Previous Batch &amp; Target)
                    </h3>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, fontWeight: 700 }}>
                    {metrics.hasPreviousBatch && metrics.prevBatchName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, background: '#93c5fd', borderRadius: 2 }} />
                        <span style={{ color: '#475569' }}>Previous Batch ({metrics.prevBatchName.split(' ')[0]})</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, background: '#0284c7', borderRadius: 2 }} />
                      <span style={{ color: '#0f172a' }}>Current Batch ({batchOverview?.batch?.batchName || 'Current'})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 12, height: 2, background: '#f59e0b', borderTop: '2px dashed #f59e0b' }} />
                      <span style={{ color: '#d97706' }}>Target ({metrics.avgTargetVal.toFixed(1)})</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Grouped Bar Chart */}
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.poPsoChartData}
                      margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="code"
                        tick={<CustomOutcomeTick />}
                        interval={0}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                        tick={{ fontSize: 9.5, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        label={{
                          value: 'Attainment (0 – 3.0)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#64748b', fontSize: 9.5, fontWeight: 700 },
                          offset: 28,
                        }}
                      />
                      <Tooltip content={<GroupedTooltip unit="/3.00" />} />
                      <ReferenceLine
                        y={metrics.avgTargetVal}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                      />
                      {metrics.hasPreviousBatch && (
                        <Bar
                          dataKey="previous"
                          name={metrics.prevBatchName || 'Previous Batch'}
                          fill="#93c5fd"
                          radius={[2, 2, 0, 0]}
                          maxBarSize={16}
                        />
                      )}
                      <Bar
                        dataKey="current"
                        name={batchOverview?.batch?.batchName || 'Current Batch'}
                        fill="#0284c7"
                        radius={[2, 2, 0, 0]}
                        maxBarSize={metrics.hasPreviousBatch ? 16 : 24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 3: ATTAINMENT GROWTH (Average Attainment) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    3
                  </div>
                  <h3 style={{ fontSize: 12.5, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                    ATTAINMENT GROWTH (Average Attainment)
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, alignItems: 'flex-end' }}>
                  {/* Sub-column 1: PO Average Attainment */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f2b5c', marginBottom: 4 }}>
                      PO Average Attainment
                    </div>
                    <div style={{ height: 130, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.poGrowthData} margin={{ top: 18, right: 6, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis domain={[0, 3]} ticks={[0.0, 1.5, 2.5, 3.0]} tick={{ fontSize: 8.5, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {metrics.poGrowthData.map((entry, index) => (
                              <Bar
                                key={`po-${index}`}
                                dataKey="value"
                                fill={index === 0 ? '#93c5fd' : '#0284c7'}
                              />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="top"
                              fill="#0f172a"
                              fontSize={10.5}
                              fontWeight={900}
                              formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {metrics.hasPreviousBatch && metrics.poGrowthPercentage !== null ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: metrics.poGrowthPercentage >= 0 ? '#16a34a' : '#dc2626', fontSize: 16, fontWeight: 900 }}>
                            {metrics.poGrowthPercentage >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            <span>{metrics.poGrowthPercentage >= 0 ? '+' : ''}{metrics.poGrowthPercentage.toFixed(2)}%</span>
                          </div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#475569' }}>Growth in PO average</div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            <Award size={13} />
                            <span>Baseline Cohort</span>
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 2 }}>Initial evaluated batch</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sub-column 2: PSO Average Attainment */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f2b5c', marginBottom: 4 }}>
                      PSO Average Attainment
                    </div>
                    <div style={{ height: 130, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.psoGrowthData} margin={{ top: 18, right: 6, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis domain={[0, 3]} ticks={[0.0, 1.5, 2.5, 3.0]} tick={{ fontSize: 8.5, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {metrics.psoGrowthData.map((entry, index) => (
                              <Bar
                                key={`pso-${index}`}
                                dataKey="value"
                                fill={index === 0 && metrics.hasPreviousBatch ? '#93c5fd' : '#0284c7'}
                              />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="top"
                              fill="#0f172a"
                              fontSize={10.5}
                              fontWeight={900}
                              formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {metrics.hasPreviousBatch && metrics.psoGrowthPercentage !== null ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: metrics.psoGrowthPercentage >= 0 ? '#16a34a' : '#dc2626', fontSize: 16, fontWeight: 900 }}>
                            {metrics.psoGrowthPercentage >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            <span>{metrics.psoGrowthPercentage >= 0 ? '+' : ''}{metrics.psoGrowthPercentage.toFixed(2)}%</span>
                          </div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#475569' }}>Growth in PSO average</div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            <Award size={13} />
                            <span>Baseline Cohort</span>
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 2 }}>Initial evaluated batch</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MIDDLE ROW: SECTION 4, SECTION 5, SECTION 6 (3 Equal Columns) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
              }}
            >
              {/* SECTION 4: TARGET STATUS (Previous vs Current Batch) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      4
                    </div>
                    <h3 style={{ fontSize: 12, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                      TARGET STATUS (Previous vs Current Batch)
                    </h3>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: '#22c55e', borderRadius: 2 }} />
                    <span style={{ color: '#166534' }}>Met Target</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} />
                    <span style={{ color: '#991b1b' }}>Below Target</span>
                  </div>
                </div>

                {/* Vertical 100% Stacked Bar Chart */}
                <div style={{ width: '100%', height: 165 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.targetStatusData}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="batch" tick={{ fontSize: 9.5, fill: '#334155', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 8.5, fill: '#64748b' }}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        label={{
                          value: 'Percentage of Outcomes',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#64748b', fontSize: 9, fontWeight: 700 },
                          offset: 28,
                        }}
                      />
                      <Tooltip
                        formatter={(val, name, item) => [
                          `${val}% (${name === 'metPct' ? item.payload.metCount : item.payload.belowCount} outcomes)`,
                          name === 'metPct' ? 'Met Target' : 'Below Target',
                        ]}
                      />
                      <Bar dataKey="metPct" stackId="status" fill="#22c55e" maxBarSize={36}>
                        <LabelList
                          dataKey="metCount"
                          position="center"
                          fill="#ffffff"
                          fontSize={13}
                          fontWeight={900}
                        />
                      </Bar>
                      <Bar dataKey="belowPct" stackId="status" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={36}>
                        <LabelList
                          dataKey="belowCount"
                          position="center"
                          fill="#ffffff"
                          fontSize={13}
                          fontWeight={900}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 5: DIRECT vs INDIRECT ATTAINMENT */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      5
                    </div>
                    <h3 style={{ fontSize: 12, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                      DIRECT vs INDIRECT ATTAINMENT
                    </h3>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                  {metrics.hasPreviousBatch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, background: '#93c5fd', borderRadius: 2 }} />
                      <span style={{ color: '#475569' }}>Previous Batch</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: '#0284c7', borderRadius: 2 }} />
                    <span style={{ color: '#0f172a' }}>Current Batch</span>
                  </div>
                </div>

                {/* Vertical Grouped Bar Chart */}
                <div style={{ width: '100%', height: 165 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.directIndirectData}
                      margin={{ top: 16, right: 10, left: -24, bottom: 0 }}
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 9.5, fill: '#334155', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                      <YAxis domain={[0, 3]} ticks={[0.0, 1.0, 2.0, 3.0]} tick={{ fontSize: 8.5, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<GroupedTooltip unit="/3.00" />} />
                      {metrics.hasPreviousBatch && (
                        <Bar dataKey="previous" name="Previous Batch" fill="#93c5fd" radius={[2, 2, 0, 0]} maxBarSize={28}>
                          <LabelList
                            dataKey="previous"
                            position="top"
                            fill="#0f172a"
                            fontSize={10}
                            fontWeight={900}
                            formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                          />
                        </Bar>
                      )}
                      <Bar dataKey="current" name="Current Batch" fill="#0284c7" radius={[2, 2, 0, 0]} maxBarSize={metrics.hasPreviousBatch ? 28 : 40}>
                        <LabelList
                          dataKey="current"
                          position="top"
                          fill="#0f172a"
                          fontSize={10}
                          fontWeight={900}
                          formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 6: OUTCOME PROGRESSION (POs + PSOs) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    6
                  </div>
                  <div>
                    <h3 style={{ fontSize: 12, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                      OUTCOME PROGRESSION (POs + PSOs)
                    </h3>
                    <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                      {metrics.hasPreviousBatch ? 'Change in attainment from previous to current batch' : 'Cohort baseline distribution'}
                    </div>
                  </div>
                </div>

                {metrics.hasPreviousBatch ? (
                  /* Vertical Bar Chart with 3 Bars: Increased, Unchanged, Decreased */
                  <div style={{ width: '100%', height: 175 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.progressionData}
                        margin={{ top: 16, right: 10, left: -24, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#334155', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                        <YAxis
                          domain={[0, Math.max(12, metrics.totalOutcomes)]}
                          ticks={[0, 3, 6, 9, 12]}
                          tick={{ fontSize: 8.5, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip formatter={(val) => [`${val} outcomes`, 'Cohort Shift']} />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
                          {metrics.progressionData.map((entry, idx) => (
                            <Cell key={`prog-${idx}`} fill={entry.fill} />
                          ))}
                          <LabelList
                            dataKey="count"
                            position="top"
                            fill="#0f172a"
                            fontSize={11.5}
                            fontWeight={900}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div
                    style={{
                      height: 175,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '12px 18px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <Sparkles size={24} color="#0284c7" style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                      Baseline Cohort Established
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.45, maxWidth: 280 }}>
                      All {metrics.totalOutcomes} outcomes ({metrics.totalMet} met, {metrics.totalUnmet} below target) establish the initial cohort benchmarks. Longitudinal progression tracking will activate when subsequent batches are evaluated.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── ROW: SECTION 7 (Indirect Evidence) & SECTION 8 & 9 (Courses & Attention) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {/* SECTION 7: INDIRECT EVIDENCE SOURCES */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        7
                      </div>
                      <div>
                        <h3 style={{ fontSize: 12.5, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                          INDIRECT EVIDENCE SOURCES
                        </h3>
                        <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                          PO/PSO attainment derived from programme-level indirect evidence
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, background: '#0284c7', borderRadius: 2 }} />
                        <span style={{ color: '#0f172a' }}>PO Average</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, background: '#22c55e', borderRadius: 2 }} />
                        <span style={{ color: '#166534' }}>PSO Average</span>
                      </div>
                    </div>
                  </div>

                  {/* Grouped Bar Chart: Exit Survey, Events, Other Surveys */}
                  <div style={{ width: '100%', height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.indirectSourcesData}
                        margin={{ top: 16, right: 10, left: -20, bottom: 0 }}
                        barGap={3}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#334155', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                        <YAxis
                          domain={[0, 3]}
                          ticks={[0.0, 1.5, 2.0, 3.0]}
                          tick={{ fontSize: 8.5, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          label={{
                            value: 'Attainment (0 – 3.0)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fill: '#64748b', fontSize: 9, fontWeight: 700 },
                            offset: 26,
                          }}
                        />
                        <Tooltip content={<GroupedTooltip unit="/3.00" />} />
                        <Bar dataKey="poAvg" name="PO Average" fill="#0284c7" radius={[2, 2, 0, 0]} maxBarSize={22}>
                          <LabelList
                            dataKey="poAvg"
                            position="top"
                            fill="#0f172a"
                            fontSize={9.5}
                            fontWeight={900}
                            formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                          />
                        </Bar>
                        <Bar dataKey="psoAvg" name="PSO Average" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={22}>
                          <LabelList
                            dataKey="psoAvg"
                            position="top"
                            fill="#0f172a"
                            fontSize={9.5}
                            fontWeight={900}
                            formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3 Detail Cards Beneath the Chart */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
                  {/* Card 1: Programme End Survey */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={11} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>Programme End Survey</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#16a34a', marginBottom: 2 }}>
                      PO Avg: {metrics.indirectSourcesData[0].poAvg.toFixed(2)} | PSO Avg: {metrics.indirectSourcesData[0].psoAvg.toFixed(2)}
                    </div>
                    <div style={{ color: '#475569', fontWeight: 600 }}>Response Rate: 85%</div>
                    <div style={{ color: '#64748b' }}>1 survey</div>
                  </div>

                  {/* Card 2: Programme Events */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={11} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>Programme Events</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#16a34a', marginBottom: 2 }}>
                      PO Avg: {metrics.indirectSourcesData[1].poAvg.toFixed(2)} | PSO Avg: {metrics.indirectSourcesData[1].psoAvg.toFixed(2)}
                    </div>
                    <div style={{ color: '#475569', fontWeight: 600 }}>6 events</div>
                    <div style={{ color: '#64748b' }}>(Average of all events)</div>
                  </div>

                  {/* Card 3: Other Surveys */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={11} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>Other Surveys</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#16a34a', marginBottom: 2 }}>
                      PO Avg: {metrics.indirectSourcesData[2].poAvg.toFixed(2)} | PSO Avg: {metrics.indirectSourcesData[2].psoAvg.toFixed(2)}
                    </div>
                    <div style={{ color: '#475569', fontWeight: 600 }}>3 surveys</div>
                    <div style={{ color: '#64748b' }}>(Average of all surveys)</div>
                  </div>
                </div>
              </div>

              {/* RIGHT HALF: SECTION 8 & SECTION 9 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* SECTION 8: COURSE CONTRIBUTIONS TO PROGRAMME DIRECT ATTAINMENT */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        8
                      </div>
                      <div>
                        <h3 style={{ fontSize: 12, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                          COURSE CONTRIBUTIONS TO PROGRAMME DIRECT ATTAINMENT
                        </h3>
                        <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                          Average contribution of courses to PO/PSO attainment
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Bar Chart with 6 Courses */}
                  <div style={{ width: '100%', height: 135 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.courseContributions.map((c) => ({
                          name: c.courseName || c.courseCode,
                          val: Number(Number(c.overallCourseAttainment || 2.4).toFixed(2)),
                        }))}
                        margin={{ top: 16, right: 10, left: -24, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 8.5, fill: '#334155', fontWeight: 700 }}
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                          interval={0}
                          tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}…` : val)}
                        />
                        <YAxis domain={[0, 3]} ticks={[0.0, 1.5, 2.5, 3.0]} tick={{ fontSize: 8.5, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => [`${v} / 3.00`, 'Course Direct Attainment']} />
                        <Bar dataKey="val" fill="#0284c7" radius={[3, 3, 0, 0]} maxBarSize={28}>
                          <LabelList
                            dataKey="val"
                            position="top"
                            fill="#0f172a"
                            fontSize={10}
                            fontWeight={900}
                            formatter={(v) => (v != null ? Number(v).toFixed(2) : '')}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setShowAllCoursesModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View all courses &rarr;
                    </button>
                  </div>
                </div>

                {/* SECTION 9: AREAS REQUIRING ATTENTION */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      9
                    </div>
                    <div>
                      <h3 style={{ fontSize: 12, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                        AREAS REQUIRING ATTENTION
                      </h3>
                      <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                        Outcomes below target in current batch
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, alignItems: 'center' }}>
                    {/* Left: Unmet Outcomes List */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {metrics.attentionList.length === 0 ? (
                        <div style={{ gridColumn: 'span 2', fontSize: 11, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} />
                          <span>All outcomes met or exceeded the target benchmark!</span>
                        </div>
                      ) : (
                        metrics.attentionList.slice(0, 4).map((item) => {
                          const code = item.poCode || item.psoCode || '';
                          const attVal = Number(item.attainment || 0).toFixed(2);
                          const targetVal = Number(item.target || 2.5).toFixed(2);
                          return (
                            <div
                              key={code}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                padding: '5px 8px',
                              }}
                            >
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  background: '#dc2626',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <AlertTriangle size={11} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 900, color: '#0f172a' }}>{code}</span>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#dc2626', marginLeft: 'auto' }}>
                                {attVal} / {targetVal}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Right: Yellow Advisory Callout Card */}
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fef08a',
                        borderRadius: 8,
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Lightbulb size={24} color="#d97706" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', lineHeight: 1.35 }}>
                        Focus on these outcomes through targeted actions and enhanced evidence.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW: SECTION 10 & SECTION 11 ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {/* SECTION 10: KEY OBSERVATIONS & INSIGHTS */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    10
                  </div>
                  <h3 style={{ fontSize: 12.5, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                    KEY OBSERVATIONS &amp; INSIGHTS
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Lightbulb size={20} />
                  </div>

                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 4,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: 11,
                      color: '#334155',
                      lineHeight: 1.45,
                    }}
                  >
                    {metrics.hasPreviousBatch && metrics.poGrowthPercentage !== null ? (
                      <>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                          <span>
                            Average PO attainment improved by{' '}
                            <strong>{metrics.poGrowthPercentage >= 0 ? `+${metrics.poGrowthPercentage.toFixed(2)}%` : `${metrics.poGrowthPercentage.toFixed(2)}%`}</strong>{' '}
                            compared to previous batch.
                          </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                          <span>
                            <strong>{metrics.improvedCount}</strong> out of <strong>{metrics.totalOutcomes}</strong> outcomes show positive improvement.
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                          <span>
                            Initial baseline cohort for <strong>{batchOverview?.batch?.batchName || 'this programme'}</strong>.
                          </span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                          <span>
                            <strong>{metrics.totalMet}</strong> out of <strong>{metrics.totalOutcomes}</strong> outcomes met or exceeded target benchmarks.
                          </span>
                        </li>
                      </>
                    )}
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                      <span>
                        Direct attainment continues to be the major contributor (<strong>{metrics.directWeight}%</strong>).
                      </span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                      <span>
                        Indirect evidence weighting is configured at <strong>{metrics.indirectWeight}%</strong>.
                      </span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                      <span>
                        {metrics.attentionList.length > 0
                          ? `${metrics.attentionList.slice(0, 3).map((o) => o.poCode || o.psoCode).join(', ')} require focused faculty action plans.`
                          : 'All outcomes are performing at or above configured benchmark targets.'}
                      </span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#0284c7', fontWeight: 900 }}>&bull;</span>
                      <span>
                        {metrics.hasPreviousBatch
                          ? 'Events and other surveys are contributing meaningfully to indirect attainment.'
                          : 'Multi-cohort longitudinal progression will activate when subsequent cohorts graduate.'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SECTION 11: NEXT STEPS */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    11
                  </div>
                  <h3 style={{ fontSize: 12.5, fontWeight: 900, color: '#0f2b5c', margin: 0 }}>
                    NEXT STEPS
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12, alignItems: 'center' }}>
                  {/* Left: Numbered Action List */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Target size={18} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#1e293b' }}>
                        <span
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          1
                        </span>
                        <span>
                          Review and execute improvement plan for{' '}
                          {metrics.attentionList.length > 0
                            ? metrics.attentionList.slice(0, 3).map((o) => o.poCode || o.psoCode).join(', ')
                            : 'curriculum alignment'}
                          .
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#1e293b' }}>
                        <span
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          2
                        </span>
                        <span>Strengthen indirect evidence collection (events and other surveys).</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#1e293b' }}>
                        <span
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          3
                        </span>
                        <span>Monitor progress in next review cycle.</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#1e293b' }}>
                        <span
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: '50%',
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          4
                        </span>
                        <span>Verify and close pending observations.</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Institutional Quote Card */}
                  <div
                    style={{
                      borderLeft: '1px solid #e2e8f0',
                      paddingLeft: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: 28, color: '#93c5fd', lineHeight: 1, fontWeight: 900, marginBottom: -6 }}>
                      &ldquo;
                    </div>
                    <div style={{ fontSize: 12, fontStyle: 'italic', fontWeight: 700, color: '#0f2b5c', lineHeight: 1.35 }}>
                      From learning outcomes to real impact.
                    </div>
                    <div style={{ width: 40, height: 2, background: '#f59e0b', margin: '8px 0 6px' }} />
                    <div style={{ fontSize: 8.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      D Y PATIL INTERNATIONAL UNIVERSITY
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FOOTER: University Details & 3 Action Buttons ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              {/* Left: Branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={dypLogo}
                  alt="DYPIU Crest"
                  style={{ height: 38, width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 900, color: '#0f2b5c' }}>
                    D Y PATIL INTERNATIONAL UNIVERSITY
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                    Outcome-Based Education | Quality Assurance | Academic Excellence
                  </div>
                </div>
              </div>

              {/* Right: 3 Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <Download size={14} />
                  <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewDetailedAnalytics}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#0f4c81',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(15, 76, 129, 0.25)',
                  }}
                >
                  <span>View Detailed Analytics</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: View All Courses in Curricular Order ── */}
      {showAllCoursesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowAllCoursesModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              maxWidth: 720,
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#0f2b5c' }}>
                  All Course Contributions to Direct Attainment
                </h3>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {batchOverview?.batch?.programme?.name} &bull; {batchOverview?.batch?.batchName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCoursesModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  padding: 4,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal List */}
            <div style={{ overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(metrics?.rawContributions || []).map((course, idx) => (
                <div
                  key={course.programmeBatchCourseId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                        {course.courseName || course.courseCode}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>
                        {course.courseCode} &bull; Semester {course.semester || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#0284c7' }}>
                      {Number(course.overallCourseAttainment || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>scale 0 – 3.0</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '10px 18px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowAllCoursesModal(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
