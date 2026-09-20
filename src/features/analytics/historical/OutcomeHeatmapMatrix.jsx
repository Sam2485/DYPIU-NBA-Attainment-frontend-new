import React, { useState } from 'react';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';

function getCellColor(finalAtt, targetMet) {
  if (finalAtt == null) return { bg: '#f8fafc', color: '#94a3b8' };
  const val = Number(finalAtt);
  if (val >= 2.5) {
    return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }; // Strong green
  } else if (val >= 2.0) {
    return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' }; // Soft green
  } else if (val >= 1.5) {
    return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' }; // Amber
  } else {
    return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' }; // Soft red
  }
}

export default function OutcomeHeatmapMatrix({
  batches = [],
  outcomes = [],
  dataPoints = [],
  selectedOutcomeCode = 'PO1',
  onSelectOutcome = () => {},
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!batches || batches.length === 0 || !outcomes || outcomes.length === 0) {
    return null;
  }

  // Create lookup map: `${batchId}::${outcomeCode}` -> dataPoint
  const dataMap = React.useMemo(() => {
    const map = new Map();
    dataPoints.forEach((dp) => {
      const key = `${dp.batchId}::${(dp.outcomeCode || '').toUpperCase()}`;
      map.set(key, dp);
    });
    return map;
  }, [dataPoints]);

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
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            PO / PSO Attainment Across Batches
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Complete longitudinal matrix of final attainment. Click any row or cell to inspect that outcome above.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: '#dcfce7', border: '1px solid #bbf7d0', display: 'inline-block' }} />
            <span>&ge; 2.50</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'inline-block' }} />
            <span>2.00 – 2.49</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: '#fef9c3', border: '1px solid #fef08a', display: 'inline-block' }} />
            <span>1.50 – 1.99</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: '#fee2e2', border: '1px solid #fecaca', display: 'inline-block' }} />
            <span>&lt; 1.50</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '4px',
            fontSize: 12.5,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  color: '#475569',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#f8fafc',
                  borderRadius: 6,
                  width: 110,
                }}
              >
                Outcome
              </th>
              {batches.map((b) => (
                <th
                  key={b.batchId}
                  style={{
                    textAlign: 'center',
                    padding: '10px 14px',
                    color: '#0f172a',
                    fontSize: 12,
                    fontWeight: 700,
                    background: '#f8fafc',
                    borderRadius: 6,
                    minWidth: 100,
                  }}
                >
                  {b.batchName || `Batch ${b.startYear}-${b.endYear}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody onMouseLeave={() => setHoveredCell(null)}>
            {outcomes.map((code) => {
              const isSelected = (selectedOutcomeCode || '').toUpperCase() === code.toUpperCase();
              const isPso = code.toUpperCase().startsWith('PSO');
              const outcomeType = isPso ? 'PSO' : 'PO';
              const labelColor = isPso ? '#16a34a' : '#0284c7';

              return (
                <tr
                  key={code}
                  onClick={() => onSelectOutcome(code, outcomeType)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? '#f0f9ff' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Outcome Label Cell */}
                  <td
                    style={{
                      padding: '8px 14px',
                      fontWeight: 800,
                      color: isSelected ? '#0284c7' : '#1e293b',
                      background: isSelected ? '#e0f2fe' : '#f8fafc',
                      borderRadius: 6,
                      border: isSelected ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: labelColor }}>{code}</span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          background: '#0284c7',
                          color: '#ffffff',
                          padding: '1px 5px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </td>

                  {/* Batch Cells */}
                  {batches.map((b) => {
                    const key = `${b.batchId}::${code.toUpperCase()}`;
                    const dp = dataMap.get(key);
                    const finalAtt = dp?.finalAttainment != null ? Number(dp.finalAttainment) : null;
                    const targetLevel = dp?.targetLevel != null ? Number(dp.targetLevel) : 2.50;
                    const gap = dp?.gap != null ? Number(dp.gap) : (finalAtt != null ? Number((finalAtt - targetLevel).toFixed(2)) : null);
                    const targetMet = dp?.targetMet != null ? dp.targetMet : (finalAtt != null ? finalAtt >= targetLevel : false);

                    const colors = getCellColor(finalAtt, targetMet);

                    return (
                      <td
                        key={b.batchId}
                        onMouseEnter={() => {
                          if (hoveredCell?.key !== key) {
                            setHoveredCell({ key, code, batch: b, dp, finalAtt, targetLevel, gap, targetMet });
                          }
                        }}
                        style={{
                          textAlign: 'center',
                          padding: '9px 12px',
                          borderRadius: 6,
                          fontWeight: 700,
                          background: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border || '#e2e8f0'}`,
                          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                          position: 'relative',
                        }}
                      >
                        {finalAtt != null ? finalAtt.toFixed(2) : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hover Information Card - Fixed min-height to guarantee zero layout shift / no flickering */}
      <div
        style={{
          marginTop: 14,
          minHeight: 52,
          padding: '10px 16px',
          background: hoveredCell ? '#f8fafc' : '#ffffff',
          border: hoveredCell ? '1px solid #e2e8f0' : '1px dashed #e2e8f0',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
          boxSizing: 'border-box',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
        }}
      >
        {hoveredCell ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>
                {hoveredCell.code} — {hoveredCell.batch.batchName || `Batch ${hoveredCell.batch.startYear}-${hoveredCell.batch.endYear}`}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: hoveredCell.targetMet ? '#dcfce7' : '#fee2e2',
                  color: hoveredCell.targetMet ? '#15803d' : '#b91c1c',
                }}
              >
                {hoveredCell.targetMet ? 'Target Met' : 'Below Target'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#475569' }}>
              <span>
                Final Attainment: <strong style={{ color: '#0f172a' }}>{hoveredCell.finalAtt != null ? hoveredCell.finalAtt.toFixed(2) : '—'}</strong>
              </span>
              <span>
                Target: <strong style={{ color: '#0f172a' }}>{hoveredCell.targetLevel.toFixed(2)}</strong>
              </span>
              <span>
                Gap:{' '}
                <strong style={{ color: hoveredCell.gap >= 0 ? '#15803d' : '#b91c1c' }}>
                  {hoveredCell.gap != null ? (hoveredCell.gap >= 0 ? `+${hoveredCell.gap.toFixed(2)}` : hoveredCell.gap.toFixed(2)) : '—'}
                </strong>
              </span>
              <span style={{ color: '#0284c7', fontWeight: 700, fontSize: 11.5 }}>
                Click row to inspect outcome &uarr;
              </span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: '#94a3b8', fontSize: 12 }}>
            <span>Hover over any outcome cell to view longitudinal attainment breakdown and target gap.</span>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Click any row to switch primary analysis focus &uarr;</span>
          </div>
        )}
      </div>
    </div>
  );
}
