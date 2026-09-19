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

const BATCH_1_COLOR = '#0284c7'; // Sky Blue
const BATCH_2_COLOR = '#8b5cf6'; // Violet

function FinalComparisonTooltip({ active, payload, batch1Name, batch2Name }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 260,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
        {data.outcomeCode} — Final Attainment
      </div>

      {/* Batch 1 details */}
      <div style={{ padding: '6px 8px', borderRadius: 6, background: '#f0f9ff', marginBottom: 6 }}>
        <div style={{ fontWeight: 800, color: BATCH_1_COLOR, marginBottom: 3 }}>
          {batch1Name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Final Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.batch1Final != null ? Number(data.batch1Final).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Target Level:</span>
          <strong style={{ color: '#334155' }}>
            {data.batch1Target != null ? Number(data.batch1Target).toFixed(2) : '—'}
          </strong>
        </div>
      </div>

      {/* Batch 2 details */}
      <div style={{ padding: '6px 8px', borderRadius: 6, background: '#f5f3ff' }}>
        <div style={{ fontWeight: 800, color: BATCH_2_COLOR, marginBottom: 3 }}>
          {batch2Name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Final Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.batch2Final != null ? Number(data.batch2Final).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Target Level:</span>
          <strong style={{ color: '#334155' }}>
            {data.batch2Target != null ? Number(data.batch2Target).toFixed(2) : '—'}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function BatchFinalAttainmentComparisonChart({
  outcomes = [],
  batch1Meta = {},
  batch2Meta = {},
}) {
  const batch1Name = batch1Meta?.batchName || 'Batch 1';
  const batch2Name = batch2Meta?.batchName || 'Batch 2';

  const chartData = React.useMemo(() => {
    return outcomes.map((o) => ({
      outcomeCode: o.outcomeCode,
      outcomeType: o.outcomeType,
      batch1Final: o.batch1?.finalAttainment != null ? Number(o.batch1.finalAttainment) : null,
      batch1Target: o.batch1?.targetLevel != null ? Number(o.batch1.targetLevel) : null,
      batch2Final: o.batch2?.finalAttainment != null ? Number(o.batch2.finalAttainment) : null,
      batch2Target: o.batch2?.targetLevel != null ? Number(o.batch2.targetLevel) : null,
    }));
  }, [outcomes]);

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
          PO / PSO Final Attainment Comparison
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Side-by-side vertical attainment comparison across all PO and PSO outcomes for both selected batches
        </span>
      </div>

      <div style={{ width: '100%', height: 340, minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="outcomeCode"
              tick={{ fill: '#334155', fontSize: 11.5, fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 3.0]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip
              content={
                <FinalComparisonTooltip
                  batch1Name={batch1Name}
                  batch2Name={batch2Name}
                />
              }
            />
            <Bar
              dataKey="batch1Final"
              name={batch1Name}
              fill={BATCH_1_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Bar
              dataKey="batch2Final"
              name={batch2Name}
              fill={BATCH_2_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={18}
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
          marginTop: 14,
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: BATCH_1_COLOR, display: 'inline-block' }} />
          <span>{batch1Name} (Final Attainment)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: BATCH_2_COLOR, display: 'inline-block' }} />
          <span>{batch2Name} (Final Attainment)</span>
        </div>
      </div>
    </div>
  );
}
