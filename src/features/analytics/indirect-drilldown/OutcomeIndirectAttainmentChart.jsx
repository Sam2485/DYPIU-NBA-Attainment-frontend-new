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
      {/* Background halo for high contrast */}
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

function IndirectChartTooltip({ active, payload, outcomeType, outcomeCode }) {
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
          {outcomeCode} Indirect Attainment
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
          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
          <strong style={{ color: themeColor }}>{data.attainment.toFixed(2)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Configured Target:</span>
          <strong style={{ color: TARGET_MARKER_COLOR }}>{data.target.toFixed(2)} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Indirect Gap:</span>
          <strong style={{ color: data.gap >= 0 ? '#16a34a' : '#dc2626' }}>
            {data.gap >= 0 ? `+${data.gap.toFixed(2)}` : data.gap.toFixed(2)}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function OutcomeIndirectAttainmentChart({
  outcomeCode,
  outcomeType,
  indirectAttainment,
  target,
  indirectGap,
  targetMet,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const attainmentNum = indirectAttainment != null ? Number(indirectAttainment) : 0;
  const targetNum = target != null ? Number(target) : 0;
  const gapNum = indirectGap != null ? Number(indirectGap) : 0;

  // Single vertical data point for the single vertical attainment bar
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
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 3px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Indirect Attainment vs Configured Target
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Authoritative vertical attainment bar (0.00 to 3.00 scale) with academic target marker line
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: themeColor,
              }}
            />
            <span style={{ color: '#475569', fontWeight: 600 }}>
              {outcomeCode} Indirect ({attainmentNum.toFixed(2)})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 16,
                height: 3,
                borderRadius: 2,
                background: TARGET_MARKER_COLOR,
              }}
            />
            <span style={{ color: '#475569', fontWeight: 600 }}>
              Target Line ({targetNum.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Primary Vertical Attainment Chart (STRICTLY VERTICAL) */}
      <div style={{ height: 260, width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            barCategoryGap="40%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }}
            />
            <YAxis
              domain={[0, 3.0]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              label={{
                value: 'Attainment Scale (0.00 – 3.00)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
              }}
            />
            <Tooltip
              content={
                <IndirectChartTooltip
                  outcomeType={outcomeType}
                  outcomeCode={outcomeCode}
                />
              }
            />

            {/* STRICTLY VERTICAL BAR */}
            <Bar
              dataKey="attainment"
              name={`${outcomeCode} Indirect Attainment`}
              maxBarSize={64}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            >
              <Cell fill={themeColor} />
            </Bar>

            {/* Target Marker: Horizontal line crossing the vertical bar track */}
            <Line
              type="linear"
              dataKey="target"
              stroke="transparent"
              legendType="none"
              isAnimationActive={false}
              dot={<TargetMarker />}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Attainment Status Indicator Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          padding: '10px 16px',
          background: targetMet ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${targetMet ? '#bbf7d0' : '#fee2e2'}`,
          borderRadius: 8,
          fontSize: 12.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, color: targetMet ? '#15803d' : '#b91c1c' }}>
            {targetMet ? 'TARGET ACHIEVED' : 'ATTENTION REQUIRED'}
          </span>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#475569' }}>
            Indirect Attainment is <strong>{indirectAttainment != null ? Number(indirectAttainment).toFixed(2) : '—'}</strong> vs Target <strong>{target != null ? Number(target).toFixed(2) : '—'}</strong>
          </span>
        </div>
        <div style={{ fontWeight: 700, color: gapNum >= 0 ? '#15803d' : '#b91c1c' }}>
          Gap: {gapNum >= 0 ? `+${gapNum.toFixed(2)}` : gapNum.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
