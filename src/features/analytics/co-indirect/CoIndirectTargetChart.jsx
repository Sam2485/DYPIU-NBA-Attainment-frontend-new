import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { Target, CheckCircle2, XCircle } from 'lucide-react';

const COLOR_ATTAINMENT_MET = '#16a34a';      // Green 600
const COLOR_ATTAINMENT_NOT_MET = '#f59e0b';  // Amber 500
const COLOR_TARGET = '#64748b';              // Slate 500

function TargetTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
        {item.label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <span style={{ color: '#64748b' }}>Score / Level:</span>
        <strong style={{ color: item.color }}>{item.value.toFixed(2)} / 3.00</strong>
      </div>
    </div>
  );
}

export default function CoIndirectTargetChart({
  coCode = 'CO',
  attainment = 0,
  target = 2.0,
  targetMet = null,
}) {
  const numAttainment = Number(attainment) || 0;
  const numTarget = Number(target) || 0;
  const gap = numAttainment - numTarget;
  const isMet = targetMet != null ? targetMet === true : gap >= 0;

  const chartData = [
    {
      label: 'Indirect Attainment',
      value: Number(numAttainment.toFixed(2)),
      color: isMet ? COLOR_ATTAINMENT_MET : COLOR_ATTAINMENT_NOT_MET,
    },
    {
      label: 'Target Benchmark',
      value: Number(numTarget.toFixed(2)),
      color: COLOR_TARGET,
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: COLOR_ATTAINMENT_MET }} />
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Attainment vs Target ({coCode})
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Indirect survey attainment benchmark comparison on the standard 0.00 – 3.00 scale.
          </span>
        </div>

        {/* Gap & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#f1f5f9',
              color: '#334155',
            }}
          >
            Gap: <strong style={{ color: gap >= 0 ? '#16a34a' : '#dc2626' }}>
              {gap >= 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)}
            </strong>
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 999,
              background: isMet ? '#dcfce7' : '#fee2e2',
              color: isMet ? '#15803d' : '#b91c1c',
              border: `1px solid ${isMet ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {isMet ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {isMet ? 'Target Met' : 'Target Not Met'}
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            barCategoryGap="40%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fontSize: 12, fontWeight: 700, fill: '#334155' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              domain={[0, 3]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              label={{
                value: 'Score (0–3)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
                fontWeight: 700,
                offset: 0,
              }}
            />
            <Tooltip content={<TargetTooltip />} cursor={{ fill: '#f8fafc' }} />
            <ReferenceLine
              y={numTarget}
              stroke="#94a3b8"
              strokeDasharray="4 4"
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-target-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(val) => val.toFixed(2)}
                style={{ fontSize: 11.5, fontWeight: 700, fill: '#0f172a' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
