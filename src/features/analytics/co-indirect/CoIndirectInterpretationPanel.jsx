import React from 'react';
import { Info, ShieldCheck, CheckCircle2, XCircle, ArrowRight, BarChart3, Award, Target } from 'lucide-react';

export default function CoIndirectInterpretationPanel({
  coCode = 'CO',
  validResponseCount = 0,
  level1Count = 0,
  level2Count = 0,
  level3Count = 0,
  indirectAttainment = null,
  indirectScore = null,
  overallIndirectPercentage = null,
  coTargetLevel = null,
  coTargetMet = null,
}) {
  const isTargetMet = coTargetMet === true;
  const attainmentDisplay = indirectAttainment != null ? indirectAttainment : (indirectScore != null ? Number(indirectScore).toFixed(2) : '—');
  const targetDisplay = coTargetLevel != null ? Number(coTargetLevel).toFixed(2) : '2.00';
  const pctDisplay = overallIndirectPercentage != null ? `${Number(overallIndirectPercentage).toFixed(2)}%` : '—';

  return (
    <div
      style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            padding: 8,
            borderRadius: 10,
            background: '#dcfce7',
            color: '#16a34a',
            flexShrink: 0,
          }}
        >
          <Info size={20} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#166534', margin: 0 }}>
              How {coCode} Attained Its Indirect Level
            </h4>
            <p style={{ fontSize: 12.5, color: '#14532d', lineHeight: 1.5, margin: '4px 0 0 0' }}>
              The authoritative NBA Course-End Survey attainment is computed systematically across three verification steps:
            </p>
          </div>

          {/* 3 Step Interpretation Flow */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                  Response Aggregation
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                <strong>{validResponseCount}</strong> valid student evaluations collected:
                <br />
                • Level 1 (Slight): <strong>{level1Count}</strong>
                <br />
                • Level 2 (Moderate): <strong>{level2Count}</strong>
                <br />
                • Level 3 (Substantial): <strong>{level3Count}</strong>
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  2
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                  Attainment Computation
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                Survey responses yield an indirect attainment level of{' '}
                <strong style={{ color: '#16a34a' }}>{attainmentDisplay}</strong> / 3.00 with an overall indirect rating of{' '}
                <strong style={{ color: '#0f172a' }}>{pctDisplay}</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dcfce7',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                  Benchmark Validation
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                Compared against target level of <strong>{targetDisplay}</strong>, outcome attainment is{' '}
                <strong style={{ color: isTargetMet ? '#15803d' : '#b91c1c' }}>
                  {isTargetMet ? 'Target Met' : 'Target Not Met'}
                </strong>.
              </p>
            </div>
          </div>

          {/* Privacy / Confidentiality Rule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#166534',
              fontWeight: 600,
              paddingTop: 8,
              borderTop: '1px solid #dcfce7',
            }}
          >
            <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span>
              <strong>Confidentiality Rule:</strong> Student privacy is strictly maintained. All responses are pseudonymized with masked PRNs (e.g., 2021***0001) for audit verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
