import React from 'react';
import { Target, Award, CheckCircle2, XCircle, Users, Percent, ShieldCheck } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CoDirectSummaryCard({
  coCode,
  directAttainment,
  directLevel,
  target,
  targetMet,
  totalStudents,
  evaluatedStudents,
  studentsMeetingThreshold,
  studentsBelowThreshold,
  threshold,
  passingPercentage,
  directWeight = 80,
}) {
  const isMet = targetMet === true;

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
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: '#0284c7',
              display: 'inline-block',
            }}
          />
          <h3
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Direct Evidence Summary ({coCode || 'CO'})
          </h3>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 999,
            background: '#e0f2fe',
            color: '#0284c7',
          }}
        >
          Direct Weight: {directWeight}%
        </span>
      </div>

      {/* Compact Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
        }}
      >
        {/* 1. Direct Attainment */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Direct Attainment
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>
              {formatVal(directAttainment)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>NBA Direct Attainment</span>
        </div>

        {/* 2. Direct Level */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Direct Level
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Level {directLevel ?? '—'}
            </span>
            <Award size={16} style={{ color: '#0284c7' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>NBA Attainment Level</span>
        </div>

        {/* 3. CO Target & Status */}
        <div
          style={{
            background: isMet ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isMet ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: isMet ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
            CO Target & Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {formatVal(target)}
            </span>
            {targetMet != null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: isMet ? '#dcfce7' : '#fee2e2',
                  color: isMet ? '#15803d' : '#b91c1c',
                }}
              >
                {isMet ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isMet ? 'Target Met' : 'Not Met'}
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: isMet ? '#166534' : '#991b1b' }}>
            Authoritative backend status
          </span>
        </div>

        {/* 4. Evaluated Students */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Evaluated Students
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {evaluatedStudents ?? totalStudents ?? '—'}
            </span>
            {totalStudents != null && evaluatedStudents != null && totalStudents !== evaluatedStudents && (
              <span style={{ fontSize: 12, color: '#64748b' }}>/ {totalStudents} Enrolled</span>
            )}
            <Users size={16} style={{ color: '#0284c7', marginLeft: 'auto' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {totalStudents != null && evaluatedStudents != null && totalStudents !== evaluatedStudents
              ? `${evaluatedStudents} evaluated of ${totalStudents} enrolled`
              : 'Evaluation Population'}
          </span>
        </div>

        {/* 5. Meeting vs Below Threshold */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Meeting / Below Threshold
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
              {studentsMeetingThreshold ?? 0}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>above</span>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: studentsBelowThreshold > 0 ? '#d97706' : '#64748b' }}>
              {studentsBelowThreshold ?? 0}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>below</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Direct assessment threshold</span>
        </div>

        {/* 6. Threshold & Passing % */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Threshold / Passing Rate
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {formatVal(passingPercentage, 1)}%
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              (@ {formatVal(threshold, 0)}% thresh)
            </span>
            <Percent size={15} style={{ color: '#0284c7', marginLeft: 'auto' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Students reaching benchmark</span>
        </div>
      </div>
    </div>
  );
}
