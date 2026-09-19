import React from 'react';
import { Target, Award, CheckCircle2, XCircle, Users, Star, FileSpreadsheet } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CoIndirectSummaryCard({
  coCode = 'CO',
  indirectAttainment = null,
  indirectLevel = null,
  target = null,
  targetMet = null,
  responseCount = 0,
  indirectScore = null,
  assessmentMethod = 'Course-End Survey',
  indirectWeight = 20,
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
              background: '#16a34a',
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
            Indirect Evidence Summary ({coCode})
          </h3>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 999,
            background: '#dcfce7',
            color: '#16a34a',
          }}
        >
          Indirect Weight: {indirectWeight}%
        </span>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
        }}
      >
        {/* 1. Indirect Attainment */}
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
            Indirect Attainment
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
              {formatVal(indirectAttainment)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>NBA Indirect Attainment</span>
        </div>

        {/* 2. Indirect Level */}
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
            Indirect Level
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Level {indirectLevel ?? '—'}
            </span>
            <Award size={16} style={{ color: '#16a34a' }} />
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

        {/* 4. Survey Responses */}
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
            Survey Responses
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {responseCount ?? 0}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>students</span>
            <Users size={16} style={{ color: '#16a34a', marginLeft: 'auto' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Anonymous survey count</span>
        </div>

        {/* 5. Average Survey Score */}
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
            Average Survey Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
              {formatVal(indirectScore)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3.00</span>
            <Star size={15} style={{ color: '#16a34a', marginLeft: 'auto' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Mean Likert response score</span>
        </div>

        {/* 6. Assessment Method */}
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
            Assessment Method
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {assessmentMethod}
            </span>
            <FileSpreadsheet size={15} style={{ color: '#16a34a', marginLeft: 'auto' }} />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Indirect Evaluation Method</span>
        </div>
      </div>
    </div>
  );
}
