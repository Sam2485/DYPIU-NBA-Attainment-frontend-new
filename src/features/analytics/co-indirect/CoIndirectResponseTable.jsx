import React from 'react';
import { Table, CheckCircle2 } from 'lucide-react';

export default function CoIndirectResponseTable({
  levelDistribution = {},
  responseCount = 0,
  coCode = 'CO',
}) {
  const slightCount =
    levelDistribution['Slight (Level 1)'] ??
    levelDistribution['Slight'] ??
    levelDistribution['Level 1'] ??
    0;
  const moderateCount =
    levelDistribution['Moderate (Level 2)'] ??
    levelDistribution['Moderate'] ??
    levelDistribution['Level 2'] ??
    0;
  const substantialCount =
    levelDistribution['Substantial (Level 3)'] ??
    levelDistribution['Substantial'] ??
    levelDistribution['Level 3'] ??
    0;

  const calculatedTotal = slightCount + moderateCount + substantialCount;
  const effectiveTotal = responseCount || calculatedTotal;

  const rows = [
    {
      category: 'Slight',
      ratingBand: 'Rating 1 (Slight)',
      numericWeight: '1 / 3',
      count: slightCount,
      share: effectiveTotal > 0 ? ((slightCount / effectiveTotal) * 100).toFixed(1) : '0.0',
      color: '#166534',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      category: 'Moderate',
      ratingBand: 'Rating 2 (Moderate)',
      numericWeight: '2 / 3',
      count: moderateCount,
      share: effectiveTotal > 0 ? ((moderateCount / effectiveTotal) * 100).toFixed(1) : '0.0',
      color: '#15803d',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      category: 'Substantial',
      ratingBand: 'Rating 3 (Substantial)',
      numericWeight: '3 / 3',
      count: substantialCount,
      share: effectiveTotal > 0 ? ((substantialCount / effectiveTotal) * 100).toFixed(1) : '0.0',
      color: '#14532d',
      bg: '#f0fdf4',
      border: '#bbf7d0',
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
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Survey Response Distribution ({coCode})
          </h3>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Aggregate response frequencies and proportional share for each feedback rating band.
          </span>
        </div>

        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            background: '#f1f5f9',
            padding: '4px 10px',
            borderRadius: 6,
            color: '#475569',
          }}
        >
          Total Evaluated Responses: <strong>{effectiveTotal}</strong>
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Response Category</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>Likert Scale Band</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Student Count</th>
              <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Response Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.category}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: r.bg,
                      color: r.color,
                      border: `1px solid ${r.border}`,
                      fontWeight: 800,
                    }}
                  >
                    {r.category}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>
                  {r.ratingBand}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                  {r.count} students
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                  {r.share}%
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 800 }}>
              <td style={{ padding: '10px 14px', color: '#0f172a' }}>Total Responses</td>
              <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 600 }}>All 3 Rating Levels</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#0f172a' }}>
                {effectiveTotal} students
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#16a34a' }}>100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
