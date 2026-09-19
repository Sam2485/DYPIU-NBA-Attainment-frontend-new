import React from 'react';
import { X, ClipboardCheck, Users, BarChart2, Star, CheckCircle } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CourseEndSurveyModal({
  isOpen = false,
  onClose = () => {},
  coCode = '',
  coStatement = '',
  indirectEvidence = null,
  courseCode = '',
  courseName = '',
}) {
  if (!isOpen) return null;

  const responseCount = indirectEvidence?.responseCount ?? 0;
  const indirectScore = indirectEvidence?.indirectScore ?? null;
  const indirectLevel = indirectEvidence?.indirectLevel ?? null;
  const indirectPercentage = indirectEvidence?.indirectPercentage ?? null;
  const levelDistribution = indirectEvidence?.levelDistribution || {};

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 600,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClipboardCheck size={20} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Course-End Survey Evidence — {coCode}
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {courseCode} • {courseName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {coStatement && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                color: '#334155',
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#0f172a' }}>{coCode}:</strong> {coStatement}
            </div>
          )}

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                Responses
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                {responseCount}
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Total Students</span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Avg Score
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                {formatVal(indirectScore)}
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Scale 1.0 – 3.0</span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Attainment Level
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                Level {indirectLevel ?? '—'}
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>NBA Level (0-3)</span>
            </div>
          </div>

          {/* Response Distribution */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '16px',
              background: '#ffffff',
            }}
          >
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Student Rating Distribution
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[3, 2, 1].map((lvl) => {
                const count = levelDistribution[`LEVEL_${lvl}`] ?? levelDistribution[`${lvl}`] ?? levelDistribution[`L${lvl}`] ?? 0;
                const percentage = responseCount > 0 ? ((count / responseCount) * 100).toFixed(1) : 0;
                const label = lvl === 3 ? 'High (3)' : lvl === 2 ? 'Medium (2)' : 'Low (1)';

                return (
                  <div key={lvl}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>{label}</span>
                      <span style={{ color: '#64748b' }}>{count} students ({percentage}%)</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: lvl === 3 ? '#16a34a' : lvl === 2 ? '#0284c7' : '#f59e0b',
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '16px 0 0', textAlign: 'center' }}>
            Indirect attainment is derived from student responses in the official Course-End Survey conducted at semester completion.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
