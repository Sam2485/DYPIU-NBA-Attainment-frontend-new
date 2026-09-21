import React from 'react';
import { Target, Award, CheckCircle2, XCircle, Users, Star, FileSpreadsheet, Percent } from 'lucide-react';

const INDIRECT_GREEN = '#16a34a';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CoIndirectSummaryCard({
  coCode = 'CO1',
  coScope = 'SELECTED',
  overallIndirectAttainment = null,
  overallIndirectPercentage = null,
  totalSurveyResponses = 0,
  assessmentMethod = 'Course End Survey',
  indirectWeight = 20,
  // Selected CO specific metrics
  indirectAttainment = null,
  indirectScore = null,
  coOverallIndirectPercentage = null,
  target = null,
  targetMet = null,
}) {
  const isMet = targetMet === true;
  const isSelectedMode = coScope === 'SELECTED';

  // In Selected CO mode, indirect percentage defaults to the selected CO's overall percentage
  const displayPercentage = isSelectedMode && coOverallIndirectPercentage != null
    ? coOverallIndirectPercentage
    : overallIndirectPercentage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
      {/* 1. TOP SUMMARY SECTION (5 CARDS) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {/* Card 1: Overall Indirect Attainment */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Indirect Attainment
            </span>
            <Award size={16} style={{ color: INDIRECT_GREEN }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: INDIRECT_GREEN }}>
              {formatVal(overallIndirectAttainment)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Authoritative Course Level</span>
        </div>

        {/* Card 2: Indirect Percentage */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Indirect Percentage
            </span>
            <Percent size={16} style={{ color: INDIRECT_GREEN }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {displayPercentage != null ? `${formatVal(displayPercentage, 2)}%` : '—'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {isSelectedMode ? `${coCode} Weighted Survey %` : 'Course Survey Attainment %'}
          </span>
        </div>

        {/* Card 3: Survey Responses */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Survey Responses
            </span>
            <Users size={16} style={{ color: INDIRECT_GREEN }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {totalSurveyResponses ?? 0}
            </span>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>respondents</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Total Feedback Submissions</span>
        </div>

        {/* Card 4: Assessment Method */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Assessment Method
            </span>
            <FileSpreadsheet size={16} style={{ color: INDIRECT_GREEN }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {assessmentMethod || 'Course End Survey'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>NBA Indirect Tool</span>
        </div>

        {/* Card 5: Indirect Weight */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Indirect Weight
            </span>
            <Award size={16} style={{ color: INDIRECT_GREEN }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: INDIRECT_GREEN }}>
              {formatVal(indirectWeight, 0)}%
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Course Attainment Share</span>
        </div>
      </div>

      {/* 2. SELECTED CO ATTAINMENT SUMMARY (Shown only when in Selected CO mode) */}
      {isSelectedMode && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
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
                  background: INDIRECT_GREEN,
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
                CO Attainment Summary ({coCode})
              </h3>
            </div>

            {targetMet != null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: isMet ? '#dcfce7' : '#fee2e2',
                  color: isMet ? '#15803d' : '#b91c1c',
                  border: `1px solid ${isMet ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                {isMet ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {isMet ? 'Target Met' : 'Target Not Met'}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 14,
            }}
          >
            {/* Indirect Attainment */}
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
                <span style={{ fontSize: 20, fontWeight: 800, color: INDIRECT_GREEN }}>
                  {formatVal(indirectAttainment, 0)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>NBA Attainment Level</span>
            </div>

            {/* Indirect Score */}
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
                Indirect Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {formatVal(indirectScore, 2)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>/ 3.00</span>
                <Star size={14} style={{ color: INDIRECT_GREEN, marginLeft: 'auto' }} />
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Mean Likert Score</span>
            </div>

            {/* Overall Indirect Percentage */}
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
                Overall Indirect Percentage
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: INDIRECT_GREEN }}>
                  {coOverallIndirectPercentage != null ? `${formatVal(coOverallIndirectPercentage, 2)}%` : '—'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Survey Attainment %</span>
            </div>

            {/* Target */}
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
                Target Benchmark
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {formatVal(target, 2)}
                </span>
                <Target size={14} style={{ color: '#64748b', marginLeft: 'auto' }} />
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>Configured CO Benchmark</span>
            </div>

            {/* Status */}
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
                Attainment Status
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: isMet ? '#15803d' : '#b91c1c' }}>
                  {isMet ? 'Target Met' : 'Not Met'}
                </span>
                {isMet ? <CheckCircle2 size={18} style={{ color: '#15803d' }} /> : <XCircle size={18} style={{ color: '#b91c1c' }} />}
              </div>
              <span style={{ fontSize: 11, color: isMet ? '#166534' : '#991b1b' }}>
                Authoritative Target Evaluation
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
