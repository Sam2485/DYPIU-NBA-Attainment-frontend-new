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
} from 'recharts';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

function CourseContributionTooltip({ active, payload, outcomeType }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const contributionVal = Number(data.contribution != null ? data.contribution : 0).toFixed(2);
  const mappingVal = Number(data.mappingStrength != null ? data.mappingStrength : 0).toFixed(1);
  const overallVal = Number(data.overallCourseAttainment != null ? data.overallCourseAttainment : 0).toFixed(2);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 12,
        minWidth: 240,
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>
        {data.courseCode}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>
        {data.courseName} {data.semester ? `(Sem ${data.semester})` : ''}
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Selected Outcome Contribution:</span>
          <strong style={{ color: themeColor }}>{contributionVal} / 3.00</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Mapping Strength:</span>
          <strong style={{ color: '#0f172a' }}>{mappingVal} / 3.0</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Overall Course Attainment:</span>
          <strong style={{ color: '#0f172a' }}>{overallVal} / 3.00</strong>
        </div>
      </div>
    </div>
  );
}

export default function CourseContributionChart({
  courses = [],
  outcomeCode,
  outcomeType,
  selectedCourseId,
  onSelectCourse,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  if (!courses || courses.length === 0) {
    return null;
  }

  const chartData = courses.map((c) => ({
    programmeBatchCourseId: c.programmeBatchCourseId,
    courseCode: c.courseCode,
    courseName: c.courseName,
    semester: c.semester,
    contribution: Number(c.contribution != null ? c.contribution : 0),
    mappingStrength: Number(c.mappingStrength != null ? c.mappingStrength : 0),
    overallCourseAttainment: Number(c.overallCourseAttainment != null ? c.overallCourseAttainment : 0),
  }));

  // Calculate dynamic min-width so vertical bars always have adequate space when many courses exist
  const dynamicWidth = Math.max(500, chartData.length * 52);

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
      {/* Header */}
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
                background: themeColor,
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
              Course Contributions to {outcomeCode}
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            How each contributing course contributes to the selected programme outcome.
          </span>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
          Y-Axis: Course Contribution (0.00 – 3.00)
        </div>
      </div>

      {/* Chart with horizontal scroll wrapper if many courses, keeping bars STRICTLY VERTICAL */}
      <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 8 }}>
        <div style={{ minWidth: dynamicWidth, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -20, bottom: 25 }}
              onClick={(state) => {
                if (state?.activePayload?.[0]?.payload && onSelectCourse) {
                  onSelectCourse(state.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="courseCode"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 3.0]}
                ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CourseContributionTooltip outcomeType={outcomeType} />} />
              <Bar
                dataKey="contribution"
                name="Contribution"
                fill={themeColor}
                radius={[4, 4, 0, 0]}
                barSize={24}
              >
                {chartData.map((entry) => {
                  const isSelected = entry.programmeBatchCourseId === selectedCourseId;
                  return (
                    <Cell
                      key={`course-cell-${entry.programmeBatchCourseId || entry.courseCode}`}
                      fill={isSelected ? '#0369a1' : themeColor}
                      cursor="pointer"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer / Guide */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid #f1f5f9',
          fontSize: 11,
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: themeColor,
              display: 'inline-block',
            }}
          />
          <span>Course Contribution = (Mapping Strength × Overall Course Attainment) / 3</span>
        </div>
        <span>Hover over any bar to view detailed course indicators</span>
      </div>
    </div>
  );
}
