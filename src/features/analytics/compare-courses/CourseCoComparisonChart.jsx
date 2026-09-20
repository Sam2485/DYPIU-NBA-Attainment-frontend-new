import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Award, Info } from 'lucide-react';

const formatNum = (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '—');

export default function CourseCoComparisonChart({ coComparisons = [], course1, course2 }) {
  if (!coComparisons || coComparisons.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: '28px',
          textAlign: 'center',
          color: '#64748b',
        }}
      >
        No Course Outcome data available to compare.
      </div>
    );
  }

  // Transform data for Recharts grouped bar chart
  const data = coComparisons.map((item) => {
    const c1Val =
      item.course1Metrics?.overallAttainment !== null &&
      item.course1Metrics?.overallAttainment !== undefined
        ? Number(item.course1Metrics.overallAttainment)
        : null;

    const c2Val =
      item.course2Metrics?.overallAttainment !== null &&
      item.course2Metrics?.overallAttainment !== undefined
        ? Number(item.course2Metrics.overallAttainment)
        : null;

    return {
      coCode: item.coCode,
      statement: item.statement,
      course1Attainment: c1Val,
      course2Attainment: c2Val,
      course1Metrics: item.course1Metrics,
      course2Metrics: item.course2Metrics,
      attainmentDelta: item.attainmentDelta,
    };
  });

  const c1Label = `${course1?.courseCode || 'C1'} (${course1?.batchName || 'Batch 1'})`;
  const c2Label = `${course2?.courseCode || 'C2'} (${course2?.batchName || 'Batch 2'})`;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              Course Outcomes Comparison (CO-by-CO)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
              Grouped vertical bars comparing overall attainment for each aligned course outcome
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
          <Info size={13} />
          <span>Scale: 0.00 – 3.00 OBE attainment level</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="coCode"
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const deltaNum =
                    item.attainmentDelta !== null && item.attainmentDelta !== undefined
                      ? Number(item.attainmentDelta)
                      : null;
                  const deltaStr =
                    deltaNum !== null
                      ? (deltaNum > 0 ? `+${deltaNum.toFixed(2)}` : deltaNum.toFixed(2))
                      : '—';

                  return (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        padding: '14px 18px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 260,
                        maxWidth: 340,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.coCode}</div>
                      {item.statement && (
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, marginBottom: 8, lineHeight: 1.4 }}>
                          {item.statement}
                        </div>
                      )}

                      <div
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          fontSize: 12,
                        }}
                      >
                        {/* Course 1 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#4f46e5', fontWeight: 600 }}>{c1Label}:</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {formatNum(item.course1Attainment)}{' '}
                            <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 400 }}>
                              (Target: {formatNum(item.course1Metrics?.targetLevel)})
                            </span>
                          </span>
                        </div>

                        {/* Course 2 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#0284c7', fontWeight: 600 }}>{c2Label}:</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {formatNum(item.course2Attainment)}{' '}
                            <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 400 }}>
                              (Target: {formatNum(item.course2Metrics?.targetLevel)})
                            </span>
                          </span>
                        </div>

                        {/* Mathematical Delta */}
                        <div
                          style={{
                            borderTop: '1px dashed #e2e8f0',
                            paddingTop: 6,
                            marginTop: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ color: '#64748b', fontSize: 11 }}>Mathematical Delta (C1 − C2):</span>
                          <span
                            style={{
                              fontFamily: 'ui-monospace, monospace',
                              fontWeight: 800,
                              fontSize: 12,
                              color: deltaNum === null ? '#94a3b8' : deltaNum === 0 ? '#334155' : deltaNum > 0 ? '#0369a1' : '#475569',
                            }}
                          >
                            {deltaStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              formatter={(val) => {
                if (val === 'course1Attainment') return c1Label;
                if (val === 'course2Attainment') return c2Label;
                return val;
              }}
            />
            <Bar dataKey="course1Attainment" name="course1Attainment" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="course2Attainment" name="course2Attainment" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
