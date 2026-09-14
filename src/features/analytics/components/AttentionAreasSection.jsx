import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../../api';
import {
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Circle,
  MinusCircle,
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
 * Resolves outcome-specific ATR intelligence for a given attention area item.
 * Extracts only the corrective actions and observation matching the specific outcomeCode.
 *
 * @param {Object} item AttentionAreaItemDto
 * @returns {Object} {
 *   state: 'ACTION_PLANNED' | 'NO_ACTION_PLANNED' | 'NO_ATR_RECORDED',
 *   actions: string[],
 *   observation: string | null,
 *   atrStatus: string | null,
 *   hasRecordedAtr: boolean
 * }
 */
function resolveOutcomeAtr(item) {
  if (!item) {
    return {
      state: 'NO_ATR_RECORDED',
      actions: [],
      observation: null,
      atrStatus: null,
      hasRecordedAtr: false,
    };
  }

  const targetCode = (item.outcomeCode || '').toUpperCase().trim();
  const rawAtr = item.recordedAtrObservations;
  const hasAtr = Boolean(item.hasRecordedAtr);
  const atrStatus = item.atrStatus || null;

  if (!hasAtr && !rawAtr) {
    return {
      state: 'NO_ATR_RECORDED',
      actions: [],
      observation: null,
      atrStatus: null,
      hasRecordedAtr: false,
    };
  }

  let matchedRecord = null;

  if (rawAtr) {
    if (typeof rawAtr === 'object') {
      matchedRecord = extractOutcomeFromObject(rawAtr, targetCode);
    } else if (typeof rawAtr === 'string' && rawAtr.trim()) {
      const trimmed = rawAtr.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          matchedRecord = extractOutcomeFromObject(parsed, targetCode);
        } catch {
          // If JSON parse fails, treated as plain text observation
          matchedRecord = { observation: trimmed, actions: [] };
        }
      } else {
        matchedRecord = { observation: trimmed, actions: [] };
      }
    }
  }

  // If no matching outcome record was found in the ATR payload and hasAtr is false
  if (!matchedRecord && !hasAtr) {
    return {
      state: 'NO_ATR_RECORDED',
      actions: [],
      observation: null,
      atrStatus: null,
      hasRecordedAtr: false,
    };
  }

  // Clean and filter actions
  let rawActions = [];
  if (Array.isArray(matchedRecord?.actions)) {
    rawActions = matchedRecord.actions;
  } else if (typeof matchedRecord?.action === 'string' && matchedRecord.action.trim()) {
    rawActions = [matchedRecord.action];
  } else if (typeof matchedRecord?.actions === 'string' && matchedRecord.actions.trim()) {
    rawActions = [matchedRecord.actions];
  }

  const cleanActions = rawActions
    .map((act) => {
      if (typeof act === 'string') return act.trim();
      if (typeof act === 'object' && act !== null) {
        return (act.action || act.text || act.statement || JSON.stringify(act)).trim();
      }
      return String(act || '').trim();
    })
    .filter((act) => Boolean(act && act.length > 0));

  // Extract observation
  let observation = null;
  if (matchedRecord?.observation && typeof matchedRecord.observation === 'string' && matchedRecord.observation.trim()) {
    observation = matchedRecord.observation.trim();
  } else if (matchedRecord?.remark && typeof matchedRecord.remark === 'string' && matchedRecord.remark.trim()) {
    observation = matchedRecord.remark.trim();
  } else if (matchedRecord?.observations && typeof matchedRecord.observations === 'string' && matchedRecord.observations.trim()) {
    observation = matchedRecord.observations.trim();
  }

  if (cleanActions.length > 0) {
    return {
      state: 'ACTION_PLANNED',
      actions: cleanActions,
      observation,
      atrStatus: atrStatus || matchedRecord?.status || 'RECORDED',
      hasRecordedAtr: true,
    };
  }

  // If ATR exists for this batch/outcome, but actions are empty
  if (hasAtr || matchedRecord) {
    return {
      state: 'NO_ACTION_PLANNED',
      actions: [],
      observation,
      atrStatus: atrStatus || matchedRecord?.status || 'RECORDED',
      hasRecordedAtr: true,
    };
  }

  return {
    state: 'NO_ATR_RECORDED',
    actions: [],
    observation: null,
    atrStatus: null,
    hasRecordedAtr: false,
  };
}

function extractOutcomeFromObject(obj, targetCode) {
  if (!obj || typeof obj !== 'object') return null;

  // Case 1: Array of outcome items
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (!item || typeof item !== 'object') continue;
      const code = (item.outcomeCode || item.code || item.poCode || item.psoCode || '').toUpperCase().trim();
      if (code === targetCode) {
        return item;
      }
    }
    return null;
  }

  // Case 2: Object with poOutcomes and psoOutcomes arrays
  const allOutcomes = [
    ...(Array.isArray(obj.poOutcomes) ? obj.poOutcomes : []),
    ...(Array.isArray(obj.psoOutcomes) ? obj.psoOutcomes : []),
    ...(Array.isArray(obj.outcomes) ? obj.outcomes : []),
    ...(Array.isArray(obj.items) ? obj.items : []),
  ];

  for (const item of allOutcomes) {
    if (!item || typeof item !== 'object') continue;
    const code = (item.outcomeCode || item.code || item.poCode || item.psoCode || '').toUpperCase().trim();
    if (code === targetCode) {
      return item;
    }
  }

  // Case 3: Keyed by outcome code { "PO1": { ... }, "PO2": { ... } }
  if (obj[targetCode] && typeof obj[targetCode] === 'object') {
    return obj[targetCode];
  }

  // Case 4: Top-level outcome matching target code
  const topCode = (obj.outcomeCode || obj.code || obj.poCode || obj.psoCode || '').toUpperCase().trim();
  if (topCode === targetCode) {
    return obj;
  }

  return null;
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
            const atr = resolveOutcomeAtr(item);

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
                      marginBottom: 12,
                    }}
                  >
                    {/* Left: Outcome Identification & Context (No statements rendered here) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 12.5,
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
                          {item.programmeName} {item.programmeCode ? `(${item.programmeCode})` : ''} • {item.batchName}
                        </span>
                      </div>
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
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ATR Workflow Status</div>
                      <div style={{ marginTop: 2 }}>
                        {atr.atrStatus ? (
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
                            {atr.atrStatus.replace(/_/g, ' ')}
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

                  {/* Structured Outcome-Specific Corrective Action & Intelligence Section */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Corrective Action
                      </span>

                      {/* State Badge */}
                      {atr.state === 'ACTION_PLANNED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#047857', fontWeight: 700, fontSize: 11.5 }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>✓ Action Planned</span>
                        </div>
                      )}
                      {atr.state === 'NO_ACTION_PLANNED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontWeight: 700, fontSize: 11.5 }}>
                          <Circle size={14} color="#94a3b8" />
                          <span>○ No Action Planned</span>
                        </div>
                      )}
                      {atr.state === 'NO_ATR_RECORDED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontWeight: 700, fontSize: 11.5 }}>
                          <MinusCircle size={14} color="#94a3b8" />
                          <span>— No ATR Recorded</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Content */}
                    {atr.state === 'ACTION_PLANNED' && (
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: '#334155', fontSize: 12, lineHeight: 1.5 }}>
                        {atr.actions.map((actionText, actIdx) => (
                          <li key={actIdx} style={{ marginBottom: 4 }}>
                            {actionText}
                          </li>
                        ))}
                      </ul>
                    )}

                    {atr.state === 'NO_ACTION_PLANNED' && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>
                        No corrective action has been recorded for this outcome.
                      </p>
                    )}

                    {atr.state === 'NO_ATR_RECORDED' && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>
                        No ATR record is currently associated with this deficit.
                      </p>
                    )}

                    {/* Recorded Observation (Only if meaningful text exists for this outcome) */}
                    {atr.observation && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 10px',
                          borderRadius: 6,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: 11.5,
                          color: '#475569',
                          lineHeight: 1.45,
                        }}
                      >
                        <strong style={{ color: '#0f172a' }}>Recorded Observation: </strong>
                        <span>{atr.observation}</span>
                      </div>
                    )}
                  </div>

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
