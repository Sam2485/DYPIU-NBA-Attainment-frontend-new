import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';
import { analyticsApi, academicApi } from '../../api';
import AnalyticsSelectors from './components/AnalyticsSelectors';
import AnalyticsKpiCards from './components/AnalyticsKpiCards';
import AttentionDistributionChart from './components/AttentionDistributionChart';
import BatchAttentionChart from './components/BatchAttentionChart';
import BatchAttentionList from './components/BatchAttentionList';
import AnalyticsSkeleton from './components/AnalyticsSkeleton';
import AnalyticsEmptyState from './components/AnalyticsEmptyState';
import AnalyticsErrorState from './components/AnalyticsErrorState';

export default function IqacAnalyticsDashboard() {
  const navigate = useNavigate();

  const {
    schools = [],
    departments = [],
    masterProgrammes = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
  } = useAcademic();

  // Primary Cascading Filter State
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState('');
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState('');

  // Batches for Selector (NOT restricted to attention batches)
  const [selectorBatches, setSelectorBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Metadata Loading State
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Analytics Data State
  const [kpiData, setKpiData] = useState(null);
  const [attentionBatches, setAttentionBatches] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // 1. Initial Metadata Load
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        await Promise.allSettled([
          loadSchools(),
          loadDepartments(),
          loadMasterProgrammes(),
        ]);
      } catch (err) {
        console.error('[IqacAnalyticsDashboard] Error loading metadata:', err);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Filter Programmes by Selected School
  const filteredProgrammes = useMemo(() => {
    if (!selectedSchoolId) return [];
    // Find department IDs belonging to selected school
    const schoolDeptIds = new Set(
      (departments || [])
        .filter((d) => (d.schoolId || d.school_id) === selectedSchoolId)
        .map((d) => d.id || d.departmentId)
    );

    return (masterProgrammes || []).filter((p) => {
      if (p.schoolId && p.schoolId === selectedSchoolId) return true;
      if (p.departmentId && schoolDeptIds.has(p.departmentId)) return true;
      return false;
    });
  }, [selectedSchoolId, departments, masterProgrammes]);

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
        console.error('[IqacAnalyticsDashboard] Error loading batches for selector:', err);
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

  // 4. Fetch Live Attention Data & KPIs
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);

    const queryParams = {
      batchStatus: 'ACTIVE',
    };
    if (selectedSchoolId) queryParams.schoolId = selectedSchoolId;
    if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;

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
      console.error('[IqacAnalyticsDashboard] Error fetching attention analytics:', err);
      setAnalyticsError(
        err?.response?.data?.message || err?.message || 'Failed to fetch live batch attention data.'
      );
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [selectedSchoolId, selectedMasterProgrammeId]);

  useEffect(() => {
    if (!isLoadingMetadata) {
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData, isLoadingMetadata]);

  // Handler for Selecting a Batch -> Transitions to Batch Analytics
  const handleNavigateToBatch = useCallback(
    (batchId) => {
      if (!batchId) return;
      navigate(`/admin/analytics/batch/${batchId}`);
    },
    [navigate]
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
    setSelectedSchoolId('');
    setSelectedMasterProgrammeId('');
    setSelectedProgrammeBatchId('');
  };

  const activeBatchesCount = kpiData?.scopeSummary?.totalBatches ?? 0;
  const poDeficitCount = kpiData?.poTargetAchievement?.targetDeficitInstances ?? 0;
  const psoDeficitCount = kpiData?.psoTargetAchievement?.targetDeficitInstances ?? 0;

  const selectedSchoolObj = schools.find((s) => (s.id || s.schoolId) === selectedSchoolId);
  const selectedProgrammeObj = masterProgrammes.find(
    (p) => (p.id || p.masterProgrammeId) === selectedMasterProgrammeId
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 64 }}>
      {/* Header — Main Heading Only */}
      <div style={{ marginBottom: 20 }}>
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
          ANALYTICS
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

      {/* Hierarchical Academic Selectors */}
      <AnalyticsSelectors
        schools={schools}
        programmes={filteredProgrammes}
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
              selectedSchoolName={selectedSchoolObj?.name}
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
