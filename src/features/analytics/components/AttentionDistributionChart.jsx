import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function AttentionDistributionChart({
  poDeficitCount = 0,
  psoDeficitCount = 0,
}) {
  const totalDeficits = poDeficitCount + psoDeficitCount;

  const data = [
    { name: 'PO Below Target', value: poDeficitCount, color: PO_COLOR },
    { name: 'PSO Below Target', value: psoDeficitCount, color: PSO_COLOR },
  ];

  const activeData = data.filter((item) => item.value > 0);

  if (totalDeficits === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          height: 380,
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
            color: '#16a34a',
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
        height: 380,
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
            fontSize: 12,
            fontWeight: 700,
            color: '#0f172a',
            background: '#f1f5f9',
            padding: '3px 10px',
            borderRadius: 999,
          }}
        >
          {totalDeficits} Total Deficits
        </span>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={activeData.length > 1 ? 4 : 0}
              dataKey="value"
            >
              {activeData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} deficit${value === 1 ? '' : 's'} (${Math.round((value / totalDeficits) * 100)}%)`,
                name,
              ]}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const count = value.startsWith('PO') ? poDeficitCount : psoDeficitCount;
                return (
                  <span style={{ color: '#334155', fontWeight: 600, fontSize: 12, marginRight: 8 }}>
                    {value}: <strong>{count}</strong>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label displaying Total Deficits */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.1,
            }}
          >
            {totalDeficits}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Deficits
          </div>
        </div>
      </div>
    </div>
  );
}

