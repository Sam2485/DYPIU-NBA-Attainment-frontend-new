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
  LabelList,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const COLOR_SLIGHT = '#4ade80';       // Green 400
const COLOR_MODERATE = '#22c55e';     // Green 500
const COLOR_SUBSTANTIAL = '#16a34a';  // Green 600

function SurveyTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
        {item.category} ({item.band})
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Response Percentage:</span>
        <strong style={{ color: item.color }}>{item.percentage.toFixed(1)}%</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
        <span style={{ color: '#64748b' }}>Response Count:</span>
        <strong style={{ color: '#0f172a' }}>{item.count} student{item.count !== 1 ? 's' : ''}</strong>
      </div>
    </div>
  );
}

export default function CoIndirectDistributionChart({
  coCode = 'CO',
  coItem = null,
  levelDistribution = {},
  responseCount = 0,
  level1Count,
  level2Count,
  level3Count,
  validResponseCount,
  level1Percentage,
  level2Percentage,
  level3Percentage,
}) {
  // Extract counts prioritizing direct props, then coItem fields, then levelDistribution map
  const l1Count =
    level1Count ??
    coItem?.level1Count ??
    levelDistribution['Level 1 (Slight)'] ??
    levelDistribution['Slight (Level 1)'] ??
    levelDistribution['Slight'] ??
    levelDistribution['Level 1'] ??
    0;

  const l2Count =
    level2Count ??
    coItem?.level2Count ??
    levelDistribution['Level 2 (Moderate)'] ??
    levelDistribution['Moderate (Level 2)'] ??
    levelDistribution['Moderate'] ??
    levelDistribution['Level 2'] ??
    0;

  const l3Count =
    level3Count ??
    coItem?.level3Count ??
    levelDistribution['Level 3 (Substantial)'] ??
    levelDistribution['Substantial (Level 3)'] ??
    levelDistribution['Substantial'] ??
    levelDistribution['Level 3'] ??
    0;

  const total =
    validResponseCount ??
    coItem?.validResponseCount ??
    responseCount ??
    (l1Count + l2Count + l3Count);

  // Extract or compute percentages if backend didn't supply them
  const l1Pct =
    level1Percentage ??
    coItem?.level1Percentage ??
    (total > 0 ? (l1Count / total) * 100 : 0);

  const l2Pct =
    level2Percentage ??
    coItem?.level2Percentage ??
    (total > 0 ? (l2Count / total) * 100 : 0);

  const l3Pct =
    level3Percentage ??
    coItem?.level3Percentage ??
    (total > 0 ? (l3Count / total) * 100 : 0);

  const chartData = [
    {
      category: 'Level 1 — Slight',
      band: 'Rating 1',
      percentage: Number(Number(l1Pct).toFixed(1)),
      count: l1Count,
      color: COLOR_SLIGHT,
    },
    {
      category: 'Level 2 — Moderate',
      band: 'Rating 2',
      percentage: Number(Number(l2Pct).toFixed(1)),
      count: l2Count,
      color: COLOR_MODERATE,
    },
    {
      category: 'Level 3 — Substantial',
      band: 'Rating 3',
      percentage: Number(Number(l3Pct).toFixed(1)),
      count: l3Count,
      color: COLOR_SUBSTANTIAL,
    },
  ];

  const hasResponses = total > 0 && (l1Count > 0 || l2Count > 0 || l3Count > 0);
  const maxPct = Math.max(...chartData.map((d) => d.percentage), 10);
  const yAxisMax = Math.min(100, Math.ceil((maxPct * 1.15) / 10) * 10);

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
            <BarChart2 size={16} style={{ color: COLOR_SUBSTANTIAL }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Response Distribution ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Course-end student feedback percentage frequencies across rating levels.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_SLIGHT, display: 'inline-block' }} />
            <span style={{ color: '#166534' }}>Level 1 — Slight</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_MODERATE, display: 'inline-block' }} />
            <span style={{ color: '#15803d' }}>Level 2 — Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_SUBSTANTIAL, display: 'inline-block' }} />
            <span style={{ color: '#14532d' }}>Level 3 — Substantial</span>
          </div>
        </div>
      </div>

      {!hasResponses ? (
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
          No course-end survey responses are available for {coCode}.
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#334155' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  domain={[0, yAxisMax]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  label={{
                    value: 'Percentage (%)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    fontWeight: 700,
                    offset: 0,
                  }}
                />
                <Tooltip content={<SurveyTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-survey-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    position="top"
                    formatter={(val) => `${val}%`}
                    style={{ fontSize: 11, fontWeight: 700, fill: '#0f172a' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compact 3-column breakdown underneath */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {/* Level 1 - Slight */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Slight
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>Rating 1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>
                  {Number(l1Pct).toFixed(1)}%
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>
                  ({l1Count} response{l1Count !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Level 2 - Moderate */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  Moderate
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>Rating 2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>
                  {Number(l2Pct).toFixed(1)}%
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>
                  ({l2Count} response{l2Count !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Level 3 - Substantial */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #4ade80',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#14532d', textTransform: 'uppercase' }}>
                  Substantial
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>Rating 3</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#14532d' }}>
                  {Number(l3Pct).toFixed(1)}%
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>
                  ({l3Count} response{l3Count !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
