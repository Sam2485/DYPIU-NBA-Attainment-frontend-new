import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const DIRECT_COLOR = '#0284c7';   // Sky Blue
const INDIRECT_COLOR = '#0d9488'; // Teal Green

function DirectIndirectTooltip({ active, payload }) {
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
        minWidth: 210,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
        {data.batchName}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: DIRECT_COLOR, fontWeight: 700 }}>Direct Attainment:</span>
          <strong style={{ color: '#0f172a' }}>{Number(data.directAttainment).toFixed(2)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: INDIRECT_COLOR, fontWeight: 700 }}>Indirect Attainment:</span>
          <strong style={{ color: '#0f172a' }}>{Number(data.indirectAttainment).toFixed(2)} / 3.00</strong>
        </div>
      </div>
    </div>
  );
}

export default function DirectVsIndirectHistoricalChart({
  batches = [],
  dataPoints = [],
  selectedOutcomeCode = 'PO1',
}) {
  const chartData = React.useMemo(() => {
    return batches.map((b) => {
      const dp = dataPoints.find(
        (p) => p.batchId === b.batchId && (p.outcomeCode || '').toUpperCase() === selectedOutcomeCode.toUpperCase()
      );

      return {
        batchId: b.batchId,
        batchName: b.batchName || `Batch ${b.startYear}-${b.endYear}`,
        directAttainment: dp?.directAttainment != null ? Number(dp.directAttainment) : 0,
        indirectAttainment: dp?.indirectAttainment != null ? Number(dp.indirectAttainment) : 0,
      };
    });
  }, [batches, dataPoints, selectedOutcomeCode]);

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
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Direct vs Indirect Attainment
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Side-by-side comparison of Direct and Indirect components across completed batches for {selectedOutcomeCode}
        </span>
      </div>

      <div style={{ width: '100%', height: 280, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="batchName"
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 3.0]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip content={<DirectIndirectTooltip />} />
            <Bar
              dataKey="directAttainment"
              name="Direct Attainment"
              fill={DIRECT_COLOR}
              radius={[5, 5, 0, 0]}
              barSize={28}
            />
            <Bar
              dataKey="indirectAttainment"
              name="Indirect Attainment"
              fill={INDIRECT_COLOR}
              radius={[5, 5, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          marginTop: 12,
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: DIRECT_COLOR, display: 'inline-block' }} />
          <span>Direct Attainment (Raw Level)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: INDIRECT_COLOR, display: 'inline-block' }} />
          <span>Indirect Attainment (Raw Level)</span>
        </div>
      </div>
    </div>
  );
}
