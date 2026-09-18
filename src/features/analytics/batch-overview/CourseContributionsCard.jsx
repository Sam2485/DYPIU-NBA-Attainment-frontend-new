import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, User } from 'lucide-react';

export default function CourseContributionsCard({
  courseContributions = [],
  programmeBatchId = '',
}) {
  const navigate = useNavigate();
  const displayCourses = (courseContributions || []).slice(0, 5);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 28,
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={17} color="#0284c7" />
          </div>
          <div>
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
              COURSE CONTRIBUTION OVERVIEW
            </h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Academic course offerings contributing to evaluated programme outcomes
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/co-attainment?programmeBatchId=${programmeBatchId}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: '#0284c7',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <span>View Course Contributions</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Course List / Empty State */}
      {displayCourses.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          No course contribution evidence recorded for this batch.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayCourses.map((course, idx) => {
            const courseCode = course.courseCode || '';
            const courseName = course.courseName || 'Course Offering';
            const semester = course.semester ? `Semester ${course.semester}` : '';
            const coordinator = course.courseCoordinator || '';
            const attainment = course.overallCourseAttainment != null
              ? Number(course.overallCourseAttainment).toFixed(2)
              : null;

            // Extract top PO or PSO contributions
            const poEntries = Object.entries(course.poContributions || {}).slice(0, 3);
            const psoEntries = Object.entries(course.psoContributions || {}).slice(0, 2);

            return (
              <div
                key={course.programmeBatchCourseId || `${courseCode}_${idx}`}
                onClick={() =>
                  navigate(
                    `/co-attainment?programmeBatchId=${programmeBatchId}&programmeBatchCourseId=${course.programmeBatchCourseId}&courseCode=${courseCode}`
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                {/* Course identity */}
                <div style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#0f172a',
                        background: '#e2e8f0',
                        padding: '2px 7px',
                        borderRadius: 5,
                      }}
                    >
                      {courseCode}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {courseName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 11.5, color: '#64748b' }}>
                    {semester && <span>{semester}</span>}
                    {coordinator && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} color="#94a3b8" />
                        {coordinator}
                      </span>
                    )}
                  </div>
                </div>

                {/* Outcome Contribution Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {poEntries.map(([code, val]) => (
                    <div
                      key={code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#0284c7' }}>{code}:</span>
                      <span style={{ fontWeight: 700, color: '#0369a1' }}>
                        {Number(val).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {psoEntries.map(([code, val]) => (
                    <div
                      key={code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: '#16a34a' }}>{code}:</span>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>
                        {Number(val).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overall Course Attainment & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {attainment && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Overall Attainment
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {attainment} <span style={{ fontSize: 11, color: '#94a3b8' }}>/ 3.00</span>
                      </div>
                    </div>
                  )}

                  <ArrowRight size={14} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
