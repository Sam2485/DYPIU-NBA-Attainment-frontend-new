import React from 'react';
import { HelpCircle } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function OutcomeIndirectFormationExplanation({
  outcomeCode,
  outcomeType,
  indirectAttainment,
  participatingEvidenceCount = 0,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const indirectVal = indirectAttainment != null ? Number(indirectAttainment).toFixed(2) : '—';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <HelpCircle size={18} color={themeColor} />
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          How this attainment is formed
        </h3>
      </div>

      {/* Conceptual Flow Diagram */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {/* Step 1 */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Step 1
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Programme Indirect Evidence
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Surveys, co-curricular events, technical activities & graduating batch exit survey
          </div>
        </div>

        {/* Step 2 */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Step 2
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            {outcomeCode} Evidence Evaluation
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Valid outcome scores evaluated across {participatingEvidenceCount} participating sources
          </div>
        </div>

        {/* Step 3 */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Step 3
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Authoritative Consolidation
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
            Unweighted arithmetic consolidation across valid participating evaluations
          </div>
        </div>

        {/* Step 4: Final Value */}
        <div
          style={{
            background: isPo ? '#f0f9ff' : '#f0fdf4',
            border: `2px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
            borderRadius: 10,
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: themeColor, textTransform: 'uppercase', marginBottom: 4 }}>
            Final Indirect Attainment
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {indirectVal}
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>/ 3.00</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: themeColor, marginTop: 4 }}>
            Authoritative backend score
          </div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
        * In DYPIU OBE analytics, Programme Indirect Attainment is computed authoritatively by the backend through unweighted arithmetic consolidation across all valid evaluated programme-level evidence sources. Course-level mapping strengths and course attainment weights apply strictly to the Programme Direct branch and are not mixed here.
      </p>
    </div>
  );
}
