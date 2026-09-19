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
import { BarChart3 } from 'lucide-react';

const BUCKET_COLOR = '#0284c7'; // Sky Blue
const BUCKET_HOVER = '#0369a1';

function DistributionTooltip({ active, payload }) {
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
        Range: {item.range}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Student Count:</span>
        <strong style={{ color: BUCKET_COLOR }}>{item.count} students</strong>
      </div>
      {item.share != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
          <span style={{ color: '#64748b' }}>Percentage of Class:</span>
          <strong style={{ color: '#0f172a' }}>{item.share}%</strong>
        </div>
      )}
    </div>
  );
}

const DEFAULT_ORDER = ['90-100%', '80-89%', '70-79%', '60-69%', '50-59%', '<50%'];

export default function CoDirectMarksDistributionChart({
  scoreDistribution = null,
  coCode = 'CO',
  classAveragePercentage = null,
  highestPercentage = null,
  lowestPercentage = null,
}) {
  const chartData = React.useMemo(() => {
    if (!scoreDistribution) return [];

    let total = 0;
    Object.values(scoreDistribution).forEach((v) => {
      total += Number(v) || 0;
    });

    return DEFAULT_ORDER.map((range) => {
      // Look up with variations (e.g., "90–100%", "90-100%", "<50%")
      let count = 0;
      if (scoreDistribution[range] !== undefined) {
        count = scoreDistribution[range];
      } else {
        const altKey = range.replace('-', '–');
        if (scoreDistribution[altKey] !== undefined) {
          count = scoreDistribution[altKey];
        }
      }
      count = Number(count) || 0;
      const share = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

      return {
        range,
        count,
        share,
      };
    });
  }, [scoreDistribution]);

  const totalStudents = chartData.reduce((acc, curr) => acc + curr.count, 0);
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
            <BarChart3 size={16} style={{ color: BUCKET_COLOR }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Marks Distribution ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Distribution of student achievement percentages across performance brackets.
          </span>
        </div>

        {/* Statistical Badges */}
        {(classAveragePercentage != null || highestPercentage != null || lowestPercentage != null) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5 }}>
            {classAveragePercentage != null && (
              <span
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '3px 8px',
                  color: '#334155',
                  fontWeight: 600,
                }}
              >
                Class Avg: <strong style={{ color: BUCKET_COLOR }}>{Number(classAveragePercentage).toFixed(1)}%</strong>
              </span>
            )}
            {highestPercentage != null && (
              <span
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '3px 8px',
                  color: '#334155',
                  fontWeight: 600,
                }}
              >
                High: <strong style={{ color: '#16a34a' }}>{Number(highestPercentage).toFixed(1)}%</strong>
              </span>
            )}
            {lowestPercentage != null && (
              <span
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '3px 8px',
                  color: '#334155',
                  fontWeight: 600,
                }}
              >
                Low: <strong style={{ color: '#d97706' }}>{Number(lowestPercentage).toFixed(1)}%</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {totalStudents === 0 ? (
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
          No mark distribution data available for this Course Outcome.
        </div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="range"
                stroke="#64748b"
                tick={{ fontSize: 11.5, fontWeight: 700, fill: '#334155' }}
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
              <Tooltip content={<DistributionTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill={BUCKET_COLOR} radius={[6, 6, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.range === '<50%' ? '#f59e0b' : BUCKET_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
