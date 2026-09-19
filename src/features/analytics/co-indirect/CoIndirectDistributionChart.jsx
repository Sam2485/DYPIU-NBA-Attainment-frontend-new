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
        <span style={{ color: '#64748b' }}>Response Count:</span>
        <strong style={{ color: item.color }}>{item.count} students</strong>
      </div>
      {item.share != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
          <span style={{ color: '#64748b' }}>Response Share:</span>
          <strong style={{ color: '#0f172a' }}>{item.share}%</strong>
        </div>
      )}
    </div>
  );
}

export default function CoIndirectDistributionChart({
  levelDistribution = {},
  responseCount = 0,
  coCode = 'CO',
}) {
  const chartData = React.useMemo(() => {
    // Backend keys from levelDistribution: "Slight (Level 1)", "Moderate (Level 2)", "Substantial (Level 3)"
    const slightCount =
      levelDistribution['Slight (Level 1)'] ??
      levelDistribution['Slight'] ??
      levelDistribution['Level 1'] ??
      0;
    const moderateCount =
      levelDistribution['Moderate (Level 2)'] ??
      levelDistribution['Moderate'] ??
      levelDistribution['Level 2'] ??
      0;
    const substantialCount =
      levelDistribution['Substantial (Level 3)'] ??
      levelDistribution['Substantial'] ??
      levelDistribution['Level 3'] ??
      0;

    const total = responseCount || (slightCount + moderateCount + substantialCount) || 1;

    return [
      {
        category: 'Slight',
        band: 'Rating 1',
        count: slightCount,
        share: total > 0 ? ((slightCount / total) * 100).toFixed(1) : '0.0',
        color: COLOR_SLIGHT,
      },
      {
        category: 'Moderate',
        band: 'Rating 2',
        count: moderateCount,
        share: total > 0 ? ((moderateCount / total) * 100).toFixed(1) : '0.0',
        color: COLOR_MODERATE,
      },
      {
        category: 'Substantial',
        band: 'Rating 3',
        count: substantialCount,
        share: total > 0 ? ((substantialCount / total) * 100).toFixed(1) : '0.0',
        color: COLOR_SUBSTANTIAL,
      },
    ];
  }, [levelDistribution, responseCount]);

  const totalResponses = chartData.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...chartData.map((d) => d.count), 5);
  const yAxisMax = Math.ceil(maxCount * 1.25);

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
              Course-End Survey Response Distribution ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Anonymous student feedback frequencies across Likert rating levels (Slight, Moderate, Substantial).
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_SLIGHT, display: 'inline-block' }} />
            <span style={{ color: '#166534' }}>Slight (Rating 1)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_MODERATE, display: 'inline-block' }} />
            <span style={{ color: '#15803d' }}>Moderate (Rating 2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_SUBSTANTIAL, display: 'inline-block' }} />
            <span style={{ color: '#14532d' }}>Substantial (Rating 3)</span>
          </div>
        </div>
      </div>

      {totalResponses === 0 ? (
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
          No course-end survey responses are available for this Course Outcome.
        </div>
      ) : (
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
                  value: 'Student Count',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 0,
                }}
              />
              <Tooltip content={<SurveyTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-survey-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
