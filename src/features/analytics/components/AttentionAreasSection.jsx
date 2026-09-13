import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUpRight, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function AttentionAreasSection({ isLoading = false }) {
  const attentionItems = [
    {
      id: 'po-gap-analysis',
      title: 'PO Deficit Diagnostics & Curriculum Alignment',
      badge: 'Deficit Analysis',
      badgeColor: '#b45309',
      badgeBg: '#fef3c7',
      badgeBorder: '#fde68a',
      description: 'Systematic outcome gap analysis across active cohorts to identify outcomes falling below target attainment thresholds.',
      actionText: 'Review CO-PO mapping weights and direct assessment distribution in course configurations.',
      impact: 'Curriculum & Assessment',
    },
    {
      id: 'cohort-variance',
      title: 'Longitudinal Cohort Attainment Variance',
      badge: 'Cohort Trend',
      badgeColor: '#0369a1',
      badgeBg: '#e0f2fe',
      badgeBorder: '#bae6fd',
      description: 'Multi-year trajectory comparison identifying unexpected attainment fluctuations between consecutive graduating cohorts.',
      actionText: 'Investigate course-level evaluation difficulty and student performance baselines.',
      impact: 'Batch Performance',
    },
    {
      id: 'atr-loop-closure',
      title: 'Action Taken Report (ATR) Closed-Loop Follow-up',
      badge: 'Governance',
      badgeColor: '#4f46e5',
      badgeBg: '#eef2ff',
      badgeBorder: '#c7d2fe',
      description: 'Continuous quality improvement audit ensuring planned remediation actions are verified in subsequent course offerings.',
      actionText: 'Follow up with Department Chairs and Course Coordinators on ATR implementation status.',
      impact: 'Continuous Improvement',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Prioritized Attention Areas & Deficit Diagnostics
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            Institutional quality alerts highlighting outcome deficits, curriculum bottlenecks, and recommended remediation follow-ups.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {attentionItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 10.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: item.badgeBg,
                    color: item.badgeColor,
                    border: `1px solid ${item.badgeBorder}`,
                  }}
                >
                  {item.badge}
                </span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.impact}</span>
              </div>

              <strong style={{ fontSize: 13.5, color: '#0f172a', lineHeight: 1.4 }}>
                {item.title}
              </strong>

              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: 11.5,
                color: '#334155',
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: '#0f172a' }}>Recommended Action: </strong>
              {item.actionText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
