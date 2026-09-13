import React, { useState } from 'react';
import { Target, Award, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Layers } from 'lucide-react';

const PO_DEFINITIONS = [
  { code: 'PO1', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics, science, and engineering fundamentals' },
  { code: 'PO2', title: 'Problem Analysis', desc: 'Identify, formulate, and analyze complex engineering problems' },
  { code: 'PO3', title: 'Design/Development of Solutions', desc: 'Design solutions for complex engineering problems and systems' },
  { code: 'PO4', title: 'Conduct Investigations', desc: 'Use research-based knowledge and methods to provide valid conclusions' },
  { code: 'PO5', title: 'Modern Tool Usage', desc: 'Create, select, and apply appropriate techniques, resources, and IT tools' },
  { code: 'PO6', title: 'The Engineer and Society', desc: 'Apply reasoning informed by contextual knowledge to assess societal issues' },
  { code: 'PO7', title: 'Environment & Sustainability', desc: 'Understand the impact of engineering solutions in societal and environmental contexts' },
  { code: 'PO8', title: 'Ethics', desc: 'Apply ethical principles and commit to professional ethics and responsibilities' },
  { code: 'PO9', title: 'Individual and Team Work', desc: 'Function effectively as an individual and as a member or leader in diverse teams' },
  { code: 'PO10', title: 'Communication', desc: 'Communicate effectively on complex engineering activities with the engineering community' },
  { code: 'PO11', title: 'Project Management & Finance', desc: 'Demonstrate knowledge and understanding of engineering and management principles' },
  { code: 'PO12', title: 'Life-long Learning', desc: 'Recognize the need for and have the ability to engage in independent and life-long learning' },
];

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
  return num > 0 ? `+${num.toFixed(2)}` : `${num.toFixed(2)}`;
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
  const [expandedPoCode, setExpandedPoCode] = useState(null);
  const [expandedPsoCode, setExpandedPsoCode] = useState(null);

  // Map incoming PO data by uppercase code
  const poDataMap = new Map();
  if (Array.isArray(poHealthData)) {
    poHealthData.forEach((item) => {
      if (item && item.poCode) {
        poDataMap.set(item.poCode.toUpperCase().trim(), item);
      }
    });
  }

  const togglePoExpand = (code) => {
    setExpandedPoCode((prev) => (prev === code ? null : code));
  };

  const togglePsoExpand = (code) => {
    setExpandedPsoCode((prev) => (prev === code ? null : code));
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Program Outcomes (PO) & Program Specific Outcomes (PSO) Intelligence
          </h3>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 18,
        }}
      >
        {/* Left Column: PO Matrix (PO1 - PO12) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', display: 'grid', placeItems: 'center' }}>
                <Target size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>Standard NBA Program Outcomes (PO1 – PO12)</strong>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '3px 8px', borderRadius: 6 }}>
              12 Outcomes
            </span>
          </div>

          {poError ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: 12.5,
                margin: '10px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} color="#dc2626" />
                <span>{poError}</span>
              </div>
              <button
                type="button"
                onClick={onRetryPo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#ffffff',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={11} />
                Retry
              </button>
            </div>
          ) : isLoadingPo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 54,
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'pulse 1.8s infinite',
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
              {PO_DEFINITIONS.map((def) => {
                const poData = poDataMap.get(def.code);
                const isEvaluated = Boolean(poData && poData.evaluatedInstanceCount > 0);
                const isExpanded = expandedPoCode === def.code;
                const hasDeficits = Boolean(poData && poData.targetDeficitCount > 0);

                return (
                  <div
                    key={def.code}
                    style={{
                      borderRadius: 10,
                      background: isExpanded ? '#f8fafc' : '#ffffff',
                      border: isExpanded ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => togglePoExpand(def.code)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          togglePoExpand(def.code);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: 42,
                            padding: '3px 6px',
                            borderRadius: 6,
                            background: '#4f46e5',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 800,
                            textAlign: 'center',
                          }}
                        >
                          {def.code}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {def.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {poData?.poStatement || def.desc}
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics Slot */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12 }}>
                        {isEvaluated ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                              {formatPercent(poData.achievementRatePercentage)}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#64748b' }}>
                              {poData.targetMetCount} / {poData.evaluatedInstanceCount} met
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>--</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Not Evaluated</div>
                          </div>
                        )}

                        {isEvaluated ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: hasDeficits ? '#fffbeb' : '#ecfdf5',
                              color: hasDeficits ? '#b45309' : '#059669',
                              border: `1px solid ${hasDeficits ? '#fde68a' : '#a7f3d0'}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {hasDeficits ? `${poData.targetDeficitCount} Deficit` : 'Target Met'}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            No Data
                          </span>
                        )}

                        <div style={{ color: '#94a3b8' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable PO Deep-Dive Detail Panel */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '10px 14px 12px',
                          background: '#f8fafc',
                          borderTop: '1px solid #e2e8f0',
                          fontSize: 11.5,
                        }}
                      >
                        <div style={{ marginBottom: 8, color: '#334155', lineHeight: 1.45 }}>
                          <strong style={{ color: '#0f172a' }}>Statement: </strong>
                          {poData?.poStatement || def.desc}
                        </div>

                        {isEvaluated ? (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                              gap: 8,
                              marginTop: 8,
                              paddingTop: 8,
                              borderTop: '1px dashed #e2e8f0',
                            }}
                          >
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Avg Attainment</div>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{formatDecimal(poData.averageAttainment)} / 3.00</div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Avg Target</div>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{formatDecimal(poData.averageTarget)} / 3.00</div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Average Gap</div>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: Number(poData.averageGap) < 0 ? '#b45309' : '#059669', marginTop: 2 }}>
                                {formatGap(poData.averageGap)}
                              </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Direct / Indirect</div>
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginTop: 2 }}>
                                {formatDecimal(poData.directAttainmentAverage)} / {formatDecimal(poData.indirectAttainmentAverage)}
                              </div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mean Divergence</div>
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginTop: 2 }}>{formatDecimal(poData.meanDivergence)}</div>
                            </div>
                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Evaluated Instances</div>
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginTop: 2 }}>{poData.evaluatedInstanceCount} Cohort Batches</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                            No finalized OBE batch reports available for this outcome under current scope.
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

        {/* Right Column: PSO Intelligence */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <Award size={16} />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>Program Specific Outcomes (PSO) Intelligence</strong>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
              {Array.isArray(psoHealthData) && psoHealthData.length > 0 ? `${psoHealthData.length} PSOs` : 'Curriculum Focus'}
            </span>
          </div>

          {psoError ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: 12.5,
                margin: '10px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} color="#dc2626" />
                <span>{psoError}</span>
              </div>
              <button
                type="button"
                onClick={onRetryPso}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#ffffff',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={11} />
                Retry
              </button>
            </div>
          ) : isLoadingPso ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 80,
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'pulse 1.8s infinite',
                  }}
                />
              ))}
            </div>
          ) : Array.isArray(psoHealthData) && psoHealthData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
              {psoHealthData.map((pso, idx) => {
                const psoKey = pso.psoCode || `PSO-${idx}`;
                const isEvaluated = Boolean(pso.evaluatedInstanceCount > 0);
                const isExpanded = expandedPsoCode === psoKey;
                const hasDeficits = Boolean(pso.targetDeficitCount > 0);

                return (
                  <div
                    key={psoKey}
                    style={{
                      borderRadius: 10,
                      background: isExpanded ? '#f0fdf4' : '#f8fafc',
                      border: isExpanded ? '1px solid #86efac' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => togglePsoExpand(psoKey)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          togglePsoExpand(psoKey);
                        }
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: 5,
                              background: '#059669',
                              color: '#ffffff',
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {pso.psoCode || 'PSO'}
                          </span>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>
                            {pso.psoCode}: Specialized Domain Outcome
                          </strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isEvaluated ? (
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                              {formatPercent(pso.achievementRatePercentage)}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>--</span>
                          )}

                          {isEvaluated ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: hasDeficits ? '#fffbeb' : '#ecfdf5',
                                color: hasDeficits ? '#b45309' : '#059669',
                                border: `1px solid ${hasDeficits ? '#fde68a' : '#a7f3d0'}`,
                              }}
                            >
                              {hasDeficits ? `${pso.targetDeficitCount} Deficit` : 'Target Met'}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: '#f1f5f9',
                                color: '#64748b',
                              }}
                            >
                              No Data
                            </span>
                          )}

                          <div style={{ color: '#94a3b8' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </div>

                      <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.45 }}>
                        {pso.psoStatement || 'Departmental curriculum specialization outcome.'}
                      </p>

                      {isEvaluated && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
                          <span>Target: {formatDecimal(pso.averageTarget)} / 3.00</span>
                          <span>Attainment: {formatDecimal(pso.averageAttainment)}</span>
                          <span style={{ fontWeight: 700, color: Number(pso.averageGap) < 0 ? '#b45309' : '#059669' }}>
                            Gap: {formatGap(pso.averageGap)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expandable PSO Deep-Dive */}
                    {isExpanded && isEvaluated && (
                      <div
                        style={{
                          padding: '10px 14px 12px',
                          background: '#ffffff',
                          borderTop: '1px solid #e2e8f0',
                          fontSize: 11.5,
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: 8,
                          }}
                        >
                          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Direct Attainment</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{formatDecimal(pso.directAttainmentAverage)}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Indirect Attainment</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{formatDecimal(pso.indirectAttainmentAverage)}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mean Divergence</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{formatDecimal(pso.meanDivergence)}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Evaluated Ratio</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{pso.targetMetCount} / {pso.evaluatedInstanceCount} Met</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 16px',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Layers size={28} color="#94a3b8" style={{ marginBottom: 8 }} />
              <strong style={{ fontSize: 13, color: '#0f172a', marginBottom: 4 }}>
                No Finalized PSO Analytics Available
              </strong>
              <p style={{ margin: 0, fontSize: 11.5, maxWidth: 320, lineHeight: 1.4 }}>
                Program Specific Outcomes are configured per Master Programme. Select a specific Programme or Batch to inspect specialized PSOs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
