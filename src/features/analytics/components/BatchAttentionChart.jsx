import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function BatchAttentionChart({
  batches = [],
  onSelectBatch = () => {},
}) {
  const chartData = (batches || [])
    .filter((b) => (b.gapCount || 0) > 0)
    .slice(0, 10)
    .map((b) => {
      const name = b.batchName || b.name || 'Unnamed Batch';
      const prog = b.programmeName ? `${b.programmeName} • ` : '';
      return {
        id: b.programmeBatchId || b.id,
        rawName: `${prog}${name}`,
        displayName: `${prog}${name}`.length > 28 ? `${`${prog}${name}`.slice(0, 26)}…` : `${prog}${name}`,
        gapCount: b.gapCount || 0,
        poBelowTarget: b.poBelowTarget || 0,
        psoBelowTarget: b.psoBelowTarget || 0,
      };
    });

  if (chartData.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          height: 340,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 16px 0',
            alignSelf: 'flex-start',
          }}
        >
          ATTENTION ACROSS LIVE BATCHES
        </h3>
        <div
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          No batches requiring attention
        </div>
      </div>
    );
  }

  // Dynamic height based on number of batches so bars don't get squashed
  const chartHeight = Math.max(280, chartData.length * 36 + 60);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          ATTENTION ACROSS LIVE BATCHES
        </h3>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          Top {chartData.length} Batches
        </span>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              dataKey="displayName"
              type="category"
              width={180}
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name, item) => [
                `${value} outcomes below target (PO: ${item.payload.poBelowTarget}, PSO: ${item.payload.psoBelowTarget})`,
                'Deficits',
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.rawName;
                }
                return label;
              }}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Bar
              dataKey="gapCount"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={(data) => {
                if (data && data.id) {
                  onSelectBatch(data.id);
                }
              }}
            >
              {chartData.map((entry) => (
                <Cell key={`bar-${entry.id}`} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
