import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const PO_DIRECT_COLOR = '#0284c7';   // Sky Blue
const PO_INDIRECT_COLOR = '#7dd3fc'; // Light Sky Blue Tint
const PSO_DIRECT_COLOR = '#16a34a';  // Green
const PSO_INDIRECT_COLOR = '#86efac'; // Light Green Tint
const TARGET_MARKER_COLOR = '#1e293b'; // Slate 800

function TargetMarker(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  const markerWidth = 46;

  return (
    <g>
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke={TARGET_MARKER_COLOR}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function HistoricalChartTooltip({ active, payload, outcomeCode, outcomeType }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_DIRECT_COLOR : PSO_DIRECT_COLOR;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '14px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 230,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
          {data.batchName || `Batch ${data.startYear}-${data.endYear}`}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 4,
            background: data.targetMet ? '#dcfce7' : '#fee2e2',
            color: data.targetMet ? '#15803d' : '#b91c1c',
          }}
        >
          {data.targetMet ? 'Target Met' : 'Below Target'}
        </span>
      </div>

      <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 8 }}>
        Outcome: <strong style={{ color: themeColor }}>{outcomeCode}</strong>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
          <strong style={{ color: '#0f172a' }}>{Number(data.directAttainment).toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
          <strong style={{ color: '#0f172a' }}>{Number(data.indirectAttainment).toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: 4 }}>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Final Attainment:</span>
          <strong style={{ color: themeColor, fontSize: 13 }}>
            {Number(data.finalAttainment).toFixed(2)} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Target Level:</span>
          <strong style={{ color: TARGET_MARKER_COLOR }}>
            {Number(data.targetLevel).toFixed(2)}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Attainment Gap:</span>
          <strong style={{ color: data.gap >= 0 ? '#15803d' : '#b91c1c' }}>
            {data.gap >= 0 ? `+${Number(data.gap).toFixed(2)}` : Number(data.gap).toFixed(2)}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ color: '#64748b' }}>Status:</span>
          <strong style={{ color: data.targetMet ? '#15803d' : '#b91c1c' }}>
            {data.targetMet ? 'Yes (Met)' : 'No (Unmet)'}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function HistoricalAttainmentChart({
  batches = [],
  dataPoints = [],
  selectedOutcomeCode = 'PO1',
  selectedOutcomeType = 'PO',
}) {
  const isPo = selectedOutcomeType === 'PO';
  const directColor = isPo ? PO_DIRECT_COLOR : PSO_DIRECT_COLOR;
  const indirectColor = isPo ? PO_INDIRECT_COLOR : PSO_INDIRECT_COLOR;

  // Prepare chart series data: one item per completed batch
  const chartData = React.useMemo(() => {
    return batches.map((b) => {
      const dp = dataPoints.find(
        (p) => p.batchId === b.batchId && (p.outcomeCode || '').toUpperCase() === selectedOutcomeCode.toUpperCase()
      );

      const dAtt = dp?.directAttainment != null ? Number(dp.directAttainment) : 0;
      const iAtt = dp?.indirectAttainment != null ? Number(dp.indirectAttainment) : 0;
      const fAtt = dp?.finalAttainment != null ? Number(dp.finalAttainment) : 0;
      const target = dp?.targetLevel != null ? Number(dp.targetLevel) : 2.50;
      const gap = dp?.gap != null ? Number(dp.gap) : Number((fAtt - target).toFixed(2));
      const targetMet = dp?.targetMet != null ? dp.targetMet : fAtt >= target;

      // Direct and indirect height shares: weighted 80:20 so total stack = finalAttainment
      const directShare = Number((dAtt * 0.80).toFixed(4));
      const indirectShare = Number((iAtt * 0.20).toFixed(4));

      return {
        batchId: b.batchId,
        batchName: b.batchName || `Batch ${b.startYear}-${b.endYear}`,
        startYear: b.startYear,
        endYear: b.endYear,
        directAttainment: dAtt,
        indirectAttainment: iAtt,
        finalAttainment: fAtt,
        directShare,
        indirectShare,
        targetLevel: target,
        gap,
        targetMet,
      };
    });
  }, [batches, dataPoints, selectedOutcomeCode]);

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
        }}
      >
        No completed batch attainment data is available for this programme.
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
      {/* Title & Description */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            {selectedOutcomeCode} Historical Attainment
          </h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Authoritative final attainment (Direct + Indirect) across completed batches with batch-specific target markers
          </span>
        </div>
      </div>

      {/* Vertical Stacked Chart Container */}
      <div style={{ width: '100%', height: 320, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 18, right: 24, left: 0, bottom: 20 }}>
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
            <Tooltip
              content={
                <HistoricalChartTooltip
                  outcomeCode={selectedOutcomeCode}
                  outcomeType={selectedOutcomeType}
                />
              }
            />
            {/* Direct component of stack */}
            <Bar
              dataKey="directShare"
              name="Direct Attainment (80%)"
              stackId="attainment"
              fill={directColor}
              radius={[0, 0, 0, 0]}
              barSize={44}
            />
            {/* Indirect component of stack */}
            <Bar
              dataKey="indirectShare"
              name="Indirect Attainment (20%)"
              stackId="attainment"
              fill={indirectColor}
              radius={[6, 6, 0, 0]}
              barSize={44}
            />
            {/* Batch-specific target marker line */}
            <Line
              dataKey="targetLevel"
              name="Batch Target Marker"
              stroke="transparent"
              strokeWidth={0}
              dot={<TargetMarker />}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
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
          <span style={{ width: 12, height: 12, borderRadius: 2, background: directColor, display: 'inline-block' }} />
          <span>Direct Attainment Share (80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: indirectColor, display: 'inline-block' }} />
          <span>Indirect Attainment Share (20%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 3.5, borderRadius: 2, background: TARGET_MARKER_COLOR, display: 'inline-block' }} />
          <span>Batch Target Marker</span>
        </div>
      </div>
    </div>
  );
}
