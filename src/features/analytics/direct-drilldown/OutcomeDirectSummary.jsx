import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Layers } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function OutcomeDirectSummary({
  outcomeCode,
  outcomeType,
  directAttainment,
  target,
  directGap,
  targetMet,
  contributingCourseCount,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const directVal = directAttainment != null ? Number(directAttainment).toFixed(2) : '—';
  const targetVal = target != null ? Number(target).toFixed(2) : '—';
  const gapNum = directGap != null ? Number(directGap) : null;
  const gapStr = gapNum != null ? (gapNum >= 0 ? `+${gapNum.toFixed(2)}` : gapNum.toFixed(2)) : '—';

  return (
    <div style={{ marginBottom: 24 }}>
      {/* 5-Card Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 12,
        }}
      >
        {/* Card 1: Selected Outcome */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Selected Outcome
            </span>
            <Layers size={16} color={themeColor} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: themeColor, lineHeight: 1.1 }}>
            {outcomeCode}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginTop: 4 }}>
            {isPo ? 'Programme Outcome' : 'Programme Specific Outcome'}
          </div>
        </div>

        {/* Card 2: Direct Attainment */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Direct Attainment
            </span>
            <TrendingUp size={16} color={themeColor} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {directVal}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>
              / 3.00
            </span>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>
            Direct component only
          </div>
        </div>

        {/* Card 3: Target */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Configured Target
            </span>
            <Target size={16} color="#475569" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {targetVal}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginLeft: 4 }}>
              / 3.00
            </span>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>
            Academic threshold
          </div>
        </div>

        {/* Card 4: Direct Gap & Status */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Direct Gap & Status
            </span>
            {targetMet ? (
              <CheckCircle2 size={16} color="#16a34a" />
            ) : (
              <AlertTriangle size={16} color="#dc2626" />
            )}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: gapNum != null ? (gapNum >= 0 ? '#16a34a' : '#dc2626') : '#0f172a',
              lineHeight: 1.1,
            }}
          >
            {gapStr}
          </div>
          <div style={{ marginTop: 4 }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                background: targetMet ? '#dcfce7' : '#fee2e2',
                color: targetMet ? '#15803d' : '#b91c1c',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {targetMet ? 'Target Met' : 'Below Target'}
            </span>
          </div>
        </div>

        {/* Card 5: Contributing Courses */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 18,
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Contributing Courses
            </span>
            <BookOpen size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {contributingCourseCount ?? 0}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginTop: 4 }}>
            Participating in aggregation
          </div>
        </div>
      </div>

      {/* Small Contextual Note (Direct component only) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 12,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontWeight: 700, color: '#475569' }}>Note:</span>
        <span>
          This view shows the direct component only. Programme final attainment also includes the separate programme indirect component (Exit Surveys & indirect evaluations).
        </span>
      </div>
    </div>
  );
}
