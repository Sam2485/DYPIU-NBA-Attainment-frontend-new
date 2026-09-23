import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, academicApi } from '../../api';
import AnalyticsSelectors from './components/AnalyticsSelectors';
import AnalyticsKpiCards from './components/AnalyticsKpiCards';
import AttentionDistributionChart from './components/AttentionDistributionChart';
import BatchAttentionChart from './components/BatchAttentionChart';
import BatchAttentionList from './components/BatchAttentionList';
import AnalyticsSkeleton from './components/AnalyticsSkeleton';
import AnalyticsEmptyState from './components/AnalyticsEmptyState';
import AnalyticsErrorState from './components/AnalyticsErrorState';
import { Sparkles } from 'lucide-react';

export default function RoleAnalyticsDashboard({ roleOverride = null }) {
  const navigate = useNavigate();
  const { user, role: authRole } = useAuth();
  const currentRole = roleOverride || authRole || 'IQAC';

  const isIqac = currentRole === 'IQAC';
  const isDirector = currentRole === 'DIRECTOR';
  const isHod = currentRole === 'HOD';
  const isProgrammeCoordinator = currentRole === 'PROGRAMME_COORDINATOR';

  const showSchoolSelector = isIqac;

  const {
    schools = [],
    departments = [],
    masterProgrammes = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    loadCoordinatorMasterProgrammes = () => Promise.resolve([]),
  } = useAcademic();

  // Primary Filter State
  const [selectedSchoolId, setSelectedSchoolId] = useState(isIqac ? '' : (user?.schoolId || ''));
  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState('');
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState('');

  // Coordinator programmes for PROGRAMME_COORDINATOR role
  const [coordinatorProgrammes, setCoordinatorProgrammes] = useState([]);

  // Batches for Selector
  const [selectorBatches, setSelectorBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Metadata Loading State
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Analytics Data State
  const [kpiData, setKpiData] = useState(null);
  const [attentionBatches, setAttentionBatches] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // 1. Initial Metadata Load based on role
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        if (isIqac) {
          await Promise.allSettled([
            loadSchools(),
            loadDepartments(),
            loadMasterProgrammes(),
          ]);
        } else if (isDirector) {
          await Promise.allSettled([
            loadDepartments(),
            loadMasterProgrammes(),
          ]);
        } else if (isHod) {
          await Promise.allSettled([
            loadDepartments(),
            loadMasterProgrammes(),
          ]);
        } else if (isProgrammeCoordinator) {
          if (user?.email) {
            const progs = await loadCoordinatorMasterProgrammes(user.email);
            if (isMounted && Array.isArray(progs) && progs.length > 0) {
              setCoordinatorProgrammes(progs);
              // Auto-select first programme if coordinator has assigned programmes
              setSelectedMasterProgrammeId(progs[0].id || progs[0].masterProgrammeId || '');
            }
          }
          await loadMasterProgrammes();
        }
      } catch (err) {
        console.error('[RoleAnalyticsDashboard] Error loading metadata:', err);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [isIqac, isDirector, isHod, isProgrammeCoordinator, user?.email]);

  // 2. Role-Scoped Programmes List
  const availableProgrammes = useMemo(() => {
    if (isIqac) {
      if (!selectedSchoolId) return [];
      const schoolDeptIds = new Set(
        (departments || [])
          .filter((d) => String(d.schoolId || d.school_id) === String(selectedSchoolId))
          .map((d) => String(d.id || d.departmentId))
      );

      return (masterProgrammes || []).filter((p) => {
        if (p.schoolId && String(p.schoolId) === String(selectedSchoolId)) return true;
        if (p.departmentId && schoolDeptIds.has(String(p.departmentId))) return true;
        return false;
      });
    }

    if (isDirector) {
      const directorSchoolId = String(user?.schoolId || selectedSchoolId || '');
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
      if (coordinatorProgrammes.length > 0) {
        return coordinatorProgrammes;
      }
      const pcProgId = String(user?.masterProgrammeId || '');
      if (pcProgId) {
        return (masterProgrammes || []).filter(
          (p) => String(p.id || p.masterProgrammeId) === pcProgId
        );
      }
      return masterProgrammes || [];
    }

    return masterProgrammes || [];
  }, [isIqac, isDirector, isHod, isProgrammeCoordinator, selectedSchoolId, user?.schoolId, user?.departmentId, user?.masterProgrammeId, departments, masterProgrammes, coordinatorProgrammes]);

  // 3. Load Active Batches for Selected Programme (Selector Population)
  useEffect(() => {
    let isMounted = true;
    if (!selectedMasterProgrammeId) {
      setSelectorBatches([]);
      setSelectedProgrammeBatchId('');
      return;
    }

    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const res = await academicApi.getBatches({
          masterProgrammeId: selectedMasterProgrammeId,
          status: 'ACTIVE',
        });
        const batchList = res?.data?.data || res?.data || [];
        if (isMounted) {
          setSelectorBatches(Array.isArray(batchList) ? batchList : []);
        }
      } catch (err) {
        console.error('[RoleAnalyticsDashboard] Error loading batches for selector:', err);
        if (isMounted) setSelectorBatches([]);
      } finally {
        if (isMounted) setIsLoadingBatches(false);
      }
    };

    fetchBatches();
    return () => {
      isMounted = false;
    };
  }, [selectedMasterProgrammeId]);

  // 4. Fetch Live Attention Data & KPIs with strict role userScope
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);

    const queryParams = {
      batchStatus: 'ACTIVE',
    };

    if (isIqac) {
      if (selectedSchoolId) queryParams.schoolId = selectedSchoolId;
      if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
    } else if (isDirector) {
      if (user?.schoolId) queryParams.schoolId = user.schoolId;
      if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
    } else if (isHod) {
      if (user?.schoolId) queryParams.schoolId = user.schoolId;
      if (user?.departmentId) queryParams.departmentId = user.departmentId;
      if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
    } else if (isProgrammeCoordinator) {
      const progId = selectedMasterProgrammeId || user?.masterProgrammeId;
      if (progId) queryParams.masterProgrammeId = progId;
    }

    try {
      const [kpisRes, programmesRes] = await Promise.all([
        analyticsApi.getKpis(queryParams),
        analyticsApi.getProgrammes({
          ...queryParams,
          attentionOnly: true,
          sortBy: 'gapCount',
          direction: 'DESC',
          size: 100,
        }),
      ]);

      const kpis = kpisRes?.data?.data || kpisRes?.data || null;
      const progLandscape = programmesRes?.data?.data || programmesRes?.data || {};
      const batchRows = progLandscape.content || (Array.isArray(progLandscape) ? progLandscape : []);

      setKpiData(kpis);
      setAttentionBatches(batchRows);
    } catch (err) {
      console.error('[RoleAnalyticsDashboard] Error fetching attention analytics:', err);
      setAnalyticsError(
        err?.response?.data?.message || err?.message || 'Failed to fetch live batch attention data.'
      );
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [isIqac, isDirector, isHod, isProgrammeCoordinator, selectedSchoolId, selectedMasterProgrammeId, user?.schoolId, user?.departmentId, user?.masterProgrammeId]);

  useEffect(() => {
    if (!isLoadingMetadata) {
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData, isLoadingMetadata]);

  // Handler for Selecting a Batch -> Transitions to Quick Analysis first (can navigate to Detailed Analytics later)
  const handleNavigateToBatch = useCallback(
    (batchId) => {
      if (!batchId) return;
      const basePath = isIqac ? '/admin' : '';
      const params = new URLSearchParams();
      if (selectedMasterProgrammeId) params.set('masterProgrammeId', selectedMasterProgrammeId);
      params.set('programmeBatchId', batchId);
      navigate(`${basePath}/analytics/quick-analysis?${params.toString()}`);
    },
    [navigate, isIqac, selectedMasterProgrammeId]
  );

  // Filter change handlers
  const handleSelectSchool = (schoolId) => {
    setSelectedSchoolId(schoolId || '');
    setSelectedMasterProgrammeId('');
    setSelectedProgrammeBatchId('');
  };

  const handleSelectProgramme = (programmeId) => {
    setSelectedMasterProgrammeId(programmeId || '');
    setSelectedProgrammeBatchId('');
  };

  const handleSelectBatch = (batchId) => {
    setSelectedProgrammeBatchId(batchId || '');
    if (batchId) {
      handleNavigateToBatch(batchId);
    }
  };

  const handleResetFilters = () => {
    if (isIqac) {
      setSelectedSchoolId('');
    }
    setSelectedMasterProgrammeId('');
    setSelectedProgrammeBatchId('');
  };

  const activeBatchesCount = kpiData?.scopeSummary?.totalBatches ?? 0;
  const poDeficitCount = kpiData?.poTargetAchievement?.targetDeficitInstances ?? 0;
  const psoDeficitCount = kpiData?.psoTargetAchievement?.targetDeficitInstances ?? 0;

  const selectedSchoolObj = schools.find((s) => (s.id || s.schoolId) === selectedSchoolId);
  const selectedProgrammeObj = availableProgrammes.find(
    (p) => (p.id || p.masterProgrammeId) === selectedMasterProgrammeId
  );

  // Subtitle based on user scope
  const scopeSubtitle = useMemo(() => {
    if (isDirector) {
      return user?.schoolName || selectedSchoolObj?.name || 'School Live Cohort Attention';
    }
    if (isHod) {
      return user?.department?.name || 'Department Live Cohort Attention';
    }
    if (isProgrammeCoordinator) {
      return selectedProgrammeObj?.name || user?.programme?.name || 'Programme Live Cohort Attention';
    }
    return 'University-wide Attainment & Attention Monitoring';
  }, [isDirector, isHod, isProgrammeCoordinator, user, selectedSchoolObj, selectedProgrammeObj]);

  const handleNavigateToQuickAnalysis = () => {
    const basePath = isIqac ? '/admin' : '';
    const params = new URLSearchParams();
    if (selectedMasterProgrammeId) params.set('masterProgrammeId', selectedMasterProgrammeId);
    if (selectedProgrammeBatchId) params.set('programmeBatchId', selectedProgrammeBatchId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    navigate(`${basePath}/analytics/quick-analysis${qs}`);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 64 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#2563eb',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            ANALYTICS &bull; {scopeSubtitle}
          </div>
          <h1
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Live Programme Batch Attention
          </h1>
        </div>

        {/* Quick Analysis Button */}
        <button
          type="button"
          onClick={handleNavigateToQuickAnalysis}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: 13.5,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(2, 132, 199, 0.35)';
          }}
        >
          <Sparkles size={16} />
          <span>Quick Analysis</span>
        </button>
      </div>

      {/* Hierarchical Academic Selectors (Role-Aware) */}
      <AnalyticsSelectors
        schools={schools}
        programmes={availableProgrammes}
        batches={selectorBatches}
        selectedSchoolId={selectedSchoolId}
        selectedMasterProgrammeId={selectedMasterProgrammeId}
        selectedProgrammeBatchId={selectedProgrammeBatchId}
        onSelectSchool={handleSelectSchool}
        onSelectProgramme={handleSelectProgramme}
        onSelectBatch={handleSelectBatch}
        onReset={handleResetFilters}
        isLoadingMetadata={isLoadingMetadata}
        isLoadingBatches={isLoadingBatches}
        showSchoolSelector={showSchoolSelector}
      />

      {/* Error State */}
      {analyticsError && (
        <AnalyticsErrorState error={analyticsError} onRetry={fetchAnalyticsData} />
      )}

      {/* Loading Skeleton */}
      {isLoadingAnalytics && !analyticsError && <AnalyticsSkeleton />}

      {/* Content Area */}
      {!isLoadingAnalytics && !analyticsError && (
        <>
          {/* KPI Cards Area */}
          <AnalyticsKpiCards
            activeBatchesCount={activeBatchesCount}
            poDeficitCount={poDeficitCount}
            psoDeficitCount={psoDeficitCount}
            isLoading={isLoadingAnalytics}
          />

          {/* Empty State when no attention batches */}
          {attentionBatches.length === 0 ? (
            <AnalyticsEmptyState
              hasActiveBatches={activeBatchesCount > 0}
              selectedSchoolName={selectedSchoolObj?.name || user?.schoolName}
              selectedProgrammeName={selectedProgrammeObj?.name}
            />
          ) : (
            <>
              {/* Visual Analytics Charts: 2-column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Visualization #1: Attention Distribution (PO vs PSO Donut) */}
                <AttentionDistributionChart
                  poDeficitCount={poDeficitCount}
                  psoDeficitCount={psoDeficitCount}
                />

                {/* Visualization #2: Batch Attention Ranking (Horizontal Bar Chart) */}
                <BatchAttentionChart
                  batches={attentionBatches}
                  onSelectBatch={handleNavigateToBatch}
                />
              </div>

              {/* Live Batches Requiring Attention List */}
              <BatchAttentionList
                batches={attentionBatches}
                onSelectBatch={handleNavigateToBatch}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
