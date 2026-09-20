import React from 'react';
import { Table, CheckCircle2, XCircle } from 'lucide-react';

const formatNum = (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '—');

export default function CourseCoComparisonTable({ coComparisons = [], course1, course2 }) {
  if (!coComparisons || coComparisons.length === 0) {
    return null;
  }

  const c1Heading = `${course1?.courseCode || 'C1'} (${course1?.batchName || 'Batch 1'})`;
  const c2Heading = `${course2?.courseCode || 'C2'} (${course2?.batchName || 'Batch 2'})`;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
            }}
          >
            <Table size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Detailed Course Outcome Comparison Matrix
            </h3>
            <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
              Side-by-side breakdown of Direct, Indirect, Overall Attainment, and Targets
            </p>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: '#64748b' }}>
          Total COs: <strong>{coComparisons.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th
                rowSpan={2}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: '#475569',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  borderRight: '1px solid #e2e8f0',
                  minWidth: 90,
                }}
              >
                CO Code
              </th>
              <th
                rowSpan={2}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: '#475569',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  borderRight: '1px solid #e2e8f0',
                  minWidth: 200,
                }}
              >
                Outcome Statement
              </th>
              <th
                colSpan={5}
                style={{
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#4f46e5',
                  fontSize: 11.5,
                  borderRight: '1px solid #e2e8f0',
                  background: '#eef2ff',
                }}
              >
                {c1Heading}
              </th>
              <th
                colSpan={5}
                style={{
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#0284c7',
                  fontSize: 11.5,
                  borderRight: '1px solid #e2e8f0',
                  background: '#f0f9ff',
                }}
              >
                {c2Heading}
              </th>
              <th
                rowSpan={2}
                style={{
                  padding: '10px 16px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#334155',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  minWidth: 100,
                }}
              >
                Attainment Delta
                <div style={{ fontSize: 9.5, fontWeight: 500, color: '#64748b' }}>(C1 − C2)</div>
              </th>
            </tr>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {/* Course 1 Subheaders */}
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Direct</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Indirect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#4f46e5', fontSize: 10.5, fontWeight: 700 }}>Overall</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Target</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Status</th>

              {/* Course 2 Subheaders */}
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Direct</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Indirect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#0284c7', fontSize: 10.5, fontWeight: 700 }}>Overall</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600 }}>Target</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontSize: 10.5, fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {coComparisons.map((item, idx) => {
              const m1 = item.course1Metrics;
              const m2 = item.course2Metrics;

              const delta =
                item.attainmentDelta !== null && item.attainmentDelta !== undefined
                  ? Number(item.attainmentDelta)
                  : null;
              const deltaStr =
                delta !== null
                  ? (delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2))
                  : '—';

              const renderStatusBadge = (metrics) => {
                if (!metrics) return <span style={{ color: '#94a3b8' }}>—</span>;
                if (metrics.targetMet === true) {
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#16a34a',
                        background: '#f0fdf4',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      <CheckCircle2 size={11} /> Met
                    </span>
                  );
                }
                if (metrics.targetMet === false) {
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#dc2626',
                        background: '#fef2f2',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      <XCircle size={11} /> Not Met
                    </span>
                  );
                }
                return <span style={{ color: '#94a3b8' }}>—</span>;
              };

              return (
                <tr
                  key={item.coCode || idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  {/* CO Code */}
                  <td
                    style={{
                      padding: '12px 16px',
                      fontWeight: 800,
                      color: '#0f172a',
                      fontFamily: 'ui-monospace, monospace',
                      borderRight: '1px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.coCode}
                  </td>

                  {/* Statement */}
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#334155',
                      lineHeight: 1.4,
                      borderRight: '1px solid #e2e8f0',
                      fontSize: 11.5,
                    }}
                  >
                    {item.statement || <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>

                  {/* Course 1 Metrics */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m1?.directAttainment)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m1?.indirectAttainment)}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: '#4f46e5',
                      background: '#f5f7ff',
                    }}
                  >
                    {formatNum(m1?.overallAttainment)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m1?.targetLevel)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                    {renderStatusBadge(m1)}
                  </td>

                  {/* Course 2 Metrics */}
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m2?.directAttainment)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m2?.indirectAttainment)}
                  </td>
                  <td
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: '#0284c7',
                      background: '#f0f9ff',
                    }}
                  >
                    {formatNum(m2?.overallAttainment)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569' }}>
                    {formatNum(m2?.targetLevel)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                    {renderStatusBadge(m2)}
                  </td>

                  {/* Attainment Delta */}
                  <td
                    style={{
                      padding: '10px 16px',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontFamily: 'ui-monospace, monospace',
                      color: delta === null ? '#94a3b8' : delta === 0 ? '#475569' : delta > 0 ? '#0369a1' : '#475569',
                      background: '#f8fafc',
                    }}
                  >
                    {deltaStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
