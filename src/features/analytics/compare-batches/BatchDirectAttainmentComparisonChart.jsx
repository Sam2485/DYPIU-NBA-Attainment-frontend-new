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

const BATCH_1_DIRECT_COLOR = '#0284c7'; // Sky Blue
const BATCH_2_DIRECT_COLOR = '#0ea5e9'; // Lighter Sky Blue / Cyan

function DirectComparisonTooltip({ active, payload, batch1Name, batch2Name }) {
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
        minWidth: 230,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
        {data.outcomeCode} — Direct Attainment
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: BATCH_1_DIRECT_COLOR, fontWeight: 700 }}>{batch1Name}:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.batch1Direct != null ? Number(data.batch1Direct).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: BATCH_2_DIRECT_COLOR, fontWeight: 700 }}>{batch2Name}:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.batch2Direct != null ? Number(data.batch2Direct).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function BatchDirectAttainmentComparisonChart({
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
      batch1Direct: o.batch1?.directAttainment != null ? Number(o.batch1.directAttainment) : null,
      batch2Direct: o.batch2?.directAttainment != null ? Number(o.batch2.directAttainment) : null,
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
          Direct Attainment Comparison
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Comparison of direct course examination attainment across all PO/PSOs for both batches
        </span>
      </div>

      <div style={{ width: '100%', height: 300, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 14, right: 24, left: 0, bottom: 20 }}>
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
                <DirectComparisonTooltip
                  batch1Name={batch1Name}
                  batch2Name={batch2Name}
                />
              }
            />
            <Bar
              dataKey="batch1Direct"
              name={`${batch1Name} (Direct)`}
              fill={BATCH_1_DIRECT_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Bar
              dataKey="batch2Direct"
              name={`${batch2Name} (Direct)`}
              fill={BATCH_2_DIRECT_COLOR}
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
          marginTop: 12,
          fontSize: 12,
          color: '#64748b',
          fontWeight: 600,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: BATCH_1_DIRECT_COLOR, display: 'inline-block' }} />
          <span>{batch1Name} Direct</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: BATCH_2_DIRECT_COLOR, display: 'inline-block' }} />
          <span>{batch2Name} Direct</span>
        </div>
      </div>
    </div>
  );
}
