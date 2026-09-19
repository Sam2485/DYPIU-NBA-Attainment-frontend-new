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
} from 'recharts';
import { Users, FileSpreadsheet, ExternalLink, Award, CheckCircle2, TrendingUp } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

function ComparisonTooltip({ active, payload }) {
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
        {item.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#64748b' }}>Score:</span>
        <strong style={{ color: item.fill }}>{formatVal(item.value)} / 3.00</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
        <span style={{ color: '#64748b' }}>Component Weight:</span>
        <strong style={{ color: '#0f172a' }}>{item.weight}</strong>
      </div>
    </div>
  );
}

export default function CoDirectVsIndirectSection({
  directAttainment,
  indirectAttainment,
  target,
  directEvidenceSummary,
  indirectEvidenceSummary,
  directWeight = 80,
  indirectWeight = 20,
  onOpenStudentEvidence,
  onOpenSurvey,
}) {
  const chartData = [
    {
      name: 'Direct Attainment',
      value: Number(directAttainment != null ? directAttainment : 0),
      weight: `${directWeight || 80}%`,
      fill: PO_COLOR,
    },
    {
      name: 'Indirect Attainment',
      value: Number(indirectAttainment != null ? indirectAttainment : 0),
      weight: `${indirectWeight || 20}%`,
      fill: PSO_COLOR,
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
      {/* Section Header */}
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
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: '#0284c7',
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
              Direct vs Indirect Assessment Breakdown
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Comparison of student end-sem exam performance and student course-end survey feedback.
          </span>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
          Y-Axis: Attainment (0.00 – 3.00)
        </div>
      </div>

      {/* Vertical Bar Chart Comparison */}
      <div style={{ width: '100%', height: 260, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 30, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontWeight: 700, fill: '#334155' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 3.0]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            {target != null && (
              <ReferenceLine
                y={Number(target)}
                stroke="#0f172a"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Target: ${formatVal(target)}`,
                  position: 'insideTopRight',
                  fill: '#0f172a',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              />
            )}
            <Tooltip content={<ComparisonTooltip />} />
            <Bar
              dataKey="value"
              name="Attainment"
              radius={[4, 4, 0, 0]}
              barSize={48}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`comp-cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Side-by-side Evidence Drilldown Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Direct Evidence Panel */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #bae6fd',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: PO_COLOR,
                    display: 'inline-block',
                  }}
                />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Direct Evidence (Exams)
                </h4>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#e0f2fe',
                  color: '#0284c7',
                }}
              >
                Weight: {directWeight || 80}%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Evaluated Students:</span>
                <strong style={{ color: '#0f172a' }}>
                  {directEvidenceSummary?.evaluatedStudents ?? '—'}
                  {directEvidenceSummary?.totalStudents ? ` / ${directEvidenceSummary.totalStudents}` : ''}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Students Meeting Threshold:</span>
                <strong style={{ color: '#0284c7' }}>
                  {directEvidenceSummary?.studentsMeetingThreshold ?? '—'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Passing Percentage:</span>
                <strong style={{ color: '#0f172a' }}>
                  {formatVal(directEvidenceSummary?.directPercentage, 1)}%
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>NBA Direct Level:</span>
                <strong style={{ color: '#0f172a' }}>
                  Level {directEvidenceSummary?.directLevel ?? '—'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onOpenStudentEvidence}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: '#0284c7',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
            >
              <Users size={14} />
              <span>View Student Evidence</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Indirect Evidence Panel */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: PSO_COLOR,
                    display: 'inline-block',
                  }}
                />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Indirect Evidence (Survey)
                </h4>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#dcfce7',
                  color: '#16a34a',
                }}
              >
                Weight: {indirectWeight || 20}%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Survey Responses:</span>
                <strong style={{ color: '#0f172a' }}>
                  {indirectEvidenceSummary?.responseCount ?? '—'} students
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Survey Score:</span>
                <strong style={{ color: '#16a34a' }}>
                  {formatVal(indirectEvidenceSummary?.indirectScore)} / 3.00
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>NBA Indirect Level:</span>
                <strong style={{ color: '#0f172a' }}>
                  Level {indirectEvidenceSummary?.indirectLevel ?? '—'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Assessment Method:</span>
                <span style={{ color: '#64748b' }}>Course-End Survey</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onOpenSurvey}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: '#16a34a',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#15803d')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#16a34a')}
            >
              <FileSpreadsheet size={14} />
              <span>View Course-End Survey</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
