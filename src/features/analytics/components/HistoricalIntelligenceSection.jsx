import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsApi } from '../../../api';
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Layers,
  Calendar,
  Info,
} from 'lucide-react';

const selectStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 12.5,
  fontWeight: 600,
  outline: 'none',
};

function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

export default function HistoricalIntelligenceSection({
  selectedSchoolId = null,
  selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
}) {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState(null);
  const [selectedOutcomeCode, setSelectedOutcomeCode] = useState('PO1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real historical trend series for all available finalized cohorts
  const loadTrends = useCallback(async () => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    const params = {};
    if (selectedSchoolId) params.schoolId = selectedSchoolId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) params.masterProgrammeId = selectedMasterProgrammeId;

    try {
      const res = await analyticsApi.getTrends(params);
      if (!isCurrent) return;
      const data = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setSeriesList(list);

      // Auto-select active programme if available
      if (list.length > 0) {
        if (selectedMasterProgrammeId && list.some((s) => s.scopeIdentifier === selectedMasterProgrammeId)) {
          setSelectedProgId(selectedMasterProgrammeId);
        } else {
          setSelectedProgId((prev) => (list.some((s) => s.scopeIdentifier === prev) ? prev : list[0].scopeIdentifier));
        }
      } else {
        setSelectedProgId(null);
      }
    } catch (err) {
      if (!isCurrent) return;
      console.error('Failed to load historical trends:', err);
      setError('Unable to load historical trend intelligence. Please try again.');
    } finally {
      if (isCurrent) {
        setIsLoading(false);
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  // Sync selectedProgId when selectedMasterProgrammeId changes from parent scope
  useEffect(() => {
    if (selectedMasterProgrammeId && seriesList.some((s) => s.scopeIdentifier === selectedMasterProgrammeId)) {
      setSelectedProgId(selectedMasterProgrammeId);
    }
  }, [selectedMasterProgrammeId, seriesList]);

  // Active Programme Series
  const activeSeries = useMemo(() => {
    if (!seriesList || seriesList.length === 0) return null;
    if (selectedProgId) {
      return seriesList.find((s) => s.scopeIdentifier === selectedProgId) || seriesList[0];
    }
    return seriesList[0];
  }, [seriesList, selectedProgId]);

  // Available unique outcome codes in the active series
  const availableOutcomes = useMemo(() => {
    if (!activeSeries || !Array.isArray(activeSeries.cohortDataPoints)) return [];
    const codes = new Set();
    activeSeries.cohortDataPoints.forEach((p) => {
      if (p.outcomeCode) codes.add(p.outcomeCode);
    });

    const pos = Array.from(codes)
      .filter((c) => c.startsWith('PO'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    const psos = Array.from(codes)
      .filter((c) => !c.startsWith('PO'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    return { pos, psos, all: [...pos, ...psos] };
  }, [activeSeries]);

  // Ensure selected outcome exists in active series
  useEffect(() => {
    if (availableOutcomes.all.length > 0 && !availableOutcomes.all.includes(selectedOutcomeCode)) {
      setSelectedOutcomeCode(availableOutcomes.all[0]);
    }
  }, [availableOutcomes, selectedOutcomeCode]);

  // Filter and chronologically sort data points for the selected outcome, respecting batch scope
  const outcomePoints = useMemo(() => {
    if (!activeSeries || !Array.isArray(activeSeries.cohortDataPoints)) return [];
    let points = activeSeries.cohortDataPoints.filter((p) => p.outcomeCode === selectedOutcomeCode);
    if (selectedProgrammeBatchId) {
      points = points.filter((p) => p.programmeBatchId === selectedProgrammeBatchId);
    }
    return points.sort((a, b) => {
      const yearA = a.startYear || 0;
      const yearB = b.startYear || 0;
      if (yearA !== yearB) return yearA - yearB;
      return (a.batchName || '').localeCompare(b.batchName || '');
    });
  }, [activeSeries, selectedOutcomeCode, selectedProgrammeBatchId]);

  const cohortCount = outcomePoints.length;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* 1. Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={18} color="#2563eb" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Historical Multi-Cohort Longitudinal Intelligence
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Availability-driven longitudinal outcome attainment trajectories across finalized cohorts
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Programme Selector (when multiple programmes exist) */}
          {seriesList.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Programme:</span>
              <select
                value={selectedProgId || ''}
                onChange={(e) => setSelectedProgId(e.target.value)}
                style={selectStyle}
                aria-label="Select Programme"
              >
                {seriesList.map((s) => (
                  <option key={s.scopeIdentifier} value={s.scopeIdentifier}>
                    {s.scopeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Outcome Code Selector */}
          {availableOutcomes.all.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Outcome:</span>
              <select
                value={selectedOutcomeCode}
                onChange={(e) => setSelectedOutcomeCode(e.target.value)}
                style={selectStyle}
                aria-label="Select Outcome Code"
              >
                {availableOutcomes.pos.length > 0 && (
                  <optgroup label="Programme Outcomes (POs)">
                    {availableOutcomes.pos.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </optgroup>
                )}
                {availableOutcomes.psos.length > 0 && (
                  <optgroup label="Programme Specific Outcomes (PSOs)">
                    {availableOutcomes.psos.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadTrends}
            disabled={isLoading}
            title="Refresh Historical Intelligence"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Error State */}
      {error && (
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
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadTrends}
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

      {/* 3. Loading State (Skeleton) */}
      {isLoading && !error && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 180, height: 20, background: '#e2e8f0', borderRadius: 6 }} />
            <div style={{ width: 120, height: 20, background: '#e2e8f0', borderRadius: 6 }} />
          </div>
          <div style={{ height: 180, background: '#f8fafc', borderRadius: 10, marginBottom: 16 }} />
          <div style={{ height: 100, background: '#f1f5f9', borderRadius: 8 }} />
        </div>
      )}

      {/* 4. Empty State (No Historical Data Available) */}
      {!isLoading && !error && (!activeSeries || cohortCount === 0) && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '36px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Calendar size={22} color="#2563eb" />
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            No Historical Attainment Data Available
          </h4>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', maxWidth: 480, marginInline: 'auto' }}>
            Historical intelligence will appear when finalized cohort attainment reports are available for the selected scope.
          </p>
        </div>
      )}

      {/* 5. Real Historical Intelligence Display */}
      {!isLoading && !error && activeSeries && cohortCount > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Section Summary Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              paddingBottom: 14,
              borderBottom: '1px solid #f1f5f9',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  background: selectedOutcomeCode.startsWith('PO') ? '#eff6ff' : '#f5f3ff',
                  color: selectedOutcomeCode.startsWith('PO') ? '#1d4ed8' : '#6d28d9',
                  border: `1px solid ${selectedOutcomeCode.startsWith('PO') ? '#bfdbfe' : '#ddd6fe'}`,
                }}
              >
                {selectedOutcomeCode}
              </span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                {activeSeries.scopeName}
              </strong>
            </div>

            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '3px 10px',
                borderRadius: 6,
                border: '1px solid #dbeafe',
              }}
            >
              Showing {cohortCount} finalized cohort{cohortCount === 1 ? '' : 's'} with available data
            </span>
          </div>

          {/* Visualization: Single Cohort View vs Multi-Cohort Trajectory */}
          {cohortCount === 1 ? (
            /* Single Cohort Observation Card (Availability-Driven, No artificial slope) */
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Info size={16} color="#0284c7" />
                <span style={{ fontSize: 12.5, color: '#0369a1', fontWeight: 600 }}>
                  Single finalized historical cohort available. Longitudinal trajectory graph will connect as subsequent cohorts finalize.
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Cohort Batch</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                    {outcomePoints[0].batchName}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Applicable Target</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                    {formatNumber(outcomePoints[0].configuredTarget)}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Overall Attainment</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: outcomePoints[0].targetMet ? '#15803d' : '#b45309', marginTop: 3 }}>
                    {formatNumber(outcomePoints[0].overallAttainment)}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Observed Gap</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: outcomePoints[0].targetMet ? '#15803d' : '#dc2626', marginTop: 3 }}>
                    {formatNumber(outcomePoints[0].gap)}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Compliance Status</div>
                  <div style={{ marginTop: 4 }}>
                    {outcomePoints[0].targetMet ? (
                      <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        Target Met
                      </span>
                    ) : (
                      <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        Below Target
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Cohort Trajectory SVG Visualization */
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 20,
              }}
            >
              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 16,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 2, background: '#2563eb' }} />
                  <span>Attainment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 2, background: '#94a3b8', borderTop: '2px dashed #94a3b8' }} />
                  <span>Configured Target</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                  <span>Met</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                  <span>Below</span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg
                  viewBox="0 0 600 200"
                  style={{ width: '100%', minWidth: 420, height: 180, overflow: 'visible' }}
                >
                  {/* Grid Lines (Scale 0 to 3.0) */}
                  <line x1="50" y1="30" x2="560" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x="35" y="34" fontSize="10" fill="#94a3b8" textAnchor="end">3.00</text>

                  <line x1="50" y1="80" x2="560" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x="35" y="84" fontSize="10" fill="#94a3b8" textAnchor="end">2.00</text>

                  <line x1="50" y1="130" x2="560" y2="130" stroke="#e2e8f0" strokeDasharray="3 3" />
                  <text x="35" y="134" fontSize="10" fill="#94a3b8" textAnchor="end">1.00</text>

                  <line x1="50" y1="170" x2="560" y2="170" stroke="#cbd5e1" />
                  <text x="35" y="174" fontSize="10" fill="#94a3b8" textAnchor="end">0.00</text>

                  {(() => {
                    const width = 510;
                    const step = cohortCount > 1 ? width / (cohortCount - 1) : width;
                    const getY = (val) => {
                      const num = Number(val) || 0;
                      return 170 - (num / 3.0) * 140;
                    };

                    const attainmentPointsStr = outcomePoints
                      .map((p, idx) => `${50 + idx * step},${getY(p.overallAttainment)}`)
                      .join(' ');

                    const targetPointsStr = outcomePoints
                      .map((p, idx) => `${50 + idx * step},${getY(p.configuredTarget)}`)
                      .join(' ');

                    return (
                      <g>
                        {/* Target Line (Dashed) */}
                        <polyline
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          points={targetPointsStr}
                        />

                        {/* Attainment Line (Solid) */}
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          points={attainmentPointsStr}
                        />

                        {/* Data Points */}
                        {outcomePoints.map((p, idx) => {
                          const x = 50 + idx * step;
                          const yAtt = getY(p.overallAttainment);
                          const yTgt = getY(p.configuredTarget);
                          const isMet = p.targetMet;

                          return (
                            <g key={p.programmeBatchId || `${p.batchName}_${idx}`}>
                              {/* Target Marker */}
                              <rect
                                x={x - 4}
                                y={yTgt - 4}
                                width="8"
                                height="8"
                                fill="#94a3b8"
                                transform={`rotate(45 ${x} ${yTgt})`}
                              />

                              {/* Attainment Circle Point */}
                              <circle
                                cx={x}
                                cy={yAtt}
                                r="6"
                                fill={isMet ? '#16a34a' : '#dc2626'}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />

                              {/* Attainment Value Text */}
                              <text
                                x={x}
                                y={yAtt - 10}
                                fontSize="10.5"
                                fontWeight="700"
                                fill="#0f172a"
                                textAnchor="middle"
                              >
                                {formatNumber(p.overallAttainment)}
                              </text>

                              {/* Cohort Label on X-Axis */}
                              <text
                                x={x}
                                y="188"
                                fontSize="11"
                                fontWeight="600"
                                fill="#475569"
                                textAnchor="middle"
                              >
                                {p.batchName}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Tabular Evidence Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
              <Layers size={14} color="#0f172a" />
              <span>Cohort Evidence Breakdown for {selectedOutcomeCode}</span>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '8px 12px' }}>Cohort Batch</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Academic Span</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Configured Target</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Direct Attainment</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Indirect Attainment</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Final Attainment</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Observed Gap</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomePoints.map((p, idx) => (
                    <tr
                      key={p.programmeBatchId || `${p.batchName}_${idx}`}
                      style={{
                        borderBottom: idx === cohortCount - 1 ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {p.batchName}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>
                        {p.startYear && p.endYear ? `${p.startYear} – ${p.endYear}` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                        {formatNumber(p.configuredTarget)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                        {formatNumber(p.directAttainment)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                        {formatNumber(p.indirectAttainment)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {formatNumber(p.overallAttainment)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: p.targetMet ? '#15803d' : '#dc2626' }}>
                        {formatNumber(p.gap)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {p.targetMet ? (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10.5,
                              fontWeight: 700,
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            Met
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10.5,
                              fontWeight: 700,
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                            }}
                          >
                            Below Target
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
