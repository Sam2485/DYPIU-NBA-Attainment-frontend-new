import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, User } from 'lucide-react';

export default function CoAnalyticsHeader({
  programmeBatchId,
  programmeBatchCourseId,
  batchName,
  programmeName,
  courseCode,
  courseName,
  semester,
  courseCoordinator,
  coCode,
  coStatement,
  outcomeCode,
  outcomeType = 'PO',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  const handleBackToCourse = () => {
    const query = outcomeCode ? `?outcomeType=${outcomeType}&outcomeCode=${outcomeCode}` : '';
    navigate(
      `${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}${query}`
    );
  };

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
      {/* 1. Breadcrumbs & Back Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBackToCourse}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Course Analytics</span>
          </button>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span>ANALYTICS</span>
            <span>/</span>
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`${basePath}/analytics/batch/${programmeBatchId}`)}
            >
              BATCH ANALYTICS
            </span>
            {outcomeCode && (
              <>
                <span>/</span>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`${basePath}/analytics/batch/${programmeBatchId}/direct/${outcomeType}/${outcomeCode}`)
                  }
                >
                  DIRECT ATTAINMENT ({outcomeCode})
                </span>
              </>
            )}
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={handleBackToCourse}>
              {courseCode || 'COURSE'}
            </span>
            <span>/</span>
            <span style={{ color: '#7c3aed', fontWeight: 800 }}>{coCode} ANALYTICS</span>
          </span>
        </div>
      </div>

      {/* 2. CO Details and Context */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: '#7c3aed',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            {coCode}
          </span>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {courseCode} — {courseName}
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

        {/* CO Statement */}
        {coStatement && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#334155',
              lineHeight: 1.5,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <strong style={{ color: '#0f172a' }}>CO Statement:</strong> {coStatement}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
          {programmeName && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap size={14} color="#64748b" />
              <span>{programmeName}</span>
            </span>
          )}
          {batchName && (
            <span>
              <strong style={{ color: '#0f172a' }}>Batch:</strong> {batchName}
            </span>
          )}
          {courseCoordinator && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <User size={13} color="#64748b" />
              <span>Coordinator: {courseCoordinator}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
