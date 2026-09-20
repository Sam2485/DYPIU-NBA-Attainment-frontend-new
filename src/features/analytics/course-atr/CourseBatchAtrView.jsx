import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CourseATR from '../../atr/CourseATR';
import { ArrowLeft, Calendar, User, GraduationCap } from 'lucide-react';
import { ScreenLoadingState } from '../../../components/common/ScreenState';

export default function CourseBatchAtrView() {
  const { programmeBatchId, programmeBatchCourseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin' : '';
  const courseAnalyticsPath = programmeBatchId
    ? `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}`
    : `${basePath}/analytics/course/${programmeBatchCourseId}`;

  useEffect(() => {
    if (!programmeBatchCourseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    analyticsApi
      .getCourseAnalytics({ programmeBatchCourseId })
      .then((res) => {
        const payload = res?.data ?? res;
        setCourseData(payload);
      })
      .catch((err) => {
        console.warn('[CourseBatchAtrView] Error loading course analytics metadata:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [programmeBatchCourseId]);

  if (loading) {
    return <ScreenLoadingState message="Loading Course Action Taken Report..." />;
  }

  const courseCode = courseData?.courseCode || 'Course';
  const courseName = courseData?.courseName || 'Course Action Taken Report';
  const batchName = courseData?.batchName || 'Batch';
  const semester = courseData?.semester;
  const programmeName = courseData?.programmeName || '';
  const coordinator = courseData?.courseCoordinator || '';
  const status = (courseData?.courseAtrStatus || (courseData?.courseAtrAvailable ? 'RECORDED' : 'DRAFT')).toUpperCase();
  const isApproved = status === 'APPROVED' || status === 'VERIFIED' || status === 'COMPLETED';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header & Breadcrumbs */}
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
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate(courseAnalyticsPath)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Course Analytics</span>
            </button>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / COURSE / ACTION TAKEN REPORT (ATR)
            </span>
          </div>

          {/* ATR Status Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: isApproved ? '#f0fdf4' : '#fffbeb',
              color: isApproved ? '#15803d' : '#b45309',
              border: `1px solid ${isApproved ? '#bbf7d0' : '#fde68a'}`,
            }}
          >
            {status}
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {courseCode}
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {courseName} — Action Taken Report (ATR)
            </h1>
            {semester && (
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
                Semester {semester}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap', marginTop: 8 }}>
            {programmeName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <GraduationCap size={14} color="#64748b" />
                <strong style={{ color: '#0284c7' }}>{programmeName}</strong>
              </span>
            )}
            {batchName && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} color="#64748b" />
                <span style={{ color: '#334155', fontWeight: 600 }}>{batchName}</span>
              </span>
            )}
            {coordinator && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <User size={13} color="#64748b" />
                <span>Coordinator: {coordinator}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Course ATR Component in Reports Read-Only Mode:
          - No course selector
          - No print option
          - Scoped to the selected course offering
      */}
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
  );
}
