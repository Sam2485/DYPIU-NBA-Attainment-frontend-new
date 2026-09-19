import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ExternalLink, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function CoAttainmentTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

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
        {item.coCode}
      </div>
      {item.statement && (
        <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>
          {item.statement}
        </div>
      )}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Overall Attainment:</span>
          <strong style={{ color: '#7c3aed' }}>{formatVal(item.overallAttainment)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
          <strong style={{ color: '#0284c7' }}>{formatVal(item.directAttainment)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
          <strong style={{ color: '#16a34a' }}>{formatVal(item.indirectAttainment)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>CO Target:</span>
          <strong style={{ color: '#0f172a' }}>{formatVal(item.target)} / 3.00</strong>
        </div>
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

export default function CourseCoAttainmentSection({
  courseOutcomes = [],
  programmeBatchId,
  programmeBatchCourseId,
  outcomeCode,
  outcomeType = 'PO',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const handleNavigateToCo = (coCode) => {
    if (!coCode) return;
    const query = outcomeCode ? `?outcomeType=${outcomeType}&outcomeCode=${outcomeCode}` : '';
    navigate(
      `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${coCode}${query}`
    );
  };

  // Sort COs in ascending order (CO1, CO2, CO3...)
  const sortedCourseOutcomes = React.useMemo(() => {
    return sortCosAscending(courseOutcomes);
  }, [courseOutcomes]);

  if (!sortedCourseOutcomes || sortedCourseOutcomes.length === 0) {
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
          No Course Outcomes (COs) defined or calculated for this course.
        </p>
      </div>
    );
  }

  const chartData = sortedCourseOutcomes.map((co) => ({
    coCode: co.coCode,
    statement: co.statement,
    overallAttainment: Number(co.overallAttainment != null ? co.overallAttainment : 0),
    directAttainment: co.directAttainment,
    indirectAttainment: co.indirectAttainment,
    target: co.target != null ? Number(co.target) : null,
    targetMet: co.targetMet,
  }));

  const dynamicWidth = Math.max(500, chartData.length * 56);

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
                background: '#7c3aed',
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
              Course Outcomes (CO) Attainment
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            CO-level direct, indirect, and overall attainment against target. Tap any bar or row to view CO Analytics.
          </span>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
          Y-Axis: Overall CO Attainment (0.00 – 3.00)
        </div>
      </div>

      {/* CO Overall Attainment Vertical Bar Chart */}
      <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 8 }}>
        <div style={{ minWidth: dynamicWidth, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -20, bottom: 25 }}
              onClick={(state) => {
                const clickedCo = state?.activePayload?.[0]?.payload?.coCode
                  || (state?.activeTooltipIndex != null ? chartData[state.activeTooltipIndex]?.coCode : null);
                if (clickedCo) {
                  handleNavigateToCo(clickedCo);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="coCode"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 3.0]}
                ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CoAttainmentTooltip />} />
              <Bar
                dataKey="overallAttainment"
                name="Overall Attainment"
                fill="#7c3aed"
                radius={[4, 4, 0, 0]}
                barSize={28}
                cursor="pointer"
                onClick={(entry) => {
                  const clickedCo = entry?.coCode || entry?.payload?.coCode;
                  if (clickedCo) handleNavigateToCo(clickedCo);
                }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`co-cell-${entry.coCode}`}
                    fill={entry.targetMet === false ? '#e11d48' : '#7c3aed'}
                    cursor="pointer"
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      handleNavigateToCo(entry.coCode);
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CO Table */}
      <div style={{ marginTop: 18, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>CO Code & Statement</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Direct Attainment</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Indirect Attainment</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Overall Attainment</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>CO Target</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
              {outcomeCode && (
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>
                  {outcomeCode} Mapping
                </th>
              )}
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedCourseOutcomes.map((co) => {
              const isTargetMet = co.targetMet === true;
              return (
                <tr
                  key={co.coCode}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNavigateToCo(co.coCode)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <td style={{ padding: '10px 14px', maxWidth: 360 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{co.coCode}</div>
                    {co.statement && (
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 1.3 }}>
                        {co.statement}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                    {formatVal(co.directAttainment)}
                    {co.directPercentage != null && (
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                        {formatVal(co.directPercentage, 1)}%
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                    {formatVal(co.indirectAttainment)}
                    {co.indirectScore != null && (
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                        Score: {formatVal(co.indirectScore, 2)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>
                    {formatVal(co.overallAttainment)}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                    {formatVal(co.target)}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {co.targetMet != null ? (
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
                    ) : (
                      '—'
                    )}
                  </td>
                  {outcomeCode && (
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {co.selectedOutcomeMapping != null && co.selectedOutcomeMapping > 0 ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            color: '#0f172a',
                          }}
                        >
                          Level {co.selectedOutcomeMapping}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleNavigateToCo(co.coCode)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f5f3ff';
                        e.currentTarget.style.borderColor = '#7c3aed';
                        e.currentTarget.style.color = '#7c3aed';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                    >
                      <span>View Details</span>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
