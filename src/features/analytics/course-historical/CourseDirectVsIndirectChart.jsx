import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const DIRECT_BAR_COLOR = '#0284c7';   // Sky Blue
const INDIRECT_BAR_COLOR = '#0d9488'; // Teal Green

function DirectVsIndirectTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
          {data.batchName}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 4,
            background: data.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
            color: data.status === 'ACTIVE' ? '#15803d' : '#475569',
            border: `1px solid ${data.status === 'ACTIVE' ? '#86efac' : '#cbd5e1'}`,
          }}
        >
          {data.status || 'ACTIVE'}
        </span>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: DIRECT_BAR_COLOR, fontWeight: 700 }}>Direct Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.directAttainment != null ? Number(data.directAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: INDIRECT_BAR_COLOR, fontWeight: 700 }}>Indirect Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.indirectAttainment != null ? Number(data.indirectAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function CourseDirectVsIndirectChart({ batches = [] }) {
  const chartData = React.useMemo(() => {
    return batches.map((b) => ({
      batchId: b.programmeBatchId,
      batchName: b.batchName || `Batch ${b.startYear}-${b.endYear}`,
      status: b.status,
      directAttainment: b.directAttainment != null ? Number(b.directAttainment) : 0,
      indirectAttainment: b.indirectAttainment != null ? Number(b.indirectAttainment) : 0,
    }));
  }, [batches]);

  if (!batches || batches.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Direct vs Indirect Attainment
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Side-by-side grouped comparison of examination direct and student indirect scores across batches.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#475569', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: DIRECT_BAR_COLOR, display: 'inline-block' }} />
            <span>Direct Attainment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: INDIRECT_BAR_COLOR, display: 'inline-block' }} />
            <span>Indirect Attainment</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 300, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="batchName"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11.5 }}
              label={{
                value: 'Attainment (0 - 3)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11.5,
                fontWeight: 600,
                offset: 14,
              }}
            />
            <Tooltip content={<DirectVsIndirectTooltip />} cursor={{ fill: 'rgba(2, 132, 199, 0.04)' }} />
            <Bar
              dataKey="directAttainment"
              name="Direct Attainment"
              fill={DIRECT_BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="indirectAttainment"
              name="Indirect Attainment"
              fill={INDIRECT_BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
