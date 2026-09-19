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
import { CheckCircle2, AlertCircle } from 'lucide-react';

const COLOR_MEETING = '#0284c7'; // Sky Blue
const COLOR_BELOW = '#f59e0b';   // Amber / Warning

function ThresholdTooltip({ active, payload }) {
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
        {item.statusLabel}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Student Count:</span>
        <strong style={{ color: item.color }}>{item.count} students</strong>
      </div>
      {item.share != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
          <span style={{ color: '#64748b' }}>Share of Cohort:</span>
          <strong style={{ color: '#0f172a' }}>{item.share}%</strong>
        </div>
      )}
    </div>
  );
}

export default function CoDirectThresholdChart({
  studentsMeetingThreshold = 0,
  studentsBelowThreshold = 0,
  thresholdPercentage = 60,
  coCode = 'CO',
}) {
  const total = (studentsMeetingThreshold || 0) + (studentsBelowThreshold || 0);

  const chartData = React.useMemo(() => {
    const meetingCount = Number(studentsMeetingThreshold) || 0;
    const belowCount = Number(studentsBelowThreshold) || 0;
    const meetingShare = total > 0 ? ((meetingCount / total) * 100).toFixed(1) : '0.0';
    const belowShare = total > 0 ? ((belowCount / total) * 100).toFixed(1) : '0.0';

    return [
      {
        statusLabel: 'Meeting Threshold',
        count: meetingCount,
        share: meetingShare,
        color: COLOR_MEETING,
      },
      {
        statusLabel: 'Below Threshold',
        count: belowCount,
        share: belowShare,
        color: COLOR_BELOW,
      },
    ];
  }, [studentsMeetingThreshold, studentsBelowThreshold, total]);

  const maxCount = Math.max(studentsMeetingThreshold || 0, studentsBelowThreshold || 0, 10);
  const yAxisMax = Math.ceil(maxCount * 1.2);

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
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Students vs Direct Threshold ({coCode})
          </h3>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Comparison of evaluated students meeting vs below the configured {thresholdPercentage}% direct threshold.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_MEETING, display: 'inline-block' }} />
            <span style={{ color: '#0369a1' }}>Meeting Threshold ({studentsMeetingThreshold ?? 0})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_BELOW, display: 'inline-block' }} />
            <span style={{ color: '#b45309' }}>Below Threshold ({studentsBelowThreshold ?? 0})</span>
          </div>
        </div>
      </div>

      {total === 0 ? (
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
          No evaluated student examination data available for this Course Outcome.
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
                dataKey="statusLabel"
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
              <Tooltip content={<ThresholdTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={90}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
