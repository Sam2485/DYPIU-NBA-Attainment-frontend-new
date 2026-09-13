import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../../api';
import {
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
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

/**
 * Safely format numerical values to 2 decimal places.
 */
function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(2);
}

/**
 * Safely parse ATR observation content (which may be JSON or plain string).
 */
function renderAtrObservation(rawObservation) {
  if (!rawObservation || typeof rawObservation !== 'string' || !rawObservation.trim()) {
    return 'No specific ATR observation notes recorded.';
  }

  const trimmed = rawObservation.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return item.observation || item.action || item.statement || JSON.stringify(item);
          }
          return String(item);
        }).join('; ');
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.observation || parsed.action || parsed.comment || parsed.summary || trimmed;
      }
    } catch {
      // Fallback to direct string if parse fails
    }
  }

  return trimmed;
}

export default function AttentionAreasSection({
  selectedSchoolId = null,
  selectedDepartmentId = null,
  selectedMasterProgrammeId = null,
  selectedProgrammeBatchId = null,
}) {
  const [items, setItems] = useState([]);
  const [outcomeType, setOutcomeType] = useState('ALL'); // 'ALL' | 'PO' | 'PSO'
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItemIds, setExpandedItemIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const loadAttentionAreas = useCallback(async () => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    const params = {
      limit,
      outcomeType,
    };
    if (selectedSchoolId) params.schoolId = selectedSchoolId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMasterProgrammeId) params.masterProgrammeId = selectedMasterProgrammeId;
    if (selectedProgrammeBatchId) params.programmeBatchId = selectedProgrammeBatchId;

    try {
      const res = await analyticsApi.getAttentionAreas(params);
      if (!isCurrent) return;
      const data = res?.data?.data ?? res?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!isCurrent) return;
      console.error('Failed to load attention areas:', err);
      setError('Unable to load attention areas. Please try again.');
    } finally {
      if (isCurrent) {
        setIsLoading(false);
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [selectedSchoolId, selectedDepartmentId, selectedMasterProgrammeId, selectedProgrammeBatchId, limit, outcomeType]);

  useEffect(() => {
    loadAttentionAreas();
  }, [loadAttentionAreas]);

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
              background: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={18} color="#b45309" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Prioritized Attention Areas & Deficit Diagnostics
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Observed outcome target deficits requiring quality review and evidence investigation
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Outcome Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Filter:</span>
            <select
              value={outcomeType}
              onChange={(e) => setOutcomeType(e.target.value)}
              style={selectStyle}
              aria-label="Filter outcome type"
            >
              <option value="ALL">All Outcomes</option>
              <option value="PO">POs Only</option>
              <option value="PSO">PSOs Only</option>
            </select>
          </div>

          {/* Limit Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Top:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={selectStyle}
              aria-label="Items limit"
            >
              <option value={5}>Top 5 Deficits</option>
              <option value={10}>Top 10 Deficits</option>
              <option value={20}>Top 20 Deficits</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadAttentionAreas}
            disabled={isLoading}
            title="Refresh Attention Areas"
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
            onClick={loadAttentionAreas}
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

      {/* 3. Loading State (Skeleton Cards) */}
      {isLoading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 140, height: 20, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ width: 90, height: 20, background: '#e2e8f0', borderRadius: 6 }} />
              </div>
              <div style={{ width: '70%', height: 16, background: '#f1f5f9', borderRadius: 4, marginBottom: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[1, 2, 3, 4].map((col) => (
                  <div key={col} style={{ height: 48, background: '#f8fafc', borderRadius: 8 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Empty State (No observed gaps) */}
      {!isLoading && !error && items.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
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
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <CheckCircle2 size={22} color="#16a34a" />
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            No Observed Target Deficits
          </h4>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', maxWidth: 460, marginInline: 'auto' }}>
            No PO/PSO outcomes are currently below their applicable configured targets for the active scope.
          </p>
        </div>
      )}

      {/* 5. Real Attention Area Investigation Cards */}
      {!isLoading && !error && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, index) => {
            const isPo = item.outcomeType === 'PO';
            const itemId = item.id || `${item.programmeBatchId}_${item.outcomeCode}_${index}`;
            const isExpanded = expandedItemIds.has(itemId);
            const evidenceCount = item.contributingCourseEvidence?.length ?? 0;

            return (
              <div
                key={itemId}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Main Card Header & Metrics */}
                <div style={{ padding: '16px 20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {/* Left: Outcome Identification & Context */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: '0.02em',
                            background: isPo ? '#eff6ff' : '#f5f3ff',
                            color: isPo ? '#1d4ed8' : '#6d28d9',
                            border: `1px solid ${isPo ? '#bfdbfe' : '#ddd6fe'}`,
                          }}
                        >
                          {item.outcomeCode}
                        </span>
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {item.outcomeType === 'PO' ? 'Programme Outcome' : 'Programme Specific Outcome'}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                          {item.programmeName} ({item.programmeCode}) • {item.batchName}
                        </span>
                      </div>

                      {/* Outcome Statement */}
                      {item.outcomeStatement && (
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: 12.5,
                            color: '#334155',
                            lineHeight: 1.45,
                          }}
                        >
                          {item.outcomeStatement}
                        </p>
                      )}
                    </div>

                    {/* Right: Observed Gap Pill */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          fontSize: 12.5,
                          fontWeight: 800,
                        }}
                      >
                        <span>Observed Gap:</span>
                        <span>{formatNumber(item.gap)}</span>
                      </div>
                      {item.departmentName && (
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          {item.departmentName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Comparison Bar */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 10,
                      marginTop: 14,
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Configured Target</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        {formatNumber(item.configuredTarget)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Attained Value</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#b45309', marginTop: 2 }}>
                        {formatNumber(item.attainedValue)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Achievement Rate</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginTop: 2 }}>
                        {item.achievementPercentage != null ? `${formatNumber(item.achievementPercentage)}%` : '—'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ATR Governance</div>
                      <div style={{ marginTop: 2 }}>
                        {item.hasRecordedAtr ? (
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.atrStatus || 'Recorded'}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            No ATR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recorded ATR Observation Snippet */}
                  {item.hasRecordedAtr && item.recordedAtrObservations && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#fdf8f6',
                        border: '1px solid #fed7aa',
                        fontSize: 12,
                        color: '#7c2d12',
                        lineHeight: 1.45,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, marginBottom: 3 }}>
                        <FileText size={13} color="#ea580c" />
                        <span>Recorded ATR Observation:</span>
                      </div>
                      <div>{renderAtrObservation(item.recordedAtrObservations)}</div>
                    </div>
                  )}

                  {/* Evidence Chain Expand / Collapse Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={14} color="#64748b" />
                      <span>
                        Associated course/CO evidence: <strong>{evidenceCount} mapped course{evidenceCount === 1 ? '' : 's'}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(itemId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Associated Evidence' : 'Inspect Evidence Chain'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* 6. Expandable Associated Course/CO Evidence Chain */}
                {isExpanded && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderTop: '1px solid #e2e8f0',
                      padding: '16px 20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 12,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      <Layers size={14} color="#0f172a" />
                      <span>Associated Course-Level Outcome Evidence</span>
                    </div>

                    {evidenceCount === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                        No course-level mapping evidence records were returned for this cohort snapshot.
                      </p>
                    ) : (
                      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                              <th style={{ padding: '8px 12px' }}>Course</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Sem</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>CO</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Mapping Strength</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>CO Target</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Direct</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Indirect</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Overall</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Target Met</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.contributingCourseEvidence.map((ev, evIdx) => (
                              <tr
                                key={ev.courseOfferingId || ev.masterCourseId || `${ev.courseCode}_${ev.coCode}_${evIdx}`}
                                style={{
                                  borderBottom: evIdx === evidenceCount - 1 ? 'none' : '1px solid #f1f5f9',
                                }}
                              >
                                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                                  <div>{ev.courseName || ev.courseCode}</div>
                                  <div style={{ fontSize: 11, color: '#64748b' }}>
                                    {ev.courseCode} {ev.courseCoordinatorName ? `• ${ev.courseCoordinatorName}` : ''}
                                  </div>
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center', color: '#475569' }}>
                                  {ev.semester != null ? `Sem ${ev.semester}` : '—'}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                                  {ev.coCode || '—'}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {ev.mappingStrength != null ? (
                                    <span
                                      style={{
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        background: '#f1f5f9',
                                        color: '#334155',
                                      }}
                                    >
                                      Level {ev.mappingStrength}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                                  {formatNumber(ev.coTarget)}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                                  {formatNumber(ev.coDirectAttainment)}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                                  {formatNumber(ev.coIndirectAttainment)}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                  {formatNumber(ev.coOverallAttainment)}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {ev.coTargetMet === true ? (
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
                                  ) : ev.coTargetMet === false ? (
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
                                      Not Met
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

