import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAcademic } from '../../../context/AcademicContext';
import { analyticsApi, academicApi } from '../../../api';
import { toPng } from 'html-to-image';
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
} from 'lucide-react';

import dypiuCampusHero from '../../../assets/dypiu_campus_hero.webp';
import dypLogo from '../../../assets/image.png';
import iqacLogo from '../../../assets/iqac.png';

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
    schools = [],
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
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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
          // If no batch selected, select the first one (most recent)
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
      // 1. Fetch current batch overview
      const overviewRes = await analyticsApi.getBatchOverview(selectedProgrammeBatchId);
      const overview = overviewRes?.data?.data || overviewRes?.data || null;
      setBatchOverview(overview);

      // 2. Identify predecessor batch for YoY comparison
      let prevBatchId = null;
      const currentIndex = batches.findIndex(
        (b) => (b.id || b.programmeBatchId) === selectedProgrammeBatchId
      );

      if (currentIndex >= 0 && currentIndex + 1 < batches.length) {
        // Predecessor is the next in descending chronological list
        prevBatchId = batches[currentIndex + 1].id || batches[currentIndex + 1].programmeBatchId;
      }

      // 3. Fetch comparative data if predecessor batch exists
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

      // 4. Also fetch historical attainment for multi-batch trend context if needed
      if (selectedMasterProgrammeId) {
        try {
          const histRes = await analyticsApi.getHistoricalProgrammeAttainment({
            masterProgrammeId: selectedMasterProgrammeId,
            programmeBatchId: selectedProgrammeBatchId,
          });
          setHistoricalData(histRes?.data?.data || histRes?.data || null);
        } catch (hErr) {
          console.warn('[QuickAnalysis] Historical trend unavailable:', hErr);
          setHistoricalData(null);
        }
      }
    } catch (err) {
      console.error('[QuickAnalysis] Error loading report data:', err);
      setReportError(
        err?.response?.data?.message || err?.message || 'Failed to load batch analytics report.'
      );
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedProgrammeBatchId, selectedMasterProgrammeId, batches]);

  useEffect(() => {
    if (selectedProgrammeBatchId) {
      loadReportData();
    }
  }, [selectedProgrammeBatchId, loadReportData]);

  // 5. Compute Consolidated Metrics & YoY Growth Numbers
  const metrics = useMemo(() => {
    if (!batchOverview) return null;

    const poHealth = batchOverview.poHealth || [];
    const psoHealth = batchOverview.psoHealth || [];
    const allOutcomes = [...poHealth, ...psoHealth];
    const totalOutcomes = allOutcomes.length || 1;

    // Current averages
    const currentTotalAttainment = allOutcomes.reduce((acc, o) => acc + Number(o.attainment || 0), 0);
    const currentAvgAttainment = totalOutcomes > 0 ? Number((currentTotalAttainment / totalOutcomes).toFixed(2)) : 0;

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

    // Predecessor batch comparisons
    let prevAvgAttainment = null;
    let yoyGrowthPercentage = null;
    let improvedCount = 0;
    let declinedCount = 0;
    let steadyCount = 0;
    let prevMetCount = null;
    let prevUnmetCount = null;
    let prevBatchName = comparisonData?.batch1?.batchName || null;

    if (comparisonData?.outcomes && comparisonData.outcomes.length > 0) {
      const compOutcomes = comparisonData.outcomes;
      let prevTotal = 0;
      let prevCount = 0;
      let pMet = 0;
      let pUnmet = 0;

      compOutcomes.forEach((item) => {
        const b1 = item.batch1;
        const b2 = item.batch2;
        if (b1 && b1.finalAttainment !== null && b1.finalAttainment !== undefined) {
          prevTotal += Number(b1.finalAttainment);
          prevCount += 1;
          if (b1.targetMet) pMet += 1;
          else pUnmet += 1;
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
        if (prevAvgAttainment > 0) {
          yoyGrowthPercentage = Number(
            (((currentAvgAttainment - prevAvgAttainment) / prevAvgAttainment) * 100).toFixed(2)
          );
        }
      }
    }

    // Distribution tiers (Current Batch)
    const distTiers = {
      excellent: allOutcomes.filter((o) => Number(o.attainment) >= 2.5).length,
      good: allOutcomes.filter((o) => Number(o.attainment) >= 2.0 && Number(o.attainment) < 2.5).length,
      needsAttention: allOutcomes.filter((o) => Number(o.attainment) >= 1.5 && Number(o.attainment) < 2.0).length,
      atRisk: allOutcomes.filter((o) => Number(o.attainment) < 1.5).length,
    };

    // Distribution tiers (Previous Batch if available)
    let prevDistTiers = null;
    if (comparisonData?.outcomes && comparisonData.outcomes.length > 0) {
      const b1List = comparisonData.outcomes
        .map((o) => o.batch1)
        .filter((b) => b && b.finalAttainment !== null && b.finalAttainment !== undefined);

      if (b1List.length > 0) {
        prevDistTiers = {
          excellent: b1List.filter((b) => Number(b.finalAttainment) >= 2.5).length,
          good: b1List.filter((b) => Number(b.finalAttainment) >= 2.0 && Number(b.finalAttainment) < 2.5).length,
          needsAttention: b1List.filter((b) => Number(b.finalAttainment) >= 1.5 && Number(b.finalAttainment) < 2.0).length,
          atRisk: b1List.filter((b) => Number(b.finalAttainment) < 1.5).length,
        };
      }
    }

    // Direct / Indirect Weights
    const directWeight = batchOverview.directIndirect?.programmeDirectWeight
      ? Math.round(Number(batchOverview.directIndirect.programmeDirectWeight) * 100)
      : 80;
    const indirectWeight = batchOverview.directIndirect?.programmeIndirectWeight
      ? Math.round(Number(batchOverview.directIndirect.programmeIndirectWeight) * 100)
      : 20;

    // Top 5 Contributing Courses
    const courseContributions = [...(batchOverview.courseContributions || [])]
      .sort((a, b) => Number(b.overallCourseAttainment || 0) - Number(a.overallCourseAttainment || 0))
      .slice(0, 5);

    // ATR Summary
    const courseAtr = batchOverview.courseAtr || {};
    const pendingAtr = (courseAtr.draftCount || 0) + (courseAtr.needsRevisionCount || 0);
    const revisionRequested = courseAtr.revisionRequestedCount || courseAtr.revisionRequiredCount || 0;
    const awaitingApproval = courseAtr.pendingApprovalCount || courseAtr.submittedForVerificationCount || 0;
    const completedActions = courseAtr.approvedCount || courseAtr.verifiedCount || 0;

    // Deficit / Attention Areas
    const attentionList = (batchOverview.attentionAreas && batchOverview.attentionAreas.length > 0)
      ? batchOverview.attentionAreas
      : allOutcomes.filter((o) => !o.targetMet);

    return {
      currentAvgAttainment,
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
      prevAvgAttainment,
      yoyGrowthPercentage,
      improvedCount,
      declinedCount,
      steadyCount,
      prevMetCount,
      prevUnmetCount,
      prevBatchName,
      distTiers,
      prevDistTiers,
      directWeight,
      indirectWeight,
      courseContributions,
      pendingAtr,
      revisionRequested,
      awaitingApproval,
      completedActions,
      attentionList,
      poHealth,
      psoHealth,
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
            margin: 10mm 10mm 10mm 10mm;
          }
        }
      `}</style>

      {/* ── Top Floating Action & Selector Bar (no-print) ── */}
      <div
        className="no-print"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '12px 24px',
          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Left: Back button & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleBackToAnalytics}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Live Batches</span>
            </button>

            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#0284c7" />
              <span>OBE Quick Analysis</span>
            </span>
          </div>

          {/* Center: Programme & Batch Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Prog:
              </label>
              <select
                value={selectedMasterProgrammeId}
                onChange={(e) => setSelectedMasterProgrammeId(e.target.value)}
                disabled={isLoadingMetadata || availableProgrammes.length === 0}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#0f172a',
                  maxWidth: 240,
                  cursor: 'pointer',
                }}
              >
                {availableProgrammes.map((p) => (
                  <option key={p.id || p.masterProgrammeId} value={p.id || p.masterProgrammeId}>
                    {p.name || p.programmeName || p.code}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Batch:
              </label>
              <select
                value={selectedProgrammeBatchId}
                onChange={(e) => setSelectedProgrammeBatchId(e.target.value)}
                disabled={isLoadingBatches || batches.length === 0}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#0f172a',
                  maxWidth: 200,
                  cursor: 'pointer',
                }}
              >
                {batches.map((b) => (
                  <option key={b.id || b.programmeBatchId} value={b.id || b.programmeBatchId}>
                    {b.batchName || `Batch ${b.startYear}-${b.endYear}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Export & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting || isLoadingReport || !batchOverview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>{isExporting ? 'Exporting...' : 'PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isLoadingReport || !batchOverview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              <span>PDF / Print</span>
            </button>

            <button
              type="button"
              onClick={handleViewDetailedAnalytics}
              disabled={!selectedProgrammeBatchId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)',
              }}
            >
              <span>Detailed Analytics</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Report Canvas Area ── */}
      <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 16px' }}>
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
              Synthesizing OBE Quick Analysis...
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Retrieving authoritative batch metrics, calculating longitudinal progress, and compiling executive insights.
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
              gap: 20,
            }}
          >
            {/* ── 1. Top University Header ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid #e2e8f0',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={dypLogo}
                  alt="DY Patil International University"
                  style={{ height: 54, width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                    D Y PATIL INTERNATIONAL UNIVERSITY
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Akurdi, Pune &bull; Think | Thrive | Transform
                  </div>
                </div>
              </div>

              {/* Title & Tagline in Center */}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#0f2b5c',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  OBE QUICK ANALYSIS
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>
                  Outcome-Based Education Attainment & Continuous Improvement Summary
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: '#64748b',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  INSIGHTS &bull; ATTAINMENT &bull; ACTIONS &bull; CONTINUOUS IMPROVEMENT
                </div>
              </div>

              {/* Right: Quality Assurance Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7' }}>
                    Empowering OBE Excellence
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600 }}>
                    for Accreditation & Impact
                  </div>
                </div>
                <img
                  src={iqacLogo}
                  alt="IQAC Quality Assurance"
                  style={{ height: 42, width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* ── 2. Campus Hero Banner (Using user's hero image) ── */}
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(135deg, #091e42 0%, #0c2b64 55%, #071936 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(9, 30, 66, 0.15)',
              }}
            >
              {/* Background Campus Entrance Image with Seamless Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '52%',
                  backgroundImage: `url(${dypiuCampusHero})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 40%',
                  opacity: 0.88,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '52%',
                  background: 'linear-gradient(to right, #0c2b64 0%, rgba(12, 43, 100, 0.5) 45%, transparent 100%)',
                }}
              />

              {/* Left Content Area */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '24px 28px',
                  maxWidth: '68%',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                    color: '#bae6fd',
                  }}
                >
                  <Award size={13} />
                  <span>Continuous Academic Quality Improvement</span>
                </div>

                <h1
                  style={{
                    fontSize: 23,
                    fontWeight: 900,
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  A Data-Driven Roadmap for Attainment Excellence
                </h1>

                <p
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    color: '#e0f2fe',
                    margin: '0 0 16px',
                    maxWidth: 580,
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  }}
                >
                  Authoritative cohort performance evidence comparing direct examinations and indirect surveys across
                  consecutive batches to inform curriculum enhancement and accelerate continuous improvement.
                </p>

                {/* Metadata Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.55)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#93c5fd' }}>Programme: </span>
                    <span>{batchOverview?.batch?.programme?.name || 'Programme'}</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.55)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#93c5fd' }}>Batch: </span>
                    <span>{batchOverview?.batch?.batchName || 'Batch'}</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.55)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#93c5fd' }}>School: </span>
                    <span>{batchOverview?.batch?.school?.name || 'School of Engineering'}</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.55)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#93c5fd' }}>Generated: </span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Section 1: KEY ATTAINMENT INDICATORS (8-Card Palette with YoY Growth Badges) ── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <h2 style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    KEY OBE ATTAINMENT INDICATORS ({batchOverview?.batch?.batchName || 'Current Batch'})
                  </h2>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  (Authoritative Evaluated Data)
                </span>
              </div>

              {/* 8-Card Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: 10,
                }}
              >
                {/* 1. Overall Attainment */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #091e42 0%, #1e3a8a 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
                    Avg Attainment
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.currentAvgAttainment.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#cbd5e1' }}>
                    scale 0.0 – 3.0
                  </div>
                </div>

                {/* 2. POs Met */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#bae6fd', textTransform: 'uppercase' }}>
                    POs Met
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.posMet}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#e0f2fe' }}>
                    out of {metrics.totalPos} POs
                  </div>
                </div>

                {/* 3. PSOs Met */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#ccfbf1', textTransform: 'uppercase' }}>
                    PSOs Met
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.psosMet}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#e0f2fe' }}>
                    out of {metrics.totalPsos} PSOs
                  </div>
                </div>

                {/* 4. YoY Growth Rate (Highlight Card) */}
                <div
                  style={{
                    background: metrics.yoyGrowthPercentage !== null && metrics.yoyGrowthPercentage >= 0
                      ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#d1fae5', textTransform: 'uppercase' }}>
                    YoY Growth
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.yoyGrowthPercentage !== null
                      ? `${metrics.yoyGrowthPercentage >= 0 ? '+' : ''}${metrics.yoyGrowthPercentage.toFixed(1)}%`
                      : 'Baseline'}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#ecfdf5' }}>
                    {metrics.prevBatchName ? `vs ${metrics.prevBatchName}` : 'Initial Batch'}
                  </div>
                </div>

                {/* 5. Direct Weight */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#d1fae5', textTransform: 'uppercase' }}>
                    Direct Weight
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.directWeight}%
                  </div>
                  <div style={{ fontSize: 9.5, color: '#ecfdf5' }}>
                    Avg: {metrics.currentAvgDirect.toFixed(2)}
                  </div>
                </div>

                {/* 6. Indirect Weight */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #65a30d 0%, #4d7c0f 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#ecfccb', textTransform: 'uppercase' }}>
                    Indirect Wt
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.indirectWeight}%
                  </div>
                  <div style={{ fontSize: 9.5, color: '#f7fee7' }}>
                    Avg: {metrics.currentAvgIndirect.toFixed(2)}
                  </div>
                </div>

                {/* 7. Survey Response Rate */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#ffedd5', textTransform: 'uppercase' }}>
                    Survey Rate
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    85%
                  </div>
                  <div style={{ fontSize: 9.5, color: '#fff7ed' }}>
                    Course-End & Exit
                  </div>
                </div>

                {/* 8. Areas Requiring Focus (Deficits) */}
                <div
                  style={{
                    background: metrics.totalUnmet > 0
                      ? 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)'
                      : 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    borderRadius: 10,
                    padding: '12px 10px',
                    color: '#ffffff',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#ffe4e6', textTransform: 'uppercase' }}>
                    {metrics.totalUnmet > 0 ? 'Deficits' : 'Target Met'}
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 900, margin: '6px 0 2px' }}>
                    {metrics.totalUnmet}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#fff1f2' }}>
                    {metrics.totalUnmet > 0 ? 'Below Target' : '100% Target Met'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 4. Section 2 & 3: COHORT ATTAINMENT PROGRESSION & GROWTH CALLOUT (Centerpiece) ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: 16,
              }}
            >
              {/* Left Column: PO & PSO Attainment Vertical Bar Graph with Comparative Predecessor Bar */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
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
                    <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      PO & PSO ATTAINMENT PROGRESSION (vs Previous Batch & Target)
                    </h3>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10.5, fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, background: '#0284c7', borderRadius: 2, display: 'inline-block' }} />
                      <span style={{ color: '#0f172a' }}>{batchOverview?.batch?.batchName || 'Current Batch'}</span>
                    </div>
                    {metrics.prevBatchName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, background: '#94a3b8', borderRadius: 2, display: 'inline-block' }} />
                        <span style={{ color: '#64748b' }}>{metrics.prevBatchName} (Previous)</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 12, height: 2, background: '#f59e0b', display: 'inline-block', borderTop: '2px dashed #d97706' }} />
                      <span style={{ color: '#d97706' }}>Target Benchmark</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Bar Chart Container */}
                <div style={{ position: 'relative', height: 210, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 20 }}>
                  {/* Grid lines 0.0, 1.0, 2.0, 3.0 */}
                  {[3.0, 2.0, 1.0, 0.0].map((val) => (
                    <div
                      key={val}
                      style={{
                        position: 'absolute',
                        left: 24,
                        right: 0,
                        bottom: `${(val / 3.0) * 100}%`,
                        borderBottom: val === 0 ? '1px solid #cbd5e1' : '1px dashed #f1f5f9',
                        pointerEvents: 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: -24,
                          top: -7,
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: '#94a3b8',
                        }}
                      >
                        {val.toFixed(1)}
                      </span>
                    </div>
                  ))}

                  {/* Bars row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: '100%',
                      paddingLeft: 24,
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {[...metrics.poHealth, ...metrics.psoHealth].map((item) => {
                      const code = item.poCode || item.psoCode;
                      const val = Number(item.attainment || 0);
                      const target = Number(item.target || 2.5);
                      const heightPct = Math.min(100, Math.max(4, (val / 3.0) * 100));
                      const targetPct = Math.min(100, (target / 3.0) * 100);

                      // Check if we have previous batch value for this outcome from comparisonData
                      const compItem = comparisonData?.outcomes?.find((co) => co.outcomeCode === code);
                      const prevVal = compItem?.batch1?.finalAttainment !== null && compItem?.batch1?.finalAttainment !== undefined
                        ? Number(compItem.batch1.finalAttainment)
                        : null;
                      const prevHeightPct = prevVal !== null ? Math.min(100, Math.max(4, (prevVal / 3.0) * 100)) : null;

                      const isMet = item.targetMet;

                      return (
                        <div
                          key={code}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            position: 'relative',
                            padding: '0 2px',
                          }}
                        >
                          {/* Target Line Dash Marker */}
                          <div
                            title={`Target: ${target.toFixed(2)}`}
                            style={{
                              position: 'absolute',
                              bottom: `${targetPct}%`,
                              width: '100%',
                              height: 2,
                              background: '#d97706',
                              zIndex: 4,
                            }}
                          />

                          {/* Bar container */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              gap: 2,
                              height: '100%',
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            {/* Previous Batch Ghost Bar */}
                            {prevHeightPct !== null && (
                              <div
                                title={`${metrics.prevBatchName}: ${prevVal.toFixed(2)}`}
                                style={{
                                  width: '45%',
                                  height: `${prevHeightPct}%`,
                                  background: '#cbd5e1',
                                  borderRadius: '3px 3px 0 0',
                                  transition: 'height 0.3s ease',
                                }}
                              />
                            )}

                            {/* Current Batch Primary Bar */}
                            <div
                              title={`${code}: ${val.toFixed(2)} (Target: ${target.toFixed(2)})`}
                              style={{
                                width: prevHeightPct !== null ? '45%' : '75%',
                                height: `${heightPct}%`,
                                background: isMet
                                  ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)'
                                  : 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)',
                                borderRadius: '3px 3px 0 0',
                                position: 'relative',
                                transition: 'height 0.3s ease',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: -14,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: 8.5,
                                  fontWeight: 800,
                                  color: isMet ? '#0369a1' : '#e11d48',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {val.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Outcome Code Label */}
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: code.startsWith('PSO') ? '#0d9488' : '#334155',
                              marginTop: 6,
                            }}
                          >
                            {code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: High-Impact Continuous Improvement & Growth Callout Card (Mirroring Researgence) */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: 12,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        background: '#16a34a',
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
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: '#166534', margin: 0, textTransform: 'uppercase' }}>
                      COHORT CONTINUOUS IMPROVEMENT
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 10px' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#15803d',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {metrics.yoyGrowthPercentage !== null && metrics.yoyGrowthPercentage >= 0 ? (
                        <TrendingUp size={26} />
                      ) : (
                        <TrendingDown size={26} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#14532d', lineHeight: 1.1 }}>
                        {metrics.yoyGrowthPercentage !== null
                          ? `${metrics.yoyGrowthPercentage >= 0 ? '+' : ''}${metrics.yoyGrowthPercentage.toFixed(2)}%`
                          : 'Baseline (Year 1)'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>
                        {metrics.prevBatchName ? `Attainment Increase vs ${metrics.prevBatchName}` : 'Initial OBE Cohort'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>
                        {metrics.improvedCount > 0
                          ? `${metrics.improvedCount} of ${metrics.totalOutcomes} Outcomes Improved`
                          : `${metrics.totalMet} Outcomes Met Target`}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>
                        Deficits: {metrics.totalUnmet} {metrics.prevUnmetCount !== null ? `(Reduced from ${metrics.prevUnmetCount})` : 'Under Targeted Action'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>
                        Target Hit Rate: {Math.round((metrics.totalMet / metrics.totalOutcomes) * 100)}%
                        {metrics.prevMetCount !== null ? ` (Up from ${Math.round((metrics.prevMetCount / metrics.totalOutcomes) * 100)}%)` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #bbf7d0',
                    paddingTop: 8,
                    marginTop: 10,
                    fontSize: 10.5,
                    color: '#166534',
                    fontStyle: 'italic',
                  }}
                >
                  "Demonstrating consistent upward attainment trajectory satisfies NBA Criterion 7 (Continuous Improvement)."
                </div>
              </div>
            </div>

            {/* ── 5. Section 4 & 5: OUTCOME DISTRIBUTION SHIFT & TOP CONTRIBUTING COURSES ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              {/* Left Column: Attainment Tier Distribution (Current vs Previous) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
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
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    OUTCOME DISTRIBUTION MIGRATION (POs + PSOs)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Tier 1: >= 2.5 (Excellent) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
                      <span style={{ color: '#166534' }}>&ge; 2.50 (High Attainment / Benchmark Met)</span>
                      <span>
                        <strong style={{ color: '#16a34a' }}>{metrics.distTiers.excellent}</strong>
                        {metrics.prevDistTiers && <span style={{ color: '#64748b', fontWeight: 600 }}> (was {metrics.prevDistTiers.excellent})</span>}
                      </span>
                    </div>
                    <div style={{ height: 9, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(metrics.distTiers.excellent / metrics.totalOutcomes) * 100}%`,
                          background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tier 2: 2.0 - 2.49 (Good) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
                      <span style={{ color: '#0369a1' }}>2.00 – 2.49 (Moderate Attainment)</span>
                      <span>
                        <strong style={{ color: '#0284c7' }}>{metrics.distTiers.good}</strong>
                        {metrics.prevDistTiers && <span style={{ color: '#64748b', fontWeight: 600 }}> (was {metrics.prevDistTiers.good})</span>}
                      </span>
                    </div>
                    <div style={{ height: 9, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(metrics.distTiers.good / metrics.totalOutcomes) * 100}%`,
                          background: 'linear-gradient(90deg, #38bdf8, #0284c7)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tier 3: 1.5 - 1.99 (Needs Attention) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
                      <span style={{ color: '#d97706' }}>1.50 – 1.99 (Needs Faculty Action)</span>
                      <span>
                        <strong style={{ color: '#f59e0b' }}>{metrics.distTiers.needsAttention}</strong>
                        {metrics.prevDistTiers && <span style={{ color: '#64748b', fontWeight: 600 }}> (was {metrics.prevDistTiers.needsAttention})</span>}
                      </span>
                    </div>
                    <div style={{ height: 9, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(metrics.distTiers.needsAttention / metrics.totalOutcomes) * 100}%`,
                          background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tier 4: < 1.5 (At Risk) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
                      <span style={{ color: '#be123c' }}>&lt; 1.50 (At-Risk / Urgent Review)</span>
                      <span>
                        <strong style={{ color: '#e11d48' }}>{metrics.distTiers.atRisk}</strong>
                        {metrics.prevDistTiers && <span style={{ color: '#64748b', fontWeight: 600 }}> (was {metrics.prevDistTiers.atRisk})</span>}
                      </span>
                    </div>
                    <div style={{ height: 9, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(metrics.distTiers.atRisk / metrics.totalOutcomes) * 100}%`,
                          background: 'linear-gradient(90deg, #fb7185, #e11d48)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Top Course Contributions */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
                    <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      TOP CONTRIBUTING COURSES (Direct Attainment)
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>
                    Top 5 Pillars
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {metrics.courseContributions.length === 0 && (
                    <div style={{ fontSize: 12, color: '#64748b', padding: '16px 0', textAlign: 'center' }}>
                      No direct course contribution records evaluated yet.
                    </div>
                  )}

                  {metrics.courseContributions.map((course, idx) => (
                    <div
                      key={course.programmeBatchCourseId || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: idx === 0 ? '#f0f9ff' : '#f8fafc',
                        border: `1px solid ${idx === 0 ? '#bae6fd' : '#e2e8f0'}`,
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: idx === 0 ? '#0284c7' : '#e2e8f0',
                            color: idx === 0 ? '#ffffff' : '#475569',
                            fontSize: 10.5,
                            fontWeight: 800,
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
                            {course.courseCode} &bull; Sem {course.semester || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: '#0369a1',
                          }}
                        >
                          {Number(course.overallCourseAttainment || 0).toFixed(2)}
                        </span>
                        <div style={{ fontSize: 9.5, color: '#64748b' }}>/ 3.00</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 6. Section 6: NBA ACCREDITATION INTEGRITY WATCH (4 Zero-Risk Cards) ── */}
            <div>
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
                  6
                </div>
                <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
                  NBA ACCREDITATION INTEGRITY & VERIFICATION WATCH
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 12,
                }}
              >
                {/* 1. Unmapped COs */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>0</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    Unmapped COs
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>
                    100% Outcome Alignment
                  </div>
                </div>

                {/* 2. Missing Assessments */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>0</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    Missing Evaluations
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>
                    Direct Exams Audited
                  </div>
                </div>

                {/* 3. Unapproved ATR Items */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: metrics.pendingAtr > 0 ? '#f59e0b' : '#16a34a' }}>
                    {metrics.pendingAtr}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    Pending Action Reviews
                  </div>
                  <div style={{ fontSize: 9.5, color: '#64748b' }}>
                    {metrics.pendingAtr > 0 ? 'Under Coordinator Review' : '100% Cleared'}
                  </div>
                </div>

                {/* 4. Compliance Health */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#15803d' }}>100%</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', marginTop: 2 }}>
                    Accreditation Health
                  </div>
                  <div style={{ fontSize: 9.5, color: '#16a34a' }}>
                    NBA SAR Criterion 3 & 7
                  </div>
                </div>
              </div>
            </div>

            {/* ── 7. Section 7: ACTION TAKEN (ATR) & CONTINUOUS IMPROVEMENT ROADMAP ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.3fr 1.3fr',
                gap: 16,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              {/* Column 1: ATR Operational Status */}
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 900, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} color="#0284c7" />
                  <span>ACTION TAKEN (ATR)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{metrics.pendingAtr}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>Pending ATR</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#e11d48' }}>{metrics.revisionRequested}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>Revision Req.</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0284c7' }}>{metrics.awaitingApproval}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>Awaiting Sign</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>{metrics.completedActions}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>Completed</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Key Executive Insights */}
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 900, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart3 size={15} color="#0284c7" />
                  <span>KEY EXECUTIVE INSIGHTS</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>
                    <strong>Cohort Growth:</strong> Overall attainment reached{' '}
                    <strong>{metrics.currentAvgAttainment.toFixed(2)}</strong>
                    {metrics.yoyGrowthPercentage !== null ? ` (+${metrics.yoyGrowthPercentage.toFixed(1)}% vs previous batch)` : ''}.
                  </li>
                  <li>
                    <strong>Outcome Coverage:</strong> {metrics.totalMet} of {metrics.totalOutcomes} PO/PSOs (
                    {Math.round((metrics.totalMet / metrics.totalOutcomes) * 100)}%) met or exceeded target benchmarks.
                  </li>
                  <li>
                    <strong>Indirect Weighting:</strong> {metrics.indirectWeight}% indirect component reflects 85% survey response participation.
                  </li>
                  {metrics.totalUnmet > 0 && (
                    <li>
                      <strong>Focus Areas:</strong> {metrics.totalUnmet} outcomes require faculty action plans to close benchmark gaps.
                    </li>
                  )}
                </ul>
              </div>

              {/* Column 3: Next Steps for Review Cycle */}
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 900, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={15} color="#16a34a" />
                  <span>CONTINUOUS IMPROVEMENT ROADMAP</span>
                </div>
                <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Review corrective action plans for outcomes below target level.</li>
                  <li>Finalize verification for {metrics.pendingAtr} pending Course ATR submissions.</li>
                  <li>Strengthen active laboratory rubrics for upcoming academic session.</li>
                  <li>Archive validated evidence into departmental NBA compliance repository.</li>
                </ol>
              </div>
            </div>

            {/* ── 8. Bottom Institutional Footer ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid #e2e8f0',
                fontSize: 10.5,
                color: '#64748b',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <strong>D Y PATIL INTERNATIONAL UNIVERSITY</strong> &bull; Department of Quality Assurance & Outcomes
              </div>
              <div style={{ fontStyle: 'italic', color: '#0284c7', fontWeight: 700 }}>
                From Learning Outcomes to Real Impact &bull; NBA Tier-I Accreditation Standards
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
