import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  Layers,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Scale
} from 'lucide-react';

const sortOutcomeCodes = (a, b) => {
  const matchA = (a || '').match(/^([A-Za-z]+)(\d+)$/);
  const matchB = (b || '').match(/^([A-Za-z]+)(\d+)$/);
  if (matchA && matchB && matchA[1].toUpperCase() === matchB[1].toUpperCase()) {
    return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
  }
  return (a || '').localeCompare(b || '', undefined, { numeric: true, sensitivity: 'base' });
};

const formatPercent = (val) => {
  if (val === null || val === undefined) return '--';
  const num = Number(val);
  if (isNaN(num)) return '--';
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
};

const formatDecimal = (val, decimals = 2) => {
  if (val === null || val === undefined) return '--';
  const num = Number(val);
  if (isNaN(num)) return '--';
  return num.toFixed(decimals);
};

const formatGap = (gap) => {
  if (gap === null || gap === undefined) return '--';
  const num = Number(gap);
  if (isNaN(num)) return '--';
  if (num > 0) return `+${num.toFixed(2)}`;
  if (num === 0) return '0.00';
  return num.toFixed(2);
};

export default function PoPsoIntelligenceSection({
  poHealthData = [],
  psoHealthData = [],
  isLoadingPo = false,
  isLoadingPso = false,
  poError = null,
  psoError = null,
  onRetryPo = () => {},
  onRetryPso = () => {},
}) {
  const [activeTab, setActiveTab] = useState('PO'); // 'PO' | 'PSO'
  const [selectedOutcome, setSelectedOutcome] = useState(null); // { type: 'PO'|'PSO', code: string, data: object }

  // Dynamically resolve all PO codes across all batches (minimum 12, or higher if batch contains PO13, PO14, PO15, etc.)
  const poList = useMemo(() => {
    const map = new Map();
    if (Array.isArray(poHealthData)) {
      poHealthData.forEach((item) => {
        if (item && item.poCode) {
          map.set(item.poCode.toUpperCase().trim(), item);
        }
      });
    }

    let maxPoIndex = 12; // Standard NBA baseline
    map.forEach((_, code) => {
      const match = code.match(/^PO(\d+)$/i);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx > maxPoIndex) {
          maxPoIndex = idx;
        }
      }
    });

    const codes = [];
    for (let i = 1; i <= maxPoIndex; i++) {
      codes.push(`PO${i}`);
    }
    map.forEach((_, code) => {
      if (!codes.includes(code)) {
        codes.push(code);
      }
    });

    codes.sort(sortOutcomeCodes);

    return codes.map((code) => ({
      code,
      data: map.get(code) || null,
    }));
  }, [poHealthData]);

  // Dynamically resolve all PSO codes, naturally sorted
  const psoList = useMemo(() => {
    if (!Array.isArray(psoHealthData)) return [];
    const valid = psoHealthData.filter(Boolean);
    return [...valid].sort((a, b) => sortOutcomeCodes(a.psoCode, b.psoCode));
  }, [psoHealthData]);

  // Close detail drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedOutcome(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTileClick = (type, code, data) => {
    setSelectedOutcome({ type, code, data });
  };

  const handleCloseDrawer = () => {
    setSelectedOutcome(null);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Main Container Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 22px',
          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Header with Title and Segmented Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: activeTab === 'PO' ? '#eef2ff' : '#ecfdf5',
                color: activeTab === 'PO' ? '#4f46e5' : '#059669',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {activeTab === 'PO' ? <Target size={18} /> : <Award size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: '#0f172a' }}>
                Outcome Intelligence
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                {activeTab === 'PO'
                  ? `Standard & Extended Program Outcomes (PO1–PO${poList.length}) analytical attainment performance`
                  : `Curriculum Program Specific Outcomes (${psoList.length} PSOs) specialized performance`}
              </p>
            </div>
          </div>

          {/* Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
            role="tablist"
            aria-label="Outcome Type Selection"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'PO'}
              onClick={() => setActiveTab('PO')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: activeTab === 'PO' ? 700 : 500,
                color: activeTab === 'PO' ? '#4f46e5' : '#64748b',
                background: activeTab === 'PO' ? '#ffffff' : 'transparent',
                border: 'none',
                boxShadow: activeTab === 'PO' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Target size={14} />
              <span>Program Outcomes</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: activeTab === 'PO' ? '#eef2ff' : '#e2e8f0',
                  color: activeTab === 'PO' ? '#4f46e5' : '#64748b',
                }}
              >
                {poList.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'PSO'}
              onClick={() => setActiveTab('PSO')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: activeTab === 'PSO' ? 700 : 500,
                color: activeTab === 'PSO' ? '#059669' : '#64748b',
                background: activeTab === 'PSO' ? '#ffffff' : 'transparent',
                border: 'none',
                boxShadow: activeTab === 'PSO' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Award size={14} />
              <span>Program Specific (PSO)</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: activeTab === 'PSO' ? '#ecfdf5' : '#e2e8f0',
                  color: activeTab === 'PSO' ? '#059669' : '#64748b',
                }}
              >
                {psoList.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: PROGRAM OUTCOMES (PO1 - POn) */}
        {activeTab === 'PO' && (
          <div>
            {poError ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <span>{poError}</span>
                </div>
                <button
                  type="button"
                  onClick={onRetryPo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : isLoadingPo ? (
              /* Loading Skeleton: Grid */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12,
                }}
              >
                {[...Array(poList.length || 12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 140,
                      borderRadius: 10,
                      background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'pulse 1.8s infinite',
                      border: '1px solid #f1f5f9',
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Scannable Responsive Grid for POs */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: 12,
                }}
              >
                {poList.map(({ code, data: poData }) => {
                  const isEvaluated = Boolean(poData && poData.evaluatedInstanceCount > 0);
                  const hasDeficits = Boolean(poData && poData.targetDeficitCount > 0);
                  const isTargetMet = Boolean(isEvaluated && !hasDeficits);

                  const attainmentNum = isEvaluated && poData.averageAttainment !== null && poData.averageAttainment !== undefined
                    ? formatDecimal(poData.averageAttainment)
                    : '--';
                  const targetNum = isEvaluated && poData.averageTarget !== null && poData.averageTarget !== undefined
                    ? formatDecimal(poData.averageTarget)
                    : '--';
                  const gapFormatted = isEvaluated ? formatGap(poData.averageGap) : '--';
                  const isGapPositive = isEvaluated && Number(poData?.averageGap) >= 0;

                  return (
                    <div
                      key={code}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleTileClick('PO', code, poData)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTileClick('PO', code, poData);
                        }
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                        minHeight: 136,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.02)';
                      }}
                    >
                      {/* Level 1: Outcome Code & Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {code}
                        </span>

                        {isEvaluated ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: isTargetMet ? '#ecfdf5' : '#fffbeb',
                              color: isTargetMet ? '#065f46' : '#92400e',
                              border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fde68a'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            {isTargetMet ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                            {isTargetMet ? 'Target Met' : 'Below Target'}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#f1f5f9',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            Not Evaluated
                          </span>
                        )}
                      </div>

                      {/* Level 2: Attainment (Dominant Value) */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: isEvaluated ? '#0f172a' : '#94a3b8',
                              lineHeight: 1.1,
                            }}
                          >
                            {attainmentNum}
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b' }}>
                            / 3.00
                          </span>
                        </div>
                      </div>

                      {/* Level 3: Target & Gap */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          paddingTop: 6,
                          borderTop: '1px solid #f1f5f9',
                          color: '#475569',
                        }}
                      >
                        <span style={{ color: '#64748b' }}>
                          Target: <strong style={{ color: '#334155' }}>{targetNum}</strong>
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isEvaluated
                              ? isGapPositive
                                ? '#059669'
                                : '#b45309'
                              : '#94a3b8',
                          }}
                        >
                          Gap {gapFormatted}
                        </span>
                      </div>

                      {/* Level 4: Compliance Context / Evaluated Ratio Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          color: '#64748b',
                          marginTop: 4,
                        }}
                      >
                        {isEvaluated ? (
                          <span>
                            {poData.targetMetCount} / {poData.evaluatedInstanceCount} met ({formatPercent(poData.achievementRatePercentage)})
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No batch data</span>
                        )}
                        <ArrowRight size={11} color="#94a3b8" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROGRAM SPECIFIC OUTCOMES (PSO) */}
        {activeTab === 'PSO' && (
          <div>
            {psoError ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <span>{psoError}</span>
                </div>
                <button
                  type="button"
                  onClick={onRetryPso}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ) : isLoadingPso ? (
              /* Loading Skeleton: Grid */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 140,
                      borderRadius: 10,
                      background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'pulse 1.8s infinite',
                      border: '1px solid #f1f5f9',
                    }}
                  />
                ))}
              </div>
            ) : psoList.length > 0 ? (
              /* Scannable Responsive Grid for PSOs matching PO visual language */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: 12,
                }}
              >
                {psoList.map((pso, idx) => {
                  const code = pso.psoCode || `PSO${idx + 1}`;
                  const isEvaluated = Boolean(pso && pso.evaluatedInstanceCount > 0);
                  const hasDeficits = Boolean(pso && pso.targetDeficitCount > 0);
                  const isTargetMet = Boolean(isEvaluated && !hasDeficits);

                  const attainmentNum = isEvaluated && pso.averageAttainment !== null && pso.averageAttainment !== undefined
                    ? formatDecimal(pso.averageAttainment)
                    : '--';
                  const targetNum = isEvaluated && pso.averageTarget !== null && pso.averageTarget !== undefined
                    ? formatDecimal(pso.averageTarget)
                    : '--';
                  const gapFormatted = isEvaluated ? formatGap(pso.averageGap) : '--';
                  const isGapPositive = isEvaluated && Number(pso?.averageGap) >= 0;

                  return (
                    <div
                      key={code}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleTileClick('PSO', code, pso)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTileClick('PSO', code, pso);
                        }
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                        minHeight: 136,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.02)';
                      }}
                    >
                      {/* Level 1: Outcome Code & Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {code}
                        </span>

                        {isEvaluated ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: isTargetMet ? '#ecfdf5' : '#fffbeb',
                              color: isTargetMet ? '#065f46' : '#92400e',
                              border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fde68a'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            {isTargetMet ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                            {isTargetMet ? 'Target Met' : 'Below Target'}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#f1f5f9',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            Not Evaluated
                          </span>
                        )}
                      </div>

                      {/* Level 2: Attainment (Dominant Value) */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: isEvaluated ? '#0f172a' : '#94a3b8',
                              lineHeight: 1.1,
                            }}
                          >
                            {attainmentNum}
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b' }}>
                            / 3.00
                          </span>
                        </div>
                      </div>

                      {/* Level 3: Target & Gap */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          paddingTop: 6,
                          borderTop: '1px solid #f1f5f9',
                          color: '#475569',
                        }}
                      >
                        <span style={{ color: '#64748b' }}>
                          Target: <strong style={{ color: '#334155' }}>{targetNum}</strong>
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isEvaluated
                              ? isGapPositive
                                ? '#059669'
                                : '#b45309'
                              : '#94a3b8',
                          }}
                        >
                          Gap {gapFormatted}
                        </span>
                      </div>

                      {/* Level 4: Compliance Context / Evaluated Ratio Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          color: '#64748b',
                          marginTop: 4,
                        }}
                      >
                        {isEvaluated ? (
                          <span>
                            {pso.targetMetCount} / {pso.evaluatedInstanceCount} met ({formatPercent(pso.achievementRatePercentage)})
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No batch data</span>
                        )}
                        <ArrowRight size={11} color="#94a3b8" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty PSO State */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Layers size={28} color="#94a3b8" style={{ marginBottom: 8 }} />
                <strong style={{ fontSize: 13.5, color: '#0f172a', marginBottom: 4 }}>
                  No Program Specific Outcomes for Current Scope
                </strong>
                <p style={{ margin: 0, fontSize: 12, maxWidth: 360, lineHeight: 1.45, color: '#64748b' }}>
                  PSOs are configured per Master Programme. Select a specific Programme or Batch from the filter bar above to analyze specialized curriculum outcomes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL SLIDE-OVER DRAWER FOR DEEP-DIVE (PRESERVES ALL DETAILED DATA) */}
      {selectedOutcome && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1050,
          }}
          onClick={handleCloseDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="outcome-detail-title"
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 500,
              height: '100%',
              boxShadow: '-8px 0 25px rgba(15, 23, 42, 0.15)',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: selectedOutcome.type === 'PO' ? '#4f46e5' : '#059669',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {selectedOutcome.code}
                </span>
                <div>
                  <h4
                    id="outcome-detail-title"
                    style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}
                  >
                    {selectedOutcome.type === 'PO' ? 'Program Outcome' : 'Program Specific Outcome'} Deep Dive
                  </h4>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                    Authoritative Institutional Analytics Breakdown
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                aria-label="Close details"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {selectedOutcome.data && selectedOutcome.data.evaluatedInstanceCount > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Performance Summary Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 10,
                    }}
                  >
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Avg Attainment</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                        {formatDecimal(selectedOutcome.data.averageAttainment)} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>/ 3.00</span>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Avg Target</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                        {formatDecimal(selectedOutcome.data.averageTarget)} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>/ 3.00</span>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Average Gap</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: Number(selectedOutcome.data.averageGap) < 0 ? '#b45309' : '#059669',
                          marginTop: 4,
                        }}
                      >
                        {formatGap(selectedOutcome.data.averageGap)}
                      </div>
                    </div>
                  </div>

                  {/* Attainment Assessment Breakdown (Direct vs Indirect vs Divergence) */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '12px 14px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BarChart3 size={14} color="#4f46e5" />
                      <span>Assessment Components Breakdown</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 6 }}>
                        <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Direct Attainment</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                          {formatDecimal(selectedOutcome.data.directAttainmentAverage)}
                        </div>
                      </div>

                      <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 6 }}>
                        <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Indirect Attainment</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                          {formatDecimal(selectedOutcome.data.indirectAttainmentAverage)}
                        </div>
                      </div>

                      <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 6 }}>
                        <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Mean Divergence</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                          {formatDecimal(selectedOutcome.data.meanDivergence)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Institutional Cohort Compliance */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '12px 14px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scale size={14} color="#059669" />
                      <span>Target Compliance & Scope Evaluation</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#334155', padding: '6px 0' }}>
                      <span style={{ color: '#64748b' }}>Achievement Rate:</span>
                      <strong style={{ color: '#0f172a' }}>{formatPercent(selectedOutcome.data.achievementRatePercentage)}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#334155', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Cohorts Meeting Target:</span>
                      <strong style={{ color: '#059669' }}>{selectedOutcome.data.targetMetCount} Cohorts</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#334155', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Cohorts with Deficit:</span>
                      <strong style={{ color: selectedOutcome.data.targetDeficitCount > 0 ? '#b45309' : '#059669' }}>
                        {selectedOutcome.data.targetDeficitCount} Cohorts
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#334155', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Total Evaluated Instances:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedOutcome.data.evaluatedInstanceCount} Evaluated Batches</strong>
                    </div>

                    {selectedOutcome.data.applicableCohortCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#334155', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Total Applicable Cohorts:</span>
                        <strong style={{ color: '#0f172a' }}>{selectedOutcome.data.applicableCohortCount} Total Cohorts</strong>
                      </div>
                    )}
                  </div>

                  {/* Statement Reference (Unambiguous context in deep dive if present in DTO) */}
                  {(selectedOutcome.data.poStatement || selectedOutcome.data.psoStatement) && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: 11.5,
                        color: '#475569',
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>Context Statement Reference: </strong>
                      <span>{selectedOutcome.data.poStatement || selectedOutcome.data.psoStatement}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    No Batch Evaluation Data Available
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>
                    There are no finalized or in-progress OBE batch assessments for {selectedOutcome.code} under the currently selected institutional scope.
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={handleCloseDrawer}
                style={{
                  padding: '7px 18px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: 12.5,
                  fontWeight: 600,
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
