import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsApi } from '../../../api';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  UserCheck,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';

/**
 * Format number to 2 decimal places safely.
 */
function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

/**
 * Format ISO datetime string to localized readable string.
 */
function formatDateTime(dtStr) {
  if (!dtStr) return '—';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dtStr;
  }
}

/**
 * Returns color tokens for ATR status.
 */
function getStatusBadgeStyle(status, hasAtr) {
  if (!hasAtr || !status) {
    return {
      label: 'No ATR Recorded',
      bg: '#fff1f2',
      text: '#e11d48',
      border: '#fecdd3',
    };
  }

  const upper = status.toUpperCase();
  switch (upper) {
    case 'APPROVED':
      return { label: 'Approved', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    case 'VERIFIED':
    case 'SUBMITTED_FOR_VERIFICATION':
    case 'PENDING_APPROVAL':
    case 'SUBMITTED':
      return { label: 'In Verification / Review', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    case 'NEEDS_REVISION':
    case 'REVISION_REQUESTED':
    case 'REJECTED':
      return { label: 'Revision Required', bg: '#fff1f2', text: '#be123c', border: '#fda4af' };
    case 'DRAFT':
      return { label: 'Draft Action Plan', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    default:
      return { label: upper.replace(/_/g, ' '), bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
}

export default function AtrIntelligenceSection({
  selectedSchoolId = null,
  selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'WITH_ATR' | 'NO_ATR' | 'REVISION'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const requestCounterRef = useRef(0);

  const fetchData = useCallback(async () => {
    const reqId = ++requestCounterRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.getAtrIntelligence({
        schoolId: selectedSchoolId,
        departmentId: selectedDepartmentId,
        masterProgrammeId: selectedMasterProgrammeId,
        programmeBatchId: selectedProgrammeBatchId,
      });

      if (reqId === requestCounterRef.current) {
        const payload = res?.data?.data ?? res?.data ?? null;
        setData(payload);
      }
    } catch (err) {
      if (reqId === requestCounterRef.current) {
        console.error('Failed to load ATR Intelligence:', err);
        setError('Unable to load Action Taken Report (ATR) intelligence. Please try again.');
      }
    } finally {
      if (reqId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  }, [selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedRecord) {
        setSelectedRecord(null);
      }
    };
    if (selectedRecord) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecord]);

  // Derived filter logic
  const allRecords = data?.gapAtrRecords || [];

  const filteredRecords = allRecords.filter((record) => {
    // Tab filter
    if (activeTab === 'WITH_ATR' && !record.hasRecordedAtr) return false;
    if (activeTab === 'NO_ATR' && record.hasRecordedAtr) return false;
    if (activeTab === 'REVISION') {
      const s = (record.atrStatus || '').toUpperCase();
      if (!['NEEDS_REVISION', 'REVISION_REQUESTED', 'REJECTED'].includes(s)) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchProg = (record.programmeName || '').toLowerCase().includes(q) || (record.programmeCode || '').toLowerCase().includes(q);
      const matchBatch = (record.batchName || '').toLowerCase().includes(q);
      const matchOutcome = (record.outcomeCode || '').toLowerCase().includes(q);
      const matchDept = (record.departmentName || '').toLowerCase().includes(q);
      const matchObs = (record.recordedObservations || '').toLowerCase().includes(q);
      const matchActions = Array.isArray(record.recordedActions) && record.recordedActions.some((a) => a.toLowerCase().includes(q));

      if (!matchProg && !matchBatch && !matchOutcome && !matchDept && !matchObs && !matchActions) {
        return false;
      }
    }

    return true;
  });

  const totalGaps = data?.totalGapsInScope || 0;
  const gapsWithAtr = data?.gapsWithAtr || 0;
  const gapsWithoutAtr = data?.gapsWithoutAtr || 0;
  const totalAtrs = data?.totalAtrRecords || 0;
  const approvedAtrs = data?.approvedAtrs || 0;
  const pendingAtrs = data?.pendingAtrs || 0;
  const needsRevisionAtrs = data?.needsRevisionAtrs || 0;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* 1. Header with Title and CQI Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Action Taken Report (ATR) Detailed Intelligence
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
            Continuous Quality Improvement (CQI) closed-loop investigation connecting target gaps to recorded corrective action plans.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Main Card Container */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 22,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              borderRadius: 8,
              color: '#b91c1c',
              fontSize: 13,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#b91c1c',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 3. Summary KPI Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {/* Card 1: Total ATR Records */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Evaluated ATRs
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {isLoading ? '—' : totalAtrs}
              </strong>
              <FileText size={15} color="#64748b" />
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Recorded in active scope</span>
          </div>

          {/* Card 2: Approved ATRs */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Approved ATRs
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: '#15803d' }}>
                {isLoading ? '—' : approvedAtrs}
              </strong>
              <CheckCircle2 size={15} color="#15803d" />
            </div>
            <span style={{ fontSize: 11, color: '#16a34a' }}>Institutional verified</span>
          </div>

          {/* Card 3: Pending Review */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Verification
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>
                {isLoading ? '—' : pendingAtrs}
              </strong>
              <Clock size={15} color="#0284c7" />
            </div>
            <span style={{ fontSize: 11, color: '#0284c7' }}>Submitted / Under review</span>
          </div>

          {/* Card 4: Needs Revision */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#fff1f2',
              border: '1px solid #fecdd3',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Action Required
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: '#e11d48' }}>
                {isLoading ? '—' : needsRevisionAtrs}
              </strong>
              <ShieldAlert size={15} color="#e11d48" />
            </div>
            <span style={{ fontSize: 11, color: '#e11d48' }}>Revision requested</span>
          </div>

          {/* Card 5: Gaps with ATR */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gaps Covered
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: '#7e22ce' }}>
                {isLoading ? '—' : `${gapsWithAtr} / ${totalGaps}`}
              </strong>
              <Layers size={15} color="#7e22ce" />
            </div>
            <span style={{ fontSize: 11, color: '#9333ea' }}>
              {totalGaps > 0 ? `${((gapsWithAtr / totalGaps) * 100).toFixed(0)}% coverage` : 'No gaps in scope'}
            </span>
          </div>

          {/* Card 6: Gaps Missing ATR */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: gapsWithoutAtr > 0 ? '#fffbeb' : '#f8fafc',
              border: `1px solid ${gapsWithoutAtr > 0 ? '#fde68a' : '#e2e8f0'}`,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: gapsWithoutAtr > 0 ? '#92400e' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gaps Missing ATR
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <strong style={{ fontSize: 20, fontWeight: 800, color: gapsWithoutAtr > 0 ? '#b45309' : '#0f172a' }}>
                {isLoading ? '—' : gapsWithoutAtr}
              </strong>
              <AlertTriangle size={15} color={gapsWithoutAtr > 0 ? '#b45309' : '#64748b'} />
            </div>
            <span style={{ fontSize: 11, color: gapsWithoutAtr > 0 ? '#b45309' : '#94a3b8' }}>
              {gapsWithoutAtr > 0 ? 'Action plan required' : 'Full CQI coverage'}
            </span>
          </div>
        </div>

        {/* 4. Filter Tabs and Search Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          {/* Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'ALL' ? '#0f172a' : '#ffffff',
                color: activeTab === 'ALL' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              All Deficits ({allRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('WITH_ATR')}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'WITH_ATR' ? '#0f172a' : '#ffffff',
                color: activeTab === 'WITH_ATR' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'WITH_ATR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              With ATR Plan ({gapsWithAtr})
            </button>
            <button
              onClick={() => setActiveTab('NO_ATR')}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'NO_ATR' ? '#0f172a' : '#ffffff',
                color: activeTab === 'NO_ATR' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'NO_ATR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Action Missing ({gapsWithoutAtr})
            </button>
            {needsRevisionAtrs > 0 && (
              <button
                onClick={() => setActiveTab('REVISION')}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'REVISION' ? '#e11d48' : '#ffffff',
                  color: activeTab === 'REVISION' ? '#ffffff' : '#be123c',
                  boxShadow: activeTab === 'REVISION' ? '0 1px 3px rgba(225,29,72,0.2)' : 'none',
                }}
              >
                Needs Revision ({needsRevisionAtrs})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240, maxWidth: 320, flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 9 }} />
            <input
              type="text"
              placeholder="Search programme, outcome, action..."
              aria-label="Search programme, outcome, or action plan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 7,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 2,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 5. Content Grid / Table */}
        {isLoading ? (
          <div style={{ padding: '36px 0', textAlign: 'center' }}>
            <RefreshCw size={24} color="#0284c7" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Loading Action Taken Report intelligence...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: 10,
              border: '1px dashed #cbd5e1',
            }}
          >
            {allRecords.length === 0 ? (
              <>
                <CheckCircle2 size={32} color="#15803d" style={{ marginBottom: 10 }} />
                <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  No Outcome Deficits in Selected Scope
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', maxWidth: 460, marginInline: 'auto' }}>
                  All evaluated POs and PSOs for finalized cohorts in this scope meet or exceed configured attainment targets.
                </p>
              </>
            ) : (
              <>
                <Filter size={28} color="#94a3b8" style={{ marginBottom: 10 }} />
                <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  No Matching Records
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>
                  No target deficits match your current filter or search criteria.
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredRecords.map((record) => {
              const statusBadge = getStatusBadgeStyle(record.atrStatus, record.hasRecordedAtr);
              const actions = Array.isArray(record.recordedActions) ? record.recordedActions : [];

              return (
                <div
                  key={record.id}
                  style={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '16px 18px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 12,
                      paddingBottom: 10,
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    {/* Left: Outcome & Programme Identifiers */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#0284c7',
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {record.outcomeCode}
                        </span>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>
                          {record.programmeName || record.programmeCode}
                        </strong>
                        <span style={{ fontSize: 12, color: '#64748b' }}>•</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                          Cohort: {record.batchName}
                        </span>
                        {record.departmentName && (
                          <>
                            <span style={{ fontSize: 12, color: '#64748b' }}>•</span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>{record.departmentName}</span>
                          </>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                        {record.outcomeStatement}
                      </p>
                    </div>

                    {/* Right: ATR Status Badge & Inspect Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: statusBadge.text,
                          background: statusBadge.bg,
                          border: `1px solid ${statusBadge.border}`,
                          padding: '3px 10px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {statusBadge.label}
                      </span>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#0284c7',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={12} />
                        Audit Detail
                      </button>
                    </div>
                  </div>

                  {/* Attainment Gap Metric Summary Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 10,
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Level</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        {formatNumber(record.configuredTarget)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Final Attainment</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        {formatNumber(record.attainedValue)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Deficit (Gap)</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#e11d48', marginTop: 2 }}>
                        {formatNumber(record.gap)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Achievement %</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginTop: 2 }}>
                        {formatNumber(record.achievementPercentage)}%
                      </div>
                    </div>
                  </div>

                  {/* Recorded Action Plans / Observations */}
                  <div>
                    {actions.length > 0 ? (
                      <div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 4 }}>
                          Recorded Improvement Actions ({actions.length}):
                        </span>
                        <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                          {actions.map((act, idx) => (
                            <li key={idx} style={{ marginBottom: 3 }}>
                              {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 6 }}>
                        {record.hasRecordedAtr
                          ? 'No discrete action bullets listed in report JSON (see general observations).'
                          : 'No Action Taken Report (ATR) recorded for this deficit yet.'}
                      </div>
                    )}

                    {record.recordedObservations && (
                      <div style={{ fontSize: 11.5, color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: 6 }}>
                        <strong style={{ color: '#475569' }}>Reviewer / Coordinator Comments:</strong> {record.recordedObservations}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Detailed Audit Inspector Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="atr-audit-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#0284c7',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {selectedRecord.outcomeCode}
                  </span>
                  <h4 id="atr-audit-modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    ATR Closed-Loop Audit Detail
                  </h4>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  {selectedRecord.programmeName} ({selectedRecord.programmeCode}) • Cohort {selectedRecord.batchName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                aria-label="Close ATR audit detail modal"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  padding: 6,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Deficit Metrics Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TARGET</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {formatNumber(selectedRecord.configuredTarget)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ATTAINED</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {formatNumber(selectedRecord.attainedValue)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>GAP</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e11d48' }}>
                  {formatNumber(selectedRecord.gap)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ACHIEVEMENT</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>
                  {formatNumber(selectedRecord.achievementPercentage)}%
                </div>
              </div>
            </div>

            {/* Action Plans Section */}
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                Recorded Action Plan Steps
              </strong>
              {Array.isArray(selectedRecord.recordedActions) && selectedRecord.recordedActions.length > 0 ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px' }}>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#166534', lineHeight: 1.6 }}>
                    {selectedRecord.recordedActions.map((act, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: 12, color: '#64748b' }}>
                  No discrete action steps recorded in this report.
                </div>
              )}
            </div>

            {/* Observations / Reviewer Notes */}
            <div style={{ marginBottom: 16 }}>
              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                Observations & Verification Comments
              </strong>
              <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                {selectedRecord.recordedObservations || selectedRecord.verificationComments || 'No reviewer comments recorded.'}
              </div>
            </div>

            {/* Workflow Audit Trail History */}
            <div>
              <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                Administrative Workflow & Sign-Off History
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {/* Submission */}
                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <UserCheck size={14} color="#64748b" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submitted By</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                    {selectedRecord.submittedBy || 'Not recorded'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} />
                    {formatDateTime(selectedRecord.submittedAt)}
                  </div>
                </div>

                {/* Verification */}
                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <UserCheck size={14} color="#64748b" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Verified By</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                    {selectedRecord.verifiedBy || 'Pending verification'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} />
                    {formatDateTime(selectedRecord.verifiedAt)}
                  </div>
                </div>

                {/* Approval */}
                <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <UserCheck size={14} color="#64748b" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Approved By</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                    {selectedRecord.approvedBy || 'Pending approval'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} />
                    {formatDateTime(selectedRecord.approvedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Close Button */}
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#ffffff',
                  background: '#0f172a',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

