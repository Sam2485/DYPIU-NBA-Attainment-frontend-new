import React from 'react';
import { FileCheck, Files, FileX, Info } from 'lucide-react';

const PO_COLOR = '#0284c7';   // Sky Blue
const PSO_COLOR = '#16a34a';  // Light Green

export default function OutcomeIndirectEvidenceOverview({
  outcomeCode,
  outcomeType,
  totalEvidenceCount = 0,
  participatingEvidenceCount = 0,
}) {
  const isPo = outcomeType === 'PO';
  const themeColor = isPo ? PO_COLOR : PSO_COLOR;

  const nonParticipatingCount = Math.max(0, totalEvidenceCount - participatingEvidenceCount);

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
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Indirect Evidence Overview
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
          Overview of programme-level surveys, co-curricular events, and the exit survey available for {outcomeCode}
        </p>
      </div>

      {/* 3 Metric Cards for Evidence Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Total Evidence */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Files size={20} color="#475569" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Evidence
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {totalEvidenceCount}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Defined across batch timeline
            </div>
          </div>
        </div>

        {/* Participating Evidence */}
        <div
          style={{
            background: isPo ? '#f0f9ff' : '#f0fdf4',
            border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#ffffff',
              border: `1px solid ${isPo ? '#bae6fd' : '#bbf7d0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCheck size={20} color={themeColor} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: themeColor, textTransform: 'uppercase' }}>
              Participating Evidence
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {participatingEvidenceCount}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Evaluated for {outcomeCode}
            </div>
          </div>
        </div>

        {/* Non-participating Evidence */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileX size={20} color="#94a3b8" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Non-Participating
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#64748b', lineHeight: 1.2 }}>
              {nonParticipatingCount}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {outcomeCode} was not evaluated
            </div>
          </div>
        </div>
      </div>

      {/* Clear Analytical Distinguisher Note (No coverage percentage) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#475569',
          background: '#f8fafc',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Info size={15} color="#64748b" style={{ flexShrink: 0 }} />
        <span>
          <strong>Evidence Status:</strong> {participatingEvidenceCount} evaluated • {nonParticipatingCount} not evaluated. Only assessments evaluating {outcomeCode} participate in the authoritative arithmetic consolidation.
        </span>
      </div>
    </div>
  );
}
