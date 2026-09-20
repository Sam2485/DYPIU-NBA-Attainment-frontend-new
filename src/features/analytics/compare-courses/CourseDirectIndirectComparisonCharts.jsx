import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Layers, Target } from 'lucide-react';

const formatNum = (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '—');

export default function CourseDirectIndirectComparisonCharts({ course1, course2 }) {
  if (!course1 || !course2) return null;

  const c1Direct = course1.directAttainment !== null && course1.directAttainment !== undefined
    ? Number(course1.directAttainment)
    : 0;
  const c2Direct = course2.directAttainment !== null && course2.directAttainment !== undefined
    ? Number(course2.directAttainment)
    : 0;

  const c1Indirect = course1.indirectAttainment !== null && course1.indirectAttainment !== undefined
    ? Number(course1.indirectAttainment)
    : 0;
  const c2Indirect = course2.indirectAttainment !== null && course2.indirectAttainment !== undefined
    ? Number(course2.indirectAttainment)
    : 0;

  const directData = [
    {
      slotName: `${course1.batchName || 'Course 1'}`,
      courseCode: course1.courseCode,
      attainment: c1Direct,
      color: '#4f46e5',
      weight: course1.directWeight,
    },
    {
      slotName: `${course2.batchName || 'Course 2'}`,
      courseCode: course2.courseCode,
      attainment: c2Direct,
      color: '#0284c7',
      weight: course2.directWeight,
    },
  ];

  const indirectData = [
    {
      slotName: `${course1.batchName || 'Course 1'}`,
      courseCode: course1.courseCode,
      attainment: c1Indirect,
      color: '#4f46e5',
      weight: course1.indirectWeight,
    },
    {
      slotName: `${course2.batchName || 'Course 2'}`,
      courseCode: course2.courseCode,
      attainment: c2Indirect,
      color: '#0284c7',
      weight: course2.indirectWeight,
    },
  ];

  const directDelta = (c1Direct - c2Direct).toFixed(2);
  const directDeltaFmt = Number(directDelta) > 0 ? `+${directDelta}` : directDelta;

  const indirectDelta = (c1Indirect - c2Indirect).toFixed(2);
  const indirectDeltaFmt = Number(indirectDelta) > 0 ? `+${indirectDelta}` : indirectDelta;

  const renderSingleChart = (title, icon, data, deltaFmt, weight1, weight2, note) => {
    return (
      <div
        style={{
          flex: 1,
          minWidth: 320,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
              }}
            >
              {icon}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{title}</h4>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{note}</p>
            </div>
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            Δ {deltaFmt}
          </div>
        </div>

        {/* Weights indicator */}
        {(weight1 !== undefined || weight2 !== undefined) && (
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
            {weight1 !== undefined && (
              <span>
                C1 Weight: <strong>{weight1 ? `${Math.round(weight1 * 100)}%` : '—'}</strong>
              </span>
            )}
            {weight2 !== undefined && (
              <span>
                C2 Weight: <strong>{weight2 ? `${Math.round(weight2 * 100)}%` : '—'}</strong>
              </span>
            )}
          </div>
        )}

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 15 }} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="slotName"
                tick={{ fill: '#334155', fontSize: 11.5, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[0, 1.0, 2.0, 3.0]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          padding: '10px 14px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.slotName}</div>
                        <div style={{ color: '#64748b', fontSize: 11 }}>{d.courseCode}</div>
                        <div style={{ marginTop: 6, fontWeight: 700, color: d.color }}>
                          Attainment: {formatNum(d.attainment)} / 3.00
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="attainment" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {renderSingleChart(
        'Direct Attainment Comparison',
        <Target size={16} />,
        directData,
        directDeltaFmt,
        course1.directWeight,
        course2.directWeight,
        'Direct student assessment performance (C1 vs C2)'
      )}
      {renderSingleChart(
        'Indirect Attainment Comparison',
        <Layers size={16} />,
        indirectData,
        indirectDeltaFmt,
        course1.indirectWeight,
        course2.indirectWeight,
        'Course exit survey / indirect assessment (C1 vs C2)'
      )}
    </div>
  );
}
