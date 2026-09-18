import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Semantic colors
const PO_MET_COLOR = '#7dd3fc';     // Lighter Sky Blue
const PO_BELOW_COLOR = '#0284c7';   // Sky Blue
const PSO_MET_COLOR = '#86efac';    // Lighter Green
const PSO_BELOW_COLOR = '#16a34a';  // Light Green

function CustomTooltip({ active, payload }) {
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
        minWidth: 260,
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
        {data.programmeName || 'Programme'}
      </div>
      <div style={{ fontWeight: 600, fontSize: 12, color: '#64748b', marginBottom: 10 }}>
        {data.batchName}
      </div>

      {/* PO Details */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            color: PO_BELOW_COLOR,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: PO_BELOW_COLOR,
              display: 'inline-block',
            }}
          />
          Program Outcomes (PO): {data.posEvaluated} Total
        </div>
        <div style={{ paddingLeft: 14, color: '#475569', fontSize: 11, lineHeight: 1.5 }}>
          <div>• Meeting Target: <strong style={{ color: '#0f172a' }}>{data.poMet}</strong></div>
          <div>• Below Target: <strong style={{ color: PO_BELOW_COLOR }}>{data.poBelow}</strong></div>
        </div>
      </div>

      {/* PSO Details */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            color: PSO_BELOW_COLOR,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: PSO_BELOW_COLOR,
              display: 'inline-block',
            }}
          />
          Program Specific Outcomes (PSO): {data.psosEvaluated} Total
        </div>
        <div style={{ paddingLeft: 14, color: '#475569', fontSize: 11, lineHeight: 1.5 }}>
          <div>• Meeting Target: <strong style={{ color: '#0f172a' }}>{data.psoMet}</strong></div>
          <div>• Below Target: <strong style={{ color: PSO_BELOW_COLOR }}>{data.psoBelow}</strong></div>
        </div>
      </div>

      {/* Total Deficits */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        <span style={{ color: '#64748b' }}>Total Deficits:</span>
        <span
          style={{
            color: '#dc2626',
            background: '#fee2e2',
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          {data.gapCount}
        </span>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: '#94a3b8',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Click column to view batch analytics
      </div>
    </div>
  );
}

export default function BatchAttentionChart({
  batches = [],
  onSelectBatch = () => {},
}) {
  const chartData = (batches || [])
    .filter((b) => (b.gapCount || 0) > 0)
    .slice(0, 10)
    .map((b) => {
      const programmeName = b.programmeName || '';
      const batchName = b.batchName || `Batch ${b.startYear || ''}-${b.endYear || ''}`;
      const posEvaluated = b.posEvaluated || 0;
      const psosEvaluated = b.psosEvaluated || 0;
      const posMet = b.posMet || 0;
      const psosMet = b.psosMet || 0;
      const poBelow =
        b.poBelowTarget !== undefined
          ? b.poBelowTarget
          : Math.max(0, posEvaluated - posMet);
      const psoBelow =
        b.psoBelowTarget !== undefined
          ? b.psoBelowTarget
          : Math.max(0, psosEvaluated - psosMet);
      const gapCount = b.gapCount || (poBelow + psoBelow);

      const label = programmeName ? `${programmeName} • ${batchName}` : batchName;

      return {
        id: b.programmeBatchId || b.id,
        programmeName,
        batchName,
        displayLabel: label,
        posEvaluated,
        poMet: posMet,
        poBelow,
        psosEvaluated,
        psoMet: psosMet,
        psoBelow,
        gapCount,
      };
    });

  if (chartData.length === 0) {
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
          ATTENTION ACROSS LIVE BATCHES
        </h3>
        <div
          style={{
            textAlign: 'center',
            color: '#16a34a',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          No batches requiring attention
        </div>
      </div>
    );
  }

  // Calculate inner width for responsive horizontal scroll container if needed
  const minChartWidth = Math.max(480, chartData.length * 110);

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
          marginBottom: 12,
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
          ATTENTION ACROSS LIVE BATCHES
        </h3>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '3px 10px',
            borderRadius: 999,
          }}
        >
          Top {chartData.length} Batches
        </span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div style={{ width: '100%', minWidth: minChartWidth, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              onClick={(chartState) => {
                if (chartState?.activePayload?.[0]?.payload?.id) {
                  onSelectBatch(chartState.activePayload[0].payload.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayLabel"
                interval={0}
                tick={({ x, y, payload }) => {
                  const raw = payload.value || '';
                  const label = raw.length > 22 ? `${raw.slice(0, 20)}…` : raw;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="end"
                        fill="#475569"
                        fontSize={11}
                        fontWeight={600}
                        transform="rotate(-25)"
                      >
                        {label}
                      </text>
                    </g>
                  );
                }}
                height={55}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, 'auto']}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Outcomes',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fill: '#64748b', fontSize: 11, fontWeight: 700 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 6 }}
                formatter={(value) => (
                  <span
                    style={{
                      color: '#334155',
                      fontWeight: 600,
                      fontSize: 11,
                      marginRight: 8,
                    }}
                  >
                    {value}
                  </span>
                )}
              />

              {/* Column 1: PO Stack (stackId="po") */}
              <Bar
                dataKey="poMet"
                name="PO Met"
                stackId="po"
                fill={PO_MET_COLOR}
                cursor="pointer"
                onClick={(data) => {
                  if (data?.id) onSelectBatch(data.id);
                }}
              />
              <Bar
                dataKey="poBelow"
                name="PO Below"
                stackId="po"
                fill={PO_BELOW_COLOR}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => {
                  if (data?.id) onSelectBatch(data.id);
                }}
              />

              {/* Column 2: PSO Stack (stackId="pso") */}
              <Bar
                dataKey="psoMet"
                name="PSO Met"
                stackId="pso"
                fill={PSO_MET_COLOR}
                cursor="pointer"
                onClick={(data) => {
                  if (data?.id) onSelectBatch(data.id);
                }}
              />
              <Bar
                dataKey="psoBelow"
                name="PSO Below"
                stackId="pso"
                fill={PSO_BELOW_COLOR}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => {
                  if (data?.id) onSelectBatch(data.id);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
