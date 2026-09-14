import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useUser } from '../../context/user';
import { analyticsApi } from '../../api';
import AnalyticsHeader from './components/AnalyticsHeader';
import AnalyticsFilterBar from './components/AnalyticsFilterBar';
import ActiveScopeBanner from './components/ActiveScopeBanner';
import KpiSummarySection from './components/KpiSummarySection';
import PoPsoIntelligenceSection from './components/PoPsoIntelligenceSection';
import ProgrammeLandscapeSection from './components/ProgrammeLandscapeSection';
import ProgrammeDiagnosticSection from './components/ProgrammeDiagnosticSection';
import AttentionAreasSection from './components/AttentionAreasSection';
import HistoricalIntelligenceSection from './components/HistoricalIntelligenceSection';
import AtrIntelligenceSection from './components/AtrIntelligenceSection';
import {
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  Layers,
  AlertTriangle,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

const ANALYTICS_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    subtitle: 'Institutional quality snapshot',
    icon: LayoutDashboard,
  },
  {
    id: 'cohorts',
    label: 'Cohorts',
    subtitle: 'Programme and cohort performance',
    icon: Layers,
  },
  {
    id: 'attention',
    label: 'Attention',
    subtitle: 'Observed outcome deficits requiring quality review',
    icon: AlertTriangle,
  },
  {
    id: 'history',
    label: 'History',
    subtitle: 'Multi-cohort attainment trends',
    icon: TrendingUp,
  },
  {
    id: 'atr',
    label: 'ATR',
    subtitle: 'Action and governance intelligence',
    icon: FileCheck,
  },
];

export default function IqacAnalyticsDashboard() {
  const {
    schools = [],
    departments = [],
    masterProgrammes = [],
    programmes = [],
    batches = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    loadProgrammeBatches = () => Promise.resolve([]),
  } = useAcademic();

  const { refreshUsers = () => Promise.resolve([]) } = useUser();

  // Active Tab State (Default: overview)
  const [activeTab, setActiveTab] = useState('overview');

  // Primary Cascading Filter State
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState(null);
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState(null);

  // Metadata Loading & Error State
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Real KPI Data State (Phase 2)
  const [kpiData, setKpiData] = useState(null);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  // Real PO / PSO Health Data State (Phase 3)
  const [poHealthData, setPoHealthData] = useState([]);
  const [isLoadingPoHealth, setIsLoadingPoHealth] = useState(true);
  const [poHealthError, setPoHealthError] = useState(null);

  const [psoHealthData, setPsoHealthData] = useState([]);
  const [isLoadingPsoHealth, setIsLoadingPsoHealth] = useState(true);
  const [psoHealthError, setPsoHealthError] = useState(null);

  // Combined master programmes list
  const allProgrammes = useMemo(() => {
    if (masterProgrammes && masterProgrammes.length > 0) return masterProgrammes;
    if (programmes && programmes.length > 0) return programmes;
    return [];
  }, [masterProgrammes, programmes]);

  // Initial Metadata Loader
  const loadInitialMetadata = useCallback(async () => {
    setIsLoadingMetadata(true);
    setMetadataError(null);
    try {
      await Promise.all([
        refreshUsers().catch(() => []),
        loadSchools().catch(() => []),
        loadDepartments().catch(() => []),
        loadMasterProgrammes().catch(() => []),
      ]);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load academic metadata for analytics:', err);
      setMetadataError('Failed to load academic organizational structure. Please check connection and retry.');
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [loadDepartments, loadMasterProgrammes, loadSchools, refreshUsers]);

  useEffect(() => {
    loadInitialMetadata();
  }, [loadInitialMetadata]);

  // Cascading Filter Handlers
  const handleSelectSchool = useCallback((schoolId) => {
    setSelectedSchoolId(schoolId || null);
    setSelectedDepartmentId(null);
    setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
    if (schoolId) {
      loadDepartments(schoolId).catch(() => {});
    } else {
      loadDepartments().catch(() => {});
    }
  }, [loadDepartments]);

  const handleSelectDepartment = useCallback((deptId) => {
    setSelectedDepartmentId(deptId || null);
    setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
    if (deptId) {
      loadMasterProgrammes(deptId).catch(() => {});
    } else {
      loadMasterProgrammes().catch(() => {});
    }
  }, [loadMasterProgrammes]);

  const handleSelectProgramme = useCallback((progId) => {
    setSelectedMasterProgrammeId(progId || null);
    setSelectedProgrammeBatchId(null);
    if (progId) {
      loadProgrammeBatches(progId).catch(() => {});
    }
  }, [loadProgrammeBatches]);

  const handleSelectBatch = useCallback((batchId) => {
    setSelectedProgrammeBatchId(batchId || null);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedSchoolId(null);
    setSelectedDepartmentId(null);
    setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
    loadDepartments().catch(() => {});
    loadMasterProgrammes().catch(() => {});
  }, [loadDepartments, loadMasterProgrammes]);

  // Programme Cohort Selection Handler for Landscape Drill-down
  const handleSelectProgrammeCohort = useCallback(async ({ schoolId, departmentId, masterProgrammeId, programmeBatchId }) => {
    if (schoolId) {
      setSelectedSchoolId(schoolId);
      await loadDepartments(schoolId).catch(() => {});
    }
    if (departmentId) {
      setSelectedDepartmentId(departmentId);
      await loadMasterProgrammes(departmentId).catch(() => {});
    }
    if (masterProgrammeId) {
      setSelectedMasterProgrammeId(masterProgrammeId);
      await loadProgrammeBatches(masterProgrammeId).catch(() => {});
    }
    if (programmeBatchId) {
      setSelectedProgrammeBatchId(programmeBatchId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadDepartments, loadMasterProgrammes, loadProgrammeBatches]);

  // Scoped KPI Fetcher (Phase 2)
  const loadKpis = useCallback(async (scope = {}) => {
    setIsLoadingKpis(true);
    setKpiError(null);
    try {
      const res = await analyticsApi.getKpis(scope);
      const data = res?.data?.data ?? res?.data ?? null;
      setKpiData(data);
    } catch (err) {
      console.error('Failed to load analytics KPIs:', err);
      setKpiError('Unable to load analytics KPIs. Please try again.');
    } finally {
      setIsLoadingKpis(false);
    }
  }, []);

  // Scoped PO Health Fetcher (Phase 3)
  const loadPoHealth = useCallback(async (scope = {}) => {
    setIsLoadingPoHealth(true);
    setPoHealthError(null);
    try {
      const res = await analyticsApi.getPoHealth(scope);
      const data = res?.data?.data ?? res?.data ?? [];
      setPoHealthData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load PO health for scope:', err);
      setPoHealthError('Unable to load PO health metrics. Please try again.');
    } finally {
      setIsLoadingPoHealth(false);
    }
  }, []);

  // Scoped PSO Health Fetcher (Phase 3)
  const loadPsoHealth = useCallback(async (scope = {}) => {
    setIsLoadingPsoHealth(true);
    setPsoHealthError(null);
    try {
      const res = await analyticsApi.getPsoHealth(scope);
      const data = res?.data?.data ?? res?.data ?? [];
      setPsoHealthData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load PSO health for scope:', err);
      setPsoHealthError('Unable to load PSO health metrics. Please try again.');
    } finally {
      setIsLoadingPsoHealth(false);
    }
  }, []);

  // React to Hierarchy Scope Changes with Stale Request Protection
  useEffect(() => {
    let isCurrent = true;
    setIsLoadingKpis(true);
    setKpiError(null);
    setIsLoadingPoHealth(true);
    setPoHealthError(null);
    setIsLoadingPsoHealth(true);
    setPsoHealthError(null);

    const scope = {};
    if (selectedSchoolId) scope.schoolId = selectedSchoolId;
    if (selectedDepartmentId) scope.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) scope.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) scope.programmeBatchId = selectedProgrammeBatchId;

    analyticsApi.getKpis(scope)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data?.data ?? res?.data ?? null;
        setKpiData(data);
        setIsLoadingKpis(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('Failed to load analytics KPIs for scope:', err);
        setKpiError('Unable to load analytics KPIs. Please try again.');
        setIsLoadingKpis(false);
      });

    analyticsApi.getPoHealth(scope)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setPoHealthData(Array.isArray(data) ? data : []);
        setIsLoadingPoHealth(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('Failed to load PO health for scope:', err);
        setPoHealthError('Unable to load PO health metrics. Please try again.');
        setIsLoadingPoHealth(false);
      });

    analyticsApi.getPsoHealth(scope)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setPsoHealthData(Array.isArray(data) ? data : []);
        setIsLoadingPsoHealth(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('Failed to load PSO health for scope:', err);
        setPsoHealthError('Unable to load PSO health metrics. Please try again.');
        setIsLoadingPsoHealth(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId]);

  const handleRetryKpis = useCallback(() => {
    const scope = {};
    if (selectedSchoolId) scope.schoolId = selectedSchoolId;
    if (selectedDepartmentId) scope.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) scope.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) scope.programmeBatchId = selectedProgrammeBatchId;
    loadKpis(scope);
  }, [loadKpis, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, selectedSchoolId]);

  const handleRetryPoHealth = useCallback(() => {
    const scope = {};
    if (selectedSchoolId) scope.schoolId = selectedSchoolId;
    if (selectedDepartmentId) scope.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) scope.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) scope.programmeBatchId = selectedProgrammeBatchId;
    loadPoHealth(scope);
  }, [loadPoHealth, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, selectedSchoolId]);

  const handleRetryPsoHealth = useCallback(() => {
    const scope = {};
    if (selectedSchoolId) scope.schoolId = selectedSchoolId;
    if (selectedDepartmentId) scope.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) scope.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) scope.programmeBatchId = selectedProgrammeBatchId;
    loadPsoHealth(scope);
  }, [loadPsoHealth, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, selectedSchoolId]);

  // Derived Filtered Lists for Selectors
  const filteredDepartments = useMemo(() => {
    if (!selectedSchoolId) return departments;
    return departments.filter(
      (dept) => String(dept.schoolId) === String(selectedSchoolId)
    );
  }, [departments, selectedSchoolId]);

  const filteredProgrammes = useMemo(() => {
    if (!selectedDepartmentId) {
      if (selectedSchoolId) {
        const schoolDeptIds = new Set(
          filteredDepartments.map((d) => String(d.id || d.departmentId))
        );
        return allProgrammes.filter((prog) =>
          schoolDeptIds.has(String(prog.departmentId))
        );
      }
      return allProgrammes;
    }
    return allProgrammes.filter(
      (prog) => String(prog.departmentId) === String(selectedDepartmentId)
    );
  }, [allProgrammes, filteredDepartments, selectedDepartmentId, selectedSchoolId]);

  const filteredBatches = useMemo(() => {
    if (!selectedMasterProgrammeId) return [];
    return batches.filter(
      (b) =>
        String(b.masterProgrammeId || b.programmeId) === String(selectedMasterProgrammeId)
    );
  }, [batches, selectedMasterProgrammeId]);

  // Active Selected Entity Objects
  const activeSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schools.find((s) => String(s.id || s.schoolId) === String(selectedSchoolId)) || null;
  }, [schools, selectedSchoolId]);

  const activeDepartment = useMemo(() => {
    if (!selectedDepartmentId) return null;
    return departments.find((d) => String(d.id || d.departmentId) === String(selectedDepartmentId)) || null;
  }, [departments, selectedDepartmentId]);

  const activeProgramme = useMemo(() => {
    if (!selectedMasterProgrammeId) return null;
    return allProgrammes.find((p) => String(p.id || p.masterProgrammeId) === String(selectedMasterProgrammeId)) || null;
  }, [allProgrammes, selectedMasterProgrammeId]);

  const activeBatch = useMemo(() => {
    if (!selectedProgrammeBatchId) return null;
    return batches.find((b) => String(b.id || b.programmeBatchId) === String(selectedProgrammeBatchId)) || null;
  }, [batches, selectedProgrammeBatchId]);

  return (
    <div className="animated-page">
      {/* 1. Page Header */}
      <AnalyticsHeader lastRefreshed={lastRefreshed} />

      {/* Error Banner if metadata failed */}
      {metadataError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{metadataError}</span>
          </div>
          <button
            type="button"
            onClick={loadInitialMetadata}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* 2. Primary Cascading Scope Filters (Preserved globally across tabs) */}
      <AnalyticsFilterBar
        schools={schools}
        departments={filteredDepartments}
        programmes={filteredProgrammes}
        batches={filteredBatches}
        selectedSchoolId={selectedSchoolId}
        selectedDepartmentId={selectedDepartmentId}
        selectedMasterProgrammeId={selectedMasterProgrammeId}
        selectedProgrammeBatchId={selectedProgrammeBatchId}
        onSelectSchool={handleSelectSchool}
        onSelectDepartment={handleSelectDepartment}
        onSelectProgramme={handleSelectProgramme}
        onSelectBatch={handleSelectBatch}
        onReset={handleResetFilters}
        isLoadingMetadata={isLoadingMetadata}
      />

      {/* 3. Active Scope Breadcrumb Banner (Preserved globally across tabs) */}
      <ActiveScopeBanner
        school={activeSchool}
        department={activeDepartment}
        programme={activeProgramme}
        batch={activeBatch}
      />

      {/* 4. Tab Navigation Workspace Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
          marginBottom: 20,
          background: '#f8fafc',
          padding: '8px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
        role="tablist"
        aria-label="Analytics Workspace Tabs"
      >
        {ANALYTICS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: 8,
                border: isActive ? '1px solid #6366f1' : '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 4,
                    background: '#4f46e5',
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 2,
                  paddingLeft: isActive ? 6 : 0,
                }}
              >
                <Icon size={16} color={isActive ? '#4f46e5' : '#64748b'} />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#1e1b4b' : '#334155',
                  }}
                >
                  {tab.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: isActive ? '#4f46e5' : '#64748b',
                  fontWeight: isActive ? 600 : 400,
                  paddingLeft: isActive ? 6 : 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {tab.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Active Tab Analytical View */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Institutional KPI Area */}
          <KpiSummarySection
            kpiData={kpiData}
            isLoading={isLoadingKpis}
            error={kpiError}
            onRetry={handleRetryKpis}
          />

          {/* PO & PSO Attainment Intelligence */}
          <PoPsoIntelligenceSection
            poHealthData={poHealthData}
            psoHealthData={psoHealthData}
            isLoadingPo={isLoadingPoHealth}
            isLoadingPso={isLoadingPsoHealth}
            poError={poHealthError}
            psoError={psoHealthError}
            onRetryPo={handleRetryPoHealth}
            onRetryPso={handleRetryPsoHealth}
          />
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Programme Cohort Attainment Landscape */}
          <ProgrammeLandscapeSection
            selectedSchoolId={selectedSchoolId}
            selectedDepartmentId={selectedDepartmentId}
            selectedMasterProgrammeId={selectedMasterProgrammeId}
            selectedProgrammeBatchId={selectedProgrammeBatchId}
            onSelectProgrammeCohort={handleSelectProgrammeCohort}
          />

          {/* Programme Diagnostic Analytics */}
          <ProgrammeDiagnosticSection
            selectedSchoolId={selectedSchoolId}
            selectedDepartmentId={selectedDepartmentId}
            selectedMasterProgrammeId={selectedMasterProgrammeId}
            selectedProgrammeBatchId={selectedProgrammeBatchId}
            programmeBatches={batches}
            activeProgramme={activeProgramme}
            activeDepartment={activeDepartment}
            activeSchool={activeSchool}
            onSelectBatch={handleSelectBatch}
            onClearProgramme={() => setSelectedMasterProgrammeId(null)}
          />
        </div>
      )}

      {activeTab === 'attention' && (
        <div>
          {/* Prioritized Attention Areas & Deficit Diagnostics */}
          <AttentionAreasSection
            selectedSchoolId={selectedSchoolId}
            selectedDepartmentId={selectedDepartmentId}
            selectedMasterProgrammeId={selectedMasterProgrammeId}
            selectedProgrammeBatchId={selectedProgrammeBatchId}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {/* Historical Multi-Cohort Longitudinal Intelligence */}
          <HistoricalIntelligenceSection
            selectedSchoolId={selectedSchoolId}
            selectedDepartmentId={selectedDepartmentId}
            selectedMasterProgrammeId={selectedMasterProgrammeId}
            selectedProgrammeBatchId={selectedProgrammeBatchId}
          />
        </div>
      )}

      {activeTab === 'atr' && (
        <div>
          {/* Action Taken Report (ATR) Detailed Intelligence */}
          <AtrIntelligenceSection
            selectedSchoolId={selectedSchoolId}
            selectedDepartmentId={selectedDepartmentId}
            selectedMasterProgrammeId={selectedMasterProgrammeId}
            selectedProgrammeBatchId={selectedProgrammeBatchId}
          />
        </div>
      )}
    </div>
  );
}
