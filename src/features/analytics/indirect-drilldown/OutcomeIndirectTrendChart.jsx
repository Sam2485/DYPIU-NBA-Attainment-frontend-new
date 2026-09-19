import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green
const TARGET_COLOR = '#334155'; // Neutral Slate

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return '';
  }
}

function TrendTooltip({ active, payload, outcomeCode, outcomeType }) {
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
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        maxWidth: 260,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
        {data.fullName}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
        {data.typeLabel} • {data.dateLabel}
      </div>
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>{outcomeCode} Evaluated Value:</span>
          <strong style={{ color: themeColor }}>{data.score.toFixed(2)} / 3.00</strong>
        </div>
        {data.responseCount != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Responses:</span>
            <strong style={{ color: '#0f172a' }}>{data.responseCount}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OutcomeIndirectTrendChart({
  evidence = [],
  outcomeCode,
  outcomeType,
  target,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;
  const targetNum = target != null ? Number(target) : null;

  // Filter evaluated items for the chronological analytical trend
  const evaluatedItems = (evidence || []).filter(
    (e) => e.outcomeEvaluated && e.outcomeValue != null && Number(e.outcomeValue) > 0
  );

  // If fewer than 2 evaluated evidence points exist, do not force a trend chart
  if (evaluatedItems.length < 2) {
    return null;
  }

  const chartData = evaluatedItems.map((item, index) => {
    const dStr = formatDateShort(item.date);
    const shortName = item.name && item.name.length > 18
      ? `${item.name.substring(0, 16)}...`
      : item.name || `E${index + 1}`;

    return {
      id: item.assessmentId,
      name: shortName,
      fullName: item.name,
      typeLabel: item.type === 'EXIT_SURVEY' ? 'Exit Survey' : item.type,
      dateLabel: dStr,
      score: Number(item.outcomeValue),
      responseCount: item.responseCount,
      isExitSurvey: item.type === 'EXIT_SURVEY',
    };
  });

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
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Chronological Evidence Evaluation Trend
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Outcome values evaluated across participating events and surveys leading up to the exit survey
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: themeColor }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Participating Assessments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#10b981' }} />
            <span style={{ color: '#475569', fontWeight: 600 }}>Exit Survey</span>
          </div>
          {targetNum != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 2, background: TARGET_COLOR }} />
              <span style={{ color: '#475569', fontWeight: 600 }}>Target ({targetNum.toFixed(2)})</span>
            </div>
          )}
        </div>
      </div>

      {/* STRICTLY VERTICAL BAR CHART */}
      <div style={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#475569', fontSize: 11.5, fontWeight: 700 }}
              interval={0}
            />
            <YAxis
              domain={[0, 3.0]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              label={{
                value: 'Outcome Value (0.00 – 3.00)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
              }}
            />
            <Tooltip
              content={
                <TrendTooltip
                  outcomeCode={outcomeCode}
                  outcomeType={outcomeType}
                />
              }
            />

            {targetNum != null && (
              <ReferenceLine
                y={targetNum}
                stroke={TARGET_COLOR}
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Target: ${targetNum.toFixed(2)}`,
                  position: 'right',
                  fill: TARGET_COLOR,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}

            {/* STRICTLY VERTICAL BARS */}
            <Bar
              dataKey="score"
              name={`${outcomeCode} Score`}
              maxBarSize={48}
              radius={[5, 5, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isExitSurvey ? '#10b981' : themeColor}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 10, fontSize: 11.5, color: '#64748b', textAlign: 'right' }}>
        * Explanatory visualization only. Authoritative consolidated indirect attainment is computed by the backend.
      </div>
    </div>
  );
}
