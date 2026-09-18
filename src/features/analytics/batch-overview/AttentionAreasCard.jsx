import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Check, Layers } from 'lucide-react';

export default function AttentionAreasCard({
  attentionAreas = [],
  onSelectOutcome = () => {},
}) {
  const topDeficits = (attentionAreas || []).slice(0, 6);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 28,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={17} color="#dc2626" />
          </div>
          <div>
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
              ATTENTION AREAS
            </h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Highest observed target deficits ordered by deficit magnitude
            </span>
          </div>
        </div>

        {topDeficits.length > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#dc2626',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '3px 10px',
              borderRadius: 999,
            }}
          >
            {topDeficits.length} Outcome{topDeficits.length === 1 ? '' : 's'} Requiring Quality Review
          </span>
        )}
      </div>

      {/* Empty State */}
      {topDeficits.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            background: '#f0fdf4',
            border: '1px solid #dcfce7',
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
            }}
          >
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#166534' }}>
            No Target Deficits in This Batch
          </div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
            All evaluated PO and PSO outcomes currently meet or exceed their configured targets.
          </div>
        </div>
      ) : (
        /* Deficit Rows */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topDeficits.map((item, idx) => {
            const isPo = item.outcomeType === 'PO';
            const outcomeColor = isPo ? '#0284c7' : '#16a34a';
            const outcomeBg = isPo ? '#f0f9ff' : '#f0fdf4';
            const outcomeBorder = isPo ? '#bae6fd' : '#bbf7d0';
            const attainmentVal = item.attainedValue != null ? Number(item.attainedValue).toFixed(2) : '—';
            const targetVal = item.configuredTarget != null ? Number(item.configuredTarget).toFixed(2) : '—';
            const gapVal = item.gap != null ? Number(item.gap).toFixed(2) : '—';
            const courseEvidenceCount = item.contributingCourseEvidence?.length || 0;

            return (
              <div
                key={item.id || `${item.outcomeCode}_${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                {/* Left: Code & Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: outcomeColor,
                      background: outcomeBg,
                      border: `1px solid ${outcomeBorder}`,
                      padding: '4px 10px',
                      borderRadius: 6,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.outcomeCode}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                      {isPo ? 'Programme Outcome' : 'Programme Specific Outcome'}
                    </div>
                    {item.outcomeStatement ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#334155',
                          fontWeight: 500,
                          maxWidth: 360,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.outcomeStatement}
                      </div>
                    ) : null}
                    {courseEvidenceCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11, color: '#64748b' }}>
                        <Layers size={12} color="#94a3b8" />
                        <span>{courseEvidenceCount} mapped course{courseEvidenceCount === 1 ? '' : 's'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center: Numeric Attainment vs Target */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Attainment / Target
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                      <span style={{ color: '#dc2626' }}>{attainmentVal}</span>
                      <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
                      <span>{targetVal}</span>
                    </div>
                  </div>

                  {/* Gap Pill */}
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Deficit Gap
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {gapVal}
                    </div>
                  </div>

                  {/* ATR State Indicator */}
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      ATR Action
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: item.hasRecordedAtr ? '#166534' : '#64748b' }}>
                      {item.hasRecordedAtr ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Check size={12} color="#16a34a" />
                          <span>Planned</span>
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>— No ATR</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Drilldown CTA */}
                <button
                  type="button"
                  onClick={() => onSelectOutcome(item.outcomeCode, item.outcomeType || (isPo ? 'PO' : 'PSO'))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <span>View Diagnostic</span>
                  <ArrowRight size={13} color="#64748b" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
