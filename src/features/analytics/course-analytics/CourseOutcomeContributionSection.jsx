import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

function OutcomeContributionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  const isPo = item.outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
        {item.outcomeCode} ({item.outcomeType})
      </div>
      {item.outcomeStatement && (
        <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>
          {item.outcomeStatement}
        </div>
      )}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Course Contribution:</span>
          <strong style={{ color: themeColor }}>{formatVal(item.contribution)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Mapping Strength:</span>
          <strong style={{ color: '#0f172a' }}>{formatVal(item.mappingStrength, 1)} / 3.0</strong>
        </div>
        {item.target != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Batch Target:</span>
            <strong style={{ color: '#475569' }}>{formatVal(item.target)} / 3.00</strong>
          </div>
        )}
        {item.targetMet != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Status:</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: item.targetMet ? '#15803d' : '#b91c1c',
              }}
            >
              {item.targetMet ? 'Target Met' : 'Target Not Met'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseOutcomeContributionSection({
  outcomeScope = 'SELECTED',
  selectedOutcome = null,
  outcomes = [],
  poContributions = [],
  psoContributions = [],
  overallCourseAttainment,
  onSelectOutcome,
}) {
  // If 'SELECTED' scope is requested, render the dedicated deep inspection card
  if (outcomeScope === 'SELECTED') {
    if (!selectedOutcome) {
      return (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '32px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            No specific PO or PSO selected. Use the dropdown above to choose a Programme Outcome to inspect.
          </p>
        </div>
      );
    }

    const isPo = selectedOutcome.outcomeType === 'PO';
    const themeColor = isPo ? PO_COLOR : PSO_COLOR;
    const isTargetMet = selectedOutcome.targetMet === true;

    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          marginBottom: 24,
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: themeColor,
                display: 'inline-block',
              }}
            />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Contribution to {selectedOutcome.outcomeCode}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: isPo ? '#f0f9ff' : '#f0fdf4',
                color: themeColor,
                border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
              }}
            >
              {isPo ? 'Programme Outcome (PO)' : 'Programme Specific Outcome (PSO)'}
            </span>
          </div>
        </div>

        {/* Selected Outcome Statement */}
        {selectedOutcome.outcomeStatement && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              color: '#334155',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            <strong style={{ color: '#0f172a' }}>{selectedOutcome.outcomeCode}:</strong>{' '}
            {selectedOutcome.outcomeStatement}
          </div>
        )}

        {/* Metric Inspection Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {/* 1. Contribution to Outcome */}
          <div
            style={{
              background: isPo ? '#f0f9ff' : '#f0fdf4',
              border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 800, color: themeColor, textTransform: 'uppercase' }}>
              Course Contribution
            </span>
            <div style={{ margin: '8px 0 4px' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: themeColor }}>
                {formatVal(selectedOutcome.contribution)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 4 }}>/ 3.00</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Weighted share in {selectedOutcome.outcomeCode}
            </span>
          </div>

          {/* 2. Mapping Strength */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Mapping Strength
            </span>
            <div style={{ margin: '8px 0 4px' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
                {formatVal(selectedOutcome.mappingStrength, 1)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 4 }}>/ 3.0</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Average CO correlation strength
            </span>
          </div>

          {/* 3. Overall Course Attainment */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Overall Course Attainment
            </span>
            <div style={{ margin: '8px 0 4px' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
                {formatVal(selectedOutcome.overallCourseAttainment || overallCourseAttainment)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 4 }}>/ 3.00</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              80% Direct + 20% Indirect
            </span>
          </div>

          {/* 4. Batch Outcome Target & Status */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Batch Target
              </span>
              {selectedOutcome.targetMet != null && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: isTargetMet ? '#ecfdf5' : '#fef2f2',
                    color: isTargetMet ? '#059669' : '#dc2626',
                    border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fecaca'}`,
                  }}
                >
                  {isTargetMet ? 'Target Met' : 'Target Not Met'}
                </span>
              )}
            </div>
            <div style={{ margin: '8px 0 4px' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
                {formatVal(selectedOutcome.target)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 4 }}>/ 3.00</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Overall programme batch target
            </span>
          </div>
        </div>

        {/* Calculation Note */}
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 11.5,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={14} color={themeColor} />
          <span>
            <strong>Authoritative Formula:</strong> Course Contribution = (Mapping Strength × Overall Course Attainment) / 3.00
          </span>
        </div>
      </div>
    );
  }

  // Otherwise: 'ALL' | 'PO' | 'PSO' scope
  let activeList = [];
  if (outcomeScope === 'PO') {
    activeList = poContributions && poContributions.length > 0 ? poContributions : outcomes.filter((o) => o.outcomeType === 'PO');
  } else if (outcomeScope === 'PSO') {
    activeList = psoContributions && psoContributions.length > 0 ? psoContributions : outcomes.filter((o) => o.outcomeType === 'PSO');
  } else {
    // ALL
    activeList = outcomes && outcomes.length > 0 ? outcomes : [...(poContributions || []), ...(psoContributions || [])];
  }

  // Only keep mapped outcomes (mappingStrength > 0 or mapped === true)
  const mappedList = activeList.filter((item) => {
    if (item.mapped === false) return false;
    if (item.mappingStrength != null && Number(item.mappingStrength) <= 0) return false;
    return true;
  });

  const chartData = mappedList.map((item) => ({
    outcomeCode: item.outcomeCode,
    outcomeType: item.outcomeType || (item.outcomeCode.startsWith('PSO') ? 'PSO' : 'PO'),
    outcomeStatement: item.outcomeStatement,
    contribution: Number(item.contribution != null ? item.contribution : 0),
    mappingStrength: Number(item.mappingStrength != null ? item.mappingStrength : 0),
    target: item.target != null ? Number(item.target) : null,
    targetMet: item.targetMet,
  }));

  const dynamicWidth = Math.max(500, chartData.length * 52);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: '#0284c7',
                display: 'inline-block',
              }}
            />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Mapped Outcome Contributions ({outcomeScope === 'PO' ? 'All POs' : outcomeScope === 'PSO' ? 'All PSOs' : 'All POs & PSOs'})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Course contribution across all mapped Programme Outcomes and Programme Specific Outcomes.
          </span>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
          Y-Axis: Contribution (0.00 – 3.00)
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          No mapped outcomes found for scope &quot;{outcomeScope}&quot;.
        </div>
      ) : (
        <>
          {/* Vertical Bar Chart (Recharts) */}
          <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 8 }}>
            <div style={{ minWidth: dynamicWidth, height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -20, bottom: 25 }}
                  onClick={(state) => {
                    if (state?.activePayload?.[0]?.payload && onSelectOutcome) {
                      const p = state.activePayload[0].payload;
                      onSelectOutcome(p.outcomeCode, p.outcomeType);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="outcomeCode"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 3.0]}
                    ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<OutcomeContributionTooltip />} />
                  <Bar
                    dataKey="contribution"
                    name="Contribution"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  >
                    {chartData.map((entry) => {
                      const color = entry.outcomeType === 'PO' ? PO_COLOR : PSO_COLOR;
                      return (
                        <Cell
                          key={`outcome-cell-${entry.outcomeCode}`}
                          fill={color}
                          cursor="pointer"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mapped Outcomes Table */}
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Outcome</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Type</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Mapping Strength</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Contribution</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Batch Target</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => {
                  const isPo = row.outcomeType === 'PO';
                  const themeColor = isPo ? PO_COLOR : PSO_COLOR;
                  return (
                    <tr
                      key={row.outcomeCode}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => onSelectOutcome && onSelectOutcome(row.outcomeCode, row.outcomeType)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f172a' }}>
                        <div>{row.outcomeCode}</div>
                        {row.outcomeStatement && (
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400, maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.outcomeStatement}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: isPo ? '#f0f9ff' : '#f0fdf4',
                            color: themeColor,
                            border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
                          }}
                        >
                          {row.outcomeType}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {formatVal(row.mappingStrength, 1)} / 3.0
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: themeColor }}>
                        {formatVal(row.contribution)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                        {formatVal(row.target)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {row.targetMet != null ? (
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: row.targetMet ? '#ecfdf5' : '#fef2f2',
                              color: row.targetMet ? '#059669' : '#dc2626',
                              border: `1px solid ${row.targetMet ? '#a7f3d0' : '#fecaca'}`,
                            }}
                          >
                            {row.targetMet ? 'Target Met' : 'Target Not Met'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
