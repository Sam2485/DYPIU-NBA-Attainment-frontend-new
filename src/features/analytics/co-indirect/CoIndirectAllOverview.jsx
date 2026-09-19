import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ExternalLink, CheckCircle2, XCircle, Award, Target, FileSpreadsheet } from 'lucide-react';

const INDIRECT_GREEN = '#16a34a';

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

function AllCoIndirectTooltip({ active, payload }) {
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
      }}
    >
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
        {item.coCode} {item.statement ? `— ${item.statement}` : ''}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
        <strong style={{ color: INDIRECT_GREEN }}>{formatVal(item.indirectAttainment)} / 3.00</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Indirect Level:</span>
        <strong style={{ color: '#0f172a' }}>Level {item.indirectLevel ?? '—'}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>CO Target:</span>
        <strong style={{ color: '#475569' }}>{formatVal(item.target)}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 4 }}>
        <span style={{ color: '#64748b' }}>Target Status:</span>
        <strong style={{ color: item.targetMet ? '#15803d' : '#b91c1c' }}>
          {item.targetMet ? 'Target Met' : 'Not Met'}
        </strong>
      </div>
    </div>
  );
}

export default function CoIndirectAllOverview({
  courseOutcomes = [],
  onSelectCo,
}) {
  const sortedCos = React.useMemo(() => {
    return sortCosAscending(courseOutcomes);
  }, [courseOutcomes]);

  const chartData = React.useMemo(() => {
    return sortedCos.map((c) => ({
      coCode: c.coCode || c.code,
      statement: c.statement,
      indirectAttainment: c.indirectAttainment != null ? Number(c.indirectAttainment) : (c.indirectLevel != null ? Number(c.indirectLevel) : 0),
      indirectLevel: c.indirectLevel,
      indirectPercentage: c.indirectPercentage,
      target: c.target != null ? Number(c.target) : 2.0,
      targetMet: c.targetMet,
    }));
  }, [sortedCos]);

  const avgTarget = chartData.length > 0
    ? (chartData.reduce((acc, c) => acc + (c.target || 2.0), 0) / chartData.length).toFixed(2)
    : 2.0;

  const dynamicWidth = Math.max(500, chartData.length * 72);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Comparison Vertical Bar Chart */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
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
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Indirect Attainment by Course Outcome
            </h3>
            <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
              Cross-CO course-end survey attainment comparison on the NBA 0.00 – 3.00 scale against course target.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: INDIRECT_GREEN, display: 'inline-block' }} />
              <span style={{ color: '#166534' }}>Indirect Attainment (0–3)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 0, borderTop: '2px dashed #94a3b8', display: 'inline-block' }} />
              <span style={{ color: '#64748b' }}>Target Benchmark ({avgTarget})</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 13,
              background: '#f8fafc',
              borderRadius: 10,
            }}
          >
            No Course Outcomes found for this course offering.
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ width: dynamicWidth, minWidth: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="coCode"
                    stroke="#64748b"
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#334155' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    domain={[0, 3]}
                    ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    label={{
                      value: 'Indirect Attainment (0-3)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                      fontSize: 11,
                      fontWeight: 700,
                      offset: 0,
                    }}
                  />
                  <Tooltip content={<AllCoIndirectTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <ReferenceLine
                    y={Number(avgTarget)}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ${avgTarget}`,
                      position: 'right',
                      fill: '#64748b',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="indirectAttainment" fill={INDIRECT_GREEN} radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`indirect-bar-${index}`}
                        fill={entry.targetMet ? INDIRECT_GREEN : '#86efac'}
                        cursor="pointer"
                        onClick={() => onSelectCo && onSelectCo(entry.coCode)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 2. Comprehensive All COs Indirect Table */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Course Outcomes Indirect Attainment Summary
          </h3>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Click &quot;View CO Survey Evidence&quot; to inspect response distribution and Likert feedback for a specific CO.
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>CO Code & Statement</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Indirect Attainment</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Indirect Level</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Indirect %</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>CO Target</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCos.map((c) => {
                const code = c.coCode || c.code;
                const isTargetMet = c.targetMet === true;
                return (
                  <tr
                    key={code}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectCo && onSelectCo(code)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  >
                    <td style={{ padding: '10px 14px', maxWidth: 360 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{code}</div>
                      {c.statement && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 1.35 }}>
                          {c.statement}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: INDIRECT_GREEN }}>
                      {formatVal(c.indirectAttainment ?? (c.indirectLevel != null ? Number(c.indirectLevel) : null))} / 3.00
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                      {c.indirectLevel != null ? `Level ${c.indirectLevel}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {c.indirectPercentage != null ? `${formatVal(c.indirectPercentage, 1)}%` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {formatVal(c.target)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {c.targetMet != null ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: isTargetMet ? '#ecfdf5' : '#fef2f2',
                            color: isTargetMet ? '#059669' : '#dc2626',
                            border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fecaca'}`,
                          }}
                        >
                          {isTargetMet ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isTargetMet ? 'Target Met' : 'Not Met'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCo) onSelectCo(code);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          borderRadius: 6,
                          background: '#ffffff',
                          border: `1px solid ${INDIRECT_GREEN}`,
                          color: INDIRECT_GREEN,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dcfce7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        <span>View CO Survey Evidence</span>
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
    </div>
  );
}
