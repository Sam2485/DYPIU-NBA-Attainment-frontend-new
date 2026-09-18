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
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PO_ATTAINMENT_COLOR = '#0284c7'; // Sky Blue
const PO_TARGET_COLOR = '#94a3b8';     // Slate Target Marker
const PSO_ATTAINMENT_COLOR = '#16a34a'; // Light Green
const PSO_TARGET_COLOR = '#94a3b8';    // Slate Target Marker

function OutcomeTooltip({ active, payload, outcomeType }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_ATTAINMENT_COLOR : PSO_ATTAINMENT_COLOR;

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
        maxWidth: 280,
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
            padding: '2px 6px',
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
          <strong style={{ color: '#334155' }}>{data.target.toFixed(2)}</strong>
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
            <span>{data.directAttainment.toFixed(2)} / {data.indirectAttainment.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
        Click to view outcome diagnostic
      </div>
    </div>
  );
}

export default function PoPsoHealthSection({
  poHealth = [],
  psoHealth = [],
  summary = {},
  onSelectOutcome = () => {},
}) {
  const poEvaluated = summary.poEvaluated ?? poHealth.length;
  const poMet = summary.poMet ?? poHealth.filter((p) => p.targetMet).length;
  const poBelow = summary.poBelowTarget ?? Math.max(0, poEvaluated - poMet);

  const psoEvaluated = summary.psoEvaluated ?? psoHealth.length;
  const psoMet = summary.psoMet ?? psoHealth.filter((p) => p.targetMet).length;
  const psoBelow = summary.psoBelowTarget ?? Math.max(0, psoEvaluated - psoMet);

  const poData = poHealth.map((item) => ({
    code: item.poCode,
    statement: item.poStatement,
    attainment: Number(item.attainment != null ? item.attainment : 0),
    target: Number(item.target != null ? item.target : 0),
    gap: Number(item.gap != null ? item.gap : 0),
    targetMet: Boolean(item.targetMet),
    directAttainment: item.directAttainment != null ? Number(item.directAttainment) : null,
    indirectAttainment: item.indirectAttainment != null ? Number(item.indirectAttainment) : null,
  }));

  const psoData = psoHealth.map((item) => ({
    code: item.psoCode,
    statement: item.psoStatement,
    attainment: Number(item.attainment != null ? item.attainment : 0),
    target: Number(item.target != null ? item.target : 0),
    gap: Number(item.gap != null ? item.gap : 0),
    targetMet: Boolean(item.targetMet),
    directAttainment: item.directAttainment != null ? Number(item.directAttainment) : null,
    indirectAttainment: item.indirectAttainment != null ? Number(item.indirectAttainment) : null,
  }));

  // Dynamic heights for horizontal bar charts
  const poChartHeight = Math.max(280, poData.length * 36 + 40);
  const psoChartHeight = Math.max(200, psoData.length * 44 + 40);

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
          {/* Section Header */}
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
                  background: PO_ATTAINMENT_COLOR,
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
                PO HEALTH
              </h3>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: '#0284c7',
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
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <strong style={{ color: '#0f172a' }}>{poEvaluated}</strong> evaluated •{' '}
            <strong style={{ color: '#16a34a' }}>{poMet}</strong> met •{' '}
            <strong style={{ color: poBelow > 0 ? '#dc2626' : '#64748b' }}>{poBelow}</strong> below target
          </div>

          {poData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>
              No Program Outcomes evaluated for this batch.
            </div>
          ) : (
            <>
              {/* Recharts Horizontal Bar Chart */}
              <div style={{ height: poChartHeight, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={poData}
                    margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]?.payload?.code) {
                        onSelectOutcome(state.activePayload[0].payload.code, 'PO');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      domain={[0, 3.0]}
                      ticks={[0, 0.75, 1.5, 2.25, 3.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="code"
                      type="category"
                      width={50}
                      tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip content={<OutcomeTooltip outcomeType="PO" />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 8 }}
                      formatter={(val) => (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', marginRight: 6 }}>
                          {val}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="attainment"
                      name="Attainment"
                      fill={PO_ATTAINMENT_COLOR}
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    />
                    <Bar
                      dataKey="target"
                      name="Target"
                      fill={PO_TARGET_COLOR}
                      radius={[0, 4, 4, 0]}
                      barSize={6}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Compact Outcome Rows for 10-second Quick Glance */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {poData.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSelectOutcome(item.code, 'PO')}
                    title={`${item.code}: ${item.attainment.toFixed(2)} vs target ${item.target.toFixed(2)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      background: item.targetMet ? '#f8fafc' : '#fef2f2',
                      border: `1px solid ${item.targetMet ? '#e2e8f0' : '#fecaca'}`,
                      borderRadius: 6,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = PO_ATTAINMENT_COLOR;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = item.targetMet ? '#e2e8f0' : '#fecaca';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.code}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 700, color: item.targetMet ? '#334155' : '#dc2626' }}>
                        {item.attainment.toFixed(2)}
                      </span>
                      {item.targetMet ? (
                        <CheckCircle2 size={13} color="#16a34a" />
                      ) : (
                        <AlertCircle size={13} color="#dc2626" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
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
          {/* Section Header */}
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
                  background: PSO_ATTAINMENT_COLOR,
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
                PSO HEALTH
              </h3>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: '#16a34a',
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
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <strong style={{ color: '#0f172a' }}>{psoEvaluated}</strong> evaluated •{' '}
            <strong style={{ color: '#16a34a' }}>{psoMet}</strong> met •{' '}
            <strong style={{ color: psoBelow > 0 ? '#dc2626' : '#64748b' }}>{psoBelow}</strong> below target
          </div>

          {psoData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>
              No Program Specific Outcomes evaluated for this batch.
            </div>
          ) : (
            <>
              {/* Recharts Horizontal Bar Chart */}
              <div style={{ height: psoChartHeight, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={psoData}
                    margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]?.payload?.code) {
                        onSelectOutcome(state.activePayload[0].payload.code, 'PSO');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      domain={[0, 3.0]}
                      ticks={[0, 0.75, 1.5, 2.25, 3.0]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="code"
                      type="category"
                      width={55}
                      tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip content={<OutcomeTooltip outcomeType="PSO" />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 8 }}
                      formatter={(val) => (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', marginRight: 6 }}>
                          {val}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="attainment"
                      name="Attainment"
                      fill={PSO_ATTAINMENT_COLOR}
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                    />
                    <Bar
                      dataKey="target"
                      name="Target"
                      fill={PSO_TARGET_COLOR}
                      radius={[0, 4, 4, 0]}
                      barSize={6}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Compact Outcome Rows for 10-second Quick Glance */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {psoData.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSelectOutcome(item.code, 'PSO')}
                    title={`${item.code}: ${item.attainment.toFixed(2)} vs target ${item.target.toFixed(2)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      background: item.targetMet ? '#f8fafc' : '#fef2f2',
                      border: `1px solid ${item.targetMet ? '#e2e8f0' : '#fecaca'}`,
                      borderRadius: 6,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = PSO_ATTAINMENT_COLOR;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = item.targetMet ? '#e2e8f0' : '#fecaca';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.code}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 700, color: item.targetMet ? '#334155' : '#dc2626' }}>
                        {item.attainment.toFixed(2)}
                      </span>
                      {item.targetMet ? (
                        <CheckCircle2 size={13} color="#16a34a" />
                      ) : (
                        <AlertCircle size={13} color="#dc2626" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
