import React from 'react';
import { Target, CheckCircle2, AlertCircle, Info } from 'lucide-react';

function formatVal(val, decimals = 2) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(decimals);
}

export default function CoSummaryCard({
  coCode,
  target,
  targetMet,
  directAttainment,
  indirectAttainment,
  overallAttainment,
  directWeight = 80,
  indirectWeight = 20,
  observation,
}) {
  const isTargetMet = targetMet === true;
  const directW = Number(directWeight != null ? directWeight : 80);
  const indirectW = Number(indirectWeight != null ? indirectWeight : 20);

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
      {/* Header */}
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
              background: '#7c3aed',
              display: 'inline-block',
            }}
          />
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
            {coCode} Attainment Summary
          </h3>
        </div>

        {targetMet != null && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 999,
              background: isTargetMet ? '#ecfdf5' : '#fef2f2',
              color: isTargetMet ? '#059669' : '#dc2626',
              border: `1px solid ${isTargetMet ? '#a7f3d0' : '#fecaca'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isTargetMet ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{isTargetMet ? 'Target Met' : 'Target Not Met'}</span>
          </span>
        )}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {/* 1. Overall CO Attainment */}
        <div
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 12,
            padding: '16px',
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>
            Overall CO Attainment
          </span>
          <div style={{ margin: '8px 0 4px' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#581c87' }}>
              {formatVal(overallAttainment)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#9333ea', marginLeft: 4 }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#7e22ce' }}>
            Weighted Direct ({directW}%) + Indirect ({indirectW}%)
          </span>
        </div>

        {/* 2. Target */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '16px',
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
            CO Target
          </span>
          <div style={{ margin: '8px 0 4px' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
              {formatVal(target)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginLeft: 4 }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            Benchmark attainment target
          </span>
        </div>

        {/* 3. Direct Attainment */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 12,
            padding: '16px',
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
            Direct Attainment ({directW}%)
          </span>
          <div style={{ margin: '8px 0 4px' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0284c7' }}>
              {formatVal(directAttainment)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', marginLeft: 4 }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#0369a1' }}>
            Based on student exam evaluations
          </span>
        </div>

        {/* 4. Indirect Attainment */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '16px',
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
            Indirect Attainment ({indirectW}%)
          </span>
          <div style={{ margin: '8px 0 4px' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>
              {formatVal(indirectAttainment)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginLeft: 4 }}>/ 3.00</span>
          </div>
          <span style={{ fontSize: 11, color: '#15803d' }}>
            Based on Course-End Survey ratings
          </span>
        </div>
      </div>

      {/* Observation Box if available */}
      {observation && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 12,
            color: '#475569',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <Info size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong style={{ color: '#0f172a' }}>Assessment Observation:</strong> {observation}
          </div>
        </div>
      )}
    </div>
  );
}
