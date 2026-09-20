import React, { useState, useMemo } from 'react';

function getCellColor(finalAtt) {
  if (finalAtt == null) return { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' };
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

export default function CourseOutcomeHeatmapMatrix({
  batches = [],
  courseOutcomes = [],
  coDataPoints = [],
  selectedCoCode = 'CO1',
  onSelectCo = () => {},
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Create lookup map: `${batchId}::${coCode}` -> dataPoint (Hook called unconditionally)
  const dataMap = useMemo(() => {
    const map = new Map();
    (coDataPoints || []).forEach((dp) => {
      const key = `${dp.programmeBatchId}::${(dp.coCode || '').toUpperCase()}`;
      map.set(key, dp);
    });
    return map;
  }, [coDataPoints]);

  if (!batches || batches.length === 0 || !courseOutcomes || courseOutcomes.length === 0) {
    return null;
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
      {/* Header & Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            CO Attainment Across Batches
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Historical heatmap matrix of Course Outcomes. Click any cell or row to inspect that CO in detail below.
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#dcfce7', border: '1px solid #bbf7d0', display: 'inline-block' }} />
            <span>&ge; 2.50</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'inline-block' }} />
            <span>2.00 – 2.49</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fef9c3', border: '1px solid #fef08a', display: 'inline-block' }} />
            <span>1.50 – 1.99</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fee2e2', border: '1px solid #fecaca', display: 'inline-block' }} />
            <span>&lt; 1.50</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
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
                  fontWeight: 700,
                  fontSize: 11.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#f8fafc',
                  borderRadius: 6,
                  minWidth: 100,
                }}
              >
                Course Outcome
              </th>
              {batches.map((b) => (
                <th
                  key={b.programmeBatchId}
                  style={{
                    textAlign: 'center',
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: 12,
                    background: '#f8fafc',
                    borderRadius: 6,
                    minWidth: 100,
                  }}
                >
                  <div>{b.batchName || `Batch ${b.startYear}-${b.endYear}`}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: b.status === 'ACTIVE' ? '#15803d' : '#64748b', marginTop: 2 }}>
                    {b.status || 'ACTIVE'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody onMouseLeave={() => setHoveredCell(null)}>
            {courseOutcomes.map((coCode, rowIndex) => {
              const isRowSelected = selectedCoCode?.toUpperCase() === coCode?.toUpperCase();

              return (
                <tr key={coCode}>
                  {/* CO Label Cell */}
                  <td
                    onClick={() => onSelectCo(coCode)}
                    style={{
                      padding: '10px 14px',
                      fontWeight: 800,
                      color: isRowSelected ? '#0284c7' : '#0f172a',
                      background: isRowSelected ? '#f0f9ff' : '#ffffff',
                      border: isRowSelected ? '1px solid #bae6fd' : '1px solid #f1f5f9',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{coCode}</span>
                      {isRowSelected && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '1px 5px', borderRadius: 4 }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Batch Cells */}
                  {batches.map((b, batchIndex) => {
                    const key = `${b.programmeBatchId}::${coCode.toUpperCase()}`;
                    const dp = dataMap.get(key);
                    const finalAtt = dp?.overallAttainment;
                    const cellStyle = getCellColor(finalAtt);
                    const isCellHovered = hoveredCell === key;

                    const isTopRow = rowIndex < 3;
                    const isFirstCol = batchIndex === 0;
                    const isLastCol = batchIndex === batches.length - 1;

                    return (
                      <td
                        key={b.programmeBatchId}
                        onClick={() => onSelectCo(coCode)}
                        onMouseEnter={() => {
                          if (hoveredCell !== key) setHoveredCell(key);
                        }}
                        style={{
                          textAlign: 'center',
                          padding: '10px 12px',
                          fontWeight: 800,
                          fontSize: 13,
                          color: cellStyle.color,
                          background: cellStyle.bg,
                          border: isRowSelected ? `2px solid #0284c7` : `1px solid ${cellStyle.border}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          position: 'relative',
                          transform: isCellHovered ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          boxShadow: isCellHovered ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
                        }}
                      >
                        {finalAtt != null ? Number(finalAtt).toFixed(2) : '—'}

                        {/* Hover Details Card */}
                        {isCellHovered && dp && (
                          <div
                            style={{
                              position: 'absolute',
                              ...(isTopRow ? { top: 'calc(100% + 6px)' } : { bottom: 'calc(100% + 6px)' }),
                              ...(isFirstCol
                                ? { left: 0 }
                                : isLastCol
                                ? { right: 0 }
                                : { left: '50%', transform: 'translateX(-50%)' }),
                              zIndex: 60,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              padding: '10px 14px',
                              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
                              fontSize: 11.5,
                              color: '#334155',
                              width: 220,
                              textAlign: 'left',
                              pointerEvents: 'none',
                            }}
                          >
                            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                              {coCode} • {b.batchName}
                            </div>
                            {dp.statement && (
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontStyle: 'italic' }}>
                                "{dp.statement.slice(0, 50)}..."
                              </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderTop: '1px solid #f1f5f9', paddingTop: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Overall Attainment:</span>
                                <strong style={{ color: '#0284c7' }}>
                                  {dp.overallAttainment != null ? Number(dp.overallAttainment).toFixed(2) : '—'}
                                </strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Direct Attainment:</span>
                                <strong>{dp.directAttainment != null ? Number(dp.directAttainment).toFixed(2) : '—'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Indirect Attainment:</span>
                                <strong>{dp.indirectAttainment != null ? Number(dp.indirectAttainment).toFixed(2) : '—'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Target Level:</span>
                                <strong>{dp.targetLevel != null ? Number(dp.targetLevel).toFixed(2) : '2.50'}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: 3 }}>
                                <span>Target Met:</span>
                                <strong style={{ color: dp.targetMet ? '#15803d' : '#b91c1c' }}>
                                  {dp.targetMet ? 'Yes' : 'No'}
                                </strong>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
