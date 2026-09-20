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
import { CheckCircle2, XCircle, Compass } from 'lucide-react';

const DIRECT_CO_COLOR = '#0284c7';   // Sky Blue
const INDIRECT_CO_COLOR = '#38bdf8'; // Light Sky Blue

function SelectedCoTooltip({ active, payload, currentBatchId }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isCurrent = data.batchId === currentBatchId;

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
          {data.batchName}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 4,
            background: data.targetMet ? '#dcfce7' : '#fee2e2',
            color: data.targetMet ? '#15803d' : '#b91c1c',
          }}
        >
          {data.targetMet ? 'Target Met' : 'Below Target'}
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
          <span>Current Batch</span>
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.directAttainment != null ? Number(data.directAttainment).toFixed(2) : '—'}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
          <strong style={{ color: '#0f172a' }}>
            {data.indirectAttainment != null ? Number(data.indirectAttainment).toFixed(2) : '—'}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: 4 }}>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Overall Attainment:</span>
          <strong style={{ color: '#0284c7', fontSize: 13 }}>
            {data.overallAttainment != null ? Number(data.overallAttainment).toFixed(2) : '—'} / 3.00
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Target Level:</span>
          <strong style={{ color: '#334155' }}>
            {data.targetLevel != null ? Number(data.targetLevel).toFixed(2) : '2.50'}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default function SelectedCoHistoricalSection({
  selectedCoCode = 'CO1',
  courseOutcomes = [],
  onSelectCo = () => {},
  batches = [],
  coDataPoints = [],
  currentBatchId = '',
  directWeight = 70,
  indirectWeight = 30,
}) {
  // Filter data points for the selected CO
  const pointsForCo = React.useMemo(() => {
    return coDataPoints.filter(
      (dp) => (dp.coCode || '').toUpperCase() === selectedCoCode.toUpperCase()
    );
  }, [coDataPoints, selectedCoCode]);

  const coStatement = pointsForCo[0]?.statement || '';

  // Prepare chart series: one entry per batch
  const chartData = React.useMemo(() => {
    return batches.map((b) => {
      const dp = pointsForCo.find((p) => p.programmeBatchId === b.programmeBatchId);
      const dAtt = dp?.directAttainment != null ? Number(dp.directAttainment) : null;
      const iAtt = dp?.indirectAttainment != null ? Number(dp.indirectAttainment) : null;
      const overall = dp?.overallAttainment != null ? Number(dp.overallAttainment) : null;
      const target = dp?.targetLevel != null ? Number(dp.targetLevel) : 2.50;
      const targetMet = dp?.targetMet != null ? dp.targetMet : (overall != null && overall >= target);

      const dWeight = b.directWeight != null ? Number(b.directWeight) : directWeight;
      const iWeight = b.indirectWeight != null ? Number(b.indirectWeight) : indirectWeight;

      const directShare = dAtt != null ? Number((dAtt * (dWeight / 100)).toFixed(4)) : 0;
      const indirectShare = iAtt != null ? Number((iAtt * (iWeight / 100)).toFixed(4)) : 0;

      const isCurrent = b.programmeBatchId === currentBatchId;

      return {
        batchId: b.programmeBatchId,
        batchName: b.batchName || `Batch ${b.startYear}-${b.endYear}`,
        displayName: isCurrent ? `${b.batchName || `Batch ${b.startYear}`} (Current)` : (b.batchName || `Batch ${b.startYear}`),
        status: b.status,
        directAttainment: dAtt,
        indirectAttainment: iAtt,
        overallAttainment: overall,
        directShare,
        indirectShare,
        targetLevel: target,
        targetMet,
        isCurrent,
      };
    });
  }, [batches, pointsForCo, currentBatchId, directWeight, indirectWeight]);

  // Current batch instance of this CO for the summary cards
  const currentCoPoint = React.useMemo(() => {
    return pointsForCo.find((p) => p.programmeBatchId === currentBatchId) || pointsForCo[pointsForCo.length - 1];
  }, [pointsForCo, currentBatchId]);

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
      {/* Header & CO Dropdown Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {selectedCoCode}
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {selectedCoCode} Attainment Across Batches
            </h3>
          </div>
          {coStatement && (
            <div style={{ fontSize: 12.5, color: '#64748b' }}>
              {coStatement}
            </div>
          )}
        </div>

        {/* CO Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Select CO:
          </label>
          <select
            value={selectedCoCode}
            onChange={(e) => onSelectCo(e.target.value)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0284c7',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #bae6fd',
              background: '#f0f9ff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {courseOutcomes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards for Selected CO (Current Batch context) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Overall</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', marginTop: 3 }}>
            {currentCoPoint?.overallAttainment != null ? Number(currentCoPoint.overallAttainment).toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Scale 0 - 3.00</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Direct</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
            {currentCoPoint?.directAttainment != null ? Number(currentCoPoint.directAttainment).toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Exams / Marks</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Indirect</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0d9488', marginTop: 3 }}>
            {currentCoPoint?.indirectAttainment != null ? Number(currentCoPoint.indirectAttainment).toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Survey</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Level</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#334155', marginTop: 3 }}>
            {currentCoPoint?.targetLevel != null ? Number(currentCoPoint.targetLevel).toFixed(2) : '2.50'}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>OBE Benchmark</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Status</div>
          <div style={{ marginTop: 4 }}>
            {currentCoPoint?.targetMet ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#15803d', fontSize: 13, fontWeight: 800 }}>
                <CheckCircle2 size={15} /> Met
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#b91c1c', fontSize: 13, fontWeight: 800 }}>
                <XCircle size={15} /> Unmet
              </span>
            )}
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>Current Batch</div>
        </div>
      </div>

      {/* Selected CO Vertical Stacked Bar Chart */}
      <div style={{ width: '100%', height: 280, minHeight: 260, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="displayName"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
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
            <Tooltip content={<SelectedCoTooltip currentBatchId={currentBatchId} />} cursor={{ fill: 'rgba(2, 132, 199, 0.04)' }} />
            <Bar
              dataKey="directShare"
              stackId="coAttainment"
              name="Direct Component"
              fill={DIRECT_CO_COLOR}
              radius={[0, 0, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="indirectShare"
              stackId="coAttainment"
              name="Indirect Component"
              fill={INDIRECT_CO_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical Inspection Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Batch</th>
              <th style={{ textAlign: 'center', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Direct Attainment</th>
              <th style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Indirect Attainment</th>
              <th style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Overall Attainment</th>
              <th style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Target Level</th>
              <th style={{ textAlign: 'center', padding: '9px 12px', fontWeight: 700, color: '#475569' }}>Target Met</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr
                key={row.batchId}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: row.isCurrent ? '#f0f9ff' : '#ffffff',
                }}
              >
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0f172a' }}>
                  {row.batchName} {row.isCurrent && <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 800 }}>• Current</span>}
                </td>
                <td style={{ textAlign: 'center', padding: '9px 12px' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: row.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                      color: row.status === 'ACTIVE' ? '#15803d' : '#475569',
                    }}
                  >
                    {row.status || 'ACTIVE'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', padding: '9px 12px', color: '#334155' }}>
                  {row.directAttainment != null ? Number(row.directAttainment).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right', padding: '9px 12px', color: '#334155' }}>
                  {row.indirectAttainment != null ? Number(row.indirectAttainment).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 800, color: '#0284c7' }}>
                  {row.overallAttainment != null ? Number(row.overallAttainment).toFixed(2) : '—'}
                </td>
                <td style={{ textAlign: 'right', padding: '9px 12px', color: '#64748b' }}>
                  {row.targetLevel != null ? Number(row.targetLevel).toFixed(2) : '2.50'}
                </td>
                <td style={{ textAlign: 'center', padding: '9px 12px' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: row.targetMet ? '#dcfce7' : '#fee2e2',
                      color: row.targetMet ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {row.targetMet ? 'Met' : 'Unmet'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
