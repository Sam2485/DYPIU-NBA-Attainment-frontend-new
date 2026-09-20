import React from 'react';
import { GraduationCap, Calendar } from 'lucide-react';

export default function CourseContextSummaryCard({ data, currentBatchSummary }) {
  if (!data) return null;

  const {
    courseCode,
    courseName,
    programmeName,
    currentBatchName,
    currentBatchStatus,
    currentSemester,
    directWeight,
    indirectWeight,
  } = data;

  const dWeight = directWeight != null ? Number(directWeight).toFixed(0) : '70';
  const iWeight = indirectWeight != null ? Number(indirectWeight).toFixed(0) : '30';

  const overall = currentBatchSummary?.overallCourseAttainment != null
    ? Number(currentBatchSummary.overallCourseAttainment).toFixed(2)
    : '—';
  const direct = currentBatchSummary?.directAttainment != null
    ? Number(currentBatchSummary.directAttainment).toFixed(2)
    : '—';
  const indirect = currentBatchSummary?.indirectAttainment != null
    ? Number(currentBatchSummary.indirectAttainment).toFixed(2)
    : '—';

  const statusBg =
    currentBatchStatus === 'ACTIVE'
      ? '#dcfce7'
      : currentBatchStatus === 'COMPLETED' || currentBatchStatus === 'GRADUATED'
      ? '#f1f5f9'
      : '#eff6ff';
  const statusColor =
    currentBatchStatus === 'ACTIVE'
      ? '#15803d'
      : currentBatchStatus === 'COMPLETED' || currentBatchStatus === 'GRADUATED'
      ? '#475569'
      : '#1d4ed8';
  const statusBorder =
    currentBatchStatus === 'ACTIVE'
      ? '#86efac'
      : currentBatchStatus === 'COMPLETED' || currentBatchStatus === 'GRADUATED'
      ? '#cbd5e1'
      : '#bfdbfe';

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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          alignItems: 'center',
        }}
      >
        {/* Left: Course Identity & Academic Context */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {courseCode || 'COURSE'}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {courseName || 'Course'}
            </h2>
            {currentSemester != null && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                Semester {currentSemester}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: '#64748b', flexWrap: 'wrap' }}>
            {programmeName && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <GraduationCap size={14} color="#64748b" />
                <span style={{ fontWeight: 600, color: '#334155' }}>{programmeName}</span>
              </div>
            )}
            {currentBatchName && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} color="#64748b" />
                <span>
                  Current Batch: <strong style={{ color: '#0f172a' }}>{currentBatchName}</strong>
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusBorder}`,
                  }}
                >
                  {currentBatchStatus || 'ACTIVE'}
                </span>
              </div>
            )}
          </div>

          {/* Configured Weights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: 12 }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Configured Assessment Weights:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#f0f9ff',
                color: '#0284c7',
                fontWeight: 700,
                border: '1px solid #bae6fd',
              }}
            >
              Direct: {dWeight}%
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#f0fdf4',
                color: '#16a34a',
                fontWeight: 700,
                border: '1px solid #bbf7d0',
              }}
            >
              Indirect: {iWeight}%
            </span>
          </div>
        </div>

        {/* Right: Key Current Metrics Cards */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div
            style={{
              flex: '1 1 110px',
              maxWidth: 140,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
              Current Overall
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>
              {overall}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Scale: 0 - 3.00</div>
          </div>

          <div
            style={{
              flex: '1 1 110px',
              maxWidth: 140,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
              Current Direct
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {direct}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Exams / Marks</div>
          </div>

          <div
            style={{
              flex: '1 1 110px',
              maxWidth: 140,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
              Current Indirect
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0d9488' }}>
              {indirect}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>CES Surveys</div>
          </div>
        </div>
      </div>
    </div>
  );
}
