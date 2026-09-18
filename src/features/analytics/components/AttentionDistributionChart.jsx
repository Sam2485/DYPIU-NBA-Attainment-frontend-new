import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b'];

export default function AttentionDistributionChart({
  poDeficitCount = 0,
  psoDeficitCount = 0,
}) {
  const totalDeficits = poDeficitCount + psoDeficitCount;

  const data = [
    { name: 'PO Below Target', value: poDeficitCount },
    { name: 'PSO Below Target', value: psoDeficitCount },
  ].filter((item) => item.value > 0);

  if (totalDeficits === 0) {
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
          ATTENTION DISTRIBUTION
        </h3>
        <div
          style={{
            textAlign: 'center',
            color: '#10b981',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Zero Deficits in Current Scope
        </div>
      </div>
    );
  }

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
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
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
          ATTENTION DISTRIBUTION
        </h3>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#ef4444',
            background: '#fee2e2',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          {totalDeficits} Total Deficits
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={entry.name.startsWith('PO') ? COLORS[0] : COLORS[1]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${Math.round((value / totalDeficits) * 100)}%)`,
                name,
              ]}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
