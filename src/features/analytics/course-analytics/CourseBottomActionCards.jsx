import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, History, ArrowRight, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import CourseATR from '../../atr/CourseATR';

export default function CourseBottomActionCards({
  programmeBatchId,
  programmeBatchCourseId,
  courseCode = '',
  courseName = '',
  batchName = '',
  courseAtrAvailable = false,
  courseAtrStatus = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showInlineAtr, setShowInlineAtr] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin' : '';

  const atrPath = programmeBatchId
    ? `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/atr`
    : `${basePath}/analytics/course/${programmeBatchCourseId}/atr`;

  const historicalPath = programmeBatchId
    ? `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/historical`
    : `${basePath}/analytics/course/${programmeBatchCourseId}/historical`;

  const comparePath = `${basePath}/analytics/compare-courses?programmeBatchCourseId1=${programmeBatchCourseId}`;

  const status = (courseAtrStatus || (courseAtrAvailable ? 'RECORDED' : 'PENDING')).toUpperCase();
  const isAtrCompleted =
    status === 'COMPLETED' || status === 'APPROVED' || status === 'VERIFIED' || status === 'RECORDED';

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section Title */}
      <div style={{ marginBottom: 14 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
          }}
        >
          Investigation &amp; Quality Actions
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Course-level continuous improvement reports and multi-batch historical performance
        </span>
      </div>

      {/* Two Side-by-Side Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
        }}
      >
        {/* CARD 1: COURSE ACTION TAKEN REPORT (ATR) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: isAtrCompleted ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${isAtrCompleted ? '#a7f3d0' : '#fde68a'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAtrCompleted ? '#059669' : '#b45309',
                }}
              >
                <FileText size={20} />
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: isAtrCompleted ? '#ecfdf5' : '#fffbeb',
                  color: isAtrCompleted ? '#059669' : '#b45309',
                  border: `1px solid ${isAtrCompleted ? '#a7f3d0' : '#fde68a'}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {status}
              </span>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Course Action Taken Report (ATR)
            </h4>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              NBA continuous improvement requires closed-loop Action Taken Reports. Review identified CO attainment
              gaps, observations, and faculty action plans for {courseCode || 'this course'}.
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setShowInlineAtr(!showInlineAtr)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 7,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
            >
              <span>{showInlineAtr ? 'Hide Preview' : 'Quick Preview'}</span>
              {showInlineAtr ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <button
              type="button"
              onClick={() => navigate(atrPath)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0f172a',
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
            >
              <span>View Course ATR</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* CARD 2: COURSE HISTORICAL ANALYSIS */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 22,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                }}
              >
                <History size={20} />
              </div>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 999,
                  background: '#f0f9ff',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Cross-Batch Trends
              </span>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Historical Course Attainment
            </h4>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Track how {courseCode || 'this course'}&apos;s attainment has evolved across all academic batches. Compare
              direct vs indirect components, inspect CO-by-CO heatmaps, or compare against another offering.
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate(comparePath, {
                  state: {
                    slot1Course: {
                      programmeBatchCourseId,
                      programmeBatchId,
                      courseCode,
                      courseName,
                      batchName,
                    },
                  },
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 7,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#4f46e5',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#eef2ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
            >
              <GitCompare size={13} />
              <span>Compare Courses</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(historicalPath)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0284c7',
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
            >
              <span>Historical Attainment</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Optional Inline Preview of Course ATR (Uses exact CourseATR UI without selectors or print option) */}
      {showInlineAtr && (
        <div
          style={{
            marginTop: 20,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 14,
            padding: '24px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#0284c7" />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                Course ATR Inline Preview — {courseCode} ({batchName})
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setShowInlineAtr(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close Preview
            </button>
          </div>

          <CourseATR
            readOnly
            hideFooter={true}
            hideHeader={false}
            showCourseSelector={false}
            showAssignedCourseSelector={false}
            showHeaderActions={false}
            courseId={programmeBatchCourseId}
            batchId={programmeBatchId}
          />
        </div>
      )}
    </div>
  );
}
