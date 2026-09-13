import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useUser } from '../../context/user';
import AnalyticsHeader from './components/AnalyticsHeader';
import AnalyticsFilterBar from './components/AnalyticsFilterBar';
import ActiveScopeBanner from './components/ActiveScopeBanner';
import KpiSummarySection from './components/KpiSummarySection';
import PoPsoIntelligenceSection from './components/PoPsoIntelligenceSection';
import ProgrammeLandscapeSection from './components/ProgrammeLandscapeSection';
import AttentionAreasSection from './components/AttentionAreasSection';
import HistoricalIntelligenceSection from './components/HistoricalIntelligenceSection';
import AtrIntelligenceSection from './components/AtrIntelligenceSection';
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  // Primary Cascading Filter State
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState(null);
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState(null);

  // Metadata Loading & Error State
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

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

      {/* 2. Primary Cascading Scope Filters */}
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

      {/* 3. Active Scope Breadcrumb Banner */}
      <ActiveScopeBanner
        school={activeSchool}
        department={activeDepartment}
        programme={activeProgramme}
        batch={activeBatch}
      />

      {/* 4. Section 1: Institutional KPI Area */}
      <KpiSummarySection isLoading={isLoadingMetadata} />

      {/* 5. Section 2: PO & PSO Attainment Intelligence */}
      <PoPsoIntelligenceSection isLoading={isLoadingMetadata} />

      {/* 6. Section 3: Programme Cohort Attainment Landscape */}
      <ProgrammeLandscapeSection
        programmes={filteredProgrammes}
        batches={filteredBatches}
        isLoading={isLoadingMetadata}
      />

      {/* 7. Section 4: Prioritized Attention Areas & Deficit Diagnostics */}
      <AttentionAreasSection isLoading={isLoadingMetadata} />

      {/* 8. Section 5: Historical Multi-Cohort Longitudinal Intelligence */}
      <HistoricalIntelligenceSection isLoading={isLoadingMetadata} />

      {/* 9. Section 6: Action Taken Report (ATR) Closed-Loop Governance */}
      <AtrIntelligenceSection isLoading={isLoadingMetadata} />
    </div>
  );
}
