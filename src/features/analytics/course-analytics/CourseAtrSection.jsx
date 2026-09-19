import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function CourseAtrSection({
  programmeBatchCourseId,
  courseAtrAvailable,
  courseAtrStatus,
}) {
  const navigate = useNavigate();

  const status = (courseAtrStatus || (courseAtrAvailable ? 'AVAILABLE' : 'PENDING')).toUpperCase();
  const isCompleted = status === 'COMPLETED' || status === 'APPROVED' || status === 'SUBMITTED';

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: isCompleted ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${isCompleted ? '#a7f3d0' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} color={isCompleted ? '#059669' : '#64748b'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Course Continuous Improvement & ATR
              </h4>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: isCompleted ? '#ecfdf5' : '#fffbeb',
                  color: isCompleted ? '#059669' : '#b45309',
                  border: `1px solid ${isCompleted ? '#a7f3d0' : '#fde68a'}`,
                }}
              >
                {status}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
              NBA continuous improvement requires closed-loop Action Taken Reports based on identified CO attainment gaps.
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              navigate(`/reports/atr?courseOfferingId=${programmeBatchCourseId}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
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
    </div>
  );
}
