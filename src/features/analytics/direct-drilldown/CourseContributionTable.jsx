import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, User } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function CourseContributionTable({
  courses = [],
  contributingCourseCount = 0,
  outcomeCode = '',
  outcomeType = 'PO',
  programmeBatchId = '',
}) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const totalCourses = courses.length;
  const displayedCourses = showAll ? courses : courses.slice(0, 5);
  const hasMoreThan5 = totalCourses > 5;

  const handleViewCourseDetails = (course) => {
    const courseId = course.programmeBatchCourseId || course.courseOfferingId || course.id;
    if (!courseId) return;

    // Navigate to Course Diagnostic screen preserving the full analytical lineage
    const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
    navigate(
      `${basePath}/analytics/batch/${programmeBatchId}/course/${courseId}?outcomeType=${outcomeType}&outcomeCode=${outcomeCode}`
    );
  };

  // Zero / No contribution state
  if (!courses || courses.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <BookOpen size={20} color="#94a3b8" />
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
          No Contributing Courses Found
        </h4>
        <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '0 auto', lineHeight: 1.5 }}>
          No contributing courses are mapped to <strong>{outcomeCode}</strong> in this programme batch curriculum. Direct attainment is evaluated only for mapped courses with active outcome correlation.
        </p>
      </div>
    );
  }

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
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14,
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
              Contributing Courses to {outcomeCode}
            </h3>
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'inline-block' }}>
            Detailed course metrics and weighted contribution calculation to {outcomeCode}
          </span>
        </div>

        {/* Contributing Course Count Badge from backend */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: 999,
            background: isPo ? '#f0f9ff' : '#f0fdf4',
            color: themeColor,
            border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
          }}
        >
          Contributing Courses: {contributingCourseCount ?? totalCourses}
        </span>
      </div>

      {/* Metric Definitions Guide Box */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 11.5,
          color: '#475569',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        <div>
          <strong style={{ color: '#0f172a' }}>Overall Course Attainment:</strong> Direct attainment achieved by this course across continuous assessments and exams (0.00 – 3.00).
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Mapping Strength:</strong> Curricular correlation of this course to {outcomeCode} (1 = Low, 2 = Medium, 3 = High).
        </div>
        <div>
          <strong style={{ color: themeColor }}>Course Contribution:</strong> Authoritative weighted contribution to {outcomeCode} aggregated by the backend engine.
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', width: 90 }}>Code</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', minWidth: 160 }}>Course Name</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', width: 80 }}>Semester</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', minWidth: 140 }}>Course Coordinator</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'right', width: 140 }}>
                Overall Attainment
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'right', width: 120 }}>
                Mapping Strength
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: themeColor, textAlign: 'right', width: 130 }}>
                {outcomeCode} Contribution
              </th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#475569', textAlign: 'center', width: 110 }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedCourses.map((c, index) => {
              const overallVal = c.overallCourseAttainment != null ? Number(c.overallCourseAttainment).toFixed(2) : '—';
              const mappingVal = c.mappingStrength != null ? Number(c.mappingStrength).toFixed(1) : '—';
              const contributionVal = c.contribution != null ? Number(c.contribution).toFixed(2) : '—';

              return (
                <tr
                  key={c.programmeBatchCourseId || `${c.courseCode}-${index}`}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0fdfa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafafa';
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 800, color: '#0f172a' }}>
                    {c.courseCode}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                    {c.courseName}
                  </td>
                  <td style={{ padding: '12px', color: '#64748b', fontWeight: 600 }}>
                    {c.semester ? `Sem ${c.semester}` : '—'}
                  </td>
                  <td style={{ padding: '12px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User size={13} color="#94a3b8" />
                      <span>{c.courseCoordinator || 'Not Assigned'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {overallVal}
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>/ 3.00</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#f1f5f9',
                        fontWeight: 800,
                      }}
                    >
                      {mappingVal}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: themeColor }}>
                    {contributionVal}
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>/ 3.00</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleViewCourseDetails(c)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isPo ? '#f0f9ff' : '#f0fdf4';
                        e.currentTarget.style.borderColor = themeColor;
                        e.currentTarget.style.color = themeColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                    >
                      <span>View Details</span>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show All / Collapse Toggle if > 5 Courses */}
      {hasMoreThan5 && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = themeColor;
              e.currentTarget.style.color = themeColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            {showAll ? (
              <>
                <span>Collapse to Top 5 Courses</span>
                <ChevronUp size={15} />
              </>
            ) : (
              <>
                <span>Show All {totalCourses} Courses</span>
                <ChevronDown size={15} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
