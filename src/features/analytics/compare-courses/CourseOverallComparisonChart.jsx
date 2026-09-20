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
import { BarChart3, Scale } from 'lucide-react';

const formatNum = (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '—');

export default function CourseOverallComparisonChart({ course1, course2 }) {
  if (!course1 || !course2) return null;

  const c1Val = course1.overallCourseAttainment !== null && course1.overallCourseAttainment !== undefined
    ? Number(course1.overallCourseAttainment)
    : 0;
  const c2Val = course2.overallCourseAttainment !== null && course2.overallCourseAttainment !== undefined
    ? Number(course2.overallCourseAttainment)
    : 0;

  const data = [
    {
      name: `${course1.courseCode} (${course1.batchName || 'Course 1'})`,
      shortName: course1.batchName || course1.courseCode,
      courseCode: course1.courseCode,
      courseName: course1.courseName,
      batchName: course1.batchName,
      overall: c1Val,
      direct: course1.directAttainment,
      indirect: course1.indirectAttainment,
      slot: 'Course 1 (Reference)',
      color: '#4f46e5', // indigo
    },
    {
      name: `${course2.courseCode} (${course2.batchName || 'Course 2'})`,
      shortName: course2.batchName || course2.courseCode,
      courseCode: course2.courseCode,
      courseName: course2.courseName,
      batchName: course2.batchName,
      overall: c2Val,
      direct: course2.directAttainment,
      indirect: course2.indirectAttainment,
      slot: 'Course 2 (Comparison)',
      color: '#0284c7', // sky blue
    },
  ];

  const delta = (c1Val - c2Val).toFixed(2);
  const deltaNum = Number(delta);
  const deltaFormatted = deltaNum > 0 ? `+${delta}` : delta;

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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Overall Course Attainment Comparison
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
                Vertical side-by-side comparison on official 0.00 – 3.00 OBE attainment scale
              </p>
            </div>
          </div>
        </div>

        {/* Delta Callout */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Scale size={14} color="#64748b" />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Delta (C1 − C2):</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'ui-monospace, monospace',
              color: deltaNum === 0 ? '#334155' : deltaNum > 0 ? '#0369a1' : '#475569',
            }}
          >
            {deltaFormatted}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#4f46e5', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, color: '#334155' }}>
            Course 1: {course1.courseCode} ({course1.batchName}) —{' '}
            <span style={{ color: '#4f46e5', fontWeight: 700 }}>{formatNum(course1.overallCourseAttainment)}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#0284c7', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, color: '#334155' }}>
            Course 2: {course2.courseCode} ({course2.batchName}) —{' '}
            <span style={{ color: '#0284c7', fontWeight: 700 }}>{formatNum(course2.overallCourseAttainment)}</span>
          </span>
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barSize={56}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
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
                  return (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        padding: '12px 16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 220,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        {item.slot}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                        {item.courseCode} · {item.batchName}
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>{item.courseName}</div>
                      <div
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Overall Attainment:</span>
                          <span style={{ fontWeight: 800, color: item.color }}>{formatNum(item.overall)} / 3.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Direct Attainment:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatNum(item.direct)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Indirect Attainment:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatNum(item.indirect)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="overall" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
