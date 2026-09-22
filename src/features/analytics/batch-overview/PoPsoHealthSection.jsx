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
  const markerWidth = 28;

  return (
    <g>
      {/* Background shadow/halo for high contrast when bar passes through */}
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke="#ffffff"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      {/* Crisp horizontal target line crossing the vertical bar track */}
      <line
        x1={cx - markerWidth / 2}
        y1={cy}
        x2={cx + markerWidth / 2}
        y2={cy}
        stroke={TARGET_MARKER_COLOR}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function OutcomeTooltip({ active, payload, outcomeType }) {
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
        minWidth: 230,
        maxWidth: 290,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: themeColor }}>
          {data.code}
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

      {data.statement && (
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, lineHeight: 1.4 }}>
          {data.statement.length > 90 ? `${data.statement.slice(0, 87)}…` : data.statement}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Attainment:</span>
          <strong style={{ color: themeColor }}>{data.attainment.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Configured Target:</span>
          <strong style={{ color: TARGET_MARKER_COLOR }}>{data.target.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Gap:</span>
          <strong style={{ color: data.gap < 0 ? '#dc2626' : '#16a34a' }}>
            {data.gap >= 0 ? `+${data.gap.toFixed(2)}` : data.gap.toFixed(2)}
          </strong>
        </div>
        {data.directAttainment != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
            <span>Direct / Indirect:</span>
            <span>
              {Number(data.directAttainment).toFixed(2)} / {Number(data.indirectAttainment).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
        Click bar to select for deep-dive investigation
      </div>
    </div>
  );
}

function sortOutcomesAscending(outcomes = []) {
  return [...outcomes].sort((a, b) => {
    const codeA = a.poCode || a.psoCode || '';
    const codeB = b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function PoPsoHealthSection({
  poHealth = [],
  psoHealth = [],
  summary = {},
  selectedOutcomeCode = '',
  onSelectOutcome = () => {},
}) {
  const sortedPo = React.useMemo(() => sortOutcomesAscending(poHealth), [poHealth]);
  const sortedPso = React.useMemo(() => sortOutcomesAscending(psoHealth), [psoHealth]);

  const poEvaluated = summary.poEvaluated ?? sortedPo.length;
  const poMet = summary.poMet ?? sortedPo.filter((p) => p.targetMet).length;
  const poBelow = summary.poBelowTarget ?? Math.max(0, poEvaluated - poMet);

  const psoEvaluated = summary.psoEvaluated ?? sortedPso.length;
  const psoMet = summary.psoMet ?? sortedPso.filter((p) => p.targetMet).length;
  const psoBelow = summary.psoBelowTarget ?? Math.max(0, psoEvaluated - psoMet);

  const poData = React.useMemo(() => sortedPo.map((item) => ({
    code: item.poCode,
    statement: item.poStatement,
    attainment: Number(item.attainment != null ? item.attainment : 0),
    target: Number(item.target != null ? item.target : 0),
    gap: Number(item.gap != null ? item.gap : 0),
    targetMet: Boolean(item.targetMet),
    directAttainment: item.directAttainment != null ? Number(item.directAttainment) : null,
    indirectAttainment: item.indirectAttainment != null ? Number(item.indirectAttainment) : null,
  })), [sortedPo]);

  const psoData = React.useMemo(() => sortedPso.map((item) => ({
    code: item.psoCode,
    statement: item.psoStatement,
    attainment: Number(item.attainment != null ? item.attainment : 0),
    target: Number(item.target != null ? item.target : 0),
    gap: Number(item.gap != null ? item.gap : 0),
    targetMet: Boolean(item.targetMet),
    directAttainment: item.directAttainment != null ? Number(item.directAttainment) : null,
    indirectAttainment: item.indirectAttainment != null ? Number(item.indirectAttainment) : null,
  })), [sortedPso]);

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 20,
        }}
      >
        {/* LEFT COLUMN: PO HEALTH (Sky Blue Theme) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: PO_COLOR,
                  display: 'inline-block',
                }}
              />
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                PO ATTAINMENT 
              </h3>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: PO_COLOR,
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              Programme Outcomes
            </span>
          </div>

          {/* Compact Summary Line */}
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <strong style={{ color: '#0f172a' }}>{poEvaluated}</strong> evaluated •{' '}
            <strong style={{ color: '#16a34a' }}>{poMet}</strong> met •{' '}
            <strong style={{ color: poBelow > 0 ? '#dc2626' : '#64748b' }}>{poBelow}</strong> below target
          </div>

          {/* Recharts Vertical Bar Visualization with Crossing Target Marker */}
          {poData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>
              No Program Outcomes evaluated for this batch.
            </div>
          ) : (
            <div>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={poData}
                    margin={{ top: 15, right: 10, left: -22, bottom: 5 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]?.payload?.code) {
                        onSelectOutcome(state.activePayload[0].payload.code, 'PO');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 3.0]}
                      ticks={[0, 1.0, 2.0, 3.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip content={<OutcomeTooltip outcomeType="PO" />} />
                    <Bar
                      dataKey="attainment"
                      name="Attainment"
                      fill={PO_COLOR}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      onClick={(entry) => {
                        if (entry?.code) onSelectOutcome(entry.code, 'PO');
                      }}
                    >
                      {poData.map((entry) => {
                        const isSelected = entry.code === selectedOutcomeCode;
                        return (
                          <Cell
                            key={`po-cell-${entry.code}`}
                            fill={isSelected ? '#0369a1' : PO_COLOR}
                            stroke={isSelected ? '#0f172a' : 'none'}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
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

              {/* Chart Legend / Guide */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 18,
                  marginTop: 6,
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: PO_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <span>Attainment Bar</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 3,
                      borderRadius: 1,
                      background: TARGET_MARKER_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <span>Target Marker (Crossing Line)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PSO HEALTH (Light Green Theme) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: PSO_COLOR,
                  display: 'inline-block',
                }}
              />
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                PSO ATTAINMENT
              </h3>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: PSO_COLOR,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              Program Specific Outcomes
            </span>
          </div>

          {/* Compact Summary Line */}
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#64748b',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <strong style={{ color: '#0f172a' }}>{psoEvaluated}</strong> evaluated •{' '}
            <strong style={{ color: '#16a34a' }}>{psoMet}</strong> met •{' '}
            <strong style={{ color: psoBelow > 0 ? '#dc2626' : '#64748b' }}>{psoBelow}</strong> below target
          </div>

          {/* Recharts Vertical Bar Visualization with Crossing Target Marker */}
          {psoData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>
              No Program Specific Outcomes evaluated for this batch.
            </div>
          ) : (
            <div>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={psoData}
                    margin={{ top: 15, right: 10, left: -22, bottom: 5 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]?.payload?.code) {
                        onSelectOutcome(state.activePayload[0].payload.code, 'PSO');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 3.0]}
                      ticks={[0, 1.0, 2.0, 3.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip content={<OutcomeTooltip outcomeType="PSO" />} />
                    <Bar
                      dataKey="attainment"
                      name="Attainment"
                      fill={PSO_COLOR}
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                      onClick={(entry) => {
                        if (entry?.code) onSelectOutcome(entry.code, 'PSO');
                      }}
                    >
                      {psoData.map((entry) => {
                        const isSelected = entry.code === selectedOutcomeCode;
                        return (
                          <Cell
                            key={`pso-cell-${entry.code}`}
                            fill={isSelected ? '#15803d' : PSO_COLOR}
                            stroke={isSelected ? '#0f172a' : 'none'}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
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

              {/* Chart Legend / Guide */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 18,
                  marginTop: 6,
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: PSO_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <span>Attainment Bar</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 3,
                      borderRadius: 1,
                      background: TARGET_MARKER_COLOR,
                      display: 'inline-block',
                    }}
                  />
                  <span>Target Marker (Crossing Line)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PoPsoHealthSection);
