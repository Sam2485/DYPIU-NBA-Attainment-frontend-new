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
  Cell,
} from 'recharts';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green
const TARGET_MARKER_COLOR = '#334155'; // Neutral Slate

/**
 * Custom horizontal target marker line that crosses the vertical attainment bar track.
 */
function TargetMarker(props) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  const markerWidth = 46;

  return (
    <g>
      {/* Background halo for contrast */}
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Crisp horizontal target line crossing the vertical bar track */}
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke={TARGET_MARKER_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function DirectChartTooltip({ active, payload, outcomeType, outcomeCode }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

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
        <span style={{ fontWeight: 800, fontSize: 13, color: themeColor }}>
          {outcomeCode} Direct Attainment
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 4,
            background: data.targetMet ? '#dcfce7' : '#fee2e2',
            color: data.targetMet ? '#15803d' : '#b91c1c',
          }}
        >
          {data.targetMet ? 'Target Met' : 'Below Target'}
        </span>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
          <strong style={{ color: themeColor }}>{data.attainment.toFixed(2)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Configured Target:</span>
          <strong style={{ color: TARGET_MARKER_COLOR }}>{data.target.toFixed(2)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Gap:</span>
          <strong style={{ color: data.gap >= 0 ? '#16a34a' : '#dc2626' }}>
            {data.gap >= 0 ? `+${data.gap.toFixed(2)}` : data.gap.toFixed(2)}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function OutcomeDirectAttainmentChart({
  outcomeCode,
  outcomeType,
  directAttainment,
  target,
  directGap,
  targetMet,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const attainmentNum = directAttainment != null ? Number(directAttainment) : 0;
  const targetNum = target != null ? Number(target) : 0;
  const gapNum = directGap != null ? Number(directGap) : attainmentNum - targetNum;

  const chartData = [
    {
      name: outcomeCode,
      attainment: attainmentNum,
      target: targetNum,
      gap: gapNum,
      targetMet: Boolean(targetMet),
    },
  ];

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
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
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 2px 0',
            }}
          >
            Direct Attainment vs Configured Target
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Authoritative direct attainment level compared to the department academic target
          </span>
        </div>

        {/* Quick Diagnostic Pill */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 999,
            background: targetMet ? '#f0fdf4' : '#fef2f2',
            color: targetMet ? '#15803d' : '#b91c1c',
            border: `1px solid ${targetMet ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {targetMet
            ? `Target Met (${attainmentNum.toFixed(2)} ≥ ${targetNum.toFixed(2)})`
            : `Below Target (Deficit: ${Math.abs(gapNum).toFixed(2)})`}
        </div>
      </div>

      {/* Recharts Vertical Bar with Target Marker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
        <div style={{ width: '100%', maxWidth: 380, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fontWeight: 800, fill: themeColor }}
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
              <Tooltip content={<DirectChartTooltip outcomeType={outcomeType} outcomeCode={outcomeCode} />} />
              <Bar
                dataKey="attainment"
                name="Direct Attainment"
                fill={themeColor}
                radius={[6, 6, 0, 0]}
                barSize={42}
              >
                <Cell fill={themeColor} />
              </Bar>
              <Line
                dataKey="target"
                name="Target Marker"
                stroke="transparent"
                strokeWidth={0}
                dot={<TargetMarker />}
                activeDot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          marginTop: 6,
          fontSize: 11.5,
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: themeColor,
              display: 'inline-block',
            }}
          />
          <span>Direct Attainment Bar ({attainmentNum.toFixed(2)})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 18,
              height: 3.5,
              borderRadius: 2,
              background: TARGET_MARKER_COLOR,
              display: 'inline-block',
            }}
          />
          <span>Target Marker Line ({targetNum.toFixed(2)})</span>
        </div>
      </div>
    </div>
  );
}
