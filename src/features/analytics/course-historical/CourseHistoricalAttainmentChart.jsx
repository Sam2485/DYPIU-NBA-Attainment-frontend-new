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
import { Compass } from 'lucide-react';

const DIRECT_STACK_COLOR = '#0284c7';   // Sky Blue
const INDIRECT_STACK_COLOR = '#38bdf8'; // Light Sky Blue

function CourseHistoricalTooltip({ active, payload, currentBatchId }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isCurrent = data.programmeBatchId === currentBatchId;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 240,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
          {data.batchName || `Batch ${data.startYear}-${data.endYear}`}
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

      {isCurrent && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: '#0369a1',
            background: '#e0f2fe',
            padding: '2px 6px',
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          <Compass size={12} />
          <span>Current Investigating Batch</span>
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.directAttainment != null ? Number(data.directAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.indirectAttainment != null ? Number(data.indirectAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: 5 }}>
          <span style={{ color: '#0f172a', fontWeight: 800 }}>Overall Attainment:</span>
          <strong style={{ color: '#0284c7', fontSize: 13.5 }}>
            {data.overallCourseAttainment != null ? Number(data.overallCourseAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4, borderTop: '1px solid #f8fafc', paddingTop: 4 }}>
          <span>Weights Configured:</span>
          <span>Direct {data.directWeight}% • Indirect {data.indirectWeight}%</span>
        </div>
      </div>
    </div>
  );
}

export default function CourseHistoricalAttainmentChart({
  batches = [],
  currentBatchId = '',
  directWeight = 70,
  indirectWeight = 30,
}) {
  const chartData = React.useMemo(() => {
    return batches.map((b) => {
      const dAtt = b.directAttainment != null ? Number(b.directAttainment) : null;
      const iAtt = b.indirectAttainment != null ? Number(b.indirectAttainment) : null;
      const overall = b.overallCourseAttainment != null ? Number(b.overallCourseAttainment) : null;

      const dWeight = b.directWeight != null ? Number(b.directWeight) : directWeight;
      const iWeight = b.indirectWeight != null ? Number(b.indirectWeight) : indirectWeight;

      // Direct and indirect height shares: weighted so total stack = overallCourseAttainment
      const directShare = dAtt != null ? Number((dAtt * (dWeight / 100)).toFixed(4)) : 0;
      const indirectShare = iAtt != null ? Number((iAtt * (iWeight / 100)).toFixed(4)) : 0;

      const isCurrent = b.programmeBatchId === currentBatchId;

      return {
        programmeBatchCourseId: b.programmeBatchCourseId,
        programmeBatchId: b.programmeBatchId,
        batchName: b.batchName || `Batch ${b.startYear}-${b.endYear}`,
        displayName: isCurrent ? `${b.batchName || `Batch ${b.startYear}`} (Current)` : (b.batchName || `Batch ${b.startYear}`),
        startYear: b.startYear,
        endYear: b.endYear,
        status: b.status,
        directAttainment: dAtt,
        indirectAttainment: iAtt,
        overallCourseAttainment: overall,
        directWeight: dWeight,
        indirectWeight: iWeight,
        directShare,
        indirectShare,
        isCurrent,
      };
    });
  }, [batches, currentBatchId, directWeight, indirectWeight]);

  if (!batches || batches.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 32,
          textAlign: 'center',
          color: '#64748b',
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        No historical batch data available for this course.
      </div>
    );
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
            Course Attainment Across Batches
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Direct and indirect attainment across all available batches for this course.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#475569', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: DIRECT_STACK_COLOR, display: 'inline-block' }} />
            <span>Direct Component ({directWeight}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: INDIRECT_STACK_COLOR, display: 'inline-block' }} />
            <span>Indirect Component ({indirectWeight}%)</span>
          </div>
        </div>
      </div>

      {/* Vertical Stacked Bar Chart */}
      <div style={{ width: '100%', height: 340, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="displayName"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
              interval={0}
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
            <Tooltip
              content={<CourseHistoricalTooltip currentBatchId={currentBatchId} />}
              cursor={{ fill: 'rgba(2, 132, 199, 0.04)' }}
            />
            <Bar
              dataKey="directShare"
              stackId="attainment"
              name="Direct Component"
              fill={DIRECT_STACK_COLOR}
              radius={[0, 0, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="indirectShare"
              stackId="attainment"
              name="Indirect Component"
              fill={INDIRECT_STACK_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
